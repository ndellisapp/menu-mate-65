import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db, productsQuery, type Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { uploadPhoto } from "@/lib/upload";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type Draft = {
  id?: string;
  name: string;
  description: string;
  photo_url: string;
  category: string;
  base_price: number;
  active: boolean;
};

const EMPTY: Draft = {
  name: "",
  description: "",
  photo_url: "",
  category: "plat",
  base_price: 0,
  active: true,
};

function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);

  async function pickPhoto(file: File) {
    if (!draft) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      setDraft((current) => (current ? { ...current, photo_url: url } : current));
      toast.success("Photo importée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import impossible");
    } finally {
      setUploading(false);
    }
  }

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const payload = {
        name: value.name.trim(),
        description: value.description.trim() || null,
        photo_url: value.photo_url.trim() || null,
        category: value.category,
        base_price: value.base_price,
        active: value.active,
      };
      const query = value.id
        ? db.from("products").update(payload).eq("id", value.id)
        : db.from("products").insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDraft(null);
      toast.success("Produit enregistré");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit supprimé");
    },
    onError: () =>
      toast.error("Impossible de supprimer ce produit (il est peut-être utilisé dans un menu)."),
  });

  function edit(product: Product) {
    setDraft({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      photo_url: product.photo_url ?? "",
      category: product.category,
      base_price: product.base_price,
      active: product.active,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Catalogue produits</h1>
          <p className="text-sm text-muted-foreground">Plats et jus réutilisables dans les menus</p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" /> Nouveau produit
        </Button>
      </div>

      <div className="surface-card overflow-x-auto p-2">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Photo</th>
              <th className="p-3">Produit</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3 text-right">Prix de base</th>
              <th className="p-3">Actif</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border/60">
                <td className="p-3">
                  {product.photo_url ? (
                    <img
                      src={product.photo_url}
                      alt={product.name}
                      className="size-12 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-sm font-bold">
                      {product.name.slice(0, 1)}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <p className="font-medium">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground">{product.description}</p>
                  )}
                </td>
                <td className="p-3 capitalize">{product.category}</td>
                <td className="p-3 text-right">{formatPrice(product.base_price)}</td>
                <td className="p-3">{product.active ? "Oui" : "Non"}</td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => edit(product)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Supprimer"
                    onClick={() => remove.mutate(product.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Aucun produit pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  maxLength={120}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  maxLength={500}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo-file">Photo du produit</Label>
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    if (picked) void pickPhoto(picked);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {uploading ? "Import en cours…" : "ou collez un lien d'image ci-dessous"}
                </p>
                <Input
                  id="photo"
                  maxLength={500}
                  placeholder="https://…/photo.jpg"
                  value={draft.photo_url}
                  onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })}
                />
                {draft.photo_url.trim() && (
                  <img
                    src={draft.photo_url.trim()}
                    alt="Aperçu du produit"
                    className="h-32 w-full rounded-md object-cover"
                  />
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <select
                    id="category"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="plat">Plat</option>
                    <option value="jus">Jus</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix de base (FCFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={draft.base_price}
                    onChange={(e) => setDraft({ ...draft, base_price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.active}
                  onCheckedChange={(checked) => setDraft({ ...draft, active: checked })}
                />
                Produit actif
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Annuler
            </Button>
            <Button
              disabled={!draft?.name.trim() || save.isPending}
              onClick={() => draft && save.mutate(draft)}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
