"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildAndDownloadDocx, VISA_NOTE, EMERGENCY, CUSTOMS, estimateBudget, BudgetBreakdown } from "@/app/lib/buildDocx";

const DESTINATIONS = [
  // 日本
  "東京", "大阪", "沖繩", "福岡", "札幌", "名古屋",
  // 韓國
  "首爾", "釜山", "濟州",
  // 東南亞
  "曼谷", "清邁", "普吉島", "新加坡", "吉隆坡", "峇里島",
  "胡志明市", "河內", "峴港", "馬尼拉", "宿霧", "雅加達",
  "亞庇", "蘭卡威", "檳城", "金邊", "暹粒",
  // 東北亞
  "香港", "澳門", "上海", "北京", "廣州",
  // 中東/歐洲/美洲/大洋洲
  "杜拜", "倫敦", "巴黎", "羅馬", "巴塞隆納", "雪梨",
  "紐約", "洛杉磯", "溫哥華", "多倫多",
  // 其他
  "關島", "帛琉",
];
const DEP_CITIES = ["高雄", "台北", "台中", "台南"];

const ARR_AIRPORTS: Record<string, { code: string; label: string }[]> = {
  首爾: [
    { code: "ICN", label: "仁川（ICN）── 多數國際航班" },
    { code: "GMP", label: "金浦（GMP）── 廉航/離市區近" },
  ],
  東京: [
    { code: "NRT", label: "成田（NRT）── 多數國際航班" },
    { code: "HND", label: "羽田（HND）── 離市區近" },
  ],
  大阪: [
    { code: "KIX", label: "關西（KIX）── 多數國際航班" },
    { code: "ITM", label: "伊丹（ITM）── 部分亞洲航線" },
  ],
  曼谷: [
    { code: "BKK", label: "素萬那普（BKK）── 多數國際航班" },
    { code: "DMK", label: "廊曼（DMK）── 廉航常用（虎航/獅航）" },
  ],
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
    destination: "首爾", depCity: "高雄", arrAirport: "ICN",
    depDate: "", retDate: "", people: "2",
    budget: "", style: "", mustVisit: "", memo: "",
  });

  const [budgetBreakdownOverride, setBudgetBreakdownOverride] = useState<Record<string, number> | null>(null);
  const dayCount = getDayCount(form.depDate, form.retDate);

  // 優先用 LINE Bot 帶入的值，否則用前端估算
  const budgetBreakdown: BudgetBreakdown | null = (() => {
    if (budgetBreakdownOverride && budgetBreakdownOverride.total > 0) {
      return budgetBreakdownOverride as unknown as BudgetBreakdown;
    }
    if (form.destination && form.depDate && form.retDate) {
      const adults = parseInt(form.people) || 1;
      return estimateBudget(form.destination, dayCount, adults);
    }
    return null;
  })();
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
          const dest = data.destination || "首爾";
          // "2026-06" → "2026-06-01"，讓 date input 能正確顯示
          const toFullDate = (s: string) =>
            s && /^\d{4}-\d{2}$/.test(s) ? s + "-01" : s;
          const depDate = toFullDate(data.dep_date || "");
          const retDate = toFullDate(data.ret_date || "") || (() => {
            const daysMatch = typeof data.days_text === "string"
              ? data.days_text.match(/(\d+)\s*天/) : null;
            const numDays = daysMatch ? parseInt(daysMatch[1]) - 1 : 4;
            return depDate ? addDays(depDate, numDays) : "";
          })();
          setForm({
            destination: dest,
            depCity: "高雄",
            arrAirport: data.arr_airport || "",
            depDate,
            retDate,
            people: String(data.people ?? 2),
            budget: String(data.budget ?? ""),
            style: data.style || "",
            mustVisit: data.must_visit || "",
            memo: "",
          });
          if (data.budget_breakdown && data.budget_breakdown.total) {
            setBudgetBreakdownOverride(data.budget_breakdown);
          }
          // llm_itinerary 有資料 → 直接帶入；沒有 → 自動用 Claude 生成
          if (Array.isArray(data.llm_itinerary) && data.llm_itinerary.length > 0) {
            const numDays = getDayCount(depDate, retDate);
            const filled: DayNote[] = Array.from({ length: numDays }, (_, i) => {
              const mid = data.llm_itinerary[i - 1];
              if (!mid) return emptyDay();
              return { morning: mid.am || "", afternoon: mid.pm || "", evening: mid.eve || "", food: "", note: mid.theme || "" };
            });
            setDays(filled);
            setStep("edit");
          } else if (depDate && retDate) {
            // 自動觸發 Claude 生成，不需使用者再按按鈕
            setGenerating(true);
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 55000);
            fetch("/api/generate-itinerary", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ destination: dest, arrAirport: data.arr_airport || "", depDate, retDate, people: data.people ?? 2, style: data.style || "", mustVisit: data.must_visit || "" }),
              signal: ctrl.signal,
            })
              .then((r) => r.json())
              .then((r) => {
                if (r.itinerary) { setDays(r.itinerary); setStep("edit"); }
              })
              .catch(() => {})
              .finally(() => { clearTimeout(timer); setGenerating(false); });
          }
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
      arrAirport: searchParams.get("arrAirport") || "",
      depDate,
      retDate,
      people: searchParams.get("people") || "2",
      budget: searchParams.get("budget") || "",
      style: searchParams.get("style") || "",
      mustVisit: searchParams.get("mustVisit") || "",
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
          arrAirport: form.arrAirport,
          depDate: form.depDate,
          retDate: form.retDate,
          people: form.people,
          style: form.style,
          mustVisit: form.mustVisit,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("AI 生成失敗，請稍後再試");
        return;
      }
      const { itinerary } = data;
      if (!itinerary) throw new Error("No itinerary");
      setDays(itinerary);
      setStep("edit");
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
                  <select value={form.destination} onChange={(e) => {
                    const dest = e.target.value;
                    const airports = ARR_AIRPORTS[dest];
                    setForm((p) => ({ ...p, destination: dest, arrAirport: airports ? airports[0].code : "" }));
                  }} className={inputClass}>
                    {DESTINATIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">出發城市</span>
                  <select value={form.depCity} onChange={(e) => setForm((p) => ({ ...p, depCity: e.target.value }))} className={inputClass}>
                    {DEP_CITIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </label>
                {ARR_AIRPORTS[form.destination] && (
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">抵達機場</span>
                    <select value={form.arrAirport} onChange={(e) => setForm((p) => ({ ...p, arrAirport: e.target.value }))} className={inputClass}>
                      {ARR_AIRPORTS[form.destination].map(({ code, label }) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                  </label>
                )}
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
                  <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">指定景點 <span className="text-[#B0A89E]">（選填，AI 會幫你插入行程）</span></span>
                  <textarea value={form.mustVisit} onChange={(e) => setForm((p) => ({ ...p, mustVisit: e.target.value }))}
                    rows={2} placeholder="例：建大貨櫃屋、弘大 MUJI、明洞某某烤肉店…" className={ta} />
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
                        <textarea rows={4} value={day.morning} onChange={(e) => updateDay(i, "morning", e.target.value)}
                          placeholder="景點、活動…" className={ta} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">☀️ 下午</span>
                        <textarea rows={4} value={day.afternoon} onChange={(e) => updateDay(i, "afternoon", e.target.value)}
                          placeholder="景點、購物…" className={ta} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">🌙 晚上</span>
                        <textarea rows={4} value={day.evening} onChange={(e) => updateDay(i, "evening", e.target.value)}
                          placeholder="夜市、酒吧、夜景…" className={ta} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">🍜 美食</span>
                        <textarea rows={4} value={day.food} onChange={(e) => updateDay(i, "food", e.target.value)}
                          placeholder="今日餐廳、必吃清單…" className={ta} />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-[11px] font-light tracking-widest text-[#8FA39A]">📝 備註</span>
                        <textarea rows={2} value={day.note} onChange={(e) => updateDay(i, "note", e.target.value)}
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
              <div className="flex gap-2">
                <button onClick={() => window.print()}
                  className="rounded-full border border-[#5A8AA8] bg-[#5A8AA8]/10 px-6 py-3 text-sm font-light tracking-[0.15em] text-[#4A7A98] transition hover:bg-[#5A8AA8]/20">
                  🖨 匯出 PDF
                </button>
                <button onClick={handleExport} disabled={exporting}
                  className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-6 py-3 text-sm font-light tracking-[0.15em] text-[#7D5548] transition hover:bg-[#B98774]/25 disabled:opacity-60">
                  {exporting ? "產生中…" : "📄 下載 .docx"}
                </button>
              </div>
            </div>

            {/* ── Printable Document ── */}
            <div id="plan-print-content" className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] overflow-hidden">

              {/* Cover */}
              <div id="plan-print-cover" className="bg-[#3A2E26] px-10 py-16 text-center text-white">
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
                      <span>🛂 簽證 &amp; 海關規定</span><span>▸</span>
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

                {/* Visa, Customs & Emergency */}
                <section className="mb-10">
                  <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.5em] text-[#8FA39A]">🛂 簽證 &amp; 海關規定</h2>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-[#C4A882]/50 bg-[#FDF6ED] px-5 py-4">
                      <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">簽證說明</div>
                      <p className="text-sm font-light leading-6 text-[#5C5248]">{VISA_NOTE[form.destination] ?? "請出發前確認最新簽證規定。"}</p>
                    </div>
                    <div className="rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                      <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">海關注意事項</div>
                      <ul className="space-y-1">
                        {(CUSTOMS[form.destination] ?? ["請至目的地海關官網確認最新規定。"]).map((item, i) => (
                          <li key={i} className="text-sm font-light leading-6 text-[#5C5248]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                      <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">📞 緊急聯絡</div>
                      <ul className="space-y-1">
                        {(EMERGENCY[form.destination] ?? ["請查詢外交部領事事務局官網。"]).map((item, i) => (
                          <li key={i} className="text-sm font-light leading-6 text-[#5C5248]">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Budget Breakdown */}
                {budgetBreakdown && budgetBreakdown.hotel > 0 && (
                  <section className="mb-10">
                    <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.5em] text-[#8FA39A]">整趟旅程預估費用</h2>
                    <div className="rounded-2xl border border-[#D8D2C7] bg-white p-5">
                      <p className="mb-3 text-xs font-light text-[#8A7F73]">
                        {form.destination} · {budgetBreakdown.days}天{budgetBreakdown.nights}夜 · {budgetBreakdown.adults}人　｜　以下為整趟旅程合計金額
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: `✈️ 機票（含稅 · ${budgetBreakdown.adults}人）`, val: budgetBreakdown.flight, dash: budgetBreakdown.flight === 0 },
                          { label: `🏨 住宿（${budgetBreakdown.nights}晚 · ${budgetBreakdown.adults}人）`, val: budgetBreakdown.hotel },
                          { label: `🍜 餐飲（${budgetBreakdown.days}天 · ${budgetBreakdown.adults}人）`, val: budgetBreakdown.food },
                          { label: `🚇 當地交通（${budgetBreakdown.adults}人）`, val: budgetBreakdown.transport },
                          { label: `🎡 景點活動（${budgetBreakdown.adults}人）`, val: budgetBreakdown.activity },
                        ].map(({ label, val, dash }) => (
                          <div key={label} className="flex justify-between text-sm font-light text-[#5C5248]">
                            <span>{label}</span>
                            <span className={dash ? "text-[#B0A89E]" : ""}>{dash ? "未計入" : `NT$ ${(val ?? 0).toLocaleString()}`}</span>
                          </div>
                        ))}
                        <div className="mt-3 border-t border-[#E8E2D8] pt-3 flex justify-between text-sm font-semibold text-[#E53935]">
                          <span>💰 整趟旅程估計</span>
                          <span>NT$ {(budgetBreakdown.total ?? 0).toLocaleString()}</span>
                        </div>
                        {budgetBreakdown.adults > 1 && (
                          <div className="flex justify-between text-xs font-light text-[#1565C0]">
                            <span>📌 每人約</span>
                            <span>NT$ {(budgetBreakdown.per_person ?? 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="mt-2 rounded-lg bg-[#F5F3EF] p-3 flex justify-between text-sm font-medium text-[#5C5248]">
                          <span>💳 建議實際攜帶金額（×1.2）</span>
                          <span>NT$ {Math.round((budgetBreakdown.total ?? 0) * 1.2).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-[10px] font-light text-[#A79C91]">
                          參考中間值，實際依住宿等級、旅遊方式、匯率而異。不含購物與個人消費。
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Day Plans */}
                <section className="mb-10">
                  <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.5em] text-[#8FA39A]">每日行程</h2>
                  <div className="space-y-6">
                    {days.map((day, i) => {
                      const dateStr = addDays(form.depDate, i);
                      const label = i === 0 ? "Day 1 · 抵達日" : i === days.length - 1 ? `Day ${i + 1} · 返程日` : `Day ${i + 1}`;
                      return (
                        <div key={i} className="print-day-card rounded-2xl border border-[#D8D2C7] bg-white p-6">
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
