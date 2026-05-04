"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, type SharedTrip } from "../lib/supabase";

// 若 Supabase 未設定，顯示靜態 Mock 資料
const MOCK_TRIPS: SharedTrip[] = [
  { id: "1", city: "首爾", flag: "🇰🇷", days: 5, people: 2, request: "拍貼機", departure_date: "2026-06-01", return_date: "2026-06-05", likes: 42, created_at: "2026-05-01" },
  { id: "2", city: "東京", flag: "🇯🇵", days: 7, people: 4, request: "迪士尼", departure_date: "2026-07-10", return_date: "2026-07-16", likes: 38, created_at: "2026-04-28" },
  { id: "3", city: "大阪", flag: "🇯🇵", days: 4, people: 2, request: "環球影城", departure_date: "2026-05-20", return_date: "2026-05-23", likes: 31, created_at: "2026-04-20" },
  { id: "4", city: "曼谷", flag: "🇹🇭", days: 6, people: 3, request: "寺廟文化", departure_date: "2026-08-01", return_date: "2026-08-06", likes: 27, created_at: "2026-05-02" },
  { id: "5", city: "新加坡", flag: "🇸🇬", days: 5, people: 2, request: "濱海灣", departure_date: "2026-09-15", return_date: "2026-09-19", likes: 19, created_at: "2026-05-03" },
  { id: "6", city: "首爾", flag: "🇰🇷", days: 4, people: 1, request: "美妝掃貨", departure_date: "2026-06-10", return_date: "2026-06-13", likes: 15, created_at: "2026-05-04" },
];

function TripCard({ trip, onCopy, onLike }: { trip: SharedTrip; onCopy: () => void; onLike: () => void }) {
  const nights = trip.days - 1;
  return (
    <div className="group rounded-[1.5rem] border border-[#D8D2C7] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="text-3xl">{trip.flag}</span>
          <h3 className="mt-1 text-xl font-light tracking-wide text-[#3A2E26]">{trip.city}</h3>
          <p className="text-sm font-light text-[#8A7F73]">{trip.days}天{nights}夜 · {trip.people}人</p>
        </div>
        <button
          onClick={onLike}
          className="flex flex-col items-center gap-0.5 rounded-xl border border-[#D8D2C7] px-3 py-2 text-xs text-[#8A7F73] transition hover:border-[#A86F5A] hover:text-[#A86F5A]"
        >
          <span className="text-lg">♡</span>
          <span>{trip.likes}</span>
        </button>
      </div>

      {trip.request && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#D4A574]/50 bg-[#FBF3EE] px-3 py-1 text-xs text-[#A86F5A]">
          ✦ {trip.request}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onCopy}
          className="flex-1 rounded-full border border-[#A86F5A] bg-[#B98774]/10 py-2 text-xs font-light tracking-wider text-[#7D5548] transition hover:bg-[#B98774]/25"
        >
          複製這份行程
        </button>
        <button
          onClick={onCopy}
          className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#6F675F] transition hover:border-[#8FA39A]"
        >
          查看
        </button>
      </div>
    </div>
  );
}

export default function ExploreView() {
  const router = useRouter();
  const [trips, setTrips] = useState<SharedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState("全部");

  useEffect(() => {
    const load = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setTrips(MOCK_TRIPS);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("shared_trips")
        .select("*")
        .order("likes", { ascending: false })
        .limit(30);
      setTrips(data ?? MOCK_TRIPS);
      setLoading(false);
    };
    load();
  }, []);

  const cities = ["全部", ...Array.from(new Set(trips.map((t) => t.city)))];
  const filtered = filterCity === "全部" ? trips : trips.filter((t) => t.city === filterCity);

  const handleCopy = (trip: SharedTrip) => {
    router.push(`/trip/${encodeURIComponent(trip.city)}?people=${trip.people}&request=${encodeURIComponent(trip.request ?? "")}`);
  };

  const handleLike = async (trip: SharedTrip) => {
    setTrips((prev) => prev.map((t) => t.id === trip.id ? { ...t, likes: t.likes + 1 } : t));
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.from("shared_trips").update({ likes: trip.likes + 1 }).eq("id", trip.id);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🌏 社群行程牆</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28">
        <div className="mb-3">
          <h1 className="text-3xl font-light tracking-wide">台灣旅客的出國行程</h1>
          <p className="mt-2 text-sm font-light text-[#8A7F73]">看看別人怎麼玩，一鍵複製當自己的行程</p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCity(c)}
              className={`rounded-full border px-4 py-1.5 text-xs font-light transition ${filterCity === c ? "border-[#A86F5A] bg-[#A86F5A] text-white" : "border-[#D8D2C7] bg-white text-[#6F675F] hover:border-[#A86F5A]"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center text-sm font-light tracking-widest text-[#8FA39A]">載入中…</div>
        ) : (
          <div className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onCopy={() => handleCopy(trip)}
                onLike={() => handleLike(trip)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
