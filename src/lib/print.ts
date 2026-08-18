import { formatDay, formatPrice, ORDER_STATUS_LABELS } from "./format";
import type { Order, OrderItem } from "./api";

function openPrintWindow(title: string, body: string, extraCss = "") {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return;
  win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Manrope", Arial, sans-serif; color: #3b2a1d; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 20px 0 8px; border-bottom: 1px solid #d9c8b6; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #d9c8b6; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f4ece3; }
  .muted { color: #7a6a5c; font-size: 12px; }
  ${extraCss}
</style></head><body>${body}<script>window.onload=()=>{window.print()}<\/script></body></html>`);
  win.document.close();
}

export function printOrders(orders: Order[], items: OrderItem[], title: string) {
  const rows = orders
    .map((order) => {
      const lines = items.filter((i) => i.order_id === order.id);
      const days = [...new Set(lines.map((l) => l.day_date))].sort();
      return `<tr>
        <td><strong>${order.reference}</strong><br /><span class="muted">${new Date(order.created_at).toLocaleString("fr-FR")}</span></td>
        <td>${order.last_name} ${order.first_name}<br /><span class="muted">${order.phone}</span></td>
        <td>${order.address}${order.address_extra ? `<br /><span class="muted">${order.address_extra}</span>` : ""}${order.landmark ? `<br /><span class="muted">Repère : ${order.landmark}</span>` : ""}</td>
        <td>${days.map(formatDay).join("<br />")}</td>
        <td>${lines.map((l) => `${l.quantity} × ${l.product_name} <span class="muted">(${formatDay(l.day_date)})</span>`).join("<br />")}</td>
        <td>${formatPrice(order.total)}</td>
        <td>${ORDER_STATUS_LABELS[order.status] ?? order.status}</td>
      </tr>`;
    })
    .join("");

  openPrintWindow(
    title,
    `<h1>${title}</h1>
     <p class="muted">${orders.length} commande(s) — Total ${formatPrice(orders.reduce((s, o) => s + o.total, 0))}</p>
     <table><thead><tr><th>Référence</th><th>Client</th><th>Adresse</th><th>Jour(s)</th><th>Produits</th><th>Total</th><th>Statut</th></tr></thead>
     <tbody>${rows}</tbody></table>`,
  );
}

export function printStickers(orders: Order[], items: OrderItem[], title: string) {
  const cards = orders
    .map((order) => {
      const lines = items.filter((i) => i.order_id === order.id);
      const byDay = new Map<string, OrderItem[]>();
      lines.forEach((l) => byDay.set(l.day_date, [...(byDay.get(l.day_date) ?? []), l]));
      return [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
          ([day, dayLines]) => `<div class="sticker">
            <div class="logo">TRAITEUR</div>
            <div class="ref">COMMANDE #${order.reference}</div>
            <div class="name">${order.last_name} ${order.first_name}</div>
            <div class="small">${order.phone}</div>
            <div class="small">${order.address}${order.landmark ? ` — ${order.landmark}` : ""}</div>
            <div class="day">${formatDay(day).toUpperCase()}</div>
            <ul>${dayLines.map((l) => `<li>${l.quantity} × ${l.product_name}</li>`).join("")}</ul>
          </div>`,
        )
        .join("");
    })
    .join("");

  openPrintWindow(
    title,
    `<div class="sheet">${cards}</div>`,
    `.sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8mm; }
     .sticker { border: 1px dashed #a98a6b; border-radius: 6px; padding: 8mm; height: 62mm; page-break-inside: avoid; }
     .logo { font-weight: 800; letter-spacing: 3px; font-size: 11px; color: #8a5a34; }
     .ref { font-size: 13px; font-weight: 700; margin-top: 4px; }
     .name { font-size: 16px; font-weight: 700; margin-top: 6px; }
     .small { font-size: 11px; color: #5c4a3c; }
     .day { margin-top: 6px; font-weight: 700; font-size: 12px; letter-spacing: 1px; }
     ul { margin: 4px 0 0 16px; padding: 0; font-size: 12px; }`,
  );
}

export function printProduction(
  title: string,
  rows: { name: string; category: string; quantity: number }[],
) {
  const totalPlats = rows.filter((r) => r.category === "plat").reduce((s, r) => s + r.quantity, 0);
  const totalJus = rows.filter((r) => r.category === "jus").reduce((s, r) => s + r.quantity, 0);
  openPrintWindow(
    title,
    `<h1>${title}</h1>
     <table><thead><tr><th>Produit</th><th>Catégorie</th><th>Quantité</th></tr></thead>
     <tbody>${rows.map((r) => `<tr><td>${r.name}</td><td>${r.category}</td><td>${r.quantity}</td></tr>`).join("")}</tbody></table>
     <p><strong>Total repas : ${totalPlats}</strong> — <strong>Total jus : ${totalJus}</strong></p>`,
  );
}
