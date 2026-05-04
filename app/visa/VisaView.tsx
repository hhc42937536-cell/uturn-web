"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VISA_DATA, EMERGENCY_DATA } from "../lib/staticData";

const TYPE_STYLE: Record<string, string> = {
  免簽: "bg-green-100 text-green-700 border-green-200",
  落地簽: "bg-blue-100 text-blue-700 border-blue-200",
  電子簽: "bg-amber-100 text-amber-700 border-amber-200",
  需簽證: "bg-red-100 text-red-600 border-red-200",
};

export default function VisaView() {
  const router = useRouter();
  const [openCity, setOpenCity] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🛂 簽證＆緊急資訊</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16 space-y-14">
        {/* Section 1: 簽證資訊 */}
        <section>
          <h2 className="mb-2 text-2xl font-light tracking-wide">台灣護照簽證資訊</h2>
          <p className="mb-6 text-sm font-light text-[#8A7F73]">以中華民國護照入境為準，資訊僅供參考，出發前請確認最新規定</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VISA_DATA.map((v) => (
              <div key={v.city} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-light tracking-wide">{v.city}</h3>
                    <p className="text-xs font-light text-[#8A7F73]">{v.country}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-light ${TYPE_STYLE[v.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {v.type}
                  </span>
                </div>
                <p className="mb-2 text-sm font-light text-[#A86F5A]">最長停留 {v.days} 天</p>
                <p className="text-xs font-light leading-relaxed text-[#6F675F]">{v.notes}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: 緊急資訊 */}
        <section>
          <h2 className="mb-2 text-2xl font-light tracking-wide">緊急資訊</h2>
          <p className="mb-6 text-sm font-light text-[#8A7F73]">點選城市展開台灣代表處、警察、救護車、SIM卡及醫院資訊</p>
          <div className="space-y-3">
            {EMERGENCY_DATA.map((e) => {
              const isOpen = openCity === e.city;
              return (
                <div key={e.city} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] overflow-hidden">
                  <button
                    onClick={() => setOpenCity(isOpen ? null : e.city)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-base font-light tracking-wide">{e.city}</span>
                    <span className={`text-lg transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#D8D2C7] px-5 py-4 space-y-3">
                      <Row icon="🏛️" label="台灣代表處" value={e.embassy} />
                      <Row icon="🚔" label="警察" value={e.police} />
                      <Row icon="🚑" label="救護車" value={e.ambulance} />
                      <Row icon="📱" label="推薦SIM" value={e.sim} />
                      <Row icon="🏥" label="推薦醫院" value={e.hospital} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm font-light">
      <span className="flex-shrink-0">{icon}</span>
      <div>
        <span className="text-xs text-[#8A7F73]">{label}</span>
        <p className="text-[#4B4037]">{value}</p>
      </div>
    </div>
  );
}
