"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CITY_SPOTS, type Spot } from "../lib/spotData";

// 計算兩點距離（公尺）
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

const CAT_ICON: Record<string, string> = { 景點: "🏛️", 美食: "🍜", 購物: "🛍️", 體驗: "✨" };
const CAT_COLOR: Record<string, string> = {
  景點: "bg-blue-50 border-blue-200 text-blue-700",
  美食: "bg-orange-50 border-orange-200 text-orange-700",
  購物: "bg-pink-50 border-pink-200 text-pink-700",
  體驗: "bg-green-50 border-green-200 text-green-700",
};

type NearbySpot = Spot & { dist: number };

// 找最近的城市（用景點群中心點）
function detectCity(lat: number, lng: number): { code: string; label: string } | null {
  const CITY_CENTERS: Record<string, { label: string; lat: number; lng: number }> = {
    SEL: { label: "首爾", lat: 37.5665, lng: 126.9780 },
    TYO: { label: "東京", lat: 35.6762, lng: 139.6503 },
    OSA: { label: "大阪", lat: 34.6937, lng: 135.5023 },
    BKK: { label: "曼谷", lat: 13.7563, lng: 100.5018 },
    SIN: { label: "新加坡", lat: 1.3521, lng: 103.8198 },
  };

  let nearest: { code: string; label: string } | null = null;
  let minDist = Infinity;
  for (const [code, c] of Object.entries(CITY_CENTERS)) {
    const d = haversine(lat, lng, c.lat, c.lng);
    if (d < minDist) { minDist = d; nearest = { code, label: c.label }; }
  }
  return minDist < 200_000 ? nearest : null; // 200km 內才算在該城市
}

function NearbyMap({ userLat, userLng, spots }: { userLat: number; userLng: number; spots: NearbySpot[] }) {
  useEffect(() => {
    let mapInstance: ReturnType<typeof import("leaflet")["map"]> | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const el = document.getElementById("nearby-map");
      if (!el || (el as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      mapInstance = L.map("nearby-map").setView([userLat, userLng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapInstance);

      // 使用者位置
      L.circleMarker([userLat, userLng], {
        radius: 10, color: "#A86F5A", fillColor: "#A86F5A", fillOpacity: 0.8,
      }).bindPopup("📍 你在這裡").addTo(mapInstance);

      // 景點標記
      spots.forEach((s, i) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#1a237e;width:26px;height:26px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.25)">${i + 1}</div>`,
          iconSize: [26, 26], iconAnchor: [13, 13],
        });
        L.marker([s.lat, s.lng], { icon })
          .bindPopup(`<b>${s.name}</b><br/>${fmtDist(s.dist)} 距離<br/><small>${s.tip}</small>`)
          .addTo(mapInstance!);
      });
    })();

    return () => { mapInstance?.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLng, spots.length]);

  return <div id="nearby-map" className="h-full w-full rounded-2xl" />;
}

export default function NearbyView() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<{ code: string; label: string } | null>(null);
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [filter, setFilter] = useState<string>("全部");

  const locate = () => {
    if (!navigator.geolocation) { setState("error"); return; }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setPos({ lat, lng });

        const detected = detectCity(lat, lng);
        setCity(detected);

        const cityCode = detected?.code ?? "SEL"; // fallback
        const allSpots = CITY_SPOTS[cityCode] ?? [];
        const nearby: NearbySpot[] = allSpots
          .map((s) => ({ ...s, dist: haversine(lat, lng, s.lat, s.lng) }))
          .sort((a, b) => a.dist - b.dist);
        setSpots(nearby);
        setState("done");
      },
      () => setState("error"),
      { timeout: 10000 }
    );
  };

  const categories = ["全部", "景點", "美食", "購物", "體驗"];
  const filtered = filter === "全部" ? spots : spots.filter((s) => s.category === filter);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">📍 附近景點</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-28">

        {/* Idle / Error */}
        {(state === "idle" || state === "error") && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="mb-6 text-7xl">📍</div>
            <h1 className="mb-3 text-3xl font-light tracking-wide">出國了嗎？</h1>
            <p className="mb-8 max-w-sm text-sm font-light leading-8 text-[#6F675F]">
              開啟定位，立即找出你周圍最值得去的景點、美食、購物——LINE Bot 做不到的事。
            </p>
            {state === "error" && (
              <p className="mb-4 text-sm text-red-500">定位失敗，請確認已允許瀏覽器使用位置</p>
            )}
            <button
              onClick={locate}
              className="rounded-full border border-[#A86F5A] bg-[#A86F5A] px-10 py-4 text-sm font-light tracking-widest text-white transition hover:bg-[#8a5c49]"
            >
              🌐 開啟定位
            </button>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center py-32 text-center">
            <div className="mb-4 text-5xl animate-bounce">📡</div>
            <p className="text-sm font-light tracking-widest text-[#8FA39A]">定位中…</p>
          </div>
        )}

        {/* Results */}
        {state === "done" && pos && (
          <>
            {city ? (
              <p className="mb-4 text-sm font-light text-[#8FA39A]">
                偵測到你在 <span className="font-medium text-[#4B4037]">{city.label}</span> ✓
              </p>
            ) : (
              <p className="mb-4 text-sm font-light text-amber-600">未在支援城市範圍內，顯示最近的首爾景點資料供參考</p>
            )}

            {/* Map */}
            <div className="mb-6 h-64 overflow-hidden rounded-2xl border border-[#D8D2C7] shadow-sm">
              <NearbyMap userLat={pos.lat} userLng={pos.lng} spots={filtered.slice(0, 8)} />
            </div>

            {/* Filter */}
            <div className="mb-4 flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-light transition ${filter === cat ? "border-[#A86F5A] bg-[#A86F5A] text-white" : "border-[#D8D2C7] bg-white text-[#6F675F] hover:border-[#A86F5A]"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Spot List */}
            <div className="grid gap-3 pb-16 md:grid-cols-2">
              {filtered.map((s, i) => (
                <div key={s.id} className={`flex gap-4 rounded-2xl border p-4 ${CAT_COLOR[s.category]}`}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                    {i + 1 <= 9 ? i + 1 : CAT_ICON[s.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{s.name}</span>
                      <span className="flex-shrink-0 text-xs opacity-70">{fmtDist(s.dist)}</span>
                    </div>
                    <div className="mt-0.5 text-xs opacity-70">{s.category} · {s.duration}</div>
                    <div className="mt-1 text-xs opacity-80 leading-5">{s.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
