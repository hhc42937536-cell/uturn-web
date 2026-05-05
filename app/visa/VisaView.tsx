"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import rawData from "../lib/visa.json";

type Country = {
  name: string; flag: string; region: string;
  visa: string; days: number | null; note: string;
  entry_tips: string; customs: string; taboos: string;
  sim: string; embassy: string;
};

const DATA = rawData as unknown as Record<string, Country>;

const VISA_COLORS: Record<string, string> = {
  "免簽": "bg-[#DFF0E8] text-[#2E6B50] border-[#A8D5C0]",
  "申根免簽": "bg-[#DFF0E8] text-[#2E6B50] border-[#A8D5C0]",
  "落地簽": "bg-[#FEF3C7] text-[#92400E] border-[#F6D860]",
  "需 NZeTA": "bg-[#FEF3C7] text-[#92400E] border-[#F6D860]",
  "需 eTA": "bg-[#FEF3C7] text-[#92400E] border-[#F6D860]",
  "需簽證": "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
  "台灣居民來往大陸通行證": "bg-[#EDE9FE] text-[#5B21B6] border-[#C4B5FD]",
};

const VISA_FILTERS = ["全部", "免簽", "落地簽", "需簽證"];
const REGIONS = ["全部", "亞洲", "東南亞", "歐洲", "美洲", "大洋洲", "中東", "非洲"];

const ALL_COUNTRIES = Object.entries(DATA)
  .filter(([k]) => k !== "_meta")
  .map(([code, c]) => ({ code, ...c }));

export default function VisaView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("全部");
  const [visaFilter, setVisaFilter] = useState("全部");
  const [selected, setSelected] = useState<(typeof ALL_COUNTRIES)[0] | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_COUNTRIES.filter((c) => {
      const matchRegion = region === "全部" || c.region === region || c.region.includes(region);
      const matchVisa =
        visaFilter === "全部" ||
        (visaFilter === "免簽" && (c.visa === "免簽" || c.visa === "申根免簽")) ||
        (visaFilter === "落地簽" && c.visa === "落地簽") ||
        (visaFilter === "需簽證" && (c.visa.startsWith("需") || c.visa === "台灣居民來往大陸通行證"));
      const matchQ = !q || c.name.includes(q) || c.code.toLowerCase().includes(q);
      return matchRegion && matchVisa && matchQ;
    });
  }, [search, region, visaFilter]);

  const stats = useMemo(() => ({
    free: ALL_COUNTRIES.filter((c) => c.visa === "免簽" || c.visa === "申根免簽").length,
    voa: ALL_COUNTRIES.filter((c) => c.visa === "落地簽" || c.visa.startsWith("需 ")).length,
    visa: ALL_COUNTRIES.filter((c) => c.visa === "需簽證" || c.visa === "台灣居民來往大陸通行證").length,
  }), []);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🛂 簽證情報</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Taiwan Passport · Visa Guide</p>
          <h1 className="text-3xl font-light tracking-wide">台灣護照<br className="sm:hidden" />即時情報中心</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            涵蓋 {ALL_COUNTRIES.length} 個國家地區，含簽證類型、入境須知、海關禁令、文化禁忌與 SIM 卡推薦。
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "免簽 / 申根免簽", count: stats.free, color: "border-[#A8D5C0] bg-[#DFF0E8]", text: "text-[#2E6B50]" },
            { label: "落地簽 / ETA", count: stats.voa, color: "border-[#F6D860] bg-[#FEF3C7]", text: "text-[#92400E]" },
            { label: "需申請簽證", count: stats.visa, color: "border-[#FECACA] bg-[#FEE2E2]", text: "text-[#991B1B]" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.color} p-4 text-center`}>
              <div className={`text-2xl font-light ${s.text}`}>{s.count}</div>
              <div className={`mt-0.5 text-[11px] font-light ${s.text}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
          placeholder="搜尋國家名稱…"
          className="mb-4 h-11 w-full rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-5 text-sm font-light outline-none placeholder:text-[#A79C91] focus:border-[#8FA39A]"
        />

        {/* Filters */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {VISA_FILTERS.map((f) => (
            <button key={f} onClick={() => { setVisaFilter(f); setSelected(null); }}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-light tracking-widest transition ${
                visaFilter === f ? "border-[#8FA39A] bg-[#8FA39A]/20 text-[#4B6B63]" : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#8FA39A]/50"
              }`}
            >{f}</button>
          ))}
        </div>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {REGIONS.map((r) => (
            <button key={r} onClick={() => { setRegion(r); setSelected(null); }}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-light tracking-widest transition ${
                region === r ? "border-[#A86F5A] bg-[#A86F5A]/15 text-[#7D5548]" : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#A86F5A]/50"
              }`}
            >{r}</button>
          ))}
        </div>

        {/* Country detail */}
        {selected ? (
          <div>
            <button onClick={() => setSelected(null)} className="mb-5 text-sm font-light text-[#8A7F73] hover:text-[#A86F5A]">← 回列表</button>
            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8">
              <div className="mb-1 text-4xl">{selected.flag}</div>
              <h2 className="mb-2 text-2xl font-light tracking-wide text-[#3A2E26]">{selected.name}</h2>
              <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-light ${VISA_COLORS[selected.visa] ?? "bg-[#EDE9FE] text-[#5B21B6] border-[#C4B5FD]"}`}>
                {selected.visa}{selected.days ? `　最多 ${selected.days} 天` : ""}
              </span>
              <p className="mt-3 text-sm font-light leading-7 text-[#5C5248]">{selected.note}</p>

              <div className="mt-6 space-y-4">
                {[
                  { icon: "✈️", label: "入境須知", text: selected.entry_tips },
                  { icon: "🚫", label: "海關禁令", text: selected.customs },
                  { icon: "🙏", label: "文化禁忌", text: selected.taboos },
                  { icon: "📱", label: "SIM 卡推薦", text: selected.sim },
                  { icon: "📞", label: "台灣駐當地聯絡", text: selected.embassy },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                    <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">{item.label}</div>
                    <p className="text-sm font-light leading-6 text-[#4B4037]">
                      <span className="mr-2">{item.icon}</span>{item.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => router.push(`/trip/${encodeURIComponent(selected.name)}`)}
                  className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-8 py-3 text-sm font-light tracking-[0.15em] text-[#7D5548] transition hover:bg-[#B98774]/25"
                >
                  ✈️ 規劃 {selected.name} 行程
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 text-xs font-light text-[#A79C91]">共 {filtered.length} 個國家</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelected(c)}
                  className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 text-left transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl">{c.flag}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-light ${VISA_COLORS[c.visa] ?? "bg-[#EDE9FE] text-[#5B21B6] border-[#C4B5FD]"}`}>
                      {c.visa}
                    </span>
                  </div>
                  <div className="text-sm font-light tracking-wide text-[#3A2E26]">{c.name}</div>
                  {c.days && (
                    <div className="mt-0.5 text-xs font-light text-[#8A7F73]">最多 {c.days} 天</div>
                  )}
                  <div className="mt-2 text-[11px] font-light text-[#A79C91]">{c.region}</div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm font-light text-[#A79C91]">
                  找不到「{search}」，試試其他國家名稱？
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
