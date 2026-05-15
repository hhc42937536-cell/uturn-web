import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const maxDuration = 120;

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];

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

const COUNTRIES = [
  { code: "JP", name: "日本" },
  { code: "KR", name: "韓國" },
  { code: "TH", name: "泰國" },
  { code: "SG", name: "新加坡" },
  { code: "VN", name: "越南" },
  { code: "KUL", name: "馬來西亞吉隆坡" },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const year = today.slice(0, 4);
  const updated: string[] = [];
  const errors: string[] = [];

  for (const { code, name } of COUNTRIES) {
    const isKR = code === "KR";
    const prompt = `今天是 ${today}。你是旅遊達人，請用繁體中文生成 ${year} 年最新的${name}旅遊購物與體驗資訊給台灣旅客。

回傳一個 JSON 物件（只有 JSON，不要加說明文字），格式如下：
{
  "country_name": "${name}",
  "hot_experiences": [{"name": "體驗名稱", "tip": "實用小提示"}],  // 5-6 個最夯體驗
  "must_buy": [{"name": "商品名稱", "category": "分類", "price_range": "價格區間", "where": "購買地點"}],  // 8-10 個必買
  "shopping_areas": [{"name": "商場/區域名", "type": "類型", "tip": "省錢/攻略"}],  // 3-4 個
  "tax_free_tip": "退稅省錢小提示"${isKR ? `,
  "medical_beauty": {"popular_treatments": [{"name": "療程", "price": "價格", "tip": "注意事項"}], "areas": "醫美聚集區域", "warning": "注意事項"}` : ""}
}

確保資訊是 ${year} 年有效的，包含最新爆紅商品或景點。`;

    try {
      const raw = await callGemini(key, prompt);
      const json = extractJson(raw);
      const { error } = await supabase.from("trending_cache").upsert({
        country_code: code,
        data: json,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      updated.push(code);
    } catch (e) {
      errors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({ updated, errors });
}
