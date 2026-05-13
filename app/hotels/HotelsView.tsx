"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOTEL_ESTIMATES, HOTEL_PICKS, agodaUrl, bookingUrl } from "@/app/lib/hotelData";

const DESTINATIONS = [
  { name: "東京", flag: "🇯🇵" }, { name: "大阪", flag: "🇯🇵" },
  { name: "沖繩", flag: "🇯🇵" }, { name: "福岡", flag: "🇯🇵" },
  { name: "北海道", flag: "🇯🇵" }, { name: "名古屋", flag: "🇯🇵" },
  { name: "首爾", flag: "🇰🇷" }, { name: "釜山", flag: "🇰🇷" },
  { name: "濟州", flag: "🇰🇷" },
  { name: "曼谷", flag: "🇹🇭" }, { name: "清邁", flag: "🇹🇭" },
  { name: "普吉島", flag: "🇹🇭" },
  { name: "新加坡", flag: "🇸🇬" },
  { name: "吉隆坡", flag: "🇲🇾" }, { name: "蘭卡威", flag: "🇲🇾" },
  { name: "峇里島", flag: "🇮🇩" },
  { name: "胡志明市", flag: "🇻🇳" }, { name: "河內", flag: "🇻🇳" },
  { name: "峴港", flag: "🇻🇳" },
  { name: "香港", flag: "🇭🇰" }, { name: "澳門", flag: "🇲🇴" },
  { name: "上海", flag: "🇨🇳" }, { name: "北京", flag: "🇨🇳" },
  { name: "杜拜", flag: "🇦🇪" },
  { name: "倫敦", flag: "🇬🇧" }, { name: "巴黎", flag: "🇫🇷" },
  { name: "關島", flag: "🇬🇺" }, { name: "帛琉", flag: "🇵🇼" },
];

const BUDGET_LABELS = [
  { key: "all", label: "全部" },
  { key: "budget", label: "省錢型（＜ 800）" },
  { key: "mid", label: "舒適型（800-2000）" },
  { key: "luxury", label: "享受型（＞ 2000）" },
];

function parseLow(range: string): number {
  return parseInt(range.replace(/,/g, "").split("~")[0]) || 0;
}

export default function HotelsView() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [depDate, setDepDate] = useState("");
  const [retDate, setRetDate] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const filteredDests = DESTINATIONS.filter(({ name }) => {
    const est = HOTEL_ESTIMATES[name];
    if (!est) return budgetFilter === "all";
    const low = parseLow(est.priceRange);
    if (budgetFilter === "budget") return low < 800;
    if (budgetFilter === "mid") return low >= 800 && low <= 2000;
    if (budgetFilter === "luxury") return low > 2000;
    return true;
  });

  const currentDest = selected ? DESTINATIONS.find((d) => d.name === selected) : null;
  const est = selected ? HOTEL_ESTIMATES[selected] : null;
  const picks = selected ? HOTEL_PICKS[selected] : null;

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      {/* Nav */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">住宿推薦</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Hotel Guide</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">住哪裡最值？</h1>
          <p className="text-sm font-light text-[#8A7F73]">
            選目的地，看推薦區域・參考價・精選飯店，直接連到 Agoda / Booking 比價
          </p>
        </div>

        {/* 日期（可選，影響連結預填） */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <div>
            <label className="block text-xs font-light text-[#8A7F73] mb-1">入住日</label>
            <input type="date" min={today} value={depDate}
              onChange={(e) => setDepDate(e.target.value)}
              className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-4 py-2 text-sm font-light outline-none focus:border-[#A86F5A]" />
          </div>
          <div>
            <label className="block text-xs font-light text-[#8A7F73] mb-1">退房日</label>
            <input type="date" min={depDate || today} value={retDate}
              onChange={(e) => setRetDate(e.target.value)}
              className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-4 py-2 text-sm font-light outline-none focus:border-[#A86F5A]" />
          </div>
        </div>

        {/* 預算篩選 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {BUDGET_LABELS.map(({ key, label }) => (
            <button key={key}
              onClick={() => setBudgetFilter(key)}
              className={`rounded-full border px-4 py-2 text-xs font-light transition-all
                ${budgetFilter === key
                  ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#A86F5A]"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 城市格 */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {filteredDests.map(({ name, flag }) => {
                const e = HOTEL_ESTIMATES[name];
                return (
                  <button key={name}
                    onClick={() => setSelected(name === selected ? null : name)}
                    className={`rounded-2xl border p-3 text-center transition-all
                      ${selected === name
                        ? "border-[#A86F5A] bg-[#A86F5A]/10"
                        : "border-[#D8D2C7] bg-[#FBF8F1] hover:border-[#A86F5A] hover:bg-[#FFFDF8]"}`}>
                    <div className="text-xl mb-1">{flag}</div>
                    <div className="text-xs font-light">{name}</div>
                    {e && <div className="text-[10px] text-[#8A7F73] mt-0.5">{e.priceRange.split("~")[0]}起</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 詳細資訊 */}
          <div className="flex-1">
            {!selected && (
              <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-10 text-center text-sm font-light text-[#A79C91]">
                選擇左邊的目的地，查看住宿推薦
              </div>
            )}

            {selected && est && (
              <div className="space-y-4">
                {/* 標頭 */}
                <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{currentDest?.flag}</span>
                    <div>
                      <h2 className="text-xl font-light tracking-wide">{selected}</h2>
                      <p className="text-xs font-light text-[#8A7F73]">住宿參考資訊</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-[#F0E6DF] px-4 py-3 text-center">
                      <p className="text-xs font-light text-[#8A7F73] mb-1">每晚參考</p>
                      <p className="text-sm font-light text-[#A86F5A]">TWD {est.priceRange}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F0E6DF] px-4 py-3 text-center">
                      <p className="text-xs font-light text-[#8A7F73] mb-1">平均評分</p>
                      <p className="text-sm font-light text-[#A86F5A]">⭐ {est.rating}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F0E6DF] px-4 py-3 text-center">
                      <p className="text-xs font-light text-[#8A7F73] mb-1">推薦區域</p>
                      <p className="text-[10px] font-light text-[#4B4037] leading-4">{est.area}</p>
                    </div>
                  </div>
                </div>

                {/* 精選飯店 */}
                {picks && picks.length > 0 && (
                  <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
                    <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">精選飯店</p>
                    <div className="space-y-3">
                      {picks.map((p) => (
                        <div key={p.name}
                          className="rounded-2xl border border-[#E0D9D2] bg-white p-4">
                          <p className="text-sm font-light text-[#4B4037] mb-1">{p.name}</p>
                          <p className="text-xs font-light text-[#8A7F73] mb-3">{p.location}</p>
                          <div className="flex gap-2">
                            <a href={agodaUrl(p.agodaKeyword, depDate, retDate)}
                              target="_blank" rel="noopener noreferrer"
                              className="rounded-full border border-[#D8D2C7] px-4 py-1.5 text-xs font-light text-[#4B4037] hover:border-[#A86F5A] hover:text-[#A86F5A] transition">
                              Agoda →
                            </a>
                            <a href={bookingUrl(p.name, depDate, retDate)}
                              target="_blank" rel="noopener noreferrer"
                              className="rounded-full border border-[#D8D2C7] px-4 py-1.5 text-xs font-light text-[#4B4037] hover:border-[#A86F5A] hover:text-[#A86F5A] transition">
                              Booking →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 整體搜尋按鈕 */}
                <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
                  <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">全部比價</p>
                  <div className="flex flex-col gap-3">
                    <a href={agodaUrl(selected, depDate, retDate)}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-full border border-[#D8D2C7] bg-white py-3 text-center text-sm font-light text-[#4B4037] hover:border-[#A86F5A] hover:text-[#A86F5A] transition">
                      🔍 Agoda 搜尋「{selected}」所有飯店
                    </a>
                    <a href={bookingUrl(selected, depDate, retDate)}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-full border border-[#D8D2C7] bg-white py-3 text-center text-sm font-light text-[#4B4037] hover:border-[#A86F5A] hover:text-[#A86F5A] transition">
                      🔍 Booking.com 搜尋「{selected}」
                    </a>
                  </div>
                </div>

                {/* 去規劃行程 */}
                <button
                  onClick={() => router.push("/wizard")}
                  className="w-full rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]">
                  以 {selected} 為目的地，開始規劃行程 →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
