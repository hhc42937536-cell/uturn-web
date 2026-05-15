import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import fallbackData from "@/app/lib/idol_events.json";

export const revalidate = 3600;

export async function GET() {
  const { data } = await supabase
    .from("idol_cache")
    .select("data, updated_at")
    .eq("id", "main")
    .single();

  if (data?.data) {
    return NextResponse.json({ data: data.data, updatedAt: data.updated_at, source: "supabase" });
  }

  return NextResponse.json({ data: fallbackData, source: "static" });
}
