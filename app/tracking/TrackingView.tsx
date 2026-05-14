"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export type FlightTrack = {
  id: string;
  type: "flight";
  originCode: string;
  originLabel: string;
  destCode: string;
  destLabel: string;
  destFlag: string;
  depDate: string;
  retDate: string;
  priceRef: string;       // 儲存當時的參考票價
  skyscannerUrl: string;
  googleFlightsUrl: string;
  savedAt: string;        // ISO datetime
  lastChecked: string;    // ISO datetime
};

const STORAGE_KEY = "uturn_tracks";

export function loadTracks(): FlightTrack[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveTrack(t: FlightTrack) {
  const tracks = loadTracks();
  // 同樣航線不重複追蹤
  const exists = tracks.find(
    (x) => x.originCode === t.originCode && x.destCode === t.destCode && x.depDate === t.depDate
  );
  if (exists) return false;
  tracks.unshift(t);
  // 最多 20 筆
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks.slice(0, 20)));
  return true;
}

export function removeTrack(id: string) {
  const tracks = loadTracks().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function touchChecked(id: string) {
  const tracks = loadTracks().map((t) =>
    t.id === id ? { ...t, lastChecked: new Date().toISOString() } : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

// ── 主頁面 ─────────────────────────────────────────────────
function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 86400000);
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function TrackingView() {
  const router = useRouter();
  const [tracks, setTracks] = useState<FlightTrack[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTracks(loadTracks());
    setMounted(true);
  }, []);

  const handleRemove = (id: string) => {
    removeTrack(id);
    setTracks(loadTracks());
  };

  const handleCheck = (track: FlightTrack) => {
    touchChecked(track.id);
    setTracks(loadTracks());
    window.open(track.skyscannerUrl, "_blank", "noopener,noreferrer");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">價格追蹤</span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Price Tracker</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">機票價格追蹤</h1>
          <p className="text-sm font-light text-[#8A7F73]">儲存想追的航線，隨時回來比對票價是否調降</p>
        </div>

        {tracks.length === 0 ? (
          /* 空狀態 */
          <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] px-8 py-16 text-center">
            <p className="text-4xl mb-4">🔔</p>
            <p className="text-base font-light text-[#6F675F] mb-2">還沒有追蹤中的航線</p>
            <p className="text-sm font-light text-[#A79C91] mb-8">到機票搜尋頁點「+ 追蹤票價」即可加入</p>
            <button
              onClick={() => router.push("/flights")}
              className="rounded-full bg-[#A86F5A] px-10 py-3 text-sm font-light tracking-wider text-white transition hover:bg-[#96604D]"
            >
              去搜尋機票 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 說明欄 */}
            <div className="rounded-2xl border border-[#EDE7DD] bg-[#FFFDF8] px-5 py-3 flex items-start gap-3">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-xs font-light text-[#8A7F73] leading-6">
                點「查最新票價」會開啟 Skyscanner 顯示當前票價，與下方「追蹤時參考價」比較，判斷是否值得購票。低於參考價就是好時機！
              </p>
            </div>

            {tracks.map((track) => {
              const savedDays = daysSince(track.savedAt);
              const checkedDays = track.lastChecked !== track.savedAt ? daysSince(track.lastChecked) : null;
              return (
                <div key={track.id} className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
                  {/* 航線標題 */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{track.destFlag}</span>
                        <h3 className="text-lg font-light tracking-wide">
                          {track.originLabel} → {track.destLabel}
                        </h3>
                      </div>
                      <p className="text-xs font-light text-[#8A7F73]">
                        {track.depDate ? `去程 ${track.depDate}` : "日期未設定"}
                        {track.retDate ? ` · 回程 ${track.retDate}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(track.id)}
                      className="text-[#C4BCB4] hover:text-[#A86F5A] text-xs font-light transition"
                      title="刪除追蹤"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 參考票價 */}
                  <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-light text-[#8A7F73] mb-1">追蹤時參考票價</p>
                        <p className="text-lg font-light text-[#A86F5A]">{track.priceRef}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-light text-[#8A7F73] mb-1">追蹤日期</p>
                        <p className="text-sm font-light text-[#6F675F]">
                          {fmtDate(track.savedAt)}
                          {savedDays > 0 ? `（${savedDays} 天前）` : "（今天）"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 上次查詢 */}
                  {checkedDays !== null && (
                    <p className="text-xs font-light text-[#A79C91] mb-4">
                      上次查詢：{checkedDays === 0 ? "今天" : `${checkedDays} 天前`}
                    </p>
                  )}

                  {/* 按鈕 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCheck(track)}
                      className="flex-1 rounded-full bg-[#A86F5A] py-3 text-sm font-light tracking-wider text-white transition hover:bg-[#96604D]"
                    >
                      🔍 查最新票價（Skyscanner）
                    </button>
                    <a
                      href={track.googleFlightsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#D8D2C7] bg-white px-5 py-3 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]"
                    >
                      GF
                    </a>
                  </div>
                </div>
              );
            })}

            {/* 全部清除 */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  if (confirm("確定清除所有追蹤紀錄？")) {
                    localStorage.removeItem(STORAGE_KEY);
                    setTracks([]);
                  }
                }}
                className="text-xs font-light text-[#C4BCB4] hover:text-[#A86F5A] underline transition"
              >
                清除全部追蹤
              </button>
            </div>
          </div>
        )}

        {/* 底部 CTA */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/flights")}
            className="flex-1 rounded-full border border-[#A86F5A] bg-[#A86F5A]/10 py-4 text-sm font-light tracking-wider text-[#A86F5A] transition hover:bg-[#A86F5A]/20"
          >
            + 搜尋更多航線
          </button>
        </div>
      </div>
    </main>
  );
}

