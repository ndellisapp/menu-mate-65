import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "./format";

export type ProductState = "disponible" | "epuise" | "ferme" | "desactive" | "jour_ferme";

export type MenuRow = {
  day_product_id: string;
  day_id: string;
  day_date: string;
  day_open: boolean;
  week_id: string;
  start_date: string;
  end_date: string;
  product_id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  category: string;
  price: number;
  stock_initial: number;
  stock_reserved: number;
  stock_left: number;
  open_time: string;
  close_time: string;
  is_active: boolean;
  state: ProductState;
};

export type Week = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  published_at: string | null;
};

export type Day = {
  id: string;
  week_id: string;
  date: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  category: string;
  base_price: number;
  active: boolean;
};

export type Order = {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  address_extra: string | null;
  landmark: string | null;
  instructions: string | null;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  day_date: string;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

type AnyClient = {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => any;
};

const db = supabase as unknown as AnyClient;

async function run<T>(builder: any): Promise<T> {
  const { data, error } = await builder;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const publicMenuQuery = () =>
  queryOptions({
    queryKey: ["menu", "public"],
    queryFn: () =>
      run<MenuRow[]>(
        db.from("menu_view").select("*").gte("day_date", todayISO()).order("day_date"),
      ),
    refetchInterval: 60_000,
  });

export const adminMenuQuery = () =>
  queryOptions({
    queryKey: ["menu", "admin"],
    queryFn: () => run<MenuRow[]>(db.from("menu_view").select("*").order("day_date")),
  });

export const weeksQuery = () =>
  queryOptions({
    queryKey: ["weeks"],
    queryFn: () =>
      run<Week[]>(db.from("weeks").select("*").order("start_date", { ascending: false })),
  });

export const daysQuery = () =>
  queryOptions({
    queryKey: ["days"],
    queryFn: () => run<Day[]>(db.from("days").select("*").order("date")),
  });

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: () => run<Product[]>(db.from("products").select("*").order("name")),
  });

export const ordersQuery = () =>
  queryOptions({
    queryKey: ["orders"],
    queryFn: () =>
      run<Order[]>(db.from("orders").select("*").order("created_at", { ascending: false })),
  });

export const orderItemsQuery = () =>
  queryOptions({
    queryKey: ["order_items"],
    queryFn: () => run<OrderItem[]>(db.from("order_items").select("*")),
  });

export type PlaceOrderPayload = {
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    address_extra?: string | undefined;
    landmark?: string | undefined;
    instructions?: string | undefined;
  };
  items: { day_product_id: string; quantity: number }[];
};

/** True when the failure is just an aborted/cancelled request (navigation, retry),
 * not a real server error the user should see. */
export function isCancelledError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /cancelled|canceled|aborted|abort/i.test(message);
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const { data, error } = await db.rpc("place_order", {
    p_customer: payload.customer,
    p_items: payload.items,
  });
  if (error) throw new Error(error.message);
  return data as { reference: string; total: number; order_id: string };
}

export { db };
