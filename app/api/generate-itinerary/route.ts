import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "", {
  apiVersion: "v1beta",
});

export async function POST(req: NextRequest) {
  const { destination, depDate, retDate, people, style } = await req.json();

  const diff = new Date(retDate).getTime() - new Date(depDate).getTime();
  const days = Math.max(2, Math.round(diff / 86400000) + 1);

  const prompt = `你是台灣人出國行程規劃師。請為以下旅程生成每日建議行程，以 JSON 陣列回傳，不要有其他文字。

旅程資訊：
- 目的地：${destination}
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
    "note": "交通小提示或注意事項（簡短）"
  }
]

第一天以抵達為主、最後一天以返程為主，安排不要太滿。`;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const itinerary = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ itinerary });
  } catch (e) {
    console.error("[generate-itinerary]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
