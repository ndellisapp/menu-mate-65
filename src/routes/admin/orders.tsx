import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";
import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Printer, Tags } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, orderItemsQuery, ordersQuery } from "@/lib/api";
import { exportOrdersCsv, exportOrdersExcel } from "@/lib/csv";
import { formatDay, formatPrice, ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/format";
import { printOrders, printStickers } from "@/lib/print";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [] } = useQuery(ordersQuery());
  const { data: items = [] } = useQuery(orderItemsQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [day, setDay] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const days = useMemo(() => [...new Set(items.map((i) => i.day_date))].sort(), [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const dayOrderIds = day
      ? new Set(items.filter((i) => i.day_date === day).map((i) => i.order_id))
      : null;
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (dayOrderIds && !dayOrderIds.has(order.id)) return false;
      if (!term) return true;
      return (
        order.reference.toLowerCase().includes(term) ||
        order.phone.toLowerCase().includes(term) ||
        `${order.first_name} ${order.last_name}`.toLowerCase().includes(term)
      );
    });
  }, [orders, items, search, status, day]);

  const filteredItems = useMemo(() => {
    const ids = new Set(filtered.map((o) => o.id));
    return items.filter((i) => ids.has(i.order_id));
  }, [filtered, items]);

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await db.from("orders").update(input.patch).eq("id", input.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Commande mise à jour");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const label = day ? formatDay(day) : "toutes dates";
  const revenue = filtered
    .filter((o) => o.status !== "annulee")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Commandes</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} commande(s) — {formatPrice(revenue)} hors annulations
        </p>
      </div>

      <div className="surface-card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-52 flex-1">
          <label htmlFor="search" className="text-sm text-muted-foreground">
            Recherche (référence, nom, téléphone)
          </label>
          <Input
            id="search"
            value={search}
            maxLength={80}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm text-muted-foreground">
            Statut
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Tous</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="day" className="block text-sm text-muted-foreground">
            Jour de consommation
          </label>
          <select
            id="day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Tous les jours</option>
            {days.map((value) => (
              <option key={value} value={value}>
                {formatDay(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => printOrders(filtered, filteredItems, `Commandes — ${label}`)}
          >
            <Printer className="size-4" /> Imprimer
          </Button>
          <Button
            variant="secondary"
            onClick={() => printStickers(filtered, filteredItems, `Étiquettes — ${label}`)}
          >
            <Tags className="size-4" /> Étiquettes
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportOrdersCsv(filtered, filteredItems, `commandes-${day || "toutes"}.csv`)}
          >
            <Download className="size-4" /> CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              exportOrdersExcel(filtered, filteredItems, `commandes-${day || "toutes"}.xls`)
            }
          >
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="surface-card overflow-x-auto p-2">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Référence</th>
              <th className="p-3">Client</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Paiement</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <Fragment key={order.id}>
                <tr
                  className="cursor-pointer border-b border-border/60 hover:bg-secondary/50"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <td className="p-3 font-semibold">
                    {order.reference}
                    {order.order_type === "precommande" && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Précommande
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {order.last_name} {order.first_name}
                  </td>
                  <td className="p-3">{order.phone}</td>
                  <td className="p-3 text-right">{formatPrice(order.total)}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      aria-label={`Statut ${order.reference}`}
                      value={order.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: order.id, patch: { status: e.target.value } })
                      }
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {ORDER_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {ORDER_STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      aria-label={`Paiement ${order.reference}`}
                      value={order.payment_status}
                      onChange={(e) =>
                        updateStatus.mutate({
                          id: order.id,
                          patch: { payment_status: e.target.value },
                        })
                      }
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="non_paye">Non payé</option>
                      <option value="acompte_a_verifier">Acompte à vérifier</option>
                      <option value="acompte_paye">Acompte payé</option>
                      <option value="paye">Payé</option>
                    </select>
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr className="border-b border-border/60 bg-secondary/30">
                    <td colSpan={6} className="p-4">
                      <p className="text-sm">
                        <strong>Livraison :</strong> {order.address}
                        {order.address_extra ? ` — ${order.address_extra}` : ""}
                        {order.landmark ? ` (repère : ${order.landmark})` : ""}
                      </p>
                      {order.order_type === "precommande" && (
                        <p className="mt-1 text-sm">
                          <strong>Acompte :</strong> {formatPrice(order.deposit_required)} —{" "}
                          {order.payment_method === "wave" ? "Wave" : "Orange Money"} — ID{" "}
                          {order.payment_reference ?? "—"}
                        </p>
                      )}
                      {order.instructions && (
                        <p className="mt-1 text-sm">
                          <strong>Instructions :</strong> {order.instructions}
                        </p>
                      )}
                      <ul className="mt-3 space-y-1 text-sm">
                        {items
                          .filter((i) => i.order_id === order.id)
                          .map((item) => (
                            <li key={item.id}>
                              {item.quantity} × {item.product_name} —{" "}
                              <span className="text-muted-foreground">
                                {formatDay(item.day_date)}
                              </span>{" "}
                              — {formatPrice(item.amount)}
                            </li>
                          ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Aucune commande ne correspond aux filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
