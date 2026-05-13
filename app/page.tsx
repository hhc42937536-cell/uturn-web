"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INCLUDED = [
  "📋 旅遊封面頁",
  "🛂 簽證 & 海關規定",
  "📞 台灣大使館緊急電話",
  "📅 每日行程卡片",
  "🧳 目的地打包清單",
  "📝 備忘事項",
];

const STEPS = [
  { n: "01", title: "選目的地 & 日期", desc: "30 個熱門城市秒選，出發回程日自動算天數" },
  { n: "02", title: "設定旅伴 & 風格", desc: "人數、預算等級、旅遊偏好、必去景點" },
  { n: "03", title: "AI 生成每日行程", desc: "上午 / 下午 / 晚上 / 美食全部幫你規劃好" },
  { n: "04", title: "看簽證 & 住宿建議", desc: "自動顯示簽證須知、推薦飯店、預算估算" },
  { n: "05", title: "下載 Word / PDF", desc: "一鍵匯出正式計畫書，可用 Word 再修改" },
];

const CORE_FEATURES = [
  {
    icon: "✨",
    title: "AI 行程規劃",
    desc: "輸入目的地 + 日期，Gemini AI 生成完整每日行程，上午 / 下午 / 晚上 / 美食 / 交通提示。",
    href: "/wizard",
    cta: "開始規劃",
  },
  {
    icon: "🛂",
    title: "台灣護照簽證情報",
    desc: "選目的地，直接看簽證類型、海關禁品、SIM 卡推薦、大使館緊急電話。",
    href: "/visa",
    cta: "查簽證",
  },
  {
    icon: "🏨",
    title: "住宿推薦 & 比價",
    desc: "28 個城市精選飯店，看推薦住宿區、每晚參考價，直接連到 Agoda / Booking 比價。",
    href: "/hotels",
    cta: "找住宿",
  },
  {
    icon: "✈️",
    title: "機票搜尋",
    desc: "Skyscanner + Google Flights 快速開啟，支援南部出發（高雄 / 台中 / 台南 vs 桃園）比較。",
    href: "/flights",
    cta: "查機票",
  },
  {
    icon: "🗺",
    title: "跨城市行程規劃",
    desc: "把首爾 + 釜山、東京 + 大阪排進同一行程，地圖即時顯示城市間分佈。",
    href: "/planner/korea",
    cta: "規劃路線",
  },
  {
    icon: "🧰",
    title: "旅行工具箱",
    desc: "匯率換算、預算計算、行李清單、天氣預報、當地時間——出發前一站搞定。",
    href: "/tools",
    cta: "打開工具箱",
  },
];

const MORE_FEATURES = [
  { icon: "📋", title: "行前必知懶人包", desc: "簽證、海關禁品、插座電壓、換匯技巧、打包清單、緊急電話——出發前一站搞定。", href: "/pretrip" },
  { icon: "🚇", title: "當地交通攻略", desc: "東京/首爾/曼谷等8城市：交通卡怎麼買、地鐵怎麼搭、哪個App最好用。", href: "/transport" },
  { icon: "⭐", title: "追星行程", desc: "BTS、BLACKPINK、Snow Man 等30+藝人：聖地巡禮、演唱會搶票眉角。", href: "/idol" },
  { icon: "🗓️", title: "旅遊旺季月曆", desc: "一眼看懂各城市最佳出遊月份，避開人潮和雨季。", href: "/seasons" },
  { icon: "🔥", title: "現在最夯", desc: "整合 Dcard、KKday、Cosme 排行，這個月必買必玩。", href: "/trending" },
  { icon: "🧠", title: "深度在地知識庫", desc: "票務時機、人潮規律、隱藏景點——去過的人才知道的細節。", href: "/tips" },
  { icon: "📍", title: "附近景點", desc: "出國後開啟定位，立即找出周圍最值得去的景點與美食。", href: "/nearby" },
  { icon: "🌏", title: "社群行程牆", desc: "看台灣旅客分享的行程，一鍵複製當自己的。", href: "/explore" },
];

export default function HomePage() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">

      {/* ── Nav ── */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</div>
          <button
            onClick={() => router.push("/wizard")}
            className="rounded-full border border-[#A86F5A] bg-[#A86F5A]/10 px-5 py-2 text-sm font-light text-[#A86F5A] transition hover:bg-[#A86F5A]/20"
          >
            開始規劃 →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pb-20 pt-36">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-5 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">
            Taiwan Travel Planner · Free · No Login
          </p>
          <h1 className="text-5xl font-light leading-[1.2] tracking-wide text-[#4B4037] md:text-6xl">
            出國最麻煩的事，<br />幫你一次整理好
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg font-light leading-9 text-[#6F675F]">
            AI 規劃每日行程，自動查簽證、估預算、推薦住宿，最後下載一份{" "}
            <strong className="font-normal text-[#A86F5A]">可以印出來給家人的 Word 計畫書</strong>。
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/wizard")}
              className="rounded-full bg-[#A86F5A] px-12 py-5 text-lg font-light tracking-[0.2em] text-white shadow-md transition hover:bg-[#96604D] hover:shadow-lg"
            >
              立即開始規劃 →
            </button>
            <button
              onClick={() => router.push("/visa")}
              className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-10 py-5 text-base font-light tracking-[0.15em] text-[#6F675F] transition hover:border-[#A86F5A]"
            >
              🛂 查簽證資訊
            </button>
          </div>
          <p className="mt-4 text-sm font-light text-[#A79C91]">免費 · 不用登入 · 30 秒開始</p>
        </div>
      </section>

      {/* ── 五步驟流程 ── */}
      <section className="bg-[#EDE7DD] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 text-center text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">How it works</p>
          <h2 className="mb-12 text-center text-2xl font-light tracking-wide">從目的地到計畫書，五步完成</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6">
                <div className="mb-3 text-3xl font-light text-[#C4BCB4]">{s.n}</div>
                <h3 className="mb-2 text-sm font-light tracking-wide leading-snug">{s.title}</h3>
                <p className="text-xs font-light leading-6 text-[#6F675F]">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={() => router.push("/wizard")}
              className="rounded-full bg-[#A86F5A] px-12 py-5 text-base font-light tracking-[0.2em] text-white shadow-md transition hover:bg-[#96604D]"
            >
              立即開始規劃 →
            </button>
          </div>
        </div>
      </section>

      {/* ── 計畫書包含什麼 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 text-center text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">What&apos;s inside</p>
          <h2 className="mb-10 text-center text-2xl font-light tracking-wide">下載的計畫書裡有什麼？</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {INCLUDED.map((item) => (
              <div key={item}
                className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-5 py-4 text-sm font-light text-[#5C5248]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 差異化 ── */}
      <section className="bg-[#3A2E26] py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.45em] text-white/40">Why this</p>
          <h2 className="mb-6 text-2xl font-light tracking-wide">為什麼不用 ChatGPT 就好？</h2>
          <p className="mx-auto max-w-xl text-base font-light leading-9 text-white/70">
            ChatGPT 給你的行程是一大段文字，複製貼上就破格了。
            這裡給你的是一份
            <span className="text-[#C4A882]">可以直接印出來、傳給家人、用 Word 繼續修改</span>的正式文件——
            格式、排版、簽證資訊、緊急電話，全部自動填好。
          </p>
        </div>
      </section>

      {/* ── 核心功能 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 text-center text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Features</p>
          <h2 className="mb-3 text-center text-2xl font-light tracking-wide">出國前需要的，這裡都有</h2>
          <p className="mb-10 text-center text-sm font-light text-[#8A7F73]">AI 規劃 · 簽證查詢 · 住宿比價 · 機票搜尋 · 旅行工具</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map(({ icon, title, desc, href, cta }) => (
              <a key={href} href={href}
                className="group rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8 transition hover:border-[#A86F5A] hover:bg-[#FFFDF8] block">
                <div className="mb-4 text-3xl">{icon}</div>
                <h3 className="mb-2 text-base font-light tracking-wide">{title}</h3>
                <p className="text-sm font-light leading-7 text-[#6F675F]">{desc}</p>
                <p className="mt-4 text-xs font-light tracking-widest text-[#A86F5A] transition group-hover:underline">
                  {cta} →
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 更多功能（可展開）── */}
      <section className="border-t border-[#DDD6CA] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mx-auto flex items-center gap-2 text-sm font-light text-[#8A7F73] transition hover:text-[#A86F5A]"
          >
            <span className="text-xs">{showAll ? "▲" : "▼"}</span>
            <span>{showAll ? "收起其他功能" : "查看更多功能"}</span>
          </button>

          {showAll && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MORE_FEATURES.map(({ icon, title, desc, href }) => (
                <a key={href} href={href}
                  className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-7 transition hover:border-[#A86F5A] hover:bg-[#FFFDF8] block">
                  <div className="mb-3 text-2xl">{icon}</div>
                  <h3 className="mb-1 text-base font-light tracking-wide">{title}</h3>
                  <p className="text-sm font-light leading-7 text-[#6F675F]">{desc}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#D8D2C7] bg-[#EFE9DF] px-6 py-8 text-center text-sm font-light tracking-widest text-[#7C7168]">
        © 2026 出國優轉 AbroadUturn　·　台灣人出國前置工作室
      </footer>
    </main>
  );
}
