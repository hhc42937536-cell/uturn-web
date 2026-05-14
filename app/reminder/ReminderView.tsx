"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

const DESTINATIONS = [
  "東京", "大阪", "沖繩", "福岡", "北海道", "名古屋",
  "首爾", "釜山", "濟州",
  "曼谷", "清邁", "普吉島",
  "新加坡", "吉隆坡", "蘭卡威",
  "峇里島",
  "胡志明市", "河內", "峴港",
  "香港", "澳門",
  "馬尼拉", "宿霧",
  "杜拜", "倫敦", "巴黎", "關島", "帛琉",
];

export default function ReminderView() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [destination, setDestination] = useState(params.get("destination") ?? "首爾");
  const [depDate, setDepDate] = useState(params.get("dep") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.from("pre_trip_reminders").insert({
      user_email: email.trim(),
      destination,
      dep_date: depDate,
    });
    setStatus(error ? "err" : "ok");
  }

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">
            ✈️ 出國優轉
          </button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">行前提醒</span>
        </div>
      </nav>

      <div className="mx-auto max-w-lg px-6 pt-28 pb-20">
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Pre-Trip Reminder</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">出發前 7 天提醒</h1>
          <p className="text-sm font-light text-[#8A7F73] leading-7">
            填好目的地和出發日，出發前 7 天我們寄一封「行前必讀」給你<br />
            簽證、換匯、入境眉角、必帶物品——全部整理好
          </p>
        </div>

        {status === "ok" ? (
          <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] px-8 py-14 text-center">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-base font-light text-[#4B4037] mb-2">訂閱成功！</p>
            <p className="text-sm font-light text-[#8A7F73] mb-8">
              出發前 7 天，我們會寄「{destination} 行前必讀」到<br />
              <span className="text-[#A86F5A]">{email}</span>
            </p>
            <button
              onClick={() => router.push("/")}
              className="rounded-full border border-[#A86F5A] px-10 py-3 text-sm font-light tracking-wider text-[#A86F5A] transition hover:bg-[#A86F5A]/10"
            >
              回首頁
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8 space-y-5">
            <div>
              <label className="block text-xs font-light text-[#8A7F73] mb-2 tracking-wider">你的 Email</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm font-light outline-none focus:border-[#A86F5A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-[#8A7F73] mb-2 tracking-wider">目的地</label>
              <select
                value={destination} onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm font-light outline-none focus:border-[#A86F5A] transition"
              >
                {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-light text-[#8A7F73] mb-2 tracking-wider">出發日期</label>
              <input
                type="date" required
                min={today}
                value={depDate} onChange={(e) => setDepDate(e.target.value)}
                className="w-full rounded-2xl border border-[#D8D2C7] bg-white px-4 py-3 text-sm font-light outline-none focus:border-[#A86F5A] transition"
              />
            </div>

            {/* 說明提醒內容 */}
            <div className="rounded-2xl border border-[#EDE7DD] bg-white px-5 py-4">
              <p className="text-xs font-light text-[#8A7F73] mb-3">📬 出發前 7 天，你會收到：</p>
              <ul className="space-y-1.5 text-xs font-light text-[#6F675F]">
                <li>✅ 簽證 & 入境注意事項</li>
                <li>✅ 當地 SIM 卡 & 換匯建議</li>
                <li>✅ 行前必辦清單（訂位、票券）</li>
                <li>✅ 在地眉角 & 文化禁忌</li>
                <li>✅ 行李打包提醒</li>
              </ul>
            </div>

            {status === "err" && (
              <p className="text-xs font-light text-red-500">訂閱失敗，請稍後再試</p>
            )}

            <button
              type="submit" disabled={status === "loading"}
              className="w-full rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D] disabled:opacity-50"
            >
              {status === "loading" ? "訂閱中…" : "🔔 設定行前提醒"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
