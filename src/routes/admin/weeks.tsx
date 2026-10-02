import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  type MenuRow,
  type Product,
  type Week,
} from "@/lib/api";
import { formatDay, formatPrice, todayISO } from "@/lib/format";
import { uploadPhoto } from "@/lib/upload";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/weeks")({
  head: () => ({ meta: [
    { title: "Semaines et menus — Ndelli's Traiteur" },
    { name: "description", content: "Calendrier et planification des menus du traiteur." },
    { property: "og:title", content: "Semaines et menus — Ndelli's Traiteur" },
    { property: "og:description", content: "Calendrier et planification des menus du traiteur." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WeeksPage,
});

const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const SHORT_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function isoOf(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(iso: string, count: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return isoOf(date);
}

/** Monday of the week containing the given ISO date. */
function mondayOf(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  const shift = (date.getUTCDay() + 6) % 7;
  return addDays(iso, -shift);
}

/** Weeks (Monday → Sunday) covering the whole month. */
function monthWeeks(year: number, month: number) {
  const first = isoOf(new Date(Date.UTC(year, month, 1)));
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const last = isoOf(new Date(Date.UTC(year, month, lastDay)));
  const weeks: string[][] = [];
  let cursor = mondayOf(first);
  while (cursor <= last) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

function WeeksPage() {
  const queryClient = useQueryClient();
  const { data: weeks = [] } = useQuery(weeksQuery());
  const { data: days = [] } = useQuery(daysQuery());
  const { data: products = [] } = useQuery(productsQuery());
  const { data: menu = [] } = useQuery(adminMenuQuery());

  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split("-").map(Number);
    return { year: y ?? 2026, month: (m ?? 1) - 1 };
  });
  const [openDay, setOpenDay] = useState<string | null>(null);

  const grid = useMemo(() => monthWeeks(cursor.year, cursor.month), [cursor]);
  const daysByDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const weekById = useMemo(() => new Map(weeks.map((w) => [w.id, w])), [weeks]);
  const weekByStart = useMemo(() => new Map(weeks.map((w) => [w.start_date, w])), [weeks]);
  const rowsByDay = useMemo(() => {
    const map = new Map<string, MenuRow[]>();
    for (const row of menu) {
      const list = map.get(row.day_id) ?? [];
      list.push(row);
      map.set(row.day_id, list);
    }
    return map;
  }, [menu]);

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
        .insert({ start_date: start, end_date: end, status: "draft" })
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
    onSuccess: () => {
      refresh();
      toast.success("Semaine ouverte");
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

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const date = new Date(Date.UTC(c.year, c.month + delta, 1));
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    });
  }

  const selectedDay = openDay ? (daysByDate.get(openDay) ?? null) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Calendrier des menus</h1>
          <p className="text-sm text-muted-foreground">
            Choisissez un mois, ouvrez une semaine puis cliquez sur un jour pour composer son menu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" aria-label="Mois précédent" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <p className="min-w-44 text-center font-display text-lg font-bold capitalize">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </p>
          <Button size="icon" variant="outline" aria-label="Mois suivant" onClick={() => shiftMonth(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="hidden grid-cols-7 gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
        {SHORT_DAYS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="space-y-4">
        {grid.map((week) => {
          const start = week[0]!;
          const weekRow = weekByStart.get(start);
          const published = weekRow?.status === "published";
          return (
            <section key={start} className="surface-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <p className="font-display text-base font-bold">
                    Semaine du {formatDay(start)}
                  </p>
                  {weekRow ? (
                    <Badge variant={published ? "default" : "secondary"}>
                      {published ? "Publiée" : "Brouillon"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Non créée</Badge>
                  )}
                </div>
                {weekRow ? (
                  <Button
                    size="sm"
                    variant={published ? "secondary" : "default"}
                    onClick={() =>
                      updateWeek.mutate({
                        id: weekRow.id,
                        patch: published
                          ? { status: "draft", published_at: null }
                          : { status: "published", published_at: new Date().toISOString() },
                      })
                    }
                  >
                    {published ? "Dépublier" : "Publier la semaine"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={createWeek.isPending}
                    onClick={() => createWeek.mutate(start)}
                  >
                    <CalendarPlus className="size-4" /> Ouvrir cette semaine
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-7">
                {week.map((date) => {
                  const dayRow = daysByDate.get(date);
                  const items = dayRow ? (rowsByDay.get(dayRow.id) ?? []) : [];
                  const inMonth = Number(date.slice(5, 7)) - 1 === cursor.month;
                  const isToday = date === today;
                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={!dayRow}
                      onClick={() => setOpenDay(date)}
                      className={cn(
                        "flex min-h-24 flex-col rounded-xl border p-2 text-left transition-colors",
                        dayRow
                          ? "border-border bg-card hover:border-primary hover:bg-secondary"
                          : "cursor-not-allowed border-dashed border-border/60 bg-muted/30",
                        !inMonth && "opacity-50",
                        isToday && "border-accent ring-1 ring-accent",
                      )}
                    >
                      <span className="flex items-center justify-between text-xs font-semibold">
                        <span className="md:hidden">{formatDay(date)}</span>
                        <span className="hidden md:inline">{Number(date.slice(8, 10))}</span>
                        {dayRow && !dayRow.is_open && (
                          <span className="text-muted-foreground">fermé</span>
                        )}
                      </span>
                      <span className="mt-2 flex-1 space-y-1 text-xs text-muted-foreground">
                        {items.slice(0, 3).map((item) => (
                          <span key={item.day_product_id} className="block truncate">
                            • {item.name}
                          </span>
                        ))}
                        {items.length > 3 && <span className="block">+{items.length - 3}</span>}
                        {dayRow && items.length === 0 && <span className="block">Aucun plat</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <DayDialog
        day={selectedDay}
        week={selectedDay ? (weekById.get(selectedDay.week_id) ?? null) : null}
        rows={selectedDay ? (rowsByDay.get(selectedDay.id) ?? []) : []}
        products={products}
        onClose={() => setOpenDay(null)}
        onUpdateDay={(patch) => selectedDay && updateDay.mutate({ id: selectedDay.id, patch })}
        onUpdateDayProduct={(id, patch) => updateDayProduct.mutate({ id, patch })}
        onRemove={(id) => removeDayProduct.mutate(id)}
        onAdd={(input) => addDayProduct.mutate(input)}
        pending={addDayProduct.isPending}
      />
    </div>
  );
}

function DayDialog({
  day,
  week,
  rows,
  products,
  onClose,
  onUpdateDay,
  onUpdateDayProduct,
  onRemove,
  onAdd,
  pending,
}: {
  day: Day | null;
  week: Week | null;
  rows: MenuRow[];
  products: Product[];
  onClose: () => void;
  onUpdateDay: (patch: Record<string, unknown>) => void;
  onUpdateDayProduct: (id: string, patch: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onAdd: (input: {
    day_id: string;
    product_id: string;
    price: number;
    stock_initial: number;
  }) => void;
  pending: boolean;
}) {
  return (
    <Dialog open={day !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{day ? formatDay(day.date) : ""}</DialogTitle>
        </DialogHeader>

        {day && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={day.is_open}
                  onCheckedChange={(checked) => onUpdateDay({ is_open: checked })}
                />
                Jour ouvert
              </label>
              <div className="flex items-center gap-2 text-sm">
                <Input
                  type="time"
                  className="w-28"
                  aria-label="Heure d'ouverture"
                  defaultValue={day.open_time?.slice(0, 5)}
                  onBlur={(e) => onUpdateDay({ open_time: e.target.value })}
                />
                <span>→</span>
                <Input
                  type="time"
                  className="w-28"
                  aria-label="Heure de fermeture"
                  defaultValue={day.close_time?.slice(0, 5)}
                  onBlur={(e) => onUpdateDay({ close_time: e.target.value })}
                />
              </div>
              {week && week.status !== "published" && (
                <p className="text-xs text-muted-foreground">
                  Semaine en brouillon : publiez-la pour la rendre visible aux clients.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-base font-bold">Menu du jour</h3>
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun plat pour l'instant.</p>
              ) : (
                <ul className="space-y-2">
                  {rows.map((row) => (
                    <li
                      key={row.day_product_id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-2"
                    >
                      {row.photo_url ? (
                        <img
                          src={row.photo_url}
                          alt={row.name}
                          className="size-12 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-sm font-bold">
                          {row.name.slice(0, 1)}
                        </span>
                      )}
                      <span className="flex-1 text-sm font-medium">{row.name}</span>
                      <Input
                        type="number"
                        min={0}
                        className="w-28"
                        aria-label={`Prix ${row.name}`}
                        defaultValue={row.price}
                        onBlur={(e) =>
                          onUpdateDayProduct(row.day_product_id, { price: Number(e.target.value) })
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        className="w-24"
                        aria-label={`Stock ${row.name}`}
                        defaultValue={row.stock_initial}
                        onBlur={(e) =>
                          onUpdateDayProduct(row.day_product_id, {
                            stock_initial: Number(e.target.value),
                          })
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {row.stock_reserved} réservé(s)
                      </span>
                      <Switch
                        checked={row.is_active}
                        onCheckedChange={(checked) =>
                          onUpdateDayProduct(row.day_product_id, { is_active: checked })
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Retirer"
                        onClick={() => onRemove(row.day_product_id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <AddProductForm day={day} products={products} onAdd={onAdd} pending={pending} />
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddProductForm({
  day,
  products,
  onAdd,
  pending,
}: {
  day: Day;
  products: Product[];
  onAdd: (input: {
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

  const selected = available.find((p) => p.id === productId) ?? null;

  function reset() {
    setProductId("");
    setName("");
    setDescription("");
    setFile(null);
    setPreview(null);
    setPhotoLink("");
    setPrice(0);
    setStock(20);
  }

  async function createAndAdd() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      let photoUrl: string | null = photoLink.trim() || null;
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
      onAdd({ day_id: day.id, product_id: data.id, price, stock_initial: stock });
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ajout impossible");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-bold">Ajouter un produit</h3>
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
      </div>

      {mode === "new" ? (
        <div className="space-y-4">
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
            <p className="text-xs text-muted-foreground">ou collez un lien d'image ci-dessous</p>
            <Input
              id="np-photo-url"
              type="url"
              value={photoLink}
              onChange={(e) => setPhotoLink(e.target.value)}
              placeholder="https://…/photo.jpg"
              disabled={!!file}
            />
            {(preview ?? (photoLink.trim() || null)) && (
              <img
                src={preview ?? photoLink.trim()}
                alt="Aperçu du plat"
                className="h-32 w-full rounded-md object-cover"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Le catalogue est vide. Créez un nouveau plat.
            </p>
          ) : (
            <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
              {available.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setProductId(product.id);
                    setPrice(product.base_price);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                    productId === product.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:bg-secondary/60",
                  )}
                >
                  {product.photo_url ? (
                    <img
                      src={product.photo_url}
                      alt={product.name}
                      className="size-14 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-md bg-secondary text-sm font-bold">
                      {product.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{product.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {product.category} · {formatPrice(product.base_price)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {selected && !selected.photo_url && (
            <p className="text-xs text-muted-foreground">
              Ce produit du catalogue n'a pas de photo. Ajoutez-la dans le catalogue produits.
            </p>
          )}
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

      {mode === "new" ? (
        <Button className="w-full" disabled={!name.trim() || creating || pending} onClick={createAndAdd}>
          <Plus className="size-4" /> {creating ? "Ajout…" : "Ajouter au menu"}
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={!productId || pending}
          onClick={() => {
            onAdd({ day_id: day.id, product_id: productId, price, stock_initial: stock });
            reset();
          }}
        >
          <Plus className="size-4" /> Ajouter au menu
        </Button>
      )}
    </div>
  );
}
