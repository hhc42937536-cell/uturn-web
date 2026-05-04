"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, DragEndEvent, DragStartEvent,
  DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import { CITY_SPOTS, type Spot } from "../../lib/spotData";

// ── Draggable Spot Card ───────────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  景點: "bg-blue-50 border-blue-200 text-blue-800",
  美食: "bg-orange-50 border-orange-200 text-orange-800",
  購物: "bg-pink-50 border-pink-200 text-pink-800",
  體驗: "bg-green-50 border-green-200 text-green-800",
};

function SpotCard({ spot, mini = false }: { spot: Spot; mini?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${CAT_COLOR[spot.category]} ${mini ? "" : "cursor-grab active:cursor-grabbing"}`}>
      <div className="font-medium">{spot.name}</div>
      {!mini && (
        <>
          <div className="mt-0.5 text-xs opacity-70">{spot.category} · {spot.duration}</div>
          <div className="mt-1 text-xs opacity-60 line-clamp-1">{spot.tip}</div>
        </>
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

// ── Day Column ────────────────────────────────────────────────────────────────

function DayColumn({ day, spots, onRemove }: { day: number; spots: Spot[]; onRemove: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[120px] flex-col gap-2 rounded-2xl border-2 border-dashed p-3 transition ${isOver ? "border-[#A86F5A] bg-[#FBF3EE]" : "border-[#D8D2C7] bg-[#FAF8F4]"}`}
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#8FA39A]">Day {day}</div>
      {spots.length === 0 && (
        <p className="text-center text-xs text-[#C5BEB6]">拖曳景點到這裡</p>
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
    </div>
  );
}

// ── Map (Leaflet, lazy loaded) ────────────────────────────────────────────────

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
          iconSize: [28, 28],
          iconAnchor: [14, 14],
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PlannerView({ city, code, flag }: { city: string; code: string; flag: string }) {
  const router = useRouter();
  const allSpots = CITY_SPOTS[code] ?? [];
  const [days, setDays] = useState(5);
  const [assigned, setAssigned] = useState<Map<string, number>>(new Map()); // spotId → day
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const dayMap = assigned; // alias
  const unassigned = allSpots.filter((s) => !assigned.has(s.id));
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

  const assignedSpots = allSpots.filter((s) => assigned.has(s.id));

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#F7F3EC]">

        {/* Header */}
        <nav className="flex items-center justify-between border-b border-[#DDD6CA] bg-[#F7F3EC]/95 px-6 py-4">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-lg font-light tracking-wide text-[#4B4037]">
            {flag} {city} 行程規劃
          </div>
          <div className="flex items-center gap-2 text-sm font-light text-[#6F675F]">
            天數：
            <select
              value={days}
              onChange={(e) => setDays(+e.target.value)}
              className="rounded-lg border border-[#D8D2C7] bg-white px-2 py-1 text-sm"
            >
              {[3,4,5,6,7].map((n) => <option key={n} value={n}>{n}天</option>)}
            </select>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">

          {/* 左欄：景點選單 */}
          <aside className="flex w-56 flex-col gap-2 overflow-y-auto border-r border-[#DDD6CA] bg-white p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#8FA39A]">未排景點</p>
            {unassigned.length === 0 && (
              <p className="text-center text-xs text-[#C5BEB6] mt-4">全部排完了！</p>
            )}
            {unassigned.map((s) => <DraggableSpot key={s.id} spot={s} />)}
          </aside>

          {/* 中欄：地圖 */}
          <div className="relative flex-1 p-3">
            <CityMap spots={assignedSpots} dayMap={dayMap} />
            {assignedSpots.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="rounded-2xl bg-white/80 px-6 py-4 text-sm font-light text-[#8FA39A] shadow">
                  從左側拖拉景點，地圖會即時顯示
                </p>
              </div>
            )}
          </div>

          {/* 右欄：每日行程 */}
          <aside className="flex w-52 flex-col gap-3 overflow-y-auto border-l border-[#DDD6CA] bg-white p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#8FA39A]">每日安排</p>
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
  );
}
