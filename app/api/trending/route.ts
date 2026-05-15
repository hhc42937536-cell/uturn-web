import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import fallbackData from "@/app/lib/souvenirs.json";

export const revalidate = 3600; // 1 小時快取

export async function GET() {
  const { data } = await supabase
    .from("trending_cache")
    .select("country_code, data, updated_at");

  if (data && data.length > 0) {
    const merged: Record<string, unknown> = { ...(fallbackData as Record<string, unknown>) };
    for (const row of data) {
      merged[row.country_code] = row.data;
    }
    // 取最新 updated_at
    const updatedAt = data.reduce((a, b) =>
      a.updated_at > b.updated_at ? a : b
    ).updated_at;
    return NextResponse.json({ data: merged, updatedAt, source: "supabase" });
  }

  return NextResponse.json({ data: fallbackData, source: "static" });
}
