/**
 * 用 Claude API 為指定城市生成更多景點資料
 * 用法：node scripts/gen-spots.mjs <城市名> <IATA碼> [數量]
 *
 * 範例：
 *   node scripts/gen-spots.mjs 神戶 KBE 15
 *   node scripts/gen-spots.mjs 小樽 OTR 12
 *
 * 輸出格式可直接貼到 spotData.ts 的 CITY_SPOTS 裡。
 * 需要環境變數 ANTHROPIC_API_KEY（或建立 .env.local）
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";

// 嘗試讀 .env.local
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local */ }

const [city, code, countArg] = process.argv.slice(2);
if (!city || !code) {
  console.error("用法：node scripts/gen-spots.mjs <城市名> <IATA碼> [數量]");
  process.exit(1);
}
const count = parseInt(countArg ?? "15", 10);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const prompt = `你是一位熟悉亞洲旅遊的達人，請為「${city}」生成 ${count} 個適合台灣旅客的景點資料。

**格式要求（TypeScript 陣列字面量，直接可貼入程式碼）：**
\`\`\`typescript
  ${code.toUpperCase()}: [
    { id: "${code.toLowerCase()}-1",  name: "景點中文名", category: "景點" | "美食" | "購物" | "體驗", lat: 緯度數字, lng: 經度數字, duration: "Xhr", tip: "給台灣旅客的實用小提示（30字內）" },
    ...
  ],
\`\`\`

**規則**：
- category 只能是 "景點"、"美食"、"購物"、"體驗" 之一
- duration 格式："1hr"、"1.5hr"、"2hr"、"全天"、"半天"
- lat/lng 必須是正確的 WGS84 座標（小數點後 4 位）
- tip 要具體實用，例如說明最佳時段、注意事項、票價、交通方式
- 涵蓋不同類型：歷史景點、在地美食、購物、特殊體驗、網美打卡點
- 避開太普通的景點，多推薦當地人才知道或特殊的地方
- 不要包含 markdown 以外的解說，只輸出程式碼區塊`;

console.log(`\n正在用 Claude 生成 ${city}（${code}）的 ${count} 個景點...\n`);

const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4000,
  messages: [{ role: "user", content: prompt }],
});

const text = message.content[0].type === "text" ? message.content[0].text : "";

// 提取程式碼區塊
const match = text.match(/```(?:typescript)?\n([\s\S]+?)```/);
if (match) {
  console.log("─── 複製以下內容貼入 CITY_SPOTS ───\n");
  console.log(match[1].trim());
  console.log("\n────────────────────────────────────");
} else {
  console.log("原始輸出：\n", text);
}
