"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import rawData from "../lib/transport_info.json";

type Card = {
  name: string; type: string; deposit: string;
  where_to_buy: string; coverage: string; tip: string; app?: string;
};
type AppInfo = { name: string; icon: string; desc: string };
type CityData = {
  city_name: string; flag: string;
  cards: Card[];
  metro_lines: string[];
  key_stations: string[];
  tips: string[];
  grab_available: boolean;
  taxi_app?: string;
  apps: AppInfo[];
};

const DATA = rawData as unknown as Record<string, CityData>;

const CITIES = [
  { code: "TYO", name: "東京", flag: "🇯🇵" },
  { code: "OSA", name: "大阪", flag: "🇯🇵" },
  { code: "SEL", name: "首爾", flag: "🇰🇷" },
  { code: "BKK", name: "曼谷", flag: "🇹🇭" },
  { code: "SIN", name: "新加坡", flag: "🇸🇬" },
  { code: "HKG", name: "香港", flag: "🇭🇰" },
  { code: "KUL", name: "吉隆坡", flag: "🇲🇾" },
  { code: "SGN", name: "胡志明市", flag: "🇻🇳" },
].filter(({ code }) => !!DATA[code]);

export default function TransportView() {
  const router = useRouter();
  const [selected, setSelected] = useState("TYO");
  const city = DATA[selected];

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">當地交通攻略</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Local Transport</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">當地交通怎麼搭？</h1>
          <p className="text-sm font-light text-[#8A7F73]">交通卡・地鐵路線・必備 App・省錢眉角，一頁搞定</p>
        </div>

        {/* 城市選擇 */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CITIES.map(({ code, name, flag }) => (
            <button key={code}
              onClick={() => setSelected(code)}
              className={`rounded-full border px-5 py-2.5 text-sm font-light transition-all
                ${selected === code
                  ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}>
              {flag} {name}
            </button>
          ))}
        </div>

        {city && (
          <div className="space-y-5">
            {/* 城市標題 */}
            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] px-7 py-5 flex items-center gap-4">
              <span className="text-4xl">{city.flag}</span>
              <div>
                <h2 className="text-xl font-light tracking-wide">{city.city_name}</h2>
                <p className="text-xs font-light text-[#8A7F73] mt-1">
                  重點站：{city.key_stations.join("・")}
                </p>
              </div>
            </div>

            {/* 交通卡 */}
            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">💳 交通卡 / 票券</p>
              <div className="space-y-4">
                {city.cards.map((card, i) => (
                  <div key={i} className="rounded-2xl border border-[#E0D9D2] bg-white p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-light text-[#4B4037]">{card.name}</h3>
                        <span className="text-xs font-light text-[#8A7F73]">{card.type}</span>
                      </div>
                      <span className="text-xs font-light bg-[#F0E6DF] text-[#A86F5A] px-3 py-1 rounded-full">
                        {card.deposit}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm font-light">
                      <div className="flex gap-2">
                        <span className="text-[#8A7F73] w-14 shrink-0">購買</span>
                        <span className="text-[#4B4037]">{card.where_to_buy}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#8A7F73] w-14 shrink-0">適用</span>
                        <span className="text-[#4B4037]">{card.coverage}</span>
                      </div>
                      {card.tip && (
                        <div className="flex gap-2">
                          <span className="text-[#8A7F73] w-14 shrink-0">💡 眉角</span>
                          <span className="text-[#4B4037]">{card.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 地鐵路線 */}
            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🚇 主要路線</p>
              <ul className="space-y-2">
                {city.metro_lines.map((line, i) => (
                  <li key={i} className="text-sm font-light text-[#4B4037] leading-7">{line}</li>
                ))}
              </ul>
            </div>

            {/* 省錢/時間 tips */}
            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🧠 在地眉角</p>
              <ul className="space-y-3">
                {city.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                    <span className="text-[#A86F5A] shrink-0">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 必備 App */}
            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">📱 必備 App</p>
              <div className="grid grid-cols-2 gap-3">
                {city.apps.map((app, i) => (
                  <div key={i} className="rounded-2xl border border-[#E0D9D2] bg-white px-4 py-3">
                    <p className="text-sm font-light text-[#4B4037]">{app.icon} {app.name}</p>
                    <p className="text-xs font-light text-[#8A7F73] mt-1">{app.desc}</p>
                  </div>
                ))}
                {city.grab_available && (
                  <div className="rounded-2xl border border-[#E0D9D2] bg-white px-4 py-3">
                    <p className="text-sm font-light text-[#4B4037]">🚗 Grab</p>
                    <p className="text-xs font-light text-[#8A7F73] mt-1">叫車首選，比計程車透明計費</p>
                  </div>
                )}
                {city.taxi_app && !city.grab_available && (
                  <div className="rounded-2xl border border-[#E0D9D2] bg-white px-4 py-3">
                    <p className="text-sm font-light text-[#4B4037]">🚕 {city.taxi_app}</p>
                    <p className="text-xs font-light text-[#8A7F73] mt-1">當地叫車 App</p>
                  </div>
                )}
              </div>
            </div>

            {/* 行動 CTA */}
            <button
              onClick={() => router.push("/wizard")}
              className="w-full rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]">
              以 {city.city_name} 規劃完整行程 →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
