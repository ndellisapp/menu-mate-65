import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { placeOrder, publicMenuQuery } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { formatDay, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/commande")({
  head: () => ({
    meta: [
      { title: "Ma précommande — Traiteur" },
      {
        name: "description",
        content:
          "Vérifiez votre panier, renseignez vos coordonnées de livraison et validez votre précommande en ligne.",
      },
      { property: "og:title", content: "Ma précommande — Traiteur" },
      {
        property: "og:description",
        content: "Récapitulatif du panier et validation de la précommande.",
      },
    ],
  }),
  component: CheckoutPage,
});

const customerSchema = z.object({
  first_name: z.string().trim().min(2, "Prénom requis").max(80),
  last_name: z.string().trim().min(2, "Nom requis").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Numéro de téléphone requis")
    .max(25)
    .regex(/^[0-9+\s.-]+$/, "Numéro de téléphone invalide"),
  address: z.string().trim().min(4, "Adresse de livraison requise").max(300),
  address_extra: z.string().trim().max(200).optional(),
  landmark: z.string().trim().max(200).optional(),
  instructions: z.string().trim().max(500).optional(),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, setQuantity, remove, total, clear } = useCart();
  const { data: menu } = useQuery(publicMenuQuery());
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    address_extra: "",
    landmark: "",
    instructions: "",
  });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    items.forEach((item) => map.set(item.day_date, [...(map.get(item.day_date) ?? []), item]));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const unavailable = useMemo(() => {
    if (!menu) return [];
    return items.filter((item) => {
      const row = menu.find((r) => r.day_product_id === item.day_product_id);
      return !row || row.state !== "disponible" || row.stock_left < item.quantity;
    });
  }, [items, menu]);

  const mutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: (result) => {
      const payload = {
        reference: result.reference,
        total: result.total,
        customer: form,
        items: items.map((i) => ({ ...i })),
      };
      window.sessionStorage.setItem("traiteur.last_order", JSON.stringify(payload));
      clear();
      navigate({ to: "/confirmation" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function submit() {
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Veuillez compléter vos informations de livraison.");
      return;
    }
    setErrors({});
    if (!accepted) {
      toast.error("Vous devez accepter la condition de non-remboursement.");
      return;
    }
    if (unavailable.length > 0) {
      toast.error("Certains produits ne sont plus disponibles, mettez le panier à jour.");
      return;
    }
    mutation.mutate({
      customer: parsed.data,
      items: items.map((i) => ({ day_product_id: i.day_product_id, quantity: i.quantity })),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Ma précommande</h1>

        {items.length === 0 ? (
          <div className="surface-card mt-8 p-10 text-center">
            <p className="text-muted-foreground">Votre panier est vide.</p>
            <Button asChild className="mt-4">
              <Link to="/">Voir le menu</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              {grouped.map(([day, dayItems]) => (
                <section key={day} className="surface-card p-4">
                  <h2 className="font-display text-lg font-bold text-primary">{formatDay(day)}</h2>
                  <ul className="mt-3 divide-y divide-border">
                    {dayItems.map((item) => (
                      <li
                        key={item.day_product_id}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} l'unité
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Retirer une unité"
                            onClick={() => setQuantity(item.day_product_id, item.quantity - 1)}
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="w-6 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Ajouter une unité"
                            onClick={() => setQuantity(item.day_product_id, item.quantity + 1)}
                          >
                            <Plus className="size-4" />
                          </Button>
                          <span className="w-24 text-right font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Supprimer"
                            onClick={() => remove(item.day_product_id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {unavailable.length > 0 && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  Désolé, ces produits ne sont plus disponibles en quantité suffisante :{" "}
                  {unavailable.map((i) => i.name).join(", ")}. Veuillez ajuster votre panier.
                </div>
              )}

              <section className="surface-card space-y-4 p-4">
                <h2 className="font-display text-lg font-bold text-primary">
                  Informations de livraison
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="last_name"
                    label="Nom *"
                    value={form.last_name}
                    error={errors["last_name"]}
                    onChange={(v) => setForm({ ...form, last_name: v })}
                  />
                  <Field
                    id="first_name"
                    label="Prénom *"
                    value={form.first_name}
                    error={errors["first_name"]}
                    onChange={(v) => setForm({ ...form, first_name: v })}
                  />
                  <Field
                    id="phone"
                    label="Téléphone *"
                    value={form.phone}
                    error={errors["phone"]}
                    onChange={(v) => setForm({ ...form, phone: v })}
                  />
                  <Field
                    id="address"
                    label="Adresse de livraison *"
                    value={form.address}
                    error={errors["address"]}
                    onChange={(v) => setForm({ ...form, address: v })}
                  />
                  <Field
                    id="address_extra"
                    label="Complément d'adresse"
                    value={form.address_extra}
                    onChange={(v) => setForm({ ...form, address_extra: v })}
                  />
                  <Field
                    id="landmark"
                    label="Point de repère"
                    value={form.landmark}
                    onChange={(v) => setForm({ ...form, landmark: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions de livraison</Label>
                  <Textarea
                    id="instructions"
                    maxLength={500}
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  />
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="surface-card space-y-4 p-5">
                <h2 className="font-display text-lg font-bold text-primary">Récapitulatif</h2>
                <ul className="space-y-2 text-sm">
                  {items.map((item) => (
                    <li key={item.day_product_id} className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        {item.quantity} × {item.name}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                  <strong>Important :</strong> toute précommande validée est non remboursable.
                </div>

                <label className="flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={accepted}
                    onCheckedChange={(checked) => setAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <span>
                    J'ai pris connaissance et j'accepte que ma précommande soit non remboursable.
                  </span>
                </label>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!accepted || mutation.isPending}
                  onClick={submit}
                >
                  {mutation.isPending ? "Validation en cours…" : "Valider ma précommande"}
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} maxLength={300} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
