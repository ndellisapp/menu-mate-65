import { Link } from "@tanstack/react-router";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="font-display text-lg font-bold text-primary">Traiteur</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-2 font-medium text-foreground/80 transition-colors hover:bg-secondary"
          >
            Menu
          </Link>
          <Link
            to="/commande"
            className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingBag className="size-4" />
            Panier
            {count > 0 && (
              <span className="rounded-full bg-accent-foreground/15 px-2 text-xs font-bold">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Précommandes du lundi au vendredi — livraison à Dakar.</p>
        <Link to="/auth" className="font-medium text-primary hover:underline">
          Espace gérant
        </Link>
      </div>
    </footer>
  );
}
