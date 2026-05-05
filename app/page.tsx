"use client";

import { useRouter } from "next/navigation";

const STEPS = [
  { n: "01", title: "填寫旅遊資訊", desc: "目的地、日期、人數、風格，30 秒搞定" },
  { n: "02", title: "逐日編輯行程", desc: "每天上午/下午/晚上分開記錄，附美食與備註欄" },
  { n: "03", title: "一鍵下載 .docx", desc: "含封面、海關簽證、打包清單，可直接用 Word 再修改" },
];

const INCLUDED = [
  "📋 旅遊封面頁",
  "🛂 簽證 & 海關規定",
  "📞 台灣大使館緊急電話",
  "📅 每日行程卡片",
  "🧳 目的地打包清單",
  "📝 備忘事項",
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">

      {/* ── Nav ── */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</div>
          <div className="flex items-center gap-6 text-sm font-light text-[#6F675F]">
            <a href="https://lin.ee/YOUR_LINE_ID" target="_blank" rel="noopener"
              className="transition hover:text-[#A86F5A]">LINE Bot</a>
            <a href="/visa" className="transition hover:text-[#A86F5A]">護照情報</a>
            <button
              onClick={() => router.push("/docx")}
              className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-5 py-2 text-sm text-[#7D5548] transition hover:bg-[#B98774]/25"
            >
              開始製作 →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pb-24 pt-36">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-5 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">
            Taiwan Travel · Document Studio
          </p>
          <h1 className="text-5xl font-light leading-[1.2] tracking-wide text-[#4B4037] md:text-6xl">
            出國最麻煩的事，<br />幫你一次整理好
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg font-light leading-9 text-[#6F675F]">
            填完行程，直接下載一份可以印出來給家人的 <strong className="font-normal text-[#A86F5A]">Word 計畫書</strong>。
            簽證、海關、打包清單、緊急電話——全部幫你整理好。
          </p>
          <button
            onClick={() => router.push("/docx")}
            className="mt-10 rounded-full border border-[#A86F5A] bg-[#A86F5A] px-12 py-5 text-base font-light tracking-[0.2em] text-white transition hover:bg-[#96604D]"
          >
            📄 開始製作計畫書
          </button>
          <p className="mt-4 text-sm font-light text-[#A79C91]">免費・不用登入・直接下載</p>
        </div>
      </section>

      {/* ── 計畫書包含什麼 ── */}
      <section className="bg-[#EDE7DD] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 text-center text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">What's inside</p>
          <h2 className="mb-10 text-center text-2xl font-light tracking-wide">計畫書裡有什麼？</h2>
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

      {/* ── 三步驟 ── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-3 text-center text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">How it works</p>
          <h2 className="mb-14 text-center text-2xl font-light tracking-wide">三個步驟，搞定出國前置</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8">
                <div className="mb-4 text-4xl font-light text-[#C4BCB4]">{s.n}</div>
                <h3 className="mb-2 text-lg font-light tracking-wide text-[#4B4037]">{s.title}</h3>
                <p className="text-sm font-light leading-7 text-[#6F675F]">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push("/docx")}
              className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-12 py-4 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25"
            >
              現在就開始 →
            </button>
          </div>
        </div>
      </section>

      {/* ── 差異化說明 ── */}
      <section className="bg-[#3A2E26] py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.45em] text-white/40">Why this</p>
          <h2 className="mb-6 text-2xl font-light tracking-wide">為什麼不用 ChatGPT 就好？</h2>
          <p className="mx-auto max-w-xl text-base font-light leading-9 text-white/70">
            AI 給你的行程是一大段文字，複製貼上會破格。
            這裡給你的是一份<span className="text-[#C4A882]">可以直接印出來、傳給家人、用 Word 繼續修改</span>的正式文件。
            格式、排版、資訊分類——都幫你做好了。
          </p>
        </div>
      </section>

      {/* ── 其他工具（低調） ── */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-8 text-center text-xs font-light uppercase tracking-[0.45em] text-[#C4BCB4]">其他工具</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-light text-[#8A7F73]">
            {[
              { label: "🗺 地圖式行程規劃", href: "/planner/首爾" },
              { label: "🛂 台灣護照情報", href: "/visa" },
              { label: "✈️ 機票比價", href: "/flights" },
              { label: "⭐ 追星行程", href: "/idol" },
              { label: "📚 我的計畫庫", href: "/saved" },
            ].map(({ label, href }) => (
              <a key={href} href={href}
                className="rounded-full border border-[#D8D2C7] px-5 py-2 transition hover:border-[#A86F5A] hover:text-[#A86F5A]">
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#D8D2C7] bg-[#EFE9DF] px-6 py-8 text-center text-sm font-light tracking-widest text-[#7C7168]">
        © 2026 出國優轉 AbroadUturn　·　台灣人出國前置工作室
      </footer>
    </main>
  );
}
