import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

export const startPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createInvoice } = await import("./paydunya.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, reference, total, order_type, deposit_required, payment_status")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error || !order) throw new Error("Commande introuvable.");
    if (order.payment_status === "paye" || order.payment_status === "acompte_paye")
      throw new Error("Cette commande est déjà payée.");
    const amount = order.order_type === "precommande" ? order.deposit_required : order.total;
    const origin = new URL(getRequest().url).origin;
    const invoice = await createInvoice({
      amount,
      orderId: order.id,
      origin,
      description:
        order.order_type === "precommande"
          ? `Acompte précommande ${order.reference}`
          : `Commande ${order.reference}`,
    });
    await supabaseAdmin.from("orders").update({ paydunya_token: invoice.token }).eq("id", order.id);
    return { url: invoice.url };
  });

export const checkPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(4).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { syncPayment } = await import("./paydunya.server");
    return syncPayment(data.token);
  });
