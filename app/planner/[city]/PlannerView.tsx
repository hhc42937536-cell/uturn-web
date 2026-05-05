"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, DragEndEvent, DragStartEvent,
  DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import { CITY_SPOTS, type Spot } from "../../lib/spotData";

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

const CAT_COLOR: Record<string, string> = {
  景點: "bg-blue-50 border-blue-200 text-blue-800",
  美食: "bg-orange-50 border-orange-200 text-orange-800",
  購物: "bg-pink-50 border-pink-200 text-pink-800",
  體驗: "bg-green-50 border-green-200 text-green-800",
};

function SpotCard({ spot, mini = false }: { spot: Spot; mini?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${CAT_COLOR[spot.category] ?? "bg-gray-50 border-gray-200"} ${mini ? "" : "cursor-grab active:cursor-grabbing"}`}>
      <div className="font-medium leading-tight">{spot.name}</div>
      {!mini && (
        <>
          <div className="mt-0.5 text-xs opacity-70">{spot.category} · {spot.duration}</div>
          <div className="mt-1 text-xs opacity-60 line-clamp-1">{spot.tip}</div>
        </>
      )}
      {mini && (
        <div className="mt-0.5 text-[10px] opacity-60">{spot.category} · {spot.duration}</div>
      )}
    </div>
  );
}

function DraggableSpot({ spot }: { spot: Spot }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: spot.id, data: { spot } });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <SpotCard spot={spot} />
    </div>
  );
}

function DayColumn({ day, spots, onRemove }: { day: number; spots: Spot[]; onRemove: (id: string) => void }) {
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
          <SpotCard spot={s} mini />
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

function CityMap({ spots, dayMap }: { spots: Spot[]; dayMap: Map<string, number> }) {
  const mapId = "planner-map";
  useEffect(() => {
    let mapInstance: ReturnType<typeof import("leaflet")["map"]> | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const el = document.getElementById(mapId);
      if (!el || (el as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;
      const first = spots[0];
      mapInstance = L.map(mapId).setView([first?.lat ?? 37.55, first?.lng ?? 126.97], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);
      const DAY_COLORS = ["#A86F5A", "#5A8AA8", "#5AA87A", "#A85A8A", "#8AA85A", "#A8A05A", "#5A5AA8"];
      spots.forEach((spot) => {
        const dayNum = dayMap.get(spot.id);
        const color = dayNum !== undefined ? DAY_COLORS[(dayNum - 1) % DAY_COLORS.length] : "#8FA39A";
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.25)">${dayNum ?? "?"}</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        });
        L.marker([spot.lat, spot.lng], { icon })
          .bindPopup(`<b>${spot.name}</b><br/>${spot.category} · ${spot.duration}<br/><small>${spot.tip}</small>`)
          .addTo(mapInstance!);
      });
    })();
    return () => { mapInstance?.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify([...dayMap.entries()])]);
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
      pdf.save(`${city}行程規劃.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4" onClick={onClose}>
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

export default function PlannerView({ city, code, flag }: { city: string; code: string; flag: string }) {
  const router = useRouter();
  const allSpots = CITY_SPOTS[code] ?? [];
  const [days, setDays] = useState(5);
  const [assigned, setAssigned] = useState<Map<string, number>>(new Map());
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const unassigned = allSpots.filter((s) => !assigned.has(s.id));
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
            <div className="text-lg font-light tracking-wide text-[#4B4037]">
              {flag} {city} 行程規劃
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
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#8FA39A]">
                未排景點 ({unassigned.length})
              </p>
              {unassigned.length === 0 && (
                <p className="mt-4 text-center text-xs text-[#C5BEB6]">全部排完了！</p>
              )}
              {unassigned.map((s) => <DraggableSpot key={s.id} spot={s} />)}
            </aside>

            {/* 中欄：地圖 */}
            <div className="relative flex-1 p-3">
              <CityMap spots={assignedSpots} dayMap={assigned} />
              {assignedSpots.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="rounded-2xl bg-white/80 px-6 py-4 text-sm font-light text-[#8FA39A] shadow">
                    從左側拖拉景點，地圖會即時顯示 ✦ 每天可加入多個景點
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
                />
              ))}
            </aside>
          </div>
        </div>

        <DragOverlay>
          {activeSpot && <SpotCard spot={activeSpot} />}
        </DragOverlay>
      </DndContext>

      {showPlan && (
        <PlanModal
          city={city}
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
