import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];

async function callGemini(key: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`[${model}] ${res.status}: ${data.error?.message ?? "API error"}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function POST(req: NextRequest) {
  const { destination, arrAirport, depDate, retDate, people, style, mustVisit } = await req.json();

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  const diff = new Date(retDate).getTime() - new Date(depDate).getTime();
  const days = Math.max(2, Math.round(diff / 86400000) + 1);

  const mustVisitBlock = mustVisit?.trim()
    ? `\n【強制要求】以下景點用戶指定必去，一定要安排進行程，不可省略或替換：\n${mustVisit.trim()}\n`
    : "";

  const prompt = `你是台灣人出國行程規劃師。請為以下旅程生成每日建議行程，以 JSON 陣列回傳，不要有其他文字。
${mustVisitBlock}
旅程資訊：
- 目的地：${destination}${arrAirport ? `（抵達機場：${arrAirport}）` : ""}
- 出發日期：${depDate}
- 回程日期：${retDate}
- 人數：${people}人
- 旅遊風格：${style || "綜合"}
- 天數：${days} 天

JSON 格式（每個元素對應一天，共 ${days} 個）：
[
  {
    "morning": "上午活動（1-2 個景點或體驗，具體說明地點）",
    "afternoon": "下午活動（1-2 個景點，考慮移動時間）",
    "evening": "晚上活動（夜市、夜景、酒吧或演出）",
    "food": "今日必吃（具體餐廳名或料理名）",
    "note": "交通小提示或注意事項（簡短）",
    "memo": "今日備忘事項（訂位提醒、開放時間、票券預訂、人潮建議等，條列 2-3 點）"
  }
]

第一天以抵達為主、最後一天以返程為主，安排不要太滿。`;

  const errors: string[] = [];

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
        const raw = await callGemini(key, model, prompt);
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON in response");
        const itinerary = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ itinerary });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(msg);
        console.error(`[generate-itinerary] attempt ${attempt + 1} model=${model}:`, msg);
        // 只有 503/429 才重試，其他直接換模型
        if (!msg.includes("503") && !msg.includes("429")) break;
      }
    }
  }

  return NextResponse.json({ error: errors.at(-1) ?? "All models failed" }, { status: 500 });
}
