"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── 資料結構 ──────────────────────────────────────────────────────────────────

type Airport = {
  code: string; label: string; city: string;
  toTPE: { method: string; time: string; cost: number };  // 南部到桃園的代價
};

type RouteData = {
  ticketRange: [number, number];   // NT$ 最低~最高
  airlines: string[];
  travelTime: string;              // 飛行時間
  directFlight: boolean;
};

// 南部機場資料
const AIRPORTS: Airport[] = [
  {
    code: "KHH", label: "高雄（KHH）", city: "高雄",
    toTPE: { method: "高鐵 高雄→桃園", time: "90 分鐘", cost: 1490 },
  },
  {
    code: "RMQ", label: "台中（RMQ）", city: "台中",
    toTPE: { method: "高鐵 台中→桃園", time: "35 分鐘", cost: 700 },
  },
  {
    code: "TNN", label: "台南（TNN）", city: "台南",
    toTPE: { method: "高鐵 台南→桃園", time: "70 分鐘", cost: 1280 },
  },
];

// 各目的地 × 各機場的航線資料（NT$ 票價、飛行時間）
type DestCode = "ICN" | "NRT" | "KIX" | "OKA" | "BKK" | "SIN" | "HKG" | "SGN" | "KUL";

const ROUTES: Record<DestCode, Record<string, RouteData>> = {
  ICN: {
    KHH: { ticketRange: [3800, 7000], airlines: ["易斯達", "濟州航空", "國泰", "大韓"], travelTime: "2h 45m", directFlight: true },
    RMQ: { ticketRange: [4200, 8000], airlines: ["廈門航空（轉）", "中華航空（轉）"], travelTime: "5h+（轉機）", directFlight: false },
    TNN: { ticketRange: [3900, 7200], airlines: ["易斯達", "台灣虎航"], travelTime: "2h 50m", directFlight: true },
    TPE: { ticketRange: [3500, 7500], airlines: ["中華", "長榮", "韓亞", "大韓", "易斯達"], travelTime: "2h 30m", directFlight: true },
  },
  NRT: {
    KHH: { ticketRange: [4500, 8500], airlines: ["台灣虎航", "樂桃", "國泰（轉）"], travelTime: "3h 20m / 轉機", directFlight: false },
    RMQ: { ticketRange: [5000, 9000], airlines: ["轉機為主"], travelTime: "5h+", directFlight: false },
    TNN: { ticketRange: [4800, 8800], airlines: ["轉機為主"], travelTime: "5h+", directFlight: false },
    TPE: { ticketRange: [4000, 9000], airlines: ["長榮", "中華", "日航", "全日空", "台灣虎航"], travelTime: "2h 50m", directFlight: true },
  },
  KIX: {
    KHH: { ticketRange: [3800, 7000], airlines: ["台灣虎航", "樂桃", "易斯達"], travelTime: "2h 30m", directFlight: true },
    RMQ: { ticketRange: [3500, 7500], airlines: ["台灣虎航", "星宇"], travelTime: "2h 20m", directFlight: true },
    TNN: { ticketRange: [4000, 7500], airlines: ["轉機為主"], travelTime: "4h+", directFlight: false },
    TPE: { ticketRange: [3800, 8500], airlines: ["長榮", "中華", "樂桃", "台灣虎航"], travelTime: "2h 40m", directFlight: true },
  },
  OKA: {
    KHH: { ticketRange: [2800, 5500], airlines: ["台灣虎航", "中華"], travelTime: "1h 30m", directFlight: true },
    RMQ: { ticketRange: [3200, 6000], airlines: ["轉機為主"], travelTime: "3h+", directFlight: false },
    TNN: { ticketRange: [3000, 5800], airlines: ["轉機為主"], travelTime: "3h+", directFlight: false },
    TPE: { ticketRange: [3000, 6000], airlines: ["中華", "台灣虎航", "樂桃"], travelTime: "1h 45m", directFlight: true },
  },
  BKK: {
    KHH: { ticketRange: [4800, 9000], airlines: ["台灣虎航", "國泰（轉）"], travelTime: "4h 30m", directFlight: true },
    RMQ: { ticketRange: [5500, 10000], airlines: ["轉機為主"], travelTime: "6h+", directFlight: false },
    TNN: { ticketRange: [5200, 9500], airlines: ["轉機為主"], travelTime: "6h+", directFlight: false },
    TPE: { ticketRange: [4500, 10000], airlines: ["長榮", "中華", "泰航", "台灣虎航"], travelTime: "4h", directFlight: true },
  },
  SIN: {
    KHH: { ticketRange: [5500, 11000], airlines: ["新加坡航空（轉）", "國泰（轉）"], travelTime: "6h+", directFlight: false },
    RMQ: { ticketRange: [6000, 12000], airlines: ["轉機為主"], travelTime: "7h+", directFlight: false },
    TNN: { ticketRange: [5800, 11500], airlines: ["轉機為主"], travelTime: "7h+", directFlight: false },
    TPE: { ticketRange: [5000, 13000], airlines: ["長榮", "新加坡航空", "中華", "台灣虎航"], travelTime: "5h", directFlight: true },
  },
  HKG: {
    KHH: { ticketRange: [2800, 6000], airlines: ["國泰", "香港快運"], travelTime: "1h 45m", directFlight: true },
    RMQ: { ticketRange: [3200, 6500], airlines: ["轉機為主"], travelTime: "3h+", directFlight: false },
    TNN: { ticketRange: [3000, 6200], airlines: ["轉機為主"], travelTime: "3h+", directFlight: false },
    TPE: { ticketRange: [2800, 7000], airlines: ["國泰", "香港快運", "長榮", "中華"], travelTime: "1h 40m", directFlight: true },
  },
  SGN: {
    KHH: { ticketRange: [4200, 8500], airlines: ["越捷", "台灣虎航"], travelTime: "3h 30m", directFlight: true },
    RMQ: { ticketRange: [5000, 9500], airlines: ["轉機為主"], travelTime: "5h+", directFlight: false },
    TNN: { ticketRange: [4500, 9000], airlines: ["轉機為主"], travelTime: "5h+", directFlight: false },
    TPE: { ticketRange: [4000, 9500], airlines: ["越捷", "長榮", "中華", "台灣虎航"], travelTime: "3h 15m", directFlight: true },
  },
  KUL: {
    KHH: { ticketRange: [4500, 9000], airlines: ["亞航", "轉機為主"], travelTime: "5h+", directFlight: false },
    RMQ: { ticketRange: [5000, 10000], airlines: ["轉機為主"], travelTime: "6h+", directFlight: false },
    TNN: { ticketRange: [4800, 9500], airlines: ["轉機為主"], travelTime: "6h+", directFlight: false },
    TPE: { ticketRange: [4200, 10000], airlines: ["長榮", "馬航", "亞航", "台灣虎航"], travelTime: "4h 20m", directFlight: true },
  },
};

const DESTINATIONS: { code: DestCode; name: string; flag: string }[] = [
  { code: "ICN", name: "首爾", flag: "🇰🇷" },
  { code: "NRT", name: "東京成田", flag: "🇯🇵" },
  { code: "KIX", name: "大阪", flag: "🇯🇵" },
  { code: "OKA", name: "沖繩", flag: "🇯🇵" },
  { code: "BKK", name: "曼谷", flag: "🇹🇭" },
  { code: "SIN", name: "新加坡", flag: "🇸🇬" },
  { code: "HKG", name: "香港", flag: "🇭🇰" },
  { code: "SGN", name: "胡志明市", flag: "🇻🇳" },
  { code: "KUL", name: "吉隆坡", flag: "🇲🇾" },
];

function fmt(n: number) {
  return n.toLocaleString("zh-TW");
}

function skyscanner(from: string, to: string) {
  return `https://www.skyscanner.com.tw/transport/flights/${from}/${to}/?adultsv2=1&cabinclass=economy&currency=TWD&locale=zh-TW`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompareView() {
  const router = useRouter();
  const [dest, setDest] = useState<DestCode>("ICN");
  const [myCity, setMyCity] = useState("KHH");

  const destInfo = DESTINATIONS.find((d) => d.code === dest)!;
  const routes = ROUTES[dest];
  const myAirport = AIRPORTS.find((a) => a.code === myCity)!;

  // 計算各方案總成本
  type Option = {
    label: string; code: string; airport: string;
    ticket: [number, number]; airlines: string[];
    flightTime: string; direct: boolean;
    extraCost: number; extraTime: string; extraMethod: string;
    totalMin: number; totalMax: number;
    recommended?: boolean;
  };

  const options: Option[] = [
    // 直接從南部機場出發
    ...AIRPORTS.filter((a) => a.code !== "TPE").map((a) => {
      const r = routes[a.code];
      return {
        label: `從${a.city}直飛`, code: a.code, airport: a.label,
        ticket: r.ticketRange, airlines: r.airlines,
        flightTime: r.travelTime, direct: r.directFlight,
        extraCost: 0, extraTime: "—", extraMethod: "直接到機場",
        totalMin: r.ticketRange[0], totalMax: r.ticketRange[1],
      };
    }),
    // 先到桃園再飛
    {
      label: "先到桃園（TPE）再飛",
      code: "TPE", airport: "桃園（TPE）",
      ticket: routes.TPE.ticketRange, airlines: routes.TPE.airlines,
      flightTime: routes.TPE.travelTime, direct: routes.TPE.directFlight,
      extraCost: myAirport.toTPE.cost,
      extraTime: myAirport.toTPE.time,
      extraMethod: myAirport.toTPE.method,
      totalMin: routes.TPE.ticketRange[0] + myAirport.toTPE.cost,
      totalMax: routes.TPE.ticketRange[1] + myAirport.toTPE.cost,
    },
  ];

  // 推薦邏輯：最便宜直飛 > 最便宜轉機
  const minDirect = options.filter((o) => o.direct).sort((a, b) => a.totalMin - b.totalMin)[0];
  const best = minDirect ?? options.sort((a, b) => a.totalMin - b.totalMin)[0];
  if (best) best.recommended = true;

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🗺️ 南部出發比較器</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Southern Taiwan · Departure Comparator</p>
          <h1 className="text-3xl font-light tracking-wide">南部出發<br className="sm:hidden" />哪個方案最划算？</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            直接從 KHH/RMQ/TNN 飛，還是搭高鐵到桃園再出發？幫你算清楚總成本與時間。
          </p>
        </div>

        {/* Selectors */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-light tracking-widest text-[#6F675F]">我住在</p>
            <div className="flex gap-2">
              {AIRPORTS.map((a) => (
                <button key={a.code} onClick={() => setMyCity(a.code)}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-light tracking-wide transition ${
                    myCity === a.code ? "border-[#A86F5A] bg-[#A86F5A]/15 text-[#7D5548]" : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#A86F5A]/50"
                  }`}
                >{a.city}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-light tracking-widest text-[#6F675F]">目的地</p>
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => (
                <button key={d.code} onClick={() => setDest(d.code)}
                  className={`rounded-full border px-4 py-2 text-sm font-light transition ${
                    dest === d.code ? "border-[#8FA39A] bg-[#8FA39A]/20 text-[#4B6B63]" : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#8FA39A]/50"
                  }`}
                >{d.flag} {d.name}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation banner */}
        {best && (
          <div className="mb-6 rounded-2xl border border-[#8FA39A]/50 bg-[#F0F5F3] px-6 py-4">
            <p className="text-xs font-light uppercase tracking-widest text-[#8FA39A]">✦ 推薦方案</p>
            <p className="mt-1 text-base font-light text-[#3A2E26]">
              {best.label}
              {best.direct ? "（直飛）" : "（轉機）"}
              <span className="ml-3 text-[#A86F5A]">最低 NT$ {fmt(best.totalMin)}</span>
            </p>
          </div>
        )}

        {/* Comparison table */}
        <div className="space-y-4">
          {options.map((opt) => (
            <div key={opt.code}
              className={`rounded-[1.5rem] border bg-[#FBF8F1] p-6 transition ${
                opt.recommended ? "border-[#8FA39A] bg-[#F0F5F3]" : "border-[#D8D2C7] hover:border-[#A86F5A]/30"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-light tracking-wide text-[#3A2E26]">{opt.label}</span>
                  {opt.recommended && (
                    <span className="rounded-full bg-[#8FA39A]/20 px-2.5 py-0.5 text-[11px] font-light text-[#4B6B63]">推薦</span>
                  )}
                  {opt.direct
                    ? <span className="rounded-full bg-[#DFF0E8] px-2.5 py-0.5 text-[11px] font-light text-[#2E6B50]">直飛</span>
                    : <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-light text-[#92400E]">轉機</span>
                  }
                </div>
                <div className="text-right">
                  <div className="text-lg font-light text-[#A86F5A]">NT$ {fmt(opt.totalMin)}–{fmt(opt.totalMax)}</div>
                  <div className="text-[11px] font-light text-[#A79C91]">含交通總成本</div>
                </div>
              </div>

              <div className="grid gap-3 text-xs font-light sm:grid-cols-3">
                <div className="rounded-xl border border-[#D8D2C7] bg-white px-4 py-3">
                  <div className="mb-0.5 text-[#8FA39A]">✈️ 起飛機場</div>
                  <div className="text-[#4B4037]">{opt.airport}</div>
                </div>
                <div className="rounded-xl border border-[#D8D2C7] bg-white px-4 py-3">
                  <div className="mb-0.5 text-[#8FA39A]">🕐 飛行時間</div>
                  <div className="text-[#4B4037]">{opt.flightTime}</div>
                </div>
                <div className="rounded-xl border border-[#D8D2C7] bg-white px-4 py-3">
                  <div className="mb-0.5 text-[#8FA39A]">💰 機票參考</div>
                  <div className="text-[#4B4037]">NT$ {fmt(opt.ticket[0])}–{fmt(opt.ticket[1])}</div>
                </div>
                {opt.extraCost > 0 && (
                  <>
                    <div className="rounded-xl border border-[#E8D5C0] bg-[#FDF6ED] px-4 py-3">
                      <div className="mb-0.5 text-[#C4A882]">🚄 到桃園方式</div>
                      <div className="text-[#5C5248]">{opt.extraMethod}</div>
                    </div>
                    <div className="rounded-xl border border-[#E8D5C0] bg-[#FDF6ED] px-4 py-3">
                      <div className="mb-0.5 text-[#C4A882]">⏱️ 到桃園時間</div>
                      <div className="text-[#5C5248]">{opt.extraTime}</div>
                    </div>
                    <div className="rounded-xl border border-[#E8D5C0] bg-[#FDF6ED] px-4 py-3">
                      <div className="mb-0.5 text-[#C4A882]">🚄 高鐵費用</div>
                      <div className="text-[#5C5248]">NT$ {fmt(opt.extraCost)}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3">
                <p className="mb-2 text-[11px] font-light text-[#A79C91]">常見航空：{opt.airlines.join("、")}</p>
                <a href={skyscanner(opt.code, dest)} target="_blank" rel="noopener noreferrer"
                  className="inline-block rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-5 py-2 text-xs font-light tracking-wide text-[#7D5548] transition hover:bg-[#B98774]/25">
                  查 Skyscanner 票價 →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-8 rounded-2xl border border-[#C4A882]/50 bg-[#FDF6ED] px-6 py-5">
          <p className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">💡 比較器說明</p>
          <p className="text-sm font-light leading-7 text-[#5C5248]">
            票價為歷史參考均價（未含行李、假日加成），實際請以 Skyscanner 查詢為準。
            高鐵票價為標準票，若有早鳥優惠最低 65 折。往返票價請自行乘以 2。
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8 text-center">
          <p className="mb-2 text-sm font-light tracking-wide text-[#6F675F]">決定出發地了？</p>
          <p className="mb-6 text-xs font-light text-[#A79C91]">直接規劃完整的 {destInfo.name} 旅程</p>
          <button onClick={() => router.push(`/trip/${encodeURIComponent(destInfo.name)}`)}
            className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-10 py-3.5 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25">
            規劃 {destInfo.flag} {destInfo.name} 行程
          </button>
        </div>
      </div>
    </main>
  );
}
