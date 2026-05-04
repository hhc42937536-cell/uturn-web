import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(url, key);

export type SharedTrip = {
  id: string;
  city: string;
  flag: string;
  days: number;
  people: number;
  request: string;
  departure_date: string;
  return_date: string;
  likes: number;
  created_at: string;
};
