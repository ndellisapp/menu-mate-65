import { createFileRoute, Link, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarRange, LayoutDashboard, LogOut, Package, ShoppingBag } from "lucide-react";
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
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="font-display text-lg font-bold text-primary">Back-office</span>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Voir le site</Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={signOut}>
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
