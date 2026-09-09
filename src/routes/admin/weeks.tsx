import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminMenuQuery,
  daysQuery,
  db,
  productsQuery,
  weeksQuery,
  type Day,
  type Week,
} from "@/lib/api";
import { formatDay, formatPrice, todayISO } from "@/lib/format";
import { uploadPhoto } from "@/lib/upload";

export const Route = createFileRoute("/admin/weeks")({
  component: WeeksPage,
});

function addDays(iso: string, count: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + count);
  return date.toISOString().slice(0, 10);
}

function WeeksPage() {
  const queryClient = useQueryClient();
  const { data: weeks = [] } = useQuery(weeksQuery());
  const { data: days = [] } = useQuery(daysQuery());
  const { data: products = [] } = useQuery(productsQuery());
  const { data: menu = [] } = useQuery(adminMenuQuery());
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<Day | null>(null);
  const [newStart, setNewStart] = useState(todayISO());

  const activeWeek: Week | undefined =
    weeks.find((w) => w.id === selectedWeek) ?? weeks[0] ?? undefined;
  const weekDays = useMemo(
    () => days.filter((d) => d.week_id === activeWeek?.id).sort((a, b) => a.date.localeCompare(b.date)),
    [days, activeWeek],
  );

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["weeks"] });
    queryClient.invalidateQueries({ queryKey: ["days"] });
    queryClient.invalidateQueries({ queryKey: ["menu"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const createWeek = useMutation({
    mutationFn: async (start: string) => {
      const end = addDays(start, 6);
      const { data, error } = await db
        .from("weeks")
        .insert({ start_date: start, end_date: end, status: "brouillon" })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      const rows = Array.from({ length: 7 }, (_, index) => ({
        week_id: data.id,
        date: addDays(start, index),
        is_open: index < 5,
      }));
      const { error: dayError } = await db.from("days").insert(rows);
      if (dayError) throw new Error(dayError.message);
      return data.id as string;
    },
    onSuccess: (id) => {
      refresh();
      setSelectedWeek(id);
      toast.success("Semaine créée avec ses 7 jours");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateWeek = useMutation({
    mutationFn: async (input: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await db.from("weeks").update(input.patch).eq("id", input.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      toast.success("Semaine mise à jour");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateDay = useMutation({
    mutationFn: async (input: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await db.from("days").update(input.patch).eq("id", input.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });

  const updateDayProduct = useMutation({
    mutationFn: async (input: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await db.from("day_products").update(input.patch).eq("id", input.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });

  const addDayProduct = useMutation({
    mutationFn: async (input: {
      day_id: string;
      product_id: string;
      price: number;
      stock_initial: number;
    }) => {
      const { error } = await db.from("day_products").insert(input);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      setAddingTo(null);
      toast.success("Produit ajouté au jour");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeDayProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("day_products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      toast.success("Produit retiré");
    },
    onError: () => toast.error("Impossible de retirer ce produit (commandes existantes)."),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Semaines & menus</h1>
          <p className="text-sm text-muted-foreground">
            Créez la semaine, ouvrez les jours et composez le menu de chaque journée.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="start">Début (lundi)</Label>
            <Input
              id="start"
              type="date"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
          </div>
          <Button onClick={() => createWeek.mutate(newStart)} disabled={createWeek.isPending}>
            <Plus className="size-4" /> Créer la semaine
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {weeks.map((week) => (
          <button
            key={week.id}
            onClick={() => setSelectedWeek(week.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeWeek?.id === week.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {formatDay(week.start_date)} → {formatDay(week.end_date)}
          </button>
        ))}
        {weeks.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune semaine créée pour l'instant.</p>
        )}
      </div>

      {activeWeek && (
        <>
          <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display text-lg font-bold text-primary">
                Semaine du {formatDay(activeWeek.start_date)}
              </p>
              <p className="text-sm text-muted-foreground">
                Statut : {activeWeek.status === "publiee" ? "Publiée" : "Brouillon"}
              </p>
            </div>
            <Button
              variant={activeWeek.status === "publiee" ? "secondary" : "default"}
              onClick={() =>
                updateWeek.mutate({
                  id: activeWeek.id,
                  patch:
                    activeWeek.status === "publiee"
                      ? { status: "brouillon", published_at: null }
                      : { status: "publiee", published_at: new Date().toISOString() },
                })
              }
            >
              {activeWeek.status === "publiee" ? "Dépublier" : "Publier la semaine"}
            </Button>
          </div>

          <div className="space-y-4">
            {weekDays.map((day) => {
              const rows = menu.filter((m) => m.day_id === day.id);
              return (
                <section key={day.id} className="surface-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-lg font-bold">{formatDay(day.date)}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <Switch
                          checked={day.is_open}
                          onCheckedChange={(checked) =>
                            updateDay.mutate({ id: day.id, patch: { is_open: checked } })
                          }
                        />
                        Jour ouvert
                      </label>
                      <div className="flex items-center gap-2 text-sm">
                        <Input
                          type="time"
                          className="w-28"
                          aria-label="Heure d'ouverture"
                          defaultValue={day.open_time?.slice(0, 5)}
                          onBlur={(e) =>
                            updateDay.mutate({ id: day.id, patch: { open_time: e.target.value } })
                          }
                        />
                        <span>→</span>
                        <Input
                          type="time"
                          className="w-28"
                          aria-label="Heure de fermeture"
                          defaultValue={day.close_time?.slice(0, 5)}
                          onBlur={(e) =>
                            updateDay.mutate({ id: day.id, patch: { close_time: e.target.value } })
                          }
                        />
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => setAddingTo(day)}>
                        <Plus className="size-4" /> Ajouter un produit
                      </Button>
                    </div>
                  </div>

                  {rows.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Aucun produit ce jour-là.</p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[720px] text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-muted-foreground">
                            <th className="p-2">Produit</th>
                            <th className="p-2">Prix</th>
                            <th className="p-2">Stock initial</th>
                            <th className="p-2">Réservé</th>
                            <th className="p-2">Restant</th>
                            <th className="p-2">Actif</th>
                            <th className="p-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.day_product_id} className="border-b border-border/60">
                              <td className="p-2 font-medium">{row.name}</td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-28"
                                  aria-label={`Prix ${row.name}`}
                                  defaultValue={row.price}
                                  onBlur={(e) =>
                                    updateDayProduct.mutate({
                                      id: row.day_product_id,
                                      patch: { price: Number(e.target.value) },
                                    })
                                  }
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-24"
                                  aria-label={`Stock ${row.name}`}
                                  defaultValue={row.stock_initial}
                                  onBlur={(e) =>
                                    updateDayProduct.mutate({
                                      id: row.day_product_id,
                                      patch: { stock_initial: Number(e.target.value) },
                                    })
                                  }
                                />
                              </td>
                              <td className="p-2">{row.stock_reserved}</td>
                              <td className="p-2 font-semibold">{row.stock_left}</td>
                              <td className="p-2">
                                <Switch
                                  checked={row.is_active}
                                  onCheckedChange={(checked) =>
                                    updateDayProduct.mutate({
                                      id: row.day_product_id,
                                      patch: { is_active: checked },
                                    })
                                  }
                                />
                              </td>
                              <td className="p-2 text-right">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Retirer"
                                  onClick={() => removeDayProduct.mutate(row.day_product_id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}

      <AddProductDialog
        day={addingTo}
        products={products}
        onClose={() => setAddingTo(null)}
        onSubmit={(input) => addDayProduct.mutate(input)}
        pending={addDayProduct.isPending}
      />
    </div>
  );
}

function AddProductDialog({
  day,
  products,
  onClose,
  onSubmit,
  pending,
}: {
  day: Day | null;
  products: { id: string; name: string; base_price: number; active: boolean }[];
  onClose: () => void;
  onSubmit: (input: {
    day_id: string;
    product_id: string;
    price: number;
    stock_initial: number;
  }) => void;
  pending: boolean;
}) {
  const available = products.filter((p) => p.active);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(20);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("plat");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoLink, setPhotoLink] = useState("");
  const [creating, setCreating] = useState(false);

  function reset() {
    setProductId("");
    setName("");
    setDescription("");
    setFile(null);
    setPreview(null);
    setPhotoLink("");
    setPrice(0);
    setStock(20);
    setMode("new");
  }

  async function createAndAdd() {
    if (!day || !name.trim()) return;
    setCreating(true);
    try {
      let photoUrl: string | null = null;
      if (file) photoUrl = await uploadPhoto(file);
      const { data, error } = await db
        .from("products")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          category,
          base_price: price,
          photo_url: photoUrl,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      onSubmit({ day_id: day.id, product_id: data.id, price, stock_initial: stock });
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ajout impossible");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog
      open={day !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plat du {day ? formatDay(day.date) : ""}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "new" ? "default" : "secondary"}
            onClick={() => setMode("new")}
          >
            Nouveau plat
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "existing" ? "default" : "secondary"}
            onClick={() => setMode("existing")}
          >
            Depuis le catalogue
          </Button>
        </div>

        <div className="space-y-4">
          {mode === "new" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="np-name">Nom du plat</Label>
                <Input
                  id="np-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Thiéboudienne"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-desc">Description (facultatif)</Label>
                <Input
                  id="np-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Riz au poisson, légumes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-cat">Catégorie</Label>
                <select
                  id="np-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="plat">Plat</option>
                  <option value="jus">Jus</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-photo">Photo du plat</Label>
                <Input
                  id="np-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const picked = e.target.files?.[0] ?? null;
                    setFile(picked);
                    setPreview(picked ? URL.createObjectURL(picked) : null);
                  }}
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Aperçu du plat"
                    className="h-32 w-full rounded-md object-cover"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="product">Produit existant</Label>
              <select
                id="product"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const selected = available.find((p) => p.id === e.target.value);
                  if (selected) setPrice(selected.base_price);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Sélectionner…</option>
                {available.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatPrice(product.base_price)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dp-price">Prix du jour (FCFA)</Label>
              <Input
                id="dp-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp-stock">Stock initial</Label>
              <Input
                id="dp-stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          {mode === "new" ? (
            <Button disabled={!name.trim() || !day || creating || pending} onClick={createAndAdd}>
              {creating ? "Ajout…" : "Ajouter au menu"}
            </Button>
          ) : (
            <Button
              disabled={!productId || !day || pending}
              onClick={() =>
                day &&
                productId &&
                onSubmit({ day_id: day.id, product_id: productId, price, stock_initial: stock })
              }
            >
              Ajouter
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
