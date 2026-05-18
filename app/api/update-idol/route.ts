import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const maxDuration = 120;

const MODELS = ["gemini-2.0-flash-lite", "gemini-1.5-flash"];

async function callGemini(key: string, prompt: string): Promise<string> {
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const d = await res.json();
      if (res.ok) return d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch { /* 換下一個 model */ }
  }
  throw new Error("All Gemini models failed");
}

function extractJson(raw: string): unknown {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/);
  return JSON.parse(match ? match[1] : raw);
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const year = today.slice(0, 4);

  const prompt = `今天是 ${today}。請用繁體中文，整理 ${year} 年最受台灣旅客歡迎的日韓追星旅遊資訊。

回傳一個 JSON 物件（只有 JSON，不要加說明文字），格式如下：
{
  "groups": {
    "KR": [{"name": "團體名", "search_name": "搜尋用名稱（英文）", "agency": "所屬公司", "genre": "類型"}],
    "JP": [{"name": "團體名", "search_name": "搜尋用名稱", "agency": "所屬公司", "genre": "類型"}]
  },
  "actors": {
    "KR": [{"name": "藝人名", "search_name": "搜尋用名稱（英文）", "known_for": "代表作", "agency": "所屬公司", "type": "演員/主持人等"}],
    "JP": [{"name": "藝人名", "search_name": "搜尋用名稱", "known_for": "代表作", "agency": "所屬公司", "type": "類型"}]
  },
  "fan_shops": {
    "KR": [{"name": "店名", "type": "官方周邊店/周邊商場等", "location": "地址/區域"}],
    "JP": [{"name": "店名", "type": "類型", "location": "地址/區域"}]
  },
  "tips": ["追星旅遊實用技巧1", "技巧2", "技巧3", "技巧4", "技巧5"]
}

要求：
- KR groups 列出 15-20 個最活躍的 K-POP 團體
- JP groups 列出 10-15 個台灣粉絲最多的日本歌手/偶像團體
- actors 各 8-10 個
- fan_shops 各 5-8 個
- 確保包含 ${year} 年最新活躍的藝人`;

  try {
    const raw = await callGemini(key, prompt);
    const json = extractJson(raw);
    const { error } = await supabase.from("idol_cache").upsert({
      id: "main",
      data: json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
