import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminMenuQuery } from "@/features/menu/api";
import { orderItemsQuery, ordersQuery } from "@/features/admin/orders/api";
import { formatDay, formatPrice, todayISO } from "@/lib/format";
import { printProduction } from "@/features/admin/orders/print";

export function Dashboard() {
  const { data: orders = [] } = useQuery(ordersQuery());
  const { data: items = [] } = useQuery(orderItemsQuery());
  const { data: menu = [] } = useQuery(adminMenuQuery());
  const [day, setDay] = useState(todayISO());

  const days = useMemo(() => [...new Set(menu.map((m) => m.day_date))].sort(), [menu]);

  const cancelledIds = useMemo(
    () => new Set(orders.filter((o) => o.status === "annulee").map((o) => o.id)),
    [orders],
  );

  const dayItems = useMemo(
    () => items.filter((i) => i.day_date === day && !cancelledIds.has(i.order_id)),
    [items, day, cancelledIds],
  );

  const production = useMemo(() => {
    const map = new Map<string, { name: string; category: string; quantity: number }>();
    dayItems.forEach((i) => {
      const key = `${i.product_name}|${i.category}`;
      const current = map.get(key) ?? { name: i.product_name, category: i.category, quantity: 0 };
      current.quantity += i.quantity;
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.quantity - a.quantity);
  }, [dayItems]);

  const ordersOfDay = useMemo(() => {
    const orderIds = new Set(dayItems.map((i) => i.order_id));
    return orders.filter((o) => orderIds.has(o.id));
  }, [dayItems, orders]);

  const revenue = dayItems.reduce((sum, i) => sum + i.amount, 0);
  const meals = production.filter((p) => p.category === "plat").reduce((s, p) => s + p.quantity, 0);
  const juices = production.filter((p) => p.category === "jus").reduce((s, p) => s + p.quantity, 0);

  const lowStock = menu.filter((m) => m.day_date >= todayISO() && m.stock_left <= 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Production et suivi journalier</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Choisir un jour"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {(days.includes(day) ? days : [day, ...days]).map((d) => (
              <option key={d} value={d}>
                {formatDay(d)}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => printProduction(`Production — ${formatDay(day)}`, production)}
            disabled={production.length === 0}
          >
            <Printer className="size-4" /> Imprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Commandes du jour" value={String(ordersOfDay.length)} />
        <Stat label="Repas à préparer" value={String(meals)} />
        <Stat label="Jus à préparer" value={String(juices)} />
        <Stat label="Chiffre d'affaires" value={formatPrice(revenue)} />
      </div>

      <section className="surface-card p-5">
        <h2 className="font-display text-lg font-bold text-primary">
          Liste de production — {formatDay(day)}
        </h2>
        {production.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucune commande pour ce jour.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2">Produit</th>
                <th className="py-2">Catégorie</th>
                <th className="py-2 text-right">Quantité</th>
              </tr>
            </thead>
            <tbody>
              {production.map((row) => (
                <tr key={row.name} className="border-b border-border/60">
                  <td className="py-2 font-medium">{row.name}</td>
                  <td className="py-2 capitalize text-muted-foreground">{row.category}</td>
                  <td className="py-2 text-right font-semibold">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-lg font-bold text-primary">Stocks faibles</h2>
        {lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Tous les stocks sont confortables.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {lowStock.map((m) => (
              <li key={m.day_product_id} className="flex justify-between gap-3">
                <span>
                  {m.name} <span className="text-muted-foreground">— {formatDay(m.day_date)}</span>
                </span>
                <span className="font-semibold text-destructive">
                  {m.stock_left} restant{m.stock_left > 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
