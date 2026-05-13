"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── 機場到市區交通（依目的地機場）─────────────────────────
const ARRIVAL_TRANSPORT: Record<string, { title: string; steps: string[]; tip: string }> = {
  ICN: {
    title: "仁川機場 → 首爾市區",
    steps: [
      "入境大廳 B1 搭機場鐵路（AREX）",
      "直達列車到首爾站約 43 分鐘，₩9,500",
      "一般列車各站都停，約 66 分鐘，₩4,150",
      "首爾站轉 1 號線或 4 號線到明洞、弘大",
    ],
    tip: "機場巴士（리무진버스）直達明洞，約 70 分鐘，₩16,000；叫 Kakao T 計程車約 ₩70,000",
  },
  GMP: {
    title: "金浦機場 → 首爾市區",
    steps: [
      "地下 1 樓搭地鐵 5 號線（紫色）",
      "孔德站轉 6 號線，忠武路站下車",
      "步行 8 分鐘到明洞，全程約 50 分鐘",
      "費用約 ₩1,500（NT$35）",
    ],
    tip: "Kakao T 計程車直達明洞，約 ₩25,000–₩35,000（NT$600–850）",
  },
  NRT: {
    title: "成田機場 → 東京市區",
    steps: [
      "成田特快 N'EX 到新宿/澀谷約 90 分鐘，¥3,070",
      "京成 Skyliner 到上野/日暮里約 41 分鐘，¥2,570",
      "利木津巴士到主要飯店區約 60–90 分鐘",
      "IC 卡（Suica）在機場自動售票機購買",
    ],
    tip: "建議出發前在台灣購買 Suica/PASMO，或到機場 1F 購買",
  },
  HND: {
    title: "羽田機場 → 東京市區",
    steps: [
      "東京單軌電車到濱松町，轉 JR 山手線，約 30 分鐘",
      "京急線直通品川站約 13 分鐘，¥600",
      "利木津巴士到主要飯店區約 30–60 分鐘",
    ],
    tip: "羽田距市區近，計程車到新宿約 ¥4,500–¥6,000",
  },
  KIX: {
    title: "關西機場 → 大阪市區",
    steps: [
      "特急「Haruka」到大阪/新大阪約 75 分鐘，¥3,640",
      "南海電鐵特急到難波約 38 分鐘，¥1,450",
      "機場巴士到大阪市區約 50–70 分鐘",
    ],
    tip: "建議買 ICOCA 卡或 KANSAI THRU PASS，搭車更方便",
  },
  BKK: {
    title: "蘇萬納普機場 → 曼谷市區",
    steps: [
      "機場快線（ARL）到市區 Phaya Thai 站約 30 分鐘，฿45",
      "Phaya Thai 轉 BTS 空鐵，達市內各大站",
      "計程車打錶從 ฿200 起（加高速費），車程 30–60 分鐘",
    ],
    tip: "Grab 叫車比計程車透明，出關後在 4 樓 Grab 指定區等車",
  },
  SIN: {
    title: "樟宜機場 → 新加坡市區",
    steps: [
      "地鐵 EWL 到市區 City Hall 約 35 分鐘，S$2.5",
      "直接在機場買 EZ-Link 交通卡使用",
      "計程車/Grab 到烏節路約 S$20–30",
    ],
    tip: "樟宜機場本身就是景點（Jewel 瀑布），建議早到多逛一小時",
  },
  HKG: {
    title: "香港國際機場 → 市區",
    steps: [
      "機場快線（AEL）到香港站約 24 分鐘，HK$115",
      "機場巴士 A11/A21 到各市區，約 60 分鐘，HK$40",
      "計程車到旺角約 HK$250–350",
    ],
    tip: "機場快線可在香港站/九龍站辦理 In-Town Check-in，省去拖行李的麻煩",
  },
  SGN: {
    title: "新山一機場 → 胡志明市區",
    steps: [
      "109 號巴士（機場巴士）到市中心約 60 分鐘，₫6,000",
      "Grab 計程車到第一郡約 ₫150,000–200,000",
      "Vinasun/Mai Linh 計程車打錶，約 ₫150,000",
    ],
    tip: "強烈建議用 Grab，避免被機場外的計程車坑",
  },
};

// ── 6 步驟靜態資料 ─────────────────────────────────────────
const STEPS = [
  {
    step: "STEP 0",
    title: "出發前準備",
    color: "#37474F",
    icon: "🧳",
    items: [
      "護照（有效期至少 6 個月）",
      "電子機票（手機存截圖 + email 備份）",
      "信用卡 / 現金（少量台幣換當地幣）",
      "手機充電器、轉接頭",
      "行動電源（100Wh 以下才能帶上機）",
      "提前下載：航空公司 App、目的地地圖 App",
    ],
    tip: "行李限重看票種（通常 20–23 kg 托運 + 7 kg 手提），超重費超貴，提前在家秤好！",
  },
  {
    step: "STEP 1",
    title: "辦理登機 Check-in",
    color: "#1565C0",
    icon: "🛫",
    items: [
      "出發前 2.5 小時抵達機場（國際線）",
      "看大廳「出發資訊」電子看板，找航班號碼與航空公司",
      "到對應航空公司的「報到櫃台」排隊",
      "把護照 + 電子機票（手機或列印）交給地勤人員",
      "告知是否要托運行李（地勤會幫你貼行李條並稱重）",
      "拿回護照 + 登機證，確認班機號、座位、登機門",
    ],
    tip: "找不到櫃台？問機場工作人員「請問 [航空公司] 的 Check-in 在哪裡？」",
  },
  {
    step: "STEP 2",
    title: "安全檢查 + 出境",
    color: "#6A1B9A",
    icon: "🛂",
    items: [
      "找「出境 / Departure」指標往前走",
      "安全檢查：把背包、筆電、外套、皮帶全放進 X 光籃子",
      "液體/凝膠：每件 100ml 以下，全部裝進 1 個透明夾鏈袋",
      "身上金屬物品（鑰匙、零錢）全部取出",
      "出境查驗：走「本國人（ROC/Taiwan）」通道",
      "護照遞給海關蓋章，或走 e-Gate 自動通關",
    ],
    tip: "e-Gate 快速通關需先向移民署申請（申辦一次，往後都能用），強烈推薦！",
  },
  {
    step: "STEP 3",
    title: "候機 + 登機",
    color: "#2E7D32",
    icon: "🚪",
    items: [
      "過安檢後看登機證上的「Gate（登機門）」號碼",
      "依指標走到對應登機門（提前 30 分鐘到）",
      "聽廣播：先叫頭等/商務/需要協助的旅客，再叫各排號碼",
      "輪到你時，把登機證 + 護照給工作人員掃描",
      "找到你的座位號碼（例：23A → 第 23 排靠窗左側）",
      "手提行李放頭頂行李架，貴重物品放腳邊",
    ],
    tip: "找不到座位？問空服員「Excuse me, can you help me find seat 23A?」",
  },
  {
    step: "STEP 4",
    title: "抵達目的地 入境",
    color: "#AD1457",
    icon: "🛬",
    items: [
      "飛機落地後跟「入境 / Arrivals」指標走",
      "入境審查：外國人通道（Foreigner）排隊",
      "護照交給當地海關，可能問「旅遊目的」→ 回答「Tourism（觀光）」",
      "領行李：看電子看板找航班號碼對應的行李轉盤",
      "海關申報：沒有超額物品直接走綠色通道「Nothing to Declare」",
      "出關後就是入境大廳，找交通指標前往市區",
    ],
    tip: "行李還沒出來很正常，最慢也會在 30 分鐘內出現",
  },
];

// ── 目的地機場選單 ─────────────────────────────────────────
const AIRPORTS = [
  { code: "ICN", label: "首爾（仁川 ICN）", flag: "🇰🇷" },
  { code: "GMP", label: "首爾（金浦 GMP）", flag: "🇰🇷" },
  { code: "NRT", label: "東京（成田 NRT）", flag: "🇯🇵" },
  { code: "HND", label: "東京（羽田 HND）", flag: "🇯🇵" },
  { code: "KIX", label: "大阪（關西 KIX）", flag: "🇯🇵" },
  { code: "BKK", label: "曼谷（蘇萬納普 BKK）", flag: "🇹🇭" },
  { code: "SIN", label: "新加坡（樟宜 SIN）", flag: "🇸🇬" },
  { code: "HKG", label: "香港（HKG）", flag: "🇭🇰" },
  { code: "SGN", label: "胡志明市（SGN）", flag: "🇻🇳" },
];

const DEFAULT_ARRIVAL = {
  title: "機場到市區",
  steps: [
    "入境後在出口找「旅客服務中心 / Information」",
    "詢問前往市區的交通方式（地鐵 / 巴士 / 計程車）",
    "確認飯店是否有提供接駁服務",
  ],
  tip: "在機場換少量當地現金備用，ATM 通常在入境大廳",
};

const STEP_COLORS = ["#37474F", "#1565C0", "#6A1B9A", "#2E7D32", "#AD1457"];

export default function AirportView() {
  const router = useRouter();
  const [destAirport, setDestAirport] = useState("ICN");
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const arrival = ARRIVAL_TRANSPORT[destAirport] ?? DEFAULT_ARRIVAL;

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">機場攻略</span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Airport Guide</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">新手機場完整攻略</h1>
          <p className="text-sm font-light text-[#8A7F73]">從辦理登機到抵達飯店，6 個步驟帶你走完</p>
        </div>

        {/* 目的地機場選擇 */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 mb-8">
          <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">✈️ 你要去哪個機場？（影響第 6 步驟）</p>
          <div className="flex flex-wrap gap-2">
            {AIRPORTS.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => setDestAirport(code)}
                className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                  ${destAirport === code
                    ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                    : "border-[#D8D2C7] bg-white text-[#4B4037] hover:border-[#A86F5A]"}`}
              >
                {flag} {label}
              </button>
            ))}
          </div>
        </div>

        {/* 步驟卡片 */}
        <div className="space-y-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={i}
              className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] overflow-hidden">
              {/* 步驟標題列（可點擊展開） */}
              <button
                className="w-full flex items-center gap-4 px-6 py-5 text-left"
                onClick={() => setActiveStep(activeStep === i ? null : i)}
              >
                <div
                  className="shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white"
                  style={{ backgroundColor: STEP_COLORS[i] ?? "#A86F5A" }}
                >
                  <span className="text-[10px] font-light opacity-70">{s.step}</span>
                  <span className="text-xl leading-none">{s.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-light tracking-wide text-[#3A2E26]">{s.title}</h3>
                  <p className="text-xs font-light text-[#8A7F73] mt-0.5">{s.items.length} 個步驟</p>
                </div>
                <span className="text-[#A86F5A] text-sm">{activeStep === i ? "▲" : "▼"}</span>
              </button>

              {activeStep === i && (
                <div className="px-6 pb-6 border-t border-[#EDE7DD]">
                  <ul className="space-y-2.5 mt-4">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                        <span className="shrink-0 text-[#A86F5A]">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {s.tip && (
                    <div className="mt-4 rounded-2xl border border-[#EDE7DD] bg-[#FFFDF8] px-4 py-3">
                      <p className="text-xs font-light text-[#8A7F73] leading-6">💡 {s.tip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* STEP 5 — 機場到飯店（依目的地動態）*/}
          <div className="rounded-[2rem] border-2 border-[#A86F5A]/30 bg-[#FDF6ED] overflow-hidden">
            <button
              className="w-full flex items-center gap-4 px-6 py-5 text-left"
              onClick={() => setActiveStep(activeStep === 5 ? null : 5)}
            >
              <div className="shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white bg-[#E65100]">
                <span className="text-[10px] font-light opacity-70">STEP 5</span>
                <span className="text-xl leading-none">🚇</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-light tracking-wide text-[#3A2E26]">{arrival.title}</h3>
                <p className="text-xs font-light text-[#A86F5A] mt-0.5">依目的地客製化</p>
              </div>
              <span className="text-[#A86F5A] text-sm">{activeStep === 5 ? "▲" : "▼"}</span>
            </button>

            {activeStep === 5 && (
              <div className="px-6 pb-6 border-t border-[#E8DDD3]">
                <ul className="space-y-2.5 mt-4">
                  {arrival.steps.map((step, j) => (
                    <li key={j} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                      <span className="shrink-0 text-[#A86F5A]">·</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                {arrival.tip && (
                  <div className="mt-4 rounded-2xl border border-[#E8DDD3] bg-white px-4 py-3">
                    <p className="text-xs font-light text-[#8A7F73] leading-6">💡 {arrival.tip}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 快速展開全部 */}
        <div className="text-center mb-8">
          <button
            onClick={() => setActiveStep(activeStep !== null ? null : 0)}
            className="text-xs font-light text-[#8A7F73] underline hover:text-[#A86F5A]"
          >
            {activeStep !== null ? "收起全部步驟" : "展開第一步"}
          </button>
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/wizard")}
            className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]"
          >
            規劃完整行程 →
          </button>
          <button
            onClick={() => router.push("/pretrip")}
            className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-6 py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]"
          >
            行前必知
          </button>
        </div>
      </div>
    </main>
  );
}
