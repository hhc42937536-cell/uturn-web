"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import quickTripsData from "@/app/lib/quick_trips.json";

const FEATURES = [
  { icon: "✨", title: "AI 行程規劃", href: "/wizard", cta: "開始規劃" },
  { icon: "✈️", title: "機票搜尋", href: "/flights", cta: "查機票" },
  { icon: "🛂", title: "簽證情報", href: "/visa", cta: "查簽證" },
  { icon: "🏨", title: "住宿推薦", href: "/hotels", cta: "找住宿" },
  { icon: "🔥", title: "現在最夯", href: "/trending", cta: "看熱門" },
  { icon: "📋", title: "行前必知", href: "/pretrip", cta: "查清單" },
  { icon: "🚇", title: "當地交通", href: "/transport", cta: "看攻略" },
  { icon: "🧰", title: "旅行工具箱", href: "/tools", cta: "打開" },
  { icon: "🗺", title: "跨城市規劃", href: "/planner/korea", cta: "規劃路線" },
  { icon: "🎯", title: "依心情選目的地", href: "/theme", cta: "找靈感" },
  { icon: "🛫", title: "機場攻略", href: "/airport", cta: "看步驟" },
  { icon: "🍜", title: "在地美食", href: "/restaurant", cta: "找吃的" },
  { icon: "🎌", title: "文化禮儀", href: "/cultural", cta: "避地雷" },
  { icon: "⭐", title: "追星行程", href: "/idol", cta: "規劃" },
  { icon: "🗓️", title: "旅遊旺季月曆", href: "/seasons", cta: "查時機" },
  { icon: "🔔", title: "機票價格追蹤", href: "/tracking", cta: "設提醒" },
  { icon: "📍", title: "附近景點", href: "/nearby", cta: "找景點" },
  { icon: "🌏", title: "社群行程牆", href: "/explore", cta: "看分享" },
];

type SearchResult = {
  label: string;
  destinations: { flag: string; name: string; desc: string }[];
};

type QuickTrip = {
  id: string;
  flag: string;
  destination: string;
  days: number;
  theme: string;
  themeIcon: string;
  people: number;
  style: string;
  highlight: string;
  itinerary: { morning: string; afternoon: string; evening: string; food: string; note: string }[];
};

const quickTrips: QuickTrip[] = quickTripsData as QuickTrip[];

// ── 智慧搜尋區塊 ─────────────────────────────────────────────────
function SmartSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const HINTS = ["想看極光", "海島放鬆", "帶小孩去樂園", "蜜月旅行", "血拼購物", "美食之旅"];

  async function handleSearch(q: string) {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (data.destinations) setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-xl px-6">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch("")}
          placeholder="說說你想要什麼旅行體驗…"
          className="w-full rounded-full border border-[#D8D2C7] bg-white px-6 py-4 pr-14 text-sm font-light text-[#4B4037] shadow-sm outline-none focus:border-[#A86F5A] transition placeholder:text-[#B5AFA9]"
        />
        <button
          onClick={() => handleSearch("")}
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#A86F5A] px-4 py-2 text-xs text-white transition hover:bg-[#96604D] disabled:opacity-50"
        >
          {loading ? "…" : "搜尋"}
        </button>
      </div>

      {/* 快捷 hints */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {HINTS.map((h) => (
          <button
            key={h}
            onClick={() => { setQuery(h); handleSearch(h); }}
            className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-3 py-1 text-xs font-light text-[#6F675F] transition hover:border-[#A86F5A] hover:text-[#A86F5A]"
          >
            {h}
          </button>
        ))}
      </div>

      {/* 搜尋結果 */}
      {result && (
        <div className="mt-6 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
          <p className="mb-4 text-xs font-light uppercase tracking-widest text-[#8FA39A]">{result.label}</p>
          <div className="grid gap-3">
            {result.destinations.map((d) => (
              <button
                key={d.name}
                onClick={() => router.push(`/wizard?destination=${encodeURIComponent(d.name)}`)}
                className="flex items-center gap-4 rounded-2xl border border-[#EDE7DD] bg-white px-5 py-4 text-left transition hover:border-[#A86F5A] hover:bg-[#FFFDF8]"
              >
                <span className="text-2xl">{d.flag}</span>
                <div>
                  <p className="text-sm font-light text-[#4B4037]">{d.name}</p>
                  <p className="text-xs font-light text-[#8A7F73]">{d.desc}</p>
                </div>
                <span className="ml-auto text-xs text-[#A86F5A]">規劃 →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 說走就走卡片 ──────────────────────────────────────────────────
function QuickTripCard({ trip }: { trip: QuickTrip }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    // 計算出發/回程日（今天起算）
    const dep = new Date();
    dep.setDate(dep.getDate() + 14); // 兩週後出發
    const ret = new Date(dep);
    ret.setDate(ret.getDate() + trip.days - 1);
    const depDate = dep.toISOString().split("T")[0];
    const retDate = ret.toISOString().split("T")[0];

    // 直接用靜態行程，存 sessionStorage → /result
    sessionStorage.setItem("uturn_ai_itinerary", JSON.stringify({
      itinerary: trip.itinerary,
      destination: trip.destination,
      depDate,
      retDate,
      people: trip.people,
    }));
    router.push(`/result?source=ai&destination=${encodeURIComponent(trip.destination)}&departureDate=${depDate}&returnDate=${retDate}&people=${trip.people}`);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="group rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-7 text-left transition hover:border-[#A86F5A] hover:bg-[#FFFDF8] disabled:opacity-60 w-full"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl">{trip.flag}</span>
        <div>
          <p className="text-base font-light tracking-wide">{trip.destination}</p>
          <p className="text-xs font-light text-[#8A7F73]">{trip.days} 天行程</p>
        </div>
        <span className="ml-auto rounded-full border border-[#EDE7DD] px-3 py-1 text-xs font-light text-[#8A7F73]">
          {trip.themeIcon} {trip.theme}
        </span>
      </div>
      <p className="mb-4 text-xs font-light leading-6 text-[#6F675F]">
        {trip.highlight}
      </p>
      <p className="text-xs font-light tracking-widest text-[#A86F5A] transition group-hover:underline">
        {loading ? "生成中…" : "一鍵看行程 →"}
      </p>
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">

      {/* ── Nav ── */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</div>
          <button
            onClick={() => router.push("/wizard")}
            className="rounded-full border border-[#A86F5A] bg-[#A86F5A]/10 px-5 py-2 text-sm font-light text-[#A86F5A] transition hover:bg-[#A86F5A]/20"
          >
            開始規劃 →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pb-16 pt-36">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-5 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">
            Taiwan Travel Planner · Free · No Login
          </p>
          <h1 className="text-5xl font-light leading-[1.2] tracking-wide text-[#4B4037] md:text-6xl">
            出國最麻煩的事，<br />幫你一次整理好
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg font-light leading-9 text-[#6F675F]">
            AI 規劃每日行程，自動查簽證、估預算、推薦住宿，最後下載一份{" "}
            <strong className="font-normal text-[#A86F5A]">可以印出來給家人的 Word 計畫書</strong>。
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/wizard")}
              className="rounded-full bg-[#A86F5A] px-12 py-5 text-lg font-light tracking-[0.2em] text-white shadow-md transition hover:bg-[#96604D] hover:shadow-lg"
            >
              立即開始規劃 →
            </button>
            <button
              onClick={() => router.push("/visa")}
              className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-10 py-5 text-base font-light tracking-[0.15em] text-[#6F675F] transition hover:border-[#A86F5A]"
            >
              🛂 查簽證資訊
            </button>
          </div>
          <p className="mt-4 text-sm font-light text-[#A79C91]">免費 · 不用登入 · 30 秒開始</p>

          {/* ── 智慧搜尋 ── */}
          <SmartSearch />
        </div>
      </section>

      {/* ── 說走就走 ── */}
      <section className="border-t border-[#DDD6CA] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 text-center text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Quick Trip</p>
          <h2 className="mb-2 text-center text-2xl font-light tracking-wide">說走就走</h2>
          <p className="mb-10 text-center text-sm font-light text-[#8A7F73]">
            懶得規劃？精選套餐行程，一鍵看完整每日安排
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quickTrips.map((trip) => (
              <QuickTripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 所有工具 ── */}
      <section className="border-t border-[#DDD6CA] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-8 text-center text-xl font-light tracking-wide text-[#4B4037]">所有工具</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {FEATURES.map(({ icon, title, href, cta }) => (
              <a key={href} href={href}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-4 py-5 text-center transition hover:border-[#A86F5A] hover:bg-[#FFFDF8]">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-light tracking-wide text-[#4B4037] leading-snug">{title}</span>
                <span className="text-xs font-light text-[#A86F5A] transition group-hover:underline">{cta} →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#D8D2C7] bg-[#EFE9DF] px-6 py-8 text-center text-sm font-light tracking-widest text-[#7C7168]">
        © 2026 出國優轉 AbroadUturn　·　台灣人出國前置工作室
      </footer>
    </main>
  );
}
