const BASE = "https://app.paydunya.com/api/v1";

function headers() {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env["PAYDUNYA_MASTER_KEY"] ?? "",
    "PAYDUNYA-PRIVATE-KEY": process.env["PAYDUNYA_PRIVATE_KEY"] ?? "",
    "PAYDUNYA-TOKEN": process.env["PAYDUNYA_TOKEN"] ?? "",
  };
}

export async function createInvoice(input: {
  amount: number;
  description: string;
  orderId: string;
  origin: string;
}) {
  const res = await fetch(`${BASE}/checkout-invoice/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      invoice: { total_amount: input.amount, description: input.description },
      store: { name: "Ndelli's Traiteur" },
      actions: {
        cancel_url: `${input.origin}/commande?paiement=annule`,
        return_url: `${input.origin}/confirmation`,
        callback_url: `${input.origin}/api/public/paydunya-ipn`,
      },
      custom_data: { order_id: input.orderId },
    }),
  });
  const json = (await res.json()) as { response_code?: string; response_text?: string; token?: string };
  if (json.response_code !== "00" || !json.token || !json.response_text) {
    console.error("PayDunya create error", json);
    throw new Error("Le paiement PayDunya n'a pas pu être lancé. Réessayez.");
  }
  return { url: json.response_text, token: json.token };
}

export async function confirmInvoice(token: string) {
  const res = await fetch(`${BASE}/checkout-invoice/confirm/${encodeURIComponent(token)}`, {
    headers: headers(),
  });
  const json = (await res.json()) as {
    status?: string;
    invoice?: { total_amount?: number | string };
    custom_data?: { order_id?: string };
  };
  return {
    status: json.status ?? "unknown",
    amount: Number(json.invoice?.total_amount ?? 0),
    orderId: json.custom_data?.order_id,
  };
}

/** Confirms with PayDunya and updates the order. Returns the payment status. */
export async function syncPayment(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, order_type, payment_status")
    .eq("paydunya_token", token)
    .maybeSingle();
  if (!order) return { status: "introuvable" as const };
  const result = await confirmInvoice(token);
  if (result.status === "completed") {
    const paid = order.order_type === "precommande" ? "acompte_paye" : "paye";
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: paid, paid_amount: result.amount })
      .eq("id", order.id);
    return { status: "completed" as const };
  }
  if (result.status === "cancelled" || result.status === "failed") {
    await supabaseAdmin.from("orders").update({ payment_status: "echec_paiement" }).eq("id", order.id);
  }
  return { status: result.status };
}
