"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import rawData from "../lib/insider_tips.json";

type CityTips = {
  city: string;
  ticket: string[];
  crowd: string[];
  transport: string[];
  hidden: string[];
  money: string[];
  seasonal: Record<string, string>;
};

const DATA = rawData as unknown as Record<string, CityTips>;

const CITY_KEYS = Object.keys(DATA).filter((k) => k !== "_meta");

const CITY_FLAG: Record<string, string> = {
  TYO: "🇯🇵", OSA: "🇯🇵", CTS: "🇯🇵", FUK: "🇯🇵", OKA: "🇯🇵",
  SEL: "🇰🇷", PUS: "🇰🇷",
  BKK: "🇹🇭", CNX: "🇹🇭",
  SIN: "🇸🇬",
  HKG: "🇭🇰", MFM: "🇲🇴",
  DPS: "🇮🇩",
  SGN: "🇻🇳", HAN: "🇻🇳", DAD: "🇻🇳",
  KUL: "🇲🇾",
  MNL: "🇵🇭",
  TPE: "🇹🇼",
  PAR: "🇫🇷", ROM: "🇮🇹",
};

const CATS = [
  { key: "ticket",    label: "票務時機",  icon: "🎟️" },
  { key: "crowd",     label: "人潮規律",  icon: "👥" },
  { key: "transport", label: "交通眉角",  icon: "🚇" },
  { key: "hidden",    label: "隱藏景點",  icon: "🗺️" },
  { key: "money",     label: "省錢眉角",  icon: "💰" },
  { key: "seasonal",  label: "旺季月份",  icon: "📅" },
] as const;

type CatKey = typeof CATS[number]["key"];

export default function TipsView() {
  const router = useRouter();
  const [city, setCity] = useState("TYO");
  const [cat, setCat] = useState<CatKey>("ticket");

  const info = DATA[city];
  if (!info) return null;

  const tips: string[] = cat === "seasonal" ? [] : (info[cat as Exclude<CatKey, "seasonal">] ?? []);
  const seasonal = info.seasonal ?? {};

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">深度在地知識庫</span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Insider Tips</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">深度在地知識庫</h1>
          <p className="text-sm font-light text-[#8A7F73]">去過的人才知道的票務時機・人潮規律・隱藏景點・省錢眉角</p>
        </div>

        {/* 城市選擇 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CITY_KEYS.map((code) => {
            const d = DATA[code];
            return (
              <button
                key={code}
                onClick={() => setCity(code)}
                className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                  ${city === code
                    ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                    : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
              >
                {CITY_FLAG[code] ?? "🌏"} {d.city}
              </button>
            );
          })}
        </div>

        {/* 分類 Tab */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCat(key)}
              className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                ${cat === key
                  ? "border-[#A86F5A] bg-[#A86F5A] text-white"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* 內容 */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-7 mb-8 min-h-[200px]">
          {cat === "seasonal" ? (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-5">📅 {info.city} 各月旅遊攻略</p>
              <div className="space-y-4">
                {Object.entries(seasonal).map(([month, desc]) => (
                  <div key={month} className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                    <p className="text-sm font-light text-[#A86F5A] mb-1">{month}</p>
                    <p className="text-sm font-light text-[#4B4037] leading-7">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-5">
                {CATS.find((c) => c.key === cat)?.icon} {info.city} ·{" "}
                {CATS.find((c) => c.key === cat)?.label}
              </p>
              {tips.length === 0 ? (
                <p className="text-sm font-light text-[#A79C91]">此城市暫無該類別資料</p>
              ) : (
                <ul className="space-y-4">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                      <span className="shrink-0 mt-2 w-5 h-5 rounded-full bg-[#A86F5A]/10 text-[#A86F5A] text-xs flex items-center justify-center font-light">
                        {i + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/wizard")}
            className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]"
          >
            規劃 {info.city} 行程 →
          </button>
          <button
            onClick={() => router.push("/restaurant")}
            className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-6 py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]"
          >
            美食攻略
          </button>
        </div>
      </div>
    </main>
  );
}
