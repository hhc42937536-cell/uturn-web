"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, DragEndEvent, DragStartEvent,
  DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import { getCountrySpots, COUNTRY_INFO, type Spot } from "../../lib/spotData";

function buildGoogleMapsUrl(spots: Spot[]): string {
  if (spots.length === 0) return "";
  if (spots.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${spots[0].lat},${spots[0].lng}`;
  }
  const origin = `${spots[0].lat},${spots[0].lng}`;
  const destination = `${spots[spots.length - 1].lat},${spots[spots.length - 1].lng}`;
  const waypoints = spots.slice(1, -1).map((s) => `${s.lat},${s.lng}`).join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&travelmode=transit`;
}

const AREA_PALETTE = [
  { bg: "bg-blue-100 border-blue-300 text-blue-900",    dot: "bg-blue-400",    hex: "#60A5FA" },
  { bg: "bg-orange-100 border-orange-300 text-orange-900", dot: "bg-orange-400", hex: "#FB923C" },
  { bg: "bg-emerald-100 border-emerald-300 text-emerald-900", dot: "bg-emerald-500", hex: "#34D399" },
  { bg: "bg-purple-100 border-purple-300 text-purple-900", dot: "bg-purple-400",  hex: "#C084FC" },
  { bg: "bg-rose-100 border-rose-300 text-rose-900",    dot: "bg-rose-400",    hex: "#FB7185" },
  { bg: "bg-amber-100 border-amber-300 text-amber-900", dot: "bg-amber-400",   hex: "#FBBF24" },
  { bg: "bg-cyan-100 border-cyan-300 text-cyan-900",    dot: "bg-cyan-400",    hex: "#22D3EE" },
  { bg: "bg-pink-100 border-pink-300 text-pink-900",    dot: "bg-pink-400",    hex: "#F472B6" },
  { bg: "bg-lime-100 border-lime-300 text-lime-900",    dot: "bg-lime-500",    hex: "#84CC16" },
  { bg: "bg-sky-100 border-sky-300 text-sky-900",       dot: "bg-sky-400",     hex: "#38BDF8" },
  { bg: "bg-violet-100 border-violet-300 text-violet-900", dot: "bg-violet-400", hex: "#818CF8" },
  { bg: "bg-red-100 border-red-300 text-red-900",       dot: "bg-red-400",     hex: "#F87171" },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildClusterMap(spots: Spot[], thresholdKm = 3): Map<string, number> {
  const centroids: { lat: number; lng: number }[] = [];
  const result = new Map<string, number>();
  for (const spot of spots) {
    let nearest = -1, nearestDist = Infinity;
    centroids.forEach((c, i) => {
      const d = haversineKm(spot.lat, spot.lng, c.lat, c.lng);
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    });
    if (nearest >= 0 && nearestDist <= thresholdKm) {
      result.set(spot.id, nearest);
    } else {
      result.set(spot.id, centroids.length);
      centroids.push({ lat: spot.lat, lng: spot.lng });
    }
  }
  return result;
}

function SpotCard({ spot, areaIndex, mini = false }: { spot: Spot; areaIndex: number; mini?: boolean }) {
  const p = AREA_PALETTE[areaIndex % AREA_PALETTE.length];
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${p.bg} ${mini ? "" : "cursor-grab active:cursor-grabbing"}`}>
      <div className="flex items-center gap-1.5 font-medium leading-tight">
        <span className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${p.dot}`} />
        {spot.name}
      </div>
      {!mini && (
        <>
          <div className="mt-0.5 flex items-center gap-1 text-xs opacity-70">
            {spot.city && <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{spot.city}</span>}
            <span>{spot.category} · {spot.duration}</span>
          </div>
          <div className="mt-1 text-xs opacity-60 line-clamp-2 leading-relaxed">{spot.tip}</div>
        </>
      )}
      {mini && (
        <div className="mt-0.5 text-[10px] opacity-60">
          {spot.city && <span className="mr-1 rounded-full bg-black/10 px-1 py-0.5">{spot.city}</span>}
          {spot.category} · {spot.duration}
        </div>
      )}
    </div>
  );
}

function DraggableSpot({ spot, areaIndex }: { spot: Spot; areaIndex: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: spot.id, data: { spot } });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <SpotCard spot={spot} areaIndex={areaIndex} />
    </div>
  );
}

function DayColumn({ day, spots, onRemove, clusterMap }: { day: number; spots: Spot[]; onRemove: (id: string) => void; clusterMap: Map<string, number> }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-shrink-0 flex-col gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors ${
        isOver ? "border-[#A86F5A] bg-[#FBF3EE]" : "border-[#D8D2C7] bg-[#FAF8F4]"
      }`}
      style={{ minHeight: "140px" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8FA39A]">Day {day}</span>
        {spots.length >= 1 ? (
          <a
            href={buildGoogleMapsUrl(spots)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#8FA39A]/20 px-2 py-0.5 text-[10px] text-[#4B6B63] hover:bg-[#8FA39A]/40"
          >
            🗺️ Google Maps
          </a>
        ) : null}
      </div>
      {spots.length === 0 && (
        <p className="flex-1 flex items-center justify-center text-center text-xs text-[#C5BEB6] py-2">
          拖曳景點到這裡
        </p>
      )}
      {spots.map((s) => (
        <div key={s.id} className="group relative">
          <SpotCard spot={s} areaIndex={clusterMap.get(s.id) ?? 0} mini />
          <button
            onClick={() => onRemove(s.id)}
            className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-400 text-[9px] text-white group-hover:flex"
          >
            ✕
          </button>
        </div>
      ))}
      {spots.length > 0 && (
        <div className={`mt-1 rounded-xl border border-dashed px-2 py-1 text-center text-[10px] transition-colors ${
          isOver ? "border-[#A86F5A] text-[#A86F5A]" : "border-[#D8D2C7] text-[#C5BEB6]"
        }`}>
          + 繼續拖曳加入
        </div>
      )}
    </div>
  );
}

const CITY_MAP_CENTER: Record<string, { center: [number, number]; zoom: number }> = {
  "首爾": { center: [37.56, 126.98], zoom: 12 },
  "釜山": { center: [35.18, 129.07], zoom: 12 },
  "東京": { center: [35.69, 139.69], zoom: 12 },
  "大阪": { center: [34.69, 135.50], zoom: 12 },
  "京都": { center: [35.01, 135.77], zoom: 13 },
  "神戶": { center: [34.69, 135.20], zoom: 13 },
  "沖繩": { center: [26.33, 127.80], zoom: 12 },
  "曼谷": { center: [13.75, 100.50], zoom: 12 },
  "新加坡": { center: [1.35, 103.82], zoom: 12 },
  "香港": { center: [22.33, 114.18], zoom: 12 },
  "胡志明市": { center: [10.82, 106.63], zoom: 13 },
};

const DAY_COLORS_MAP = ["#A86F5A", "#5A8AA8", "#5AA87A", "#A85A8A", "#8AA85A", "#A8A05A", "#5A5AA8"];

function CityMap({ allSpots, dayMap, clusterMap, defaultCenter, defaultZoom, focusCity }: {
  allSpots: Spot[]; dayMap: Map<string, number>; clusterMap: Map<string, number>;
  defaultCenter: [number, number]; defaultZoom: number; focusCity: string;
}) {
  const mapId = "planner-map";
  const mapRef = useRef<any>(null);
  const lRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Init map once
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const el = document.getElementById(mapId);
      if (!el || (el as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;
      lRef.current = L;
      mapRef.current = L.map(mapId).setView(defaultCenter, defaultZoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    })();
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when dayMap changes
  useEffect(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!map || !L) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    allSpots.forEach((spot) => {
      const dayNum = dayMap.get(spot.id);
      const ci = clusterMap.get(spot.id) ?? 0;
      const areaHex = AREA_PALETTE[ci % AREA_PALETTE.length].hex;
      const isAssigned = dayNum !== undefined;
      const fillColor = isAssigned ? DAY_COLORS_MAP[(dayNum! - 1) % DAY_COLORS_MAP.length] : areaHex;
      const size = isAssigned ? 28 : 16;
      const icon = L.divIcon({
        className: "",
        html: isAssigned
          ? `<div style="background:${fillColor};width:28px;height:28px;border-radius:50%;border:3px solid ${areaHex};display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${dayNum}</div>`
          : `<div style="background:${areaHex};width:14px;height:14px;border-radius:50%;border:2px solid white;opacity:0.75;box-shadow:0 1px 4px rgba(0,0,0,0.25)"></div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([spot.lat, spot.lng], { icon })
        .bindPopup(`<b>${spot.name}</b><br/>${spot.category} · ${spot.duration}<br/><small style="color:#888">${spot.tip}</small>`)
        .addTo(map);
      markersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify([...dayMap.entries()])]);

  // Fly to city when filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (focusCity === "all") {
      map.flyTo(defaultCenter, defaultZoom, { duration: 0.8 });
    } else {
      const info = CITY_MAP_CENTER[focusCity];
      if (info) map.flyTo(info.center, info.zoom, { duration: 0.8 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCity]);

  return <div id={mapId} className="h-full w-full rounded-2xl" />;
}

// ── Plan Modal ─────────────────────────────────────────────────────────────────

const DAY_COLORS_CSS = ["#A86F5A", "#5A8AA8", "#5AA87A", "#A85A8A", "#8AA85A", "#A8A05A", "#5A5AA8"];

function PlanModal({
  city, flag, days, allSpots, assigned, onClose,
}: {
  city: string; flag: string; days: number;
  allSpots: Spot[]; assigned: Map<string, number>; onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const spotsForDay = (day: number) => allSpots.filter((s) => assigned.get(s.id) === day);
  const totalSpots = allSpots.filter((s) => assigned.has(s.id)).length;

  const exportPdf = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#FFFDF8" });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const totalH = imgH * ratio;
      let yOffset = 0;
      while (yOffset < totalH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -yOffset, pdfW, totalH);
        yOffset += pdfH;
      }
      pdf.save(`${city}行程規劃.pdf`);  // city = countryName here
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] overflow-y-auto bg-black/60 p-4" onClick={onClose}>
      <div className="mx-auto mt-6 max-w-2xl rounded-[2rem] bg-[#FFFDF8] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#E8E0D5] px-8 py-5">
          <div>
            <h2 className="text-xl font-light tracking-wide text-[#4B4037]">{flag} {city} 行程計畫書</h2>
            <p className="mt-0.5 text-xs font-light text-[#8A7F73]">{days} 天・{totalSpots} 個景點</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-5 py-2 text-sm font-light text-[#7D5548] transition hover:bg-[#B98774]/25 disabled:opacity-50"
            >
              {exporting ? "匯出中…" : "📄 匯出 PDF"}
            </button>
            <button onClick={onClose} className="text-sm font-light text-[#8A7F73] hover:text-[#4B4037]">✕ 關閉</button>
          </div>
        </div>

        {/* Printable content */}
        <div ref={printRef} className="px-8 py-6" style={{ fontFamily: "sans-serif" }}>
          {/* Cover */}
          <div className="mb-8 rounded-2xl bg-[#3A2E26] px-8 py-10 text-center text-white">
            <p className="mb-2 text-4xl">{flag}</p>
            <h1 className="text-3xl font-light tracking-widest">{city}</h1>
            <p className="mt-2 text-sm font-light tracking-[0.3em] opacity-70">TRAVEL ITINERARY · {days} DAYS</p>
            <p className="mt-4 text-xs font-light opacity-50">由 出國優轉 自動生成</p>
          </div>

          {/* Day cards */}
          {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
            const spots = spotsForDay(day);
            const color = DAY_COLORS_CSS[(day - 1) % DAY_COLORS_CSS.length];
            return (
              <div key={day} className="mb-6">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: color }}
                  >
                    {day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-[#3A2E26]">Day {day}</div>
                      {spots.length >= 2 && (
                        <a
                          href={buildGoogleMapsUrl(spots)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[#8FA39A] bg-[#8FA39A]/10 px-2 py-0.5 text-[10px] font-light text-[#4B6B63] transition hover:bg-[#8FA39A]/25"
                        >
                          🗺️ Google Maps
                        </a>
                      )}
                    </div>
                    {spots.length === 0 && (
                      <div className="text-xs text-[#C5BEB6]">尚未安排景點</div>
                    )}
                    {spots.length > 0 && (
                      <div className="text-xs text-[#8A7F73]">
                        {spots.map((s) => s.name).join("　→　")}
                      </div>
                    )}
                  </div>
                </div>

                {spots.length > 0 && (
                  <div className="ml-12 space-y-2">
                    {spots.map((s, idx) => (
                      <div key={s.id} className="flex gap-3 rounded-xl border border-[#E8E0D5] bg-white px-4 py-3">
                        <div className="flex-shrink-0 text-center">
                          <div className="text-[10px] font-light text-[#A79C91]">#{idx + 1}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#3A2E26]">{s.name}</span>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${CAT_COLOR[s.category] ?? ""}`}>
                              {s.category}
                            </span>
                            <span className="text-[10px] text-[#A79C91]">⏱ {s.duration}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[#6F675F]">{s.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div className="mt-8 border-t border-[#E8E0D5] pt-4 text-center text-[10px] text-[#A79C91]">
            ✈️ 出國優轉 AbroadUturn · uturn-web.vercel.app
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PlannerView({ country, countryName, flag, center, mapZoom }: {
  country: string; countryName: string; flag: string; center: [number, number]; mapZoom: number;
}) {
  const router = useRouter();
  const allSpots = getCountrySpots(country);
  const clusterMap = useMemo(() => buildClusterMap(allSpots, 1.5), [country]);
  const cities = [...new Set(allSpots.map((s) => s.city).filter(Boolean))] as string[];
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [days, setDays] = useState(5);
  const [assigned, setAssigned] = useState<Map<string, number>>(new Map());
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const unassigned = allSpots
    .filter((s) => !assigned.has(s.id) && (cityFilter === "all" || s.city === cityFilter))
    .sort((a, b) => {
      const ca = clusterMap.get(a.id) ?? 0;
      const cb = clusterMap.get(b.id) ?? 0;
      if (ca !== cb) return ca - cb;
      if (a.lat !== b.lat) return a.lat - b.lat;
      return a.lng - b.lng;
    });
  const assignedSpots = allSpots.filter((s) => assigned.has(s.id));
  const spotsForDay = useCallback((day: number) =>
    allSpots.filter((s) => assigned.get(s.id) === day), [allSpots, assigned]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveSpot((active.data.current as { spot: Spot })?.spot ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveSpot(null);
    if (!over) return;
    const overId = over.id as string;
    if (!overId.startsWith("day-")) return;
    const day = parseInt(overId.replace("day-", ""), 10);
    setAssigned((prev) => new Map(prev).set(active.id as string, day));
  };

  const removeFromDay = (spotId: string) => {
    setAssigned((prev) => { const m = new Map(prev); m.delete(spotId); return m; });
  };

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-screen flex-col overflow-hidden bg-[#F7F3EC]">

          {/* Header */}
          <nav className="flex items-center justify-between border-b border-[#DDD6CA] bg-[#F7F3EC]/95 px-6 py-4">
            <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{flag}</span>
              <select
                value={country}
                onChange={(e) => router.push(`/planner/${e.target.value}`)}
                className="rounded-xl border border-[#D8D2C7] bg-[#F7F3EC] px-3 py-1.5 text-base font-light tracking-wide text-[#4B4037] outline-none focus:border-[#A86F5A]"
              >
                {Object.entries(COUNTRY_INFO).map(([slug, info]) => (
                  <option key={slug} value={slug}>{info.flag} {info.name}</option>
                ))}
              </select>
              <span className="text-sm font-light text-[#8A7F73]">行程規劃</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-light text-[#6F675F]">
                天數：
                <select
                  value={days}
                  onChange={(e) => setDays(+e.target.value)}
                  className="rounded-lg border border-[#D8D2C7] bg-white px-2 py-1 text-sm"
                >
                  {[3,4,5,6,7,10,14].map((n) => <option key={n} value={n}>{n}天</option>)}
                </select>
              </div>
              <button
                onClick={() => setShowPlan(true)}
                disabled={assignedSpots.length === 0}
                className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-5 py-2 text-sm font-light text-[#7D5548] transition hover:bg-[#B98774]/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                📄 生成計畫書
              </button>
            </div>
          </nav>

          <div className="flex flex-1 overflow-hidden">

            {/* 左欄：景點選單 */}
            <aside className="flex w-56 flex-col gap-2 overflow-y-auto border-r border-[#DDD6CA] bg-white p-4">
              {/* 城市篩選 chips */}
              <div className="flex flex-wrap gap-1 pb-2 border-b border-[#EDE7DD]">
                <button
                  onClick={() => setCityFilter("all")}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${cityFilter === "all" ? "bg-[#A86F5A] text-white" : "bg-[#F0EBE4] text-[#6F675F] hover:bg-[#E8DED5]"}`}
                >全部</button>
                {cities.map((c) => (
                  <button key={c}
                    onClick={() => setCityFilter(c)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${cityFilter === c ? "bg-[#A86F5A] text-white" : "bg-[#F0EBE4] text-[#6F675F] hover:bg-[#E8DED5]"}`}
                  >{c}</button>
                ))}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8FA39A]">
                未排景點 ({unassigned.length})
              </p>
              {unassigned.length === 0 && (
                <p className="mt-4 text-center text-xs text-[#C5BEB6]">
                  {cityFilter === "all" ? "全部排完了！" : "這個城市的景點都排完了"}
                </p>
              )}
              {unassigned.map((s) => <DraggableSpot key={s.id} spot={s} areaIndex={clusterMap.get(s.id) ?? 0} />)}
            </aside>

            {/* 中欄：地圖 */}
            <div className="relative flex-1 p-3">
              <CityMap
                allSpots={allSpots}
                dayMap={assigned}
                clusterMap={clusterMap}
                defaultCenter={center}
                defaultZoom={mapZoom}
                focusCity={cityFilter}
              />
              {assigned.size === 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                  <p className="rounded-2xl bg-white/90 px-5 py-3 text-xs font-light text-[#8FA39A] shadow whitespace-nowrap">
                    色點 = 同色同區 ✦ 把同色景點拖進同一天
                  </p>
                </div>
              )}
            </div>

            {/* 右欄：每日行程 */}
            <aside className="flex w-60 flex-col gap-3 overflow-y-auto border-l border-[#DDD6CA] bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8FA39A]">每日安排</p>
                {assignedSpots.length > 0 && (
                  <span className="text-[10px] text-[#A79C91]">共 {assignedSpots.length} 個</span>
                )}
              </div>
              {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                <DayColumn
                  key={day}
                  day={day}
                  spots={spotsForDay(day)}
                  onRemove={removeFromDay}
                  clusterMap={clusterMap}
                />
              ))}
            </aside>
          </div>
        </div>

        <DragOverlay>
          {activeSpot && <SpotCard spot={activeSpot} areaIndex={clusterMap.get(activeSpot.id) ?? 0} />}
        </DragOverlay>
      </DndContext>

      {showPlan && (
        <PlanModal
          city={countryName}
          flag={flag}
          days={days}
          allSpots={allSpots}
          assigned={assigned}
          onClose={() => setShowPlan(false)}
        />
      )}
    </>
  );
}
