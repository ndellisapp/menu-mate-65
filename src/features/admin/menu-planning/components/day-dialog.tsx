import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuRow } from "@/features/menu/api";
import type { Day, Week } from "@/features/admin/menu-planning/api";
import type { Product } from "@/features/admin/products/api";
import { formatDay } from "@/lib/format";
import { AddProductForm } from "@/features/admin/menu-planning/components/add-product-form";

export function DayDialog({
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
