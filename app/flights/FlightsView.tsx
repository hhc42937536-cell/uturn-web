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

const EXPLORE_URL =
  "https://www.google.com/travel/explore?tfs=CBwQAxocagwIAhIIL20vMDRibnhyDAgEEggvbS8wMmo3MRocagwIBBIIL20vMDJqNzFyDAgCEggvbS8wNGJueEABSAFwAoIBCwj___________8BmAEBsgEEGAEgAQ&tfu=GgA&hl=zh-TW";

type Result = { sky: string; gf: string; origin: string; dest: string; depart: string; ret: string };

export default function FlightsView() {
  const router = useRouter();
  const [form, setForm] = useState({ origin: "TPE", dest: "ICN", depart: "", ret: "" });
  const [result, setResult] = useState<Result | null>(null);

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

        {/* Explore */}
        <div className="mb-10 rounded-[2rem] border border-[#C4A882]/50 bg-[#FDF6ED] p-6 md:p-8">
          <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">彈性出發？試試探索模式</div>
          <p className="mb-4 text-sm font-light leading-7 text-[#5C5248]">
            還沒決定目的地？Google 旅遊探索地圖一眼看出哪個城市最便宜，點一下直接搜尋。
          </p>
          <a
            href={EXPLORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-8 py-3 text-sm font-light tracking-[0.15em] text-[#7D5548] transition hover:bg-[#B98774]/25"
          >
            🌏 探索全球便宜機票
          </a>
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
