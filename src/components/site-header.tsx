import { Link } from "@tanstack/react-router";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/cart";

const NAV_LINK =
  "rounded-full px-4 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:text-accent";

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-sidebar text-sidebar-foreground shadow-warm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-sidebar-foreground">
            Traiteur<span className="text-accent">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" className={NAV_LINK} activeProps={{ className: "text-accent" }}>
            Menu
          </Link>
          <Link to="/auth" className={NAV_LINK}>
            Espace gérant
          </Link>
          <Link
            to="/commande"
            className="ml-2 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingBag className="size-4" />
            Panier
            {count > 0 && (
              <span className="rounded-full bg-accent-foreground/20 px-2 text-xs font-bold">
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
