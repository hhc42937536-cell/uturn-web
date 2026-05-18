import { supabase } from "./supabase";

const LIMITS: Record<string, { max: number; windowMin: number }> = {
  "generate-itinerary": { max: 5,  windowMin: 60 },  // 每小時最多 5 次行程生成
  "smart-search":       { max: 20, windowMin: 60 },  // 每小時最多 20 次搜尋
};

/**
 * 回傳 true 代表超過限制（應該擋掉）
 */
export async function isRateLimited(
  ip: string,
  endpoint: keyof typeof LIMITS
): Promise<boolean> {
  const rule = LIMITS[endpoint];
  if (!rule) return false;

  const windowStart = new Date(Date.now() - rule.windowMin * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("api_rate_log")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("endpoint", endpoint)
    .gte("called_at", windowStart);

  if ((count ?? 0) >= rule.max) return true;

  // 記錄這次呼叫
  await supabase.from("api_rate_log").insert({ ip, endpoint });
  return false;
}
