"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import rawData from "../lib/restaurants.json";

type RestaurantItem = {
  name: string;
  area: string;
  category: string;
  price_per_person: string;
  must_order: string;
  meal_time: string[];
  tip: string;
  transit: string;
};

type CityData = Record<string, RestaurantItem[]>;
const DATA = rawData as unknown as Record<string, CityData>;

// ── 城市設定 ─────────────────────────────────────────────
const CITIES = [
  { code: "TYO", name: "東京",     flag: "🇯🇵" },
  { code: "OSA", name: "大阪",     flag: "🇯🇵" },
  { code: "SEL", name: "首爾",     flag: "🇰🇷" },
  { code: "BKK", name: "曼谷",     flag: "🇹🇭" },
  { code: "SIN", name: "新加坡",   flag: "🇸🇬" },
  { code: "DPS", name: "峇里島",   flag: "🇮🇩" },
].filter(({ code }) => !!DATA[code]);

// ── 分類中文名稱對照 ─────────────────────────────────────
const CAT_LABEL: Record<string, string> = {
  // 東京
  sushi: "🍣 壽司", ramen: "🍜 拉麵", tempura: "🍤 天婦羅",
  gyukatsu: "🥩 牛排/炸牛排", yakiniku: "🔥 燒肉", izakaya: "🍶 居酒屋",
  sweets: "🍡 甜點", convenience: "🏪 便利商店美食",
  // 大阪
  okonomiyaki: "🥞 大阪燒", takoyaki: "🐙 章魚燒", kushikatsu: "🍢 串炸",
  // 首爾
  bbq: "🔥 韓式烤肉", jjajang: "🍝 炸醬麵", tteokbokki: "🌶 辣炒年糕",
  chimaek: "🍗 炸雞 + 啤酒", cafe: "☕ 特色咖啡廳",
  // 曼谷
  padthai: "🍜 泰式炒河粉", tomyum: "🍲 酸辣湯", streetfood: "🌯 街頭小吃",
  massage: "💆 泰式按摩+美食",
  // 新加坡
  hawker: "🍛 小販中心（Hawker）", chilli_crab: "🦀 辣椒螃蟹", laksa: "🍜 叻沙",
  // 峇里島
  warung: "🍽 Warung（在地小館）", seafood: "🦞 海鮮", nasi_campur: "🍚 雜飯（Nasi Campur）",
};

export default function RestaurantView() {
  const router = useRouter();
  const [city, setCity] = useState("TYO");
  const [category, setCategory] = useState<string | null>(null);

  const cityData = DATA[city] ?? {};
  const categories = Object.keys(cityData);

  // 預設選第一個分類
  const activeCategory = category && categories.includes(category) ? category : (categories[0] ?? null);
  const restaurants = activeCategory ? (cityData[activeCategory] ?? []) : [];

  const cityInfo = CITIES.find((c) => c.code === city);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">美食攻略</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Food Guide</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">在地美食攻略</h1>
          <p className="text-sm font-light text-[#8A7F73]">在地人才知道的餐廳 · 必點料理 · 避雷眉角</p>
        </div>

        {/* 城市選擇 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CITIES.map(({ code, name, flag }) => (
            <button
              key={code}
              onClick={() => { setCity(code); setCategory(null); }}
              className={`rounded-full border px-5 py-2.5 text-sm font-light transition-all
                ${city === code
                  ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
            >
              {flag} {name}
            </button>
          ))}
        </div>

        {/* 分類標籤 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                ${activeCategory === cat
                  ? "border-[#A86F5A] bg-[#A86F5A] text-white"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
            >
              {CAT_LABEL[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* 餐廳卡片 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, i) => (
            <div key={i} className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
              {/* 名稱 & 地區 */}
              <div className="mb-4">
                <h3 className="text-base font-light tracking-wide text-[#3A2E26]">{r.name}</h3>
                <p className="text-xs font-light text-[#8A7F73] mt-1">{r.area} · {r.category}</p>
              </div>

              {/* 用餐時段 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {r.meal_time.map((t) => (
                  <span key={t} className="rounded-full border border-[#E0D9D2] bg-white px-2.5 py-0.5 text-xs font-light text-[#6F675F]">
                    {t}
                  </span>
                ))}
              </div>

              {/* 資訊列 */}
              <div className="space-y-1.5 text-sm font-light mb-4">
                <div className="flex gap-2">
                  <span className="text-[#8A7F73] shrink-0 w-14">人均</span>
                  <span className="text-[#A86F5A]">{r.price_per_person}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#8A7F73] shrink-0 w-14">必點</span>
                  <span className="text-[#4B4037]">{r.must_order}</span>
                </div>
                {r.transit && (
                  <div className="flex gap-2">
                    <span className="text-[#8A7F73] shrink-0 w-14">交通</span>
                    <span className="text-[#4B4037]">{r.transit}</span>
                  </div>
                )}
              </div>

              {/* 眉角 */}
              {r.tip && (
                <div className="rounded-2xl border border-[#EDE7DD] bg-[#FFFDF8] px-4 py-3">
                  <p className="text-xs font-light text-[#8A7F73] leading-6">💡 {r.tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex gap-3">
          <button
            onClick={() => router.push("/wizard")}
            className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]"
          >
            把 {cityInfo?.name} 排進行程 →
          </button>
          <button
            onClick={() => router.push("/tips")}
            className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-6 py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]"
          >
            在地眉角
          </button>
        </div>
      </div>
    </main>
  );
}
