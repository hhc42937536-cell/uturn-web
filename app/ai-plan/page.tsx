"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DayPlan = {
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
  note: string;
};

const DESTINATIONS = [
  "首爾", "釜山", "東京", "大阪", "京都", "沖繩",
  "曼谷", "清邁", "普吉島", "新加坡", "香港", "胡志明市",
  "峴港", "河內", "會安", "富國島",
];

const STYLES = [
  { value: "綜合", label: "🗺️ 綜合探索" },
  { value: "美食", label: "🍜 美食優先" },
  { value: "購物", label: "🛍️ 購物血拼" },
  { value: "文化景點", label: "🏯 文化景點" },
  { value: "自然戶外", label: "🌿 自然戶外" },
  { value: "輕鬆悠閒", label: "☕ 輕鬆悠閒" },
];

const DAY_COLORS = ["#A86F5A", "#5A8AA8", "#5AA87A", "#A85A8A", "#8AA85A", "#A8A05A", "#5A5AA8"];

export default function AiPlanPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("東京");
  const [depDate, setDepDate] = useState("");
  const [retDate, setRetDate] = useState("");
  const [people, setPeople] = useState(2);
  const [style, setStyle] = useState("綜合");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [error, setError] = useState("");

  const days = depDate && retDate
    ? Math.max(2, Math.round((new Date(retDate).getTime() - new Date(depDate).getTime()) / 86400000) + 1)
    : null;

  const generate = async () => {
    if (!depDate || !retDate) { setError("請填寫出發與回程日期"); return; }
    if (new Date(retDate) <= new Date(depDate)) { setError("回程日期須晚於出發日期"); return; }
    setError("");
    setLoading(true);
    setItinerary(null);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, depDate, retDate, people, style }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItinerary(data.itinerary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "產生失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-[#DDD6CA] bg-[#F7F3EC]/95 px-6 py-4">
        <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">
          ← 返回
        </button>
        <span className="text-base font-light tracking-wide text-[#4B4037]">✨ AI 行程規劃</span>
        <div className="w-16" />
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* 輸入表單 */}
        <div className="rounded-3xl border border-[#E8E0D5] bg-white px-8 py-7 shadow-sm">
          <h2 className="mb-6 text-lg font-light text-[#4B4037]">告訴 AI 你的旅遊計畫</h2>

          <div className="space-y-5">
            {/* 目的地 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#8A7F73]">目的地</label>
              <div className="flex flex-wrap gap-2">
                {DESTINATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDestination(d)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                      destination === d
                        ? "bg-[#A86F5A] text-white"
                        : "border border-[#D8D2C7] text-[#6F675F] hover:border-[#A86F5A]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* 日期 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-[#8A7F73]">出發日期</label>
                <input
                  type="date"
                  value={depDate}
                  onChange={(e) => setDepDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] px-3 py-2 text-sm text-[#4B4037] outline-none focus:border-[#A86F5A]"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-[#8A7F73]">回程日期</label>
                <input
                  type="date"
                  value={retDate}
                  onChange={(e) => setRetDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] px-3 py-2 text-sm text-[#4B4037] outline-none focus:border-[#A86F5A]"
                />
              </div>
              {days && (
                <div className="flex items-end pb-2">
                  <span className="rounded-xl bg-[#F0EBE4] px-3 py-2 text-sm text-[#A86F5A]">{days} 天</span>
                </div>
              )}
            </div>

            {/* 人數 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#8A7F73]">人數</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPeople(n)}
                    className={`h-9 w-9 rounded-full text-sm transition ${
                      people === n
                        ? "bg-[#A86F5A] text-white"
                        : "border border-[#D8D2C7] text-[#6F675F] hover:border-[#A86F5A]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* 旅遊風格 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#8A7F73]">旅遊風格</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                      style === s.value
                        ? "bg-[#A86F5A] text-white"
                        : "border border-[#D8D2C7] text-[#6F675F] hover:border-[#A86F5A]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-2xl bg-[#A86F5A] py-3.5 text-sm font-light tracking-wide text-white transition hover:bg-[#8F5D4A] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "✨ AI 規劃中，請稍候…" : "✨ 生成 AI 行程"}
            </button>
          </div>
        </div>

        {/* 行程結果 */}
        {itinerary && (
          <div className="mt-8 space-y-6">
            <h3 className="text-base font-light text-[#4B4037]">
              {destination} · {itinerary.length} 天行程
            </h3>
            {itinerary.map((day, i) => {
              const color = DAY_COLORS[i % DAY_COLORS.length];
              return (
                <div key={i} className="overflow-hidden rounded-3xl border border-[#E8E0D5] bg-white shadow-sm">
                  {/* Day header */}
                  <div className="flex items-center gap-3 px-6 py-4" style={{ background: color }}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-base font-light tracking-widest text-white">Day {i + 1}</span>
                  </div>

                  {/* 時段 */}
                  <div className="divide-y divide-[#F5F0EB] px-6">
                    {[
                      { label: "☀️ 上午", text: day.morning },
                      { label: "🌤 下午", text: day.afternoon },
                      { label: "🌙 晚上", text: day.evening },
                    ].map(({ label, text }) => (
                      <div key={label} className="py-5">
                        <p className="mb-2 text-xs font-semibold text-[#8FA39A]">{label}</p>
                        <p className="text-sm leading-7 text-[#4B4037]">{text}</p>
                      </div>
                    ))}
                  </div>

                  {/* 必吃 + 小提示 */}
                  <div className="mx-6 mb-5 mt-1 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#FBF3EE] px-4 py-3.5">
                      <p className="mb-1.5 text-xs font-semibold text-[#C8825A]">🍜 必吃</p>
                      <p className="text-sm leading-6 text-[#4B4037]">{day.food}</p>
                    </div>
                    <div className="rounded-2xl bg-[#EEF4FB] px-4 py-3.5">
                      <p className="mb-1.5 text-xs font-semibold text-[#5A8AA8]">💡 小提示</p>
                      <p className="text-sm leading-6 text-[#6F675F]">{day.note}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
