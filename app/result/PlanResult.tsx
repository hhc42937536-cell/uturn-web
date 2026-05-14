"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CITY_CODE, CITY_DATA, CITY_KEYWORDS, CITY_PHOTOS,
  type CityData, type DayPlan,
} from "../lib/cityData";

type AiDay = { morning: string; afternoon: string; evening: string; food: string; note: string; memo?: string };

// ── helpers ───────────────────────────────────────────────────────────────────

function calcDays(start: string, end: string): number {
  if (!start || !end) return 5;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(2, Math.round(diff / 86400000) + 1);
}

function fmtDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function nightCount(days: number): string {
  return `${days}天${days - 1}夜`;
}

// 找特別需求要插入哪一天 (回傳 full_days 的 0-based index, -1 = 找不到)
function findRequestDay(request: string, code: string, fullDayCount: number): number {
  if (!request || fullDayCount === 0) return -1;
  const kwMap = CITY_KEYWORDS[code] ?? {};
  for (const [kw, idx] of Object.entries(kwMap)) {
    if (request.includes(kw) && idx < fullDayCount) return idx;
  }
  return Math.min(1, fullDayCount - 1); // 預設插第 2 天
}

// ── Day card ──────────────────────────────────────────────────────────────────

function DayCard({
  label, title, slots, rainy, highlight,
}: {
  label: string; title: string;
  slots: { icon: string; text: string }[];
  rainy?: string; highlight?: boolean;
}) {
  const [showRainy, setShowRainy] = useState(false);

  return (
    <div className={`relative min-w-[320px] snap-start rounded-[1.5rem] border bg-white p-6 shadow-sm transition hover:shadow-md md:min-w-[380px] ${highlight ? "border-[#A86F5A]" : "border-[#D8D2C7]"}`}>
      {highlight && (
        <div className="absolute right-4 top-4 rounded-full bg-[#A86F5A]/15 px-2.5 py-0.5 text-[10px] font-light tracking-widest text-[#7D5548]">
          ✦ 特別加入
        </div>
      )}
      <div className={`mb-1 text-[10px] font-light uppercase tracking-[0.35em] ${highlight ? "text-[#A86F5A]" : "text-[#8FA39A]"}`}>{label}</div>
      <div className="mb-5 text-lg font-light tracking-wide text-[#3A2E26]">{title}</div>
      <div className="space-y-3">
        {slots.map((s, i) => (
          <div key={i} className="flex gap-2.5 text-sm font-light leading-7 text-[#5C5248]">
            <span className="mt-0.5 w-5 flex-shrink-0 text-center">{s.icon}</span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
      {rainy && (
        <div className="mt-5 border-t border-dashed border-[#D8D2C7] pt-4">
          <button
            onClick={() => setShowRainy(!showRainy)}
            className="flex items-center gap-1.5 text-xs font-light tracking-wide text-[#8FA39A] transition hover:text-[#5C7A73]"
          >
            ☂️ 雨天備案 {showRainy ? "▲" : "▼"}
          </button>
          {showRainy && (
            <p className="mt-2 text-sm font-light leading-7 text-[#6F675F]">{rainy}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function PlanResult() {
  const params = useSearchParams();
  const router = useRouter();

  const destination = params.get("destination") ?? "首爾";
  const departureDate = params.get("departureDate") ?? "";
  const returnDate = params.get("returnDate") ?? "";
  const people = params.get("people") ?? "2";
  const request = params.get("request") ?? "";
  const source = params.get("source");

  const [aiDays, setAiDays] = useState<AiDay[] | null>(null);

  useEffect(() => {
    if (source === "ai") {
      try {
        const stored = sessionStorage.getItem("uturn_ai_itinerary");
        if (stored) setAiDays(JSON.parse(stored).itinerary ?? null);
      } catch { /* ignore */ }
    }
  }, [source]);

  const code = CITY_CODE[destination] ?? "SEL";
  const city = CITY_DATA[code];
  const photo = CITY_PHOTOS[code] ?? CITY_PHOTOS["SEL"];

  const totalDays = calcDays(departureDate, returnDate);
  const fullDayCount = Math.max(0, totalDays - 2);
  const fullDays = city.full_days.slice(0, fullDayCount);
  const requestDayIdx = findRequestDay(request, code, fullDayCount);

  // 組成 cards 陣列：[arrival, ...fullDays, departure]
  type CardData = {
    label: string; title: string;
    slots: { icon: string; text: string }[];
    rainy?: string; highlight: boolean;
  };

  const staticCards: CardData[] = [
    {
      label: "Day 1", title: "抵達日",
      slots: [
        { icon: "🌤️", text: city.arrival.pm },
        { icon: "🌙", text: city.arrival.eve },
      ],
      highlight: false,
    },
    ...fullDays.map((day: DayPlan, i: number) => ({
      label: `Day ${i + 2}`,
      title: day.theme,
      slots: [
        { icon: "☀️", text: i === requestDayIdx && request ? `${day.am}` : day.am },
        { icon: "🌤️", text: i === requestDayIdx && request ? `${day.pm}・${request}` : day.pm },
        { icon: "🌙", text: day.eve },
      ],
      rainy: day.rainy,
      highlight: i === requestDayIdx && !!request,
    })),
    {
      label: `Day ${totalDays}`, title: "回程日",
      slots: [
        { icon: "🛍️", text: city.departure.am },
        { icon: "✈️", text: city.departure.pm },
      ],
      highlight: false,
    },
  ];

  const aiCards: CardData[] = (aiDays ?? []).map((day, i) => ({
    label: `Day ${i + 1}`,
    title: i === 0 ? "抵達日" : i === (aiDays?.length ?? 0) - 1 ? "回程日" : `第 ${i + 1} 天`,
    slots: [
      ...(day.morning ? [{ icon: "☀️", text: day.morning }] : []),
      ...(day.afternoon ? [{ icon: "🌤️", text: day.afternoon }] : []),
      ...(day.evening ? [{ icon: "🌙", text: day.evening }] : []),
      ...(day.food ? [{ icon: "🍽️", text: day.food }] : []),
      ...(day.note ? [{ icon: "💡", text: day.note }] : []),
    ],
    highlight: false,
  }));

  const cards = aiDays ? aiCards : staticCards;

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">

      {/* Navbar */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-light tracking-widest text-[#6F675F] transition hover:text-[#A86F5A]"
          >
            ← 返回
          </button>
          <div className="text-xl font-light tracking-[0.18em] text-[#4B4037]">✈️ 出國優轉</div>
          <div className="w-16" />
        </div>
      </nav>

      {/* Hero with photo */}
      <section className="relative overflow-hidden pb-16 pt-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${photo}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a120a]/70 via-[#1a120a]/50 to-[#F7F3EC]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.45em] text-white/60">
            Your Itinerary
          </p>
          <div className="flex items-baseline gap-4">
            <span className="text-5xl">{city.flag}</span>
            <h1 className="text-4xl font-light tracking-wide text-white md:text-6xl">
              {destination} {nightCount(totalDays)}
            </h1>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-light">
            {departureDate && returnDate && (
              <span className="rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-white backdrop-blur-sm">
                {fmtDate(departureDate)} → {fmtDate(returnDate)}
              </span>
            )}
            <span className="rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-white backdrop-blur-sm">
              {people} 人同行
            </span>
            {request && (
              <span className="rounded-full border border-[#D4A574]/60 bg-[#A86F5A]/30 px-4 py-1.5 text-[#F5DFC8] backdrop-blur-sm">
                ✦ {request}已排入 Day {requestDayIdx + 2} 下午
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Day Cards */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-1 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">每日行程</h2>
          <p className="mb-5 text-xs font-light text-[#A79C91]">點擊「☂️ 雨天備案」可查看替代方案</p>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {cards.map((card, i) => (
              <DayCard key={i} {...card} />
            ))}
          </div>
          <p className="mt-2 text-xs font-light text-[#A79C91]">← 左右滑動查看更多 →</p>
        </div>
      </section>

      {/* Must Eat */}
      <section className="border-t border-[#D8D2C7] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">必吃清單</h2>
          <div className="flex flex-wrap gap-3">
            {city.must_eat.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-light text-[#4B4037] shadow-sm"
              >
                🍽️ {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Transport */}
      <section className="border-t border-[#D8D2C7] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">交通攻略</h2>
          <div className="rounded-[1.5rem] border border-[#D8D2C7] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-5 border-b border-[#EDE7DD] pb-5">
              <div className="text-base font-light tracking-wide text-[#3A2E26]">💳 {city.card_name}</div>
              <div className="mt-2 text-sm font-light leading-7 text-[#6F675F]">{city.card_tip}</div>
            </div>
            <ul className="mb-6 space-y-3">
              {city.transport_tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm font-light leading-7 text-[#5C5248]">
                  <span className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#A86F5A]" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              {city.apps.map((app) => (
                <div
                  key={app.name}
                  className="flex items-center gap-2 rounded-xl border border-[#D8D2C7] bg-[#F7F3EC] px-4 py-2.5"
                >
                  <span>{app.icon}</span>
                  <div>
                    <div className="text-sm font-light text-[#3A2E26]">{app.name}</div>
                    <div className="text-xs text-[#8A7F73]">{app.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insider Tips */}
      <section className="border-t border-[#D8D2C7] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">在地眉角</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {city.insider_tips.map((tip, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4 text-sm font-light leading-7 text-[#5C5248] shadow-sm"
              >
                <span className="mt-1 flex-shrink-0 text-[#A86F5A]">𓂃</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#D8D2C7] py-14">
        <div className="mx-auto max-w-5xl px-6 text-center">
          {departureDate && (
            <div className="mb-10 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] px-8 py-8 max-w-lg mx-auto">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-base font-light tracking-wide mb-1">出發前 7 天提醒</p>
              <p className="text-xs font-light text-[#8A7F73] mb-5">
                留下 Email，出發前一週自動寄「簽證 / 換匯 / 行李」行前必讀給你
              </p>
              <button
                onClick={() =>
                  router.push(
                    `/reminder?destination=${encodeURIComponent(destination)}&dep=${departureDate}`
                  )
                }
                className="rounded-full bg-[#A86F5A] px-10 py-3 text-sm font-light tracking-wider text-white transition hover:bg-[#96604D]"
              >
                設定行前提醒 →
              </button>
            </div>
          )}
          <p className="mb-6 text-sm font-light tracking-widest text-[#8FA39A]">想換個目的地？</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-12 py-4 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/30"
          >
            重新規劃另一趟旅程
          </button>
        </div>
      </section>

      <footer className="border-t border-[#D8D2C7] bg-[#EFE9DF] px-6 py-10 text-center text-sm font-light tracking-widest text-[#7C7168]">
        © 2026 出國優轉 AbroadUturn
      </footer>
    </main>
  );
}
