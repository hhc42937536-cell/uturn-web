"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import rawData from "../lib/cultural_notes.json";

type CountryData = {
  country_name: string;
  tips: string[];
  useful_phrases: string[];
  payment: string;
  transport_tip: string;
  plug_type: string;
};

const DATA = rawData as unknown as Record<string, CountryData>;

const COUNTRIES = [
  { code: "JP", flag: "🇯🇵", name: "日本" },
  { code: "KR", flag: "🇰🇷", name: "韓國" },
  { code: "TH", flag: "🇹🇭", name: "泰國" },
  { code: "SG", flag: "🇸🇬", name: "新加坡" },
  { code: "VN", flag: "🇻🇳", name: "越南" },
  { code: "ID", flag: "🇮🇩", name: "印尼" },
  { code: "HK", flag: "🇭🇰", name: "香港" },
  { code: "US", flag: "🇺🇸", name: "美國" },
].filter(({ code }) => !!DATA[code]);

type Tab = "tips" | "phrases" | "payment" | "plug";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "tips",    label: "文化禁忌", icon: "🚫" },
  { id: "phrases", label: "常用語句", icon: "💬" },
  { id: "payment", label: "付款方式", icon: "💳" },
  { id: "plug",    label: "插座電壓", icon: "🔌" },
];

export default function CulturalView() {
  const router = useRouter();
  const [active, setActive] = useState("JP");
  const [tab, setTab] = useState<Tab>("tips");

  const info = DATA[active];
  if (!info) return null;

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">文化禮儀</span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Cultural Guide</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">出國文化禮儀</h1>
          <p className="text-sm font-light text-[#8A7F73]">文化禁忌 · 常用語句 · 付款方式 · 插座資訊</p>
        </div>

        {/* 國家選擇 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {COUNTRIES.map(({ code, flag, name }) => (
            <button
              key={code}
              onClick={() => setActive(code)}
              className={`rounded-full border px-5 py-2.5 text-sm font-light transition-all
                ${active === code
                  ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
            >
              {flag} {name}
            </button>
          ))}
        </div>

        {/* 國家標頭 */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] px-7 py-5 mb-5 flex items-center gap-4">
          <span className="text-4xl">{COUNTRIES.find((c) => c.code === active)?.flag}</span>
          <div>
            <h2 className="text-xl font-light tracking-wide">{info.country_name}</h2>
            <p className="text-xs font-light text-[#8A7F73] mt-1">交通：{info.transport_tip}</p>
          </div>
        </div>

        {/* Tab 選擇 */}
        <div className="flex flex-wrap gap-2 mb-5">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                ${tab === id
                  ? "border-[#A86F5A] bg-[#A86F5A] text-white"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Tab 內容 */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-7 mb-8">
          {tab === "tips" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-5">🚫 文化注意 & 禁忌</p>
              <ul className="space-y-3">
                {info.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                    <span className="shrink-0 text-[#A86F5A]">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "phrases" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-5">💬 旅行常用語句</p>
              <div className="grid gap-3">
                {info.useful_phrases.map((phrase, i) => {
                  const [native, ...rest] = phrase.split("（");
                  const meaning = rest.join("（").replace("）", "").replace("）", "");
                  return (
                    <div key={i} className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                      <p className="text-base font-light text-[#4B4037]">{native}</p>
                      {meaning && (
                        <p className="text-xs font-light text-[#8A7F73] mt-1">（{meaning}）</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-[#EDE7DD] bg-[#FFFDF8] px-4 py-3">
                <p className="text-xs font-light text-[#8A7F73]">💡 遇到語言不通，Google 翻譯離線功能非常好用，出發前記得下載語言包</p>
              </div>
            </div>
          )}

          {tab === "payment" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">💳 付款方式</p>
              <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-5">
                <p className="text-sm font-light text-[#4B4037] leading-8">{info.payment}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://wise.com/tw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]"
                >
                  💚 Wise 卡（出國最推薦）→
                </a>
                <a
                  href="https://www.bot.com.tw/tw/personal/foreign-exchange/daily-exchange-rates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]"
                >
                  🏦 台灣銀行牌告匯率 →
                </a>
              </div>
            </div>
          )}

          {tab === "plug" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🔌 插座 & 電壓</p>
              <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-5">
                <p className="text-sm font-light text-[#4B4037] leading-8">{info.plug_type}</p>
              </div>
              <div className="mt-4 rounded-2xl border border-[#EDE7DD] bg-[#FFFDF8] px-4 py-3">
                <p className="text-xs font-light text-[#8A7F73]">💡 建議帶萬用轉接頭（旅行用），大多數電器（充電器/電腦）支援 100–240V，不需要變壓器</p>
              </div>
              <div className="mt-3">
                <a
                  href="/pretrip"
                  className="text-xs font-light text-[#A86F5A] underline"
                >
                  查看更詳細插座電壓資訊（行前必知）→
                </a>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/wizard")}
            className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]"
          >
            規劃 {info.country_name} 行程 →
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
