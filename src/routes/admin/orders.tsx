import { createFileRoute } from "@tanstack/react-router";

import { OrdersPage } from "@/features/admin/orders/orders-page";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Commandes — Ndelli's Traiteur" },
      { name: "description", content: "Suivi des commandes et précommandes du traiteur." },
      { property: "og:title", content: "Commandes — Ndelli's Traiteur" },
      { property: "og:description", content: "Suivi des commandes et précommandes du traiteur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});
