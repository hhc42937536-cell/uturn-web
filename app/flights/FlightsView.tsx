"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ORIGINS = [
  { code: "TPE", label: "台北（桃園 TPE）" },
  { code: "TSA", label: "台北（松山 TSA）" },
  { code: "KHH", label: "高雄（小港 KHH）" },
  { code: "RMQ", label: "台中（清泉崗 RMQ）" },
  { code: "TNN", label: "台南（TNN）" },
];

const DESTINATIONS = [
  { code: "ICN", label: "首爾（ICN）", flag: "🇰🇷" },
  { code: "NRT", label: "東京成田（NRT）", flag: "🇯🇵" },
  { code: "HND", label: "東京羽田（HND）", flag: "🇯🇵" },
  { code: "KIX", label: "大阪（KIX）", flag: "🇯🇵" },
  { code: "OKA", label: "沖繩（OKA）", flag: "🇯🇵" },
  { code: "BKK", label: "曼谷（BKK）", flag: "🇹🇭" },
  { code: "SIN", label: "新加坡（SIN）", flag: "🇸🇬" },
  { code: "HKG", label: "香港（HKG）", flag: "🇭🇰" },
  { code: "SGN", label: "胡志明市（SGN）", flag: "🇻🇳" },
  { code: "KUL", label: "吉隆坡（KUL）", flag: "🇲🇾" },
];

const POPULAR_ROUTES = [
  { from: "TPE", to: "ICN", fromLabel: "台北", toLabel: "首爾", flag: "🇰🇷", price: "~NT$4,000" },
  { from: "TPE", to: "NRT", fromLabel: "台北", toLabel: "東京", flag: "🇯🇵", price: "~NT$5,500" },
  { from: "KHH", to: "KIX", fromLabel: "高雄", toLabel: "大阪", flag: "🇯🇵", price: "~NT$4,800" },
  { from: "TPE", to: "BKK", fromLabel: "台北", toLabel: "曼谷", flag: "🇹🇭", price: "~NT$6,000" },
  { from: "TPE", to: "SIN", fromLabel: "台北", toLabel: "新加坡", flag: "🇸🇬", price: "~NT$7,500" },
  { from: "TPE", to: "HKG", fromLabel: "台北", toLabel: "香港", flag: "🇭🇰", price: "~NT$3,500" },
];

function skyscanner(origin: string, dest: string, depart: string, ret: string) {
  const dep = depart.replace(/-/g, "");
  const ret2 = ret.replace(/-/g, "");
  let url = `https://www.skyscanner.com.tw/transport/flights/${origin}/${dest}`;
  if (dep) {
    url += `/${dep}`;
    if (ret2) url += `/${ret2}`;
  }
  return url + "/?adultsv2=1&cabinclass=economy&currency=TWD&locale=zh-TW";
}

function googleFlights(origin: string, dest: string, depart: string, ret: string) {
  let flt = `${origin}.${dest}.${depart}`;
  if (ret) flt += `*${dest}.${origin}.${ret}`;
  return `https://www.google.com/flights#flt=${flt};c:TWD;e:1;sd:1;t:f`;
}

// 說走就走：各天數 × 出發城市 推薦目的地
type QuickDest = {
  code: string; name: string; flag: string;
  days: number[];           // 適合天數
  price: Record<string, [number, number]>; // 出發城市 → 價格區間
  direct: string[];         // 有直飛的出發城市
  travelTime: string;
};

const QUICK_DESTS: QuickDest[] = [
  { code: "HKG", name: "香港", flag: "🇭🇰", days: [2, 3], travelTime: "1h 40m",
    price: { TPE: [2500, 5000], KHH: [2800, 5500], RMQ: [3000, 6000], TNN: [3000, 6000] },
    direct: ["TPE", "KHH"] },
  { code: "OKA", name: "沖繩", flag: "🇯🇵", days: [3, 4], travelTime: "1h 30m",
    price: { TPE: [3000, 6000], KHH: [2800, 5500], RMQ: [3500, 7000], TNN: [3200, 6500] },
    direct: ["TPE", "KHH", "RMQ", "TNN"] },
  { code: "ICN", name: "首爾", flag: "🇰🇷", days: [4, 5], travelTime: "2h 30m",
    price: { TPE: [3500, 7500], KHH: [3800, 7000], RMQ: [4500, 8500], TNN: [3900, 7200] },
    direct: ["TPE", "KHH", "TNN"] },
  { code: "FUK", name: "福岡", flag: "🇯🇵", days: [3, 4], travelTime: "1h 50m",
    price: { TPE: [3200, 7000], KHH: [3500, 7000], RMQ: [3500, 7000], TNN: [3500, 7000] },
    direct: ["TPE", "KHH", "RMQ", "TNN"] },
  { code: "KIX", name: "大阪", flag: "🇯🇵", days: [4, 5], travelTime: "2h 30m",
    price: { TPE: [3800, 8500], KHH: [3800, 7000], RMQ: [3500, 7500], TNN: [4000, 7500] },
    direct: ["TPE", "KHH", "RMQ"] },
  { code: "NRT", name: "東京", flag: "🇯🇵", days: [5, 7], travelTime: "3h",
    price: { TPE: [4000, 9000], KHH: [4500, 8500], RMQ: [5000, 9000], TNN: [4800, 8800] },
    direct: ["TPE"] },
  { code: "BKK", name: "曼谷", flag: "🇹🇭", days: [4, 5], travelTime: "3h 30m",
    price: { TPE: [4500, 9000], KHH: [5000, 9500], RMQ: [5200, 10000], TNN: [5000, 9800] },
    direct: ["TPE", "KHH"] },
  { code: "SIN", name: "新加坡", flag: "🇸🇬", days: [5, 7], travelTime: "4h 30m",
    price: { TPE: [5000, 11000], KHH: [5500, 12000], RMQ: [6000, 12000], TNN: [5800, 11500] },
    direct: ["TPE", "KHH"] },
  { code: "DPS", name: "峇里島", flag: "🇮🇩", days: [7], travelTime: "6h（含轉）",
    price: { TPE: [7000, 14000], KHH: [7500, 15000], RMQ: [8000, 15000], TNN: [7800, 14500] },
    direct: [] },
  { code: "GUM", name: "關島", flag: "🇬🇺", days: [3, 4, 5], travelTime: "3h 30m",
    price: { TPE: [5000, 10000], KHH: [5500, 11000], RMQ: [5500, 11000], TNN: [5500, 11000] },
    direct: ["TPE", "KHH"] },
];

// Google Travel Explore（依出發城市）
const GOOGLE_EXPLORE: Record<string, string> = {
  TPE: "https://www.google.com/travel/explore?tfs=CBwQAxoRagcIARIDVFBFcgYIARICVFBFQAFIAXACggELCP___________wGYAQGyAQQYASAB&hl=zh-TW",
  KHH: "https://www.google.com/travel/explore?tfs=CBwQAxoRagcIARIDVFBFcgYIARICVFBFQAFIAXACggELCP___________wGYAQGyAQQYASAB&hl=zh-TW",
  RMQ: "https://www.google.com/travel/explore?tfs=CBwQAxoRagcIARIDVFBFcgYIARICVFBFQAFIAXACggELCP___________wGYAQGyAQQYASAB&hl=zh-TW",
  TNN: "https://www.google.com/travel/explore?tfs=CBwQAxoRagcIARIDVFBFcgYIARICVFBFQAFIAXACggELCP___________wGYAQGyAQQYASAB&hl=zh-TW",
};

// Skyscanner Everywhere 搜尋（依出發城市 + 月份）
function skyscannerExplore(origin: string, yyyymm: string) {
  return `https://www.skyscanner.com.tw/transport/flights/${origin.toLowerCase()}/anywhere/${yyyymm}/?adults=1&currency=TWD&locale=zh-TW`;
}

const MONTHS = [
  { label: "6 月", value: "202606" }, { label: "7 月", value: "202607" },
  { label: "8 月", value: "202608" }, { label: "9 月", value: "202609" },
  { label: "10 月", value: "202610" }, { label: "11 月", value: "202611" },
  { label: "12 月", value: "202612" }, { label: "1 月", value: "202701" },
];

type Result = { sky: string; gf: string; origin: string; dest: string; depart: string; ret: string };

export default function FlightsView() {
  const router = useRouter();
  const [form, setForm] = useState({ origin: "TPE", dest: "ICN", depart: "", ret: "" });
  const [result, setResult] = useState<Result | null>(null);
  const [quickOrigin, setQuickOrigin] = useState("TPE");
  const [quickDays, setQuickDays] = useState<number | null>(null);
  const [exploreOrigin, setExploreOrigin] = useState("TPE");
  const [exploreMonth, setExploreMonth] = useState("202606");

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSearch = () => {
    setResult({
      sky: skyscanner(form.origin, form.dest, form.depart, form.ret),
      gf: googleFlights(form.origin, form.dest, form.depart, form.ret),
      origin: ORIGINS.find((o) => o.code === form.origin)?.label ?? form.origin,
      dest: DESTINATIONS.find((d) => d.code === form.dest)?.label ?? form.dest,
      depart: form.depart,
      ret: form.ret,
    });
  };

  const selectClass =
    "h-12 w-full rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 text-sm font-light text-[#4B4037] outline-none focus:border-[#8FA39A]";

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">✈️ 機票比價</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pb-20 pt-28">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Flight Search</p>
          <h1 className="text-3xl font-light tracking-wide">即時機票比價</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            搜尋台灣出發的最低票價，一鍵跳轉 Skyscanner 與 Google Flights 比價。
          </p>
        </div>

        {/* Search form */}
        <div className="mb-8 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">出發地</span>
              <select value={form.origin} onChange={(e) => update("origin", e.target.value)} className={selectClass}>
                {ORIGINS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">目的地</span>
              <select value={form.dest} onChange={(e) => update("dest", e.target.value)} className={selectClass}>
                {DESTINATIONS.map((d) => <option key={d.code} value={d.code}>{d.flag} {d.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">出發日期</span>
              <input type="date" value={form.depart} onChange={(e) => update("depart", e.target.value)} className={selectClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">回程日期</span>
              <input type="date" value={form.ret} onChange={(e) => update("ret", e.target.value)} className={selectClass} />
            </label>
          </div>
          <button
            onClick={handleSearch}
            className="mt-5 w-full rounded-full border border-[#A86F5A] bg-[#B98774]/15 py-4 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25"
          >
            搜尋機票
          </button>
        </div>

        {/* Search result */}
        {result && (
          <div className="mb-10 rounded-[2rem] border border-[#8FA39A]/40 bg-[#F0F5F3] p-6 md:p-8">
            <p className="mb-1 text-xs font-light uppercase tracking-widest text-[#8FA39A]">搜尋結果</p>
            <p className="mb-5 text-sm font-light text-[#4B4037]">
              {result.origin.split("（")[0]} → {result.dest.split("（")[0]}
              {result.depart && <span className="ml-2 text-[#6F675F]">{result.depart}{result.ret && ` ↩ ${result.ret}`}</span>}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={result.sky}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-7 py-3 text-sm font-light tracking-wide text-[#7D5548] transition hover:bg-[#B98774]/25"
              >
                🔍 Skyscanner 查票價
              </a>
              <a
                href={result.gf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-[#D8D2C7] bg-white px-7 py-3 text-sm font-light tracking-wide text-[#6F675F] transition hover:border-[#A86F5A]/50"
              >
                🛫 Google Flights 比價
              </a>
            </div>
          </div>
        )}

        {/* ── 說走就走 ── */}
        <div className="mb-10 rounded-[2rem] border-2 border-[#A86F5A]/30 bg-[#FDF6ED] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🚀</span>
            <div>
              <h2 className="text-lg font-light tracking-wide">說走就走</h2>
              <p className="text-xs font-light text-[#8A7F73]">告訴我你有幾天假，幫你找最適合的目的地</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <div>
              <p className="text-xs font-light text-[#8A7F73] mb-2">從哪裡出發？</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { code: "TPE", label: "台北" }, { code: "KHH", label: "高雄" },
                  { code: "RMQ", label: "台中" }, { code: "TNN", label: "台南" },
                ].map(({ code, label }) => (
                  <button key={code}
                    onClick={() => setQuickOrigin(code)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-light transition
                      ${quickOrigin === code
                        ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                        : "border-[#D8D2C7] bg-white text-[#4B4037] hover:border-[#A86F5A]"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-light text-[#8A7F73] mb-2">有幾天假？</p>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5, 7].map((d) => (
                  <button key={d}
                    onClick={() => setQuickDays(quickDays === d ? null : d)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-light transition
                      ${quickDays === d
                        ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                        : "border-[#D8D2C7] bg-white text-[#4B4037] hover:border-[#A86F5A]"}`}>
                    {d} 天
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 推薦結果 */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_DESTS
              .filter((d) => !quickDays || d.days.includes(quickDays))
              .map((dest) => {
                const priceRange = dest.price[quickOrigin];
                const isDirect = dest.direct.includes(quickOrigin);
                const skyLink = skyscanner(quickOrigin, dest.code, "", "");
                return (
                  <a key={dest.code} href={skyLink} target="_blank" rel="noopener noreferrer"
                    className="rounded-2xl border border-[#D8D2C7] bg-white p-5 hover:border-[#A86F5A] transition block">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{dest.flag}</span>
                        <div>
                          <p className="text-sm font-light text-[#4B4037]">{dest.name}</p>
                          <p className="text-xs font-light text-[#8A7F73]">{dest.travelTime}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-light px-2 py-0.5 rounded-full ${isDirect ? "bg-green-50 text-green-600 border border-green-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
                        {isDirect ? "直飛" : "轉機"}
                      </span>
                    </div>
                    <p className="text-sm font-light text-[#A86F5A]">
                      NT$ {priceRange[0].toLocaleString()} ~ {priceRange[1].toLocaleString()}
                    </p>
                    <p className="text-[10px] font-light text-[#A79C91] mt-1">含稅參考・點擊查最新票價 →</p>
                  </a>
                );
              })}
          </div>
        </div>

        {/* Popular routes */}
        <div className="mb-10">
          <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">熱門航線參考票價</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_ROUTES.map((r) => (
              <a
                key={r.to}
                href={skyscanner(r.from, r.to, "", "")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]"
              >
                <div className="mb-1 text-xl">{r.flag}</div>
                <div className="text-sm font-light tracking-wide text-[#3A2E26]">{r.fromLabel} → {r.toLabel}</div>
                <div className="mt-1 text-xs font-light text-[#A86F5A]">{r.price} 含稅起參考</div>
                <div className="mt-2 text-[10px] font-light text-[#A79C91]">點擊查最新票價 →</div>
              </a>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-light text-[#B0A89E]">
            ＊以上票價為歷史參考均價，實際以 Skyscanner 搜尋結果為準。
          </p>
        </div>

        {/* ── 探索最便宜目的地 ── */}
        <div className="mb-10 rounded-[2rem] border-2 border-[#C4A882]/40 bg-[#FDF6ED] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🌏</span>
            <div>
              <h2 className="text-lg font-light tracking-wide">探索最便宜目的地</h2>
              <p className="text-xs font-light text-[#8A7F73]">還沒決定去哪？讓系統幫你找</p>
            </div>
          </div>

          {/* 出發城市選擇 */}
          <div className="mb-4">
            <p className="text-xs font-light text-[#8A7F73] mb-2">從哪裡出發？</p>
            <div className="flex flex-wrap gap-2">
              {[
                { code: "TPE", label: "台北（桃園）" },
                { code: "KHH", label: "高雄" },
                { code: "RMQ", label: "台中" },
                { code: "TNN", label: "台南" },
              ].map(({ code, label }) => (
                <button key={code}
                  onClick={() => setExploreOrigin(code)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-light transition
                    ${exploreOrigin === code
                      ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                      : "border-[#D8D2C7] bg-white text-[#4B4037] hover:border-[#A86F5A]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 月份選擇 */}
          <div className="mb-6">
            <p className="text-xs font-light text-[#8A7F73] mb-2">哪個月份出發？</p>
            <div className="flex flex-wrap gap-2">
              {MONTHS.map(({ label, value }) => (
                <button key={value}
                  onClick={() => setExploreMonth(value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-light transition
                    ${exploreMonth === value
                      ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                      : "border-[#D8D2C7] bg-white text-[#4B4037] hover:border-[#A86F5A]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 探索按鈕 */}
          <div className="flex flex-wrap gap-3">
            <a
              href={skyscannerExplore(exploreOrigin, exploreMonth)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-7 py-3 text-sm font-light tracking-[0.15em] text-[#7D5548] transition hover:bg-[#B98774]/25"
            >
              🔍 Skyscanner 全球任意飛
            </a>
            <a
              href={GOOGLE_EXPLORE[exploreOrigin] ?? GOOGLE_EXPLORE["TPE"]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-[#D8D2C7] bg-white px-7 py-3 text-sm font-light tracking-[0.15em] text-[#6F675F] transition hover:border-[#A86F5A]"
            >
              🗺 Google 旅遊探索地圖
            </a>
          </div>
          <p className="mt-3 text-xs font-light text-[#A79C91]">Skyscanner 會自動篩選出當月所有可達目的地的最低票價，Google Travel 以地圖方式呈現</p>
        </div>

        {/* CTA */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8 text-center">
          <p className="mb-2 text-sm font-light tracking-wide text-[#6F675F]">訂好機票了？</p>
          <p className="mb-6 text-xs font-light text-[#A79C91]">讓 AI 把剩下的行程一起規劃好</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-10 py-3.5 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25"
          >
            立即規劃行程
          </button>
        </div>

        <p className="mt-6 text-xs font-light text-[#A79C91]">
          本站為 Travelpayouts 聯盟合作夥伴，透過本站連結購票可支持出國優轉持續營運，不影響您的購票價格。
        </p>
      </div>
    </main>
  );
}
