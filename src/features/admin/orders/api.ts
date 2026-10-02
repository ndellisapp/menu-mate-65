import { queryOptions } from "@tanstack/react-query";
import { db, run } from "@/lib/db";

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
  order_type: string;
  deposit_required: number;
  payment_method: string | null;
  payment_reference: string | null;
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
