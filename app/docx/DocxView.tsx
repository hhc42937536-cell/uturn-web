"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildAndDownloadDocx } from "@/app/lib/buildDocx";

const DESTINATIONS = ["首爾", "東京", "大阪", "沖繩", "釜山", "曼谷", "新加坡", "香港", "胡志明市", "吉隆坡"];
const DEP_CITIES = ["高雄", "台北", "台中", "台南"];

const VISA_NOTE: Record<string, string> = {
  首爾: "免簽 90 天，建議出發前確認 K-ETA 狀態。",
  釜山: "免簽 90 天，建議出發前確認 K-ETA 狀態。",
  東京: "免簽 90 天，可使用 Visit Japan Web 加速通關。",
  大阪: "免簽 90 天，可使用 Visit Japan Web 加速通關。",
  沖繩: "免簽 90 天，可使用 Visit Japan Web 加速通關。",
  曼谷: "免簽 60 天，入境填寫 TM.6 表格。",
  新加坡: "免簽 30 天，入境前 3 天填寫 SG Arrival Card。",
  香港: "免簽 30 天。",
  胡志明市: "免簽 45 天，亦可申請 E-Visa 最長 90 天。",
  吉隆坡: "免簽 90 天，入境 KLIA/KLIA2 請確認航廈。",
};

const EMERGENCY: Record<string, string> = {
  首爾: "台灣駐韓代表部：+82-2-399-2780",
  釜山: "台灣駐韓代表部：+82-2-399-2780",
  東京: "台北駐日經濟文化代表處：+81-3-3280-7811",
  大阪: "台北駐大阪經濟文化辦事處：+81-6-6443-8481",
  沖繩: "台北駐那霸辦事處：+81-98-862-7008",
  曼谷: "台北經濟文化辦事處（曼谷）：+66-2-610-4000",
  新加坡: "台北代表處：+65-6590-9600",
  香港: "台灣旅遊交流辦事處：+852-2525-2515",
  胡志明市: "台北經濟文化辦事處（胡志明市）：+84-28-3825-2525",
  吉隆坡: "台北經濟文化辦事處（吉隆坡）：+60-3-2161-8684",
};

type DayNote = { morning: string; afternoon: string; evening: string; food: string; note: string };

function emptyDay(): DayNote {
  return { morning: "", afternoon: "", evening: "", food: "", note: "" };
}

function fmtDate(s: string) {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr: string, n: number) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayCount(dep: string, ret: string) {
  if (!dep || !ret) return 5;
  const diff = new Date(ret).getTime() - new Date(dep).getTime();
  return Math.max(2, Math.round(diff / 86400000) + 1);
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
function getWeekday(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `（週${WEEKDAYS[d.getDay()]}）`;
}

export default function DocxView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"form" | "edit" | "preview">("form");
  const [exporting, setExporting] = useState(false);

  const [form, setForm] = useState({
    destination: "首爾", depCity: "高雄",
    depDate: "", retDate: "", people: "2",
    budget: "", style: "", memo: "",
  });

  const dayCount = getDayCount(form.depDate, form.retDate);
  const [days, setDays] = useState<DayNote[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // LINE Bot 產生的計畫 token → 從 abroad-uturn 拿資料預填
      fetch(`https://abroad-uturn.vercel.app/api/plan?token=${token}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) return;
          const dest = DESTINATIONS.includes(data.destination) ? data.destination : "首爾";
          const depDate = data.dep_date || "";
          // 從 days_text 解析天數（例如「5天4夜」→ 5）
          const daysMatch = typeof data.days_text === "string"
            ? data.days_text.match(/(\d+)\s*天/)
            : null;
          const numDays = daysMatch ? parseInt(daysMatch[1]) - 1 : 4;
          const retDate = depDate ? addDays(depDate, numDays) : "";
          setForm({
            destination: dest,
            depCity: "高雄",
            depDate,
            retDate,
            people: String(data.people ?? 2),
            budget: String(data.budget ?? ""),
            style: data.style || "",
            memo: "",
          });
        })
        .catch(() => {});
      return;
    }

    const dest = searchParams.get("dest");
    if (!dest) return;
    const depDate = searchParams.get("depDate") || "";
    const retDate = searchParams.get("retDate") || "";
    const filled = {
      destination: dest,
      depCity: searchParams.get("depCity") || "高雄",
      depDate,
      retDate,
      people: searchParams.get("people") || "2",
      budget: searchParams.get("budget") || "",
      style: searchParams.get("style") || "",
      memo: searchParams.get("memo") || "",
    };
    setForm(filled);
    const count = getDayCount(depDate, retDate);
    setDays(Array.from({ length: count }, () => emptyDay()));
    setStep("edit");
  }, []);

  const initDays = () => {
    setDays(Array.from({ length: dayCount }, () => emptyDay()));
    setStep("edit");
  };

  const generateWithAI = async () => {
    if (!form.destination || !form.depDate || !form.retDate) {
      alert("請先填寫目的地與日期");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: form.destination,
          depDate: form.depDate,
          retDate: form.retDate,
          people: form.people,
          style: form.style,
        }),
      });
      const data = await res.json();
      if (data.itinerary) {
        setDays(data.itinerary);
        setStep("edit");
      } else {
        alert("AI 生成失敗，請稍後再試");
      }
    } catch {
      alert("連線失敗，請稍後再試");
    } finally {
      setGenerating(false);
    }
  };

  const updateDay = (i: number, field: keyof DayNote, val: string) => {
    setDays((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await buildAndDownloadDocx(form, days);
    } finally {
      setExporting(false);
    }
  };

  const ta = "w-full resize-none rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm font-light text-[#4B4037] outline-none focus:border-[#8FA39A] placeholder:text-[#C4BCB4]";
  const inputClass = "h-11 w-full rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 text-sm font-light text-[#4B4037] outline-none focus:border-[#8FA39A]";

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <button onClick={() => step === "form" ? router.push("/") : setStep(step === "preview" ? "edit" : "form")}
            className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← {step === "form" ? "返回" : "上一步"}</button>
          <div className="text-xl font-light tracking-[0.18em]">📄 計畫書工作室</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pb-20 pt-28">

        {/* ── Step 1: Form ── */}
        {step === "form" && (
          <>
            <div className="mb-8">
              <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Trip Planner · Document Studio</p>
              <h1 className="text-3xl font-light tracking-wide">製作你的<br className="sm:hidden" />旅遊計畫書</h1>
              <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
                填寫旅遊資訊，逐日記錄行程，一鍵匯出專業 .docx 計畫書，含封面、目錄、每日行程卡片、海關簽證、打包清單與緊急聯絡。
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 md:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">目的地</span>
                  <select value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))} className={inputClass}>
                    {DESTINATIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">出發城市</span>
                  <select value={form.depCity} onChange={(e) => setForm((p) => ({ ...p, depCity: e.target.value }))} className={inputClass}>
                    {DEP_CITIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">出發日期</span>
                  <input type="date" value={form.depDate} onChange={(e) => setForm((p) => ({ ...p, depDate: e.target.value }))} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">回程日期</span>
                  <input type="date" value={form.retDate} onChange={(e) => setForm((p) => ({ ...p, retDate: e.target.value }))} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">人數</span>
                  <select value={form.people} onChange={(e) => setForm((p) => ({ ...p, people: e.target.value }))} className={inputClass}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}人</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">預算（可填總額或人均）</span>
                  <input type="text" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                    placeholder="如：NT$30,000 / 人" className={inputClass} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">旅遊風格</span>
                  <input type="text" value={form.style} onChange={(e) => setForm((p) => ({ ...p, style: e.target.value }))}
                    placeholder="如：美食探索、文青咖啡廳、購物血拼…" className={inputClass} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">備忘事項</span>
                  <textarea value={form.memo} onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                    rows={2} placeholder="住宿訂房號、機票確認碼、特別注意事項…" className={ta} />
                </label>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={generateWithAI} disabled={generating}
                  className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.2em] text-white transition hover:bg-[#96604D] disabled:opacity-60">
                  {generating ? "✨ AI 生成中…" : "✨ AI 幫我生成建議行程"}
                </button>
                <button onClick={initDays}
                  className="flex-1 rounded-full border border-[#A86F5A] bg-[#B98774]/15 py-4 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25">
                  自己填寫每日行程
                </button>
              </div>
              <p className="mt-2 text-center text-xs font-light text-[#A79C91]">AI 生成後仍可自由編輯</p>
            </div>
          </>
        )}

        {/* ── Step 2: Day Editor ── */}
        {step === "edit" && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-light tracking-wide">逐日行程填寫</h2>
              <p className="mt-1 text-sm font-light text-[#6F675F]">{form.destination}　{fmtDate(form.depDate)} – {fmtDate(form.retDate)}　{form.people}人</p>
            </div>
            <div className="space-y-5">
              {days.map((day, i) => {
                const dateStr = addDays(form.depDate, i);
                const label = i === 0 ? "抵達日" : i === days.length - 1 ? "返程日" : `Day ${i + 1}`;
                return (
                  <div key={i} className="rounded-[1.5rem] border border-[#D8D2C7] bg-[#FBF8F1] p-5 md:p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="rounded-full bg-[#A86F5A]/15 px-3 py-0.5 text-xs font-light tracking-widest text-[#7D5548]">{label}</span>
                      <span className="text-sm font-light text-[#6F675F]">{fmtDate(dateStr)}{getWeekday(dateStr)}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">🌅 上午</span>
                        <textarea rows={2} value={day.morning} onChange={(e) => updateDay(i, "morning", e.target.value)}
                          placeholder="景點、活動…" className={ta} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">☀️ 下午</span>
                        <textarea rows={2} value={day.afternoon} onChange={(e) => updateDay(i, "afternoon", e.target.value)}
                          placeholder="景點、購物…" className={ta} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">🌙 晚上</span>
                        <textarea rows={2} value={day.evening} onChange={(e) => updateDay(i, "evening", e.target.value)}
                          placeholder="夜市、酒吧、夜景…" className={ta} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">🍜 美食</span>
                        <textarea rows={2} value={day.food} onChange={(e) => updateDay(i, "food", e.target.value)}
                          placeholder="今日餐廳、必吃清單…" className={ta} />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">📝 備註</span>
                        <textarea rows={1} value={day.note} onChange={(e) => updateDay(i, "note", e.target.value)}
                          placeholder="交通方式、訂位提醒…" className={ta} />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setStep("preview")}
              className="mt-8 w-full rounded-full border border-[#A86F5A] bg-[#B98774]/15 py-4 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25">
              預覽計畫書 →
            </button>
          </>
        )}

        {/* ── Step 3: Preview + Export ── */}
        {step === "preview" && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-light tracking-wide">預覽計畫書</h2>
              <button onClick={handleExport} disabled={exporting}
                className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-8 py-3 text-sm font-light tracking-[0.15em] text-[#7D5548] transition hover:bg-[#B98774]/25 disabled:opacity-60">
                {exporting ? "產生中…" : "📄 下載 .docx"}
              </button>
            </div>

            {/* ── Printable Document ── */}
            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] overflow-hidden">

              {/* Cover */}
              <div className="bg-[#3A2E26] px-10 py-16 text-center text-white">
                <p className="mb-3 text-xs font-light uppercase tracking-[0.5em] text-white/50">Travel Plan · 旅遊計畫書</p>
                <h1 className="mb-2 text-5xl font-light tracking-wide">{form.destination}</h1>
                <p className="mb-6 text-lg font-light tracking-widest text-white/70">
                  {fmtDate(form.depDate)} – {fmtDate(form.retDate)}
                </p>
                <div className="mx-auto flex max-w-xs justify-center gap-6 text-sm font-light text-white/60">
                  <span>✈️ 從{form.depCity}出發</span>
                  <span>👤 {form.people}人</span>
                  {form.budget && <span>💰 {form.budget}</span>}
                </div>
                {form.style && (
                  <p className="mt-4 text-sm font-light text-white/50">{form.style}</p>
                )}
              </div>

              <div className="px-8 py-10 md:px-12">

                {/* TOC */}
                <section className="mb-10">
                  <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.5em] text-[#8FA39A]">目錄</h2>
                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-[#E8E2D8] pb-1.5 text-sm font-light text-[#6F675F]">
                      <span>簽證＆緊急資訊</span><span>▸</span>
                    </div>
                    {days.map((_, i) => {
                      const label = i === 0 ? "Day 1 · 抵達" : i === days.length - 1 ? `Day ${i + 1} · 返程` : `Day ${i + 1}`;
                      const dateStr = addDays(form.depDate, i);
                      return (
                        <div key={i} className="flex justify-between border-b border-[#E8E2D8] pb-1.5 text-sm font-light text-[#6F675F]">
                          <span>{label}　<span className="text-[#A79C91]">{fmtDate(dateStr)}</span></span><span>▸</span>
                        </div>
                      );
                    })}
                    {form.memo && (
                      <div className="flex justify-between border-b border-[#E8E2D8] pb-1.5 text-sm font-light text-[#6F675F]">
                        <span>備忘事項</span><span>▸</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Visa & Emergency */}
                <section className="mb-10">
                  <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.5em] text-[#8FA39A]">簽證＆緊急資訊</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#C4A882]/50 bg-[#FDF6ED] px-5 py-4">
                      <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">🛂 簽證說明</div>
                      <p className="text-sm font-light leading-6 text-[#5C5248]">{VISA_NOTE[form.destination] ?? "請出發前確認最新簽證規定。"}</p>
                    </div>
                    <div className="rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                      <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">📞 緊急聯絡</div>
                      <p className="text-sm font-light leading-6 text-[#5C5248]">{EMERGENCY[form.destination] ?? "請查詢外交部領事事務局官網。"}</p>
                    </div>
                  </div>
                </section>

                {/* Day Plans */}
                <section className="mb-10">
                  <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.5em] text-[#8FA39A]">每日行程</h2>
                  <div className="space-y-6">
                    {days.map((day, i) => {
                      const dateStr = addDays(form.depDate, i);
                      const label = i === 0 ? "Day 1 · 抵達日" : i === days.length - 1 ? `Day ${i + 1} · 返程日` : `Day ${i + 1}`;
                      return (
                        <div key={i} className="rounded-2xl border border-[#D8D2C7] bg-white p-6">
                          <div className="mb-4 flex items-center gap-3">
                            <span className="rounded-full bg-[#A86F5A]/15 px-3 py-0.5 text-xs font-light tracking-widest text-[#7D5548]">{label}</span>
                            <span className="text-sm font-light text-[#8A7F73]">{fmtDate(dateStr)}{getWeekday(dateStr)}</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {[
                              { icon: "🌅", label: "上午", val: day.morning },
                              { icon: "☀️", label: "下午", val: day.afternoon },
                              { icon: "🌙", label: "晚上", val: day.evening },
                              { icon: "🍜", label: "美食", val: day.food },
                            ].filter((r) => r.val).map((r) => (
                              <div key={r.label}>
                                <div className="mb-0.5 text-[10px] font-light text-[#8FA39A]">{r.icon} {r.label}</div>
                                <p className="text-sm font-light leading-6 text-[#4B4037] whitespace-pre-wrap">{r.val}</p>
                              </div>
                            ))}
                          </div>
                          {day.note && (
                            <div className="mt-3 rounded-xl bg-[#F7F3EC] px-4 py-2 text-xs font-light text-[#8A7F73]">
                              📝 {day.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Memo */}
                {form.memo && (
                  <section className="mb-6">
                    <h2 className="mb-3 text-[10px] font-light uppercase tracking-[0.5em] text-[#8FA39A]">備忘事項</h2>
                    <div className="rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                      <p className="text-sm font-light leading-7 text-[#4B4037] whitespace-pre-wrap">{form.memo}</p>
                    </div>
                  </section>
                )}

                {/* Footer */}
                <div className="border-t border-[#E8E2D8] pt-6 text-center text-xs font-light text-[#B0A89E]">
                  由 出國優轉 AbroadUturn 計畫書工作室製作　uturn-web.vercel.app
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
