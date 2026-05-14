import { NextRequest, NextResponse } from "next/server";

const EXPERIENCE_MAP = [
  {
    keywords: ["極光", "北極光", "aurora"],
    label: "極光旅遊",
    destinations: [
      { flag: "🇮🇸", name: "冰島", desc: "全球最易見極光的地方" },
      { flag: "🇳🇴", name: "挪威特羅姆瑟", desc: "北極圈內，極光觀測聖地" },
      { flag: "🇫🇮", name: "芬蘭羅瓦涅米", desc: "聖誕老公公的故鄉" },
    ],
  },
  {
    keywords: ["富士山", "賞楓", "賞櫻", "溫泉", "和風", "日本味"],
    label: "日本傳統體驗",
    destinations: [
      { flag: "🇯🇵", name: "東京", desc: "購物美食，大城市體驗" },
      { flag: "🇯🇵", name: "京都", desc: "古都神社，最道地和風" },
      { flag: "🇯🇵", name: "大阪", desc: "美食之都，庶民文化" },
    ],
  },
  {
    keywords: ["海島", "潛水", "浮潛", "沙灘", "海灘", "度假村", "碧海"],
    label: "海島渡假",
    destinations: [
      { flag: "🇮🇩", name: "峇里島", desc: "神廟梯田，浪漫首選" },
      { flag: "🇵🇭", name: "宿霧", desc: "超透明海水，便宜潛水" },
      { flag: "🇹🇭", name: "普吉島", desc: "泰國最美海島" },
    ],
  },
  {
    keywords: ["購物", "血拼", "名牌", "outlet", "免稅"],
    label: "購物天堂",
    destinations: [
      { flag: "🇰🇷", name: "首爾", desc: "東大門、明洞、弘大" },
      { flag: "🇯🇵", name: "東京", desc: "銀座、原宿、秋葉原" },
      { flag: "🇸🇬", name: "新加坡", desc: "烏節路，亞洲購物中心" },
    ],
  },
  {
    keywords: ["美食", "吃貨", "必吃", "街頭小吃", "食物"],
    label: "美食之旅",
    destinations: [
      { flag: "🇹🇭", name: "曼谷", desc: "街頭小吃天堂" },
      { flag: "🇯🇵", name: "大阪", desc: "吃貨之都，章魚燒發源地" },
      { flag: "🇸🇬", name: "新加坡", desc: "小販中心，多元飲食文化" },
    ],
  },
  {
    keywords: ["蜜月", "求婚", "情侶", "浪漫", "約會"],
    label: "浪漫情侶行",
    destinations: [
      { flag: "🇫🇷", name: "巴黎", desc: "愛情之都，艾菲爾鐵塔" },
      { flag: "🇮🇩", name: "峇里島", desc: "私人泳池別墅，超浪漫" },
      { flag: "🇯🇵", name: "京都", desc: "和服漫步，最美古都" },
    ],
  },
  {
    keywords: ["親子", "帶小孩", "迪士尼", "樂園", "遊樂園", "小朋友"],
    label: "親子旅遊",
    destinations: [
      { flag: "🇯🇵", name: "東京", desc: "迪士尼、環球影城" },
      { flag: "🇭🇰", name: "香港", desc: "迪士尼、海洋公園" },
      { flag: "🇸🇬", name: "新加坡", desc: "環球影城、動物園" },
    ],
  },
  {
    keywords: ["滑雪", "雪地", "看雪", "玩雪", "雪山"],
    label: "滑雪雪地",
    destinations: [
      { flag: "🇯🇵", name: "北海道", desc: "粉雪天堂，二世谷/富良野" },
      { flag: "🇰🇷", name: "首爾", desc: "近郊滑雪場，方便又划算" },
      { flag: "🇨🇭", name: "瑞士", desc: "阿爾卑斯山，歐洲頂級雪場" },
    ],
  },
  {
    keywords: ["賭場", "賭博", "娛樂場"],
    label: "娛樂賭場",
    destinations: [
      { flag: "🇲🇴", name: "澳門", desc: "亞洲賭城，美食購物" },
      { flag: "🇸🇬", name: "新加坡", desc: "濱海灣金沙，合法賭場" },
    ],
  },
];

async function geminiSearch(query: string, key: string) {
  const prompt = `台灣旅客想去旅遊，他說：「${query}」

請推薦 3 個最適合的旅遊目的地（亞洲為主），以 JSON 格式回傳，不要有其他文字：
[
  { "flag": "國旗emoji", "name": "城市名", "desc": "一句話理由（繁體中文，20字內）" },
  ...
]`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) return null;
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: "empty query" }, { status: 400 });

  // 先做關鍵字快速比對
  for (const entry of EXPERIENCE_MAP) {
    if (entry.keywords.some((kw) => query.includes(kw))) {
      return NextResponse.json({ label: entry.label, destinations: entry.destinations, source: "keyword" });
    }
  }

  // fallback: Gemini
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "no key" }, { status: 500 });
  try {
    const destinations = await geminiSearch(query, key);
    return NextResponse.json({ label: `「${query}」的推薦目的地`, destinations, source: "gemini" });
  } catch {
    return NextResponse.json({ error: "搜尋失敗" }, { status: 500 });
  }
}
