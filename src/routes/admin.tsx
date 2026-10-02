import { createFileRoute, Link, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CalendarRange, LayoutDashboard, LogOut, Package, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Back-office gérant — Traiteur" },
      { name: "description", content: "Gestion des semaines, produits, stocks et commandes." },
      { property: "og:title", content: "Back-office gérant — Traiteur" },
      { property: "og:description", content: "Administration du service traiteur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/weeks", label: "Semaines & menus", icon: CalendarRange, exact: false },
  { to: "/admin/products", label: "Produits", icon: Package, exact: false },
  { to: "/admin/orders", label: "Commandes", icon: ShoppingBag, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<"loading" | "ready" | "denied">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: isAdmin } = await db.rpc("is_admin");
      if (!active) return;
      if (isAdmin) {
        setState("ready");
        return;
      }
      const { data: claimed } = await db.rpc("claim_admin");
      if (!active) return;
      setState(claimed ? "ready" : "denied");
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    router.navigate({ to: "/auth", replace: true });
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-muted-foreground">Chargement du back-office…</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="surface-card max-w-md p-8 text-center">
          <h1 className="font-display text-xl font-bold">Accès refusé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Votre compte n'a pas les droits d'administration.
          </p>
          <Button className="mt-4" variant="secondary" onClick={signOut}>
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-warm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex items-center justify-between gap-4">
            <Link to="/admin" className="flex shrink-0 items-center gap-3" aria-label="Ndelli's — Tableau de bord">
              <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground"><UtensilsCrossed className="size-5" /></span>
              <span className="leading-tight"><span className="block font-display text-xl font-bold">Ndelli's<span className="text-accent">.</span></span><span className="block text-[11px] font-medium uppercase text-sidebar-foreground/65">Espace gérant</span></span>
            </Link>
            <div className="flex items-center gap-1 lg:hidden">
              <Button asChild variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent" title="Voir le site"><Link to="/"><ArrowUpRight className="size-4" /></Link></Button>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-sidebar-foreground hover:bg-sidebar-accent" title="Déconnexion" aria-label="Déconnexion"><LogOut className="size-4" /></Button>
            </div>
          </div>
          <nav aria-label="Navigation gérant" className="flex w-full min-w-0 gap-1 overflow-x-auto border-t border-sidebar-border pt-3 scrollbar-hide lg:w-auto lg:flex-1 lg:border-t-0 lg:pt-0">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-accent"
                activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground" }}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Link to="/"><ArrowUpRight className="size-4" /> Voir le site</Link>
            </Button>
            <Button
              size="sm"
              onClick={signOut}
              className="rounded-full bg-accent text-accent-foreground hover:opacity-90"
            >
              <LogOut className="size-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
