import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/features/admin/layout/admin-layout";

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
