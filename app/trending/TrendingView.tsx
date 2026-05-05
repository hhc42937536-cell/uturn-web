"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import rawData from "../lib/souvenirs.json";

type MustBuyItem    = { name: string; category: string; price_range: string; where: string };
type Experience     = { name: string; tip: string };
type ShopArea       = { name: string; type: string; tip: string };
type Treatment      = { name: string; price: string; tip: string };
type MedBeauty      = { popular_treatments: Treatment[]; areas: string; warning: string };
type CountryData    = {
  country_name: string;
  must_buy: MustBuyItem[];
  hot_experiences: Experience[];
  shopping_areas: ShopArea[];
  tax_free_tip?: string;
  medical_beauty?: MedBeauty;
};

const DATA = rawData as unknown as Record<string, CountryData>;

const COUNTRIES = [
  { code: "KR", flag: "🇰🇷" },
  { code: "JP", flag: "🇯🇵" },
  { code: "TH", flag: "🇹🇭" },
  { code: "SG", flag: "🇸🇬" },
  { code: "VN", flag: "🇻🇳" },
  { code: "KUL", flag: "🇲🇾" },
].filter(({ code }) => !!DATA[code]);

type Tab = "experience" | "mustbuy" | "shopping" | "medical";

export default function TrendingView() {
  const router = useRouter();
  const [activeCountry, setActiveCountry] = useState("KR");
  const [activeTab, setActiveTab] = useState<Tab>("experience");

  const info = DATA[activeCountry];
  if (!info) return null;

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "experience", label: "🔥 熱門體驗",  show: true },
    { key: "mustbuy",   label: "🛍️ 必買清單",  show: true },
    { key: "shopping",  label: "🏬 購物地點",   show: (info.shopping_areas?.length ?? 0) > 0 },
    { key: "medical",   label: "💉 韓國醫美",   show: !!info.medical_beauty },
  ];

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      {/* Nav */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🔥 現在最夯</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Trending Now</p>
          <h1 className="text-3xl font-light tracking-wide">這個月出國<br className="sm:hidden" />必買必玩清單</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            整合熱門排行榜資料，涵蓋日韓泰新馬越六個目的地。
          </p>
        </div>

        {/* Country tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {COUNTRIES.map(({ code, flag }) => (
            <button
              key={code}
              onClick={() => { setActiveCountry(code); setActiveTab("experience"); }}
              className={`flex-shrink-0 rounded-full border px-5 py-2 text-sm font-light tracking-widest transition ${
                activeCountry === code
                  ? "border-[#A86F5A] bg-[#A86F5A]/15 text-[#7D5548]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#A86F5A]/50"
              }`}
            >
              {flag} {DATA[code].country_name}
            </button>
          ))}
        </div>

        {/* Content tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.filter((t) => t.show).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-light tracking-widest transition ${
                activeTab === t.key
                  ? "border-[#8FA39A] bg-[#8FA39A]/20 text-[#4B6B63]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#8FA39A]/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 🔥 熱門體驗 */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            {info.hot_experiences.map((exp, i) => (
              <div key={i} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]">
                <div className="mb-2 flex items-start gap-3">
                  <span className="mt-0.5 text-lg">🔥</span>
                  <span className="text-sm font-light tracking-wide text-[#3A2E26]">{exp.name}</span>
                </div>
                {exp.tip && (
                  <div className="ml-8 flex gap-2 text-xs font-light leading-5 text-[#8A7F73]">
                    <span>💡</span>
                    <span>{exp.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 🛍️ 必買清單 */}
        {activeTab === "mustbuy" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {info.must_buy.map((item, i) => (
              <div key={i} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]">
                <div className="mb-1.5 flex items-start gap-2.5">
                  <span className="mt-0.5 text-base">🎁</span>
                  <span className="text-sm font-light tracking-wide text-[#3A2E26]">{item.name}</span>
                </div>
                <div className="ml-7 space-y-0.5">
                  {item.category && (
                    <span className="inline-block rounded-full border border-[#D8D2C7] bg-white px-2.5 py-0.5 text-[11px] font-light text-[#8A7F73]">
                      {item.category}
                    </span>
                  )}
                  <div className="text-xs font-light text-[#A79C91]">
                    {item.price_range && <span>💰 {item.price_range}　</span>}
                    {item.where && <span>📍 {item.where}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🏬 購物地點 */}
        {activeTab === "shopping" && (
          <div className="space-y-4">
            {(info.shopping_areas ?? []).map((shop, i) => (
              <div key={i} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]">
                <div className="mb-1 flex items-start gap-2.5">
                  <span className="mt-0.5">🛒</span>
                  <div>
                    <span className="text-sm font-light tracking-wide text-[#3A2E26]">{shop.name}</span>
                    <span className="ml-2 text-xs text-[#8A7F73]">（{shop.type}）</span>
                  </div>
                </div>
                {shop.tip && (
                  <div className="ml-7 text-xs font-light leading-5 text-[#8A7F73]">💡 {shop.tip}</div>
                )}
              </div>
            ))}
            {info.tax_free_tip && (
              <div className="rounded-2xl border border-[#C4A882]/50 bg-[#FDF6ED] p-5">
                <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">退稅資訊</div>
                <p className="text-sm font-light leading-7 text-[#5C5248]">💰 {info.tax_free_tip}</p>
              </div>
            )}
          </div>
        )}

        {/* 💉 韓國醫美 */}
        {activeTab === "medical" && info.medical_beauty && (
          <div className="space-y-4">
            {info.medical_beauty.popular_treatments.map((t, i) => (
              <div key={i} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]">
                <div className="mb-1.5 flex items-start gap-2.5">
                  <span className="mt-0.5">💉</span>
                  <span className="text-sm font-light tracking-wide text-[#3A2E26]">{t.name}</span>
                </div>
                <div className="ml-7 space-y-0.5 text-xs font-light text-[#8A7F73]">
                  {t.price && <div>💰 {t.price}</div>}
                  {t.tip && <div>💡 {t.tip}</div>}
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5">
              <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">推薦區域</div>
              <p className="text-sm font-light leading-7 text-[#5C5248]">📍 {info.medical_beauty.areas}</p>
            </div>
            {info.medical_beauty.warning && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-light leading-7 text-amber-800">
                {info.medical_beauty.warning}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8 text-center">
          <p className="mb-2 text-sm font-light tracking-wide text-[#6F675F]">看到心動的目的地？</p>
          <p className="mb-6 text-xs font-light text-[#A79C91]">把最夯體驗直接加進你的行程</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-10 py-3.5 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25"
          >
            立即規劃行程
          </button>
        </div>
      </div>
    </main>
  );
}
