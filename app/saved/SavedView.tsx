"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type SavedTrip = {
  id: string;
  version: number;
  savedAt: string;         // ISO datetime
  city: string;
  flag: string;
  depDate: string;
  retDate: string;
  people: string;
  request: string;
  label?: string;          // user-given name
  days?: string[];         // snapshot of day summaries
};

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function fmtDate(s: string) {
  if (!s) return "未設定";
  const d = new Date(s + "T00:00:00");
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function getDays(dep: string, ret: string) {
  if (!dep || !ret) return 0;
  return Math.max(0, Math.round((new Date(ret).getTime() - new Date(dep).getTime()) / 86400000)) + 1;
}

const DEMO_TRIPS: SavedTrip[] = [
  {
    id: "demo1", version: 2, savedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    city: "首爾", flag: "🇰🇷", depDate: "2025-07-15", retDate: "2025-07-20",
    people: "2", request: "咖啡廳、弘大、江南", label: "暑假首爾五天",
    days: ["抵達・仁川機場→弘大", "明洞・N首爾塔・廣藏市場", "江南・狎鷗亭・COEX", "益善洞・景福宮・西村", "購物・返程"],
  },
  {
    id: "demo1v1", version: 1, savedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    city: "首爾", flag: "🇰🇷", depDate: "2025-07-15", retDate: "2025-07-20",
    people: "2", request: "弘大、購物", label: "暑假首爾五天（初版）",
    days: ["抵達・弘大入住", "明洞・南大門", "東大門購物", "弘大自由行", "返程"],
  },
  {
    id: "demo2", version: 1, savedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    city: "大阪", flag: "🇯🇵", depDate: "2025-08-01", retDate: "2025-08-05",
    people: "3", request: "USJ、道頓堀、黑門市場", label: "大阪家族遊",
    days: ["抵達・難波", "USJ 超級任天堂世界", "道頓堀・黑門市場", "天王寺・通天閣", "梅田・返程"],
  },
];

export default function SavedView() {
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("uturn_saved_trips");
      const parsed: SavedTrip[] = stored ? JSON.parse(stored) : [];
      // merge demo if no real data
      setTrips(parsed.length ? parsed : DEMO_TRIPS);
    } catch {
      setTrips(DEMO_TRIPS);
    }
  }, []);

  const save = (next: SavedTrip[]) => {
    setTrips(next);
    localStorage.setItem("uturn_saved_trips", JSON.stringify(next));
  };

  const deleteTrip = (id: string) => {
    save(trips.filter((t) => t.id !== id));
    setCompareIds((prev) => prev.filter((c) => c !== id));
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const saveLabel = (id: string) => {
    save(trips.map((t) => (t.id === id ? { ...t, label: editLabel } : t)));
    setEditId(null);
  };

  const compareTrips = compareIds.map((id) => trips.find((t) => t.id === id)!).filter(Boolean);

  // group by city
  const grouped = trips.reduce<Record<string, SavedTrip[]>>((acc, t) => {
    (acc[t.city] ??= []).push(t);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">📚 我的計畫庫</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">My Trip Library · Version History</p>
          <h1 className="text-3xl font-light tracking-wide">我的計畫庫</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            所有規劃過的旅程自動儲存，可命名、比較不同版本、或直接重新開啟規劃。
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-6 py-4 text-center">
            <div className="text-2xl font-light text-[#A86F5A]">{trips.length}</div>
            <div className="text-[11px] font-light text-[#8A7F73]">已儲存行程</div>
          </div>
          <div className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-6 py-4 text-center">
            <div className="text-2xl font-light text-[#8FA39A]">{Object.keys(grouped).length}</div>
            <div className="text-[11px] font-light text-[#8A7F73]">規劃過的城市</div>
          </div>
          {compareIds.length > 0 && (
            <button onClick={() => setShowCompare(true)}
              className="rounded-2xl border border-[#8FA39A] bg-[#8FA39A]/15 px-6 py-4 text-center transition hover:bg-[#8FA39A]/25">
              <div className="text-base font-light text-[#4B6B63]">⚖️ 比較 {compareIds.length} 個版本</div>
              <div className="text-[11px] font-light text-[#4B6B63]">點此開啟</div>
            </button>
          )}
        </div>

        {compareIds.length > 0 && compareIds.length < 2 && (
          <div className="mb-6 rounded-2xl border border-[#F6D860]/60 bg-[#FEF3C7] px-5 py-3 text-sm font-light text-[#92400E]">
            💡 再選一個版本即可開啟比較模式
          </div>
        )}

        {/* Trip groups */}
        {Object.entries(grouped).map(([city, cityTrips]) => (
          <div key={city} className="mb-10">
            <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">
              {cityTrips[0].flag} {city}
            </h2>
            <div className="space-y-3">
              {cityTrips.sort((a, b) => b.savedAt.localeCompare(a.savedAt)).map((trip) => {
                const dayCount = getDays(trip.depDate, trip.retDate);
                const inCompare = compareIds.includes(trip.id);
                return (
                  <div key={trip.id}
                    className={`rounded-2xl border bg-[#FBF8F1] p-5 transition ${
                      inCompare ? "border-[#8FA39A]" : "border-[#D8D2C7] hover:border-[#A86F5A]/30"
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        {editId === trip.id ? (
                          <div className="flex gap-2">
                            <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                              className="h-8 rounded-xl border border-[#D8D2C7] bg-white px-3 text-sm font-light outline-none focus:border-[#8FA39A]"
                              onKeyDown={(e) => e.key === "Enter" && saveLabel(trip.id)} />
                            <button onClick={() => saveLabel(trip.id)} className="text-xs font-light text-[#8FA39A]">確認</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditId(trip.id); setEditLabel(trip.label ?? trip.city); }}
                            className="text-left text-sm font-light tracking-wide text-[#3A2E26] hover:text-[#A86F5A]">
                            {trip.label ?? `${trip.city} 旅程`}
                            <span className="ml-2 text-[11px] text-[#A79C91]">✎</span>
                          </button>
                        )}
                        <div className="mt-0.5 text-[11px] font-light text-[#A79C91]">
                          版本 {trip.version}　儲存於 {fmt(trip.savedAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toggleCompare(trip.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-light transition ${
                            inCompare ? "border-[#8FA39A] bg-[#8FA39A]/20 text-[#4B6B63]" : "border-[#D8D2C7] text-[#6F675F] hover:border-[#8FA39A]/50"
                          }`}>
                          {inCompare ? "✓ 已選" : "⚖️ 比較"}
                        </button>
                        <button onClick={() => deleteTrip(trip.id)}
                          className="rounded-full border border-[#D8D2C7] px-3 py-1 text-xs font-light text-[#A79C91] transition hover:border-red-300 hover:text-red-400">
                          刪除
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-3 text-xs font-light text-[#6F675F]">
                      <span>📅 {fmtDate(trip.depDate)} – {fmtDate(trip.retDate)}</span>
                      {dayCount > 0 && <span>🗓 {dayCount} 天</span>}
                      <span>👤 {trip.people} 人</span>
                      {trip.request && <span>✦ {trip.request}</span>}
                    </div>

                    {trip.days && (
                      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                        {trip.days.map((d, i) => (
                          <span key={i} className="flex-shrink-0 rounded-xl border border-[#D8D2C7] bg-white px-3 py-1.5 text-[11px] font-light text-[#6F675F]">
                            Day {i + 1}　{d}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const params = new URLSearchParams({ departureDate: trip.depDate, returnDate: trip.retDate, people: trip.people, request: trip.request });
                        router.push(`/trip/${encodeURIComponent(trip.city)}?${params}`);
                      }}
                      className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-6 py-2 text-xs font-light tracking-wide text-[#7D5548] transition hover:bg-[#B98774]/25">
                      重新開啟行程 →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {trips.length === 0 && (
          <div className="py-20 text-center">
            <p className="mb-3 text-sm font-light text-[#A79C91]">還沒有儲存任何行程</p>
            <button onClick={() => router.push("/")}
              className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-8 py-3 text-sm font-light text-[#7D5548] transition hover:bg-[#B98774]/25">
              開始規劃第一趟旅程
            </button>
          </div>
        )}

        {/* Compare Modal */}
        {showCompare && compareTrips.length === 2 && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" onClick={() => setShowCompare(false)}>
            <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] bg-[#FBF8F1] p-8" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-light tracking-wide">版本比較</h3>
                <button onClick={() => setShowCompare(false)} className="text-sm font-light text-[#8A7F73]">✕ 關閉</button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {compareTrips.map((trip, idx) => (
                  <div key={trip.id} className={`rounded-2xl border p-5 ${idx === 0 ? "border-[#A86F5A] bg-[#FDF6ED]" : "border-[#8FA39A] bg-[#F0F5F3]"}`}>
                    <div className={`mb-1 text-[10px] font-light uppercase tracking-widest ${idx === 0 ? "text-[#A86F5A]" : "text-[#8FA39A]"}`}>
                      {idx === 0 ? "版本 A" : "版本 B"}
                    </div>
                    <div className="mb-2 text-sm font-light tracking-wide text-[#3A2E26]">{trip.label ?? `${trip.city} 旅程`}</div>
                    <div className="mb-3 space-y-1 text-xs font-light text-[#6F675F]">
                      <div>版本 {trip.version}　{fmt(trip.savedAt)}</div>
                      <div>{fmtDate(trip.depDate)} – {fmtDate(trip.retDate)}　{trip.people}人</div>
                      {trip.request && <div>特別需求：{trip.request}</div>}
                    </div>
                    {trip.days && (
                      <div className="space-y-1">
                        {trip.days.map((d, i) => (
                          <div key={i} className="flex gap-2 rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-[11px] font-light">
                            <span className="flex-shrink-0 text-[#A79C91]">D{i + 1}</span>
                            <span className="text-[#4B4037]">{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
