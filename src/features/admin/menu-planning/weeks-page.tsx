import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminMenuQuery, type MenuRow } from "@/features/menu/api";
import { daysQuery, weeksQuery } from "@/features/admin/menu-planning/api";
import { db } from "@/lib/db";
import { productsQuery } from "@/features/admin/products/api";
import { formatDay, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  MONTH_NAMES,
  SHORT_DAYS,
  addDays,
  monthWeeks,
} from "@/features/admin/menu-planning/calendar";
import { DayDialog } from "@/features/admin/menu-planning/components/day-dialog";

export function WeeksPage() {
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
          <Button
            size="icon"
            variant="outline"
            aria-label="Mois précédent"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="min-w-44 text-center font-display text-lg font-bold capitalize">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </p>
          <Button
            size="icon"
            variant="outline"
            aria-label="Mois suivant"
            onClick={() => shiftMonth(1)}
          >
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
                  <p className="font-display text-base font-bold">Semaine du {formatDay(start)}</p>
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
