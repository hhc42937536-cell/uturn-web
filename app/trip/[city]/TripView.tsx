"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CityData, DayPlan } from "../../lib/cityData";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function nightCount(days: number): string {
  return `${days}天${days - 1}夜`;
}

// ── Share Button ──────────────────────────────────────────────────────────────

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm font-light text-white backdrop-blur-sm transition hover:bg-white/30"
    >
      {copied ? "✓ 已複製" : "🔗 分享行程"}
    </button>
  );
}

// ── Day Card ──────────────────────────────────────────────────────────────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

type Props = {
  city: string;
  code: string;
  flag: string;
  photo: string;
  totalDays: number;
  people: string;
  request: string;
  requestDayIdx: number;
  departureDate: string;
  returnDate: string;
  cityData: CityData;
  fullDays: DayPlan[];
};

export default function TripView({
  city, flag, photo, totalDays, people, request,
  requestDayIdx, departureDate, returnDate, cityData, fullDays,
}: Props) {
  const router = useRouter();

  type CardData = {
    label: string; title: string;
    slots: { icon: string; text: string }[];
    rainy?: string; highlight: boolean;
  };

  const cards: CardData[] = [
    {
      label: "Day 1", title: "抵達日",
      slots: [
        { icon: "🌤️", text: cityData.arrival.pm },
        { icon: "🌙", text: cityData.arrival.eve },
      ],
      highlight: false,
    },
    ...fullDays.map((day: DayPlan, i: number) => ({
      label: `Day ${i + 2}`,
      title: day.theme,
      slots: [
        { icon: "☀️", text: day.am },
        { icon: "🌤️", text: i === requestDayIdx && request ? `${day.pm}・${request}` : day.pm },
        { icon: "🌙", text: day.eve },
      ],
      rainy: day.rainy,
      highlight: i === requestDayIdx && !!request,
    })),
    {
      label: `Day ${totalDays}`, title: "回程日",
      slots: [
        { icon: "🛍️", text: cityData.departure.am },
        { icon: "✈️", text: cityData.departure.pm },
      ],
      highlight: false,
    },
  ];

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

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${photo}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a120a]/70 via-[#1a120a]/50 to-[#F7F3EC]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.45em] text-white/60">Your Itinerary</p>
          <div className="flex items-baseline gap-4">
            <span className="text-5xl">{flag}</span>
            <h1 className="text-4xl font-light tracking-wide text-white md:text-6xl">
              {city} {nightCount(totalDays)}
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
                ✦ {request} 已排入 Day {requestDayIdx + 2}
              </span>
            )}
          </div>

          {/* Share Button */}
          <div className="mt-6">
            <ShareButton />
          </div>
        </div>
      </section>

      {/* Day Cards */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-1 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">每日行程</h2>
          <p className="mb-5 text-xs font-light text-[#A79C91]">點「☂️ 雨天備案」查看替代方案</p>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {cards.map((card, i) => <DayCard key={i} {...card} />)}
          </div>
          <p className="mt-2 text-xs font-light text-[#A79C91]">← 左右滑動 →</p>
        </div>
      </section>

      {/* Must Eat */}
      <section className="border-t border-[#D8D2C7] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">必吃清單</h2>
          <div className="flex flex-wrap gap-3">
            {cityData.must_eat.map((item) => (
              <span key={item} className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-sm font-light text-[#4B4037] shadow-sm">
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
              <div className="text-base font-light tracking-wide text-[#3A2E26]">💳 {cityData.card_name}</div>
              <div className="mt-2 text-sm font-light leading-7 text-[#6F675F]">{cityData.card_tip}</div>
            </div>
            <ul className="mb-6 space-y-3">
              {cityData.transport_tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm font-light leading-7 text-[#5C5248]">
                  <span className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#A86F5A]" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              {cityData.apps.map((app) => (
                <div key={app.name} className="flex items-center gap-2 rounded-xl border border-[#D8D2C7] bg-[#F7F3EC] px-4 py-2.5">
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
            {cityData.insider_tips.map((tip, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4 text-sm font-light leading-7 text-[#5C5248] shadow-sm">
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
