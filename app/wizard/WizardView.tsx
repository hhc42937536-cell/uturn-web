"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VISA_NOTE, estimateBudget } from "@/app/lib/buildDocx";
import { HOTEL_ESTIMATES, HOTEL_PICKS, agodaUrl, bookingUrl } from "@/app/lib/hotelData";

// ── 目的地資料 ─────────────────────────────────────────────
const DESTINATIONS = [
  { name: "東京", flag: "🇯🇵" }, { name: "大阪", flag: "🇯🇵" },
  { name: "沖繩", flag: "🇯🇵" }, { name: "福岡", flag: "🇯🇵" },
  { name: "北海道", flag: "🇯🇵" }, { name: "名古屋", flag: "🇯🇵" },
  { name: "首爾", flag: "🇰🇷" }, { name: "釜山", flag: "🇰🇷" },
  { name: "濟州", flag: "🇰🇷" },
  { name: "曼谷", flag: "🇹🇭" }, { name: "清邁", flag: "🇹🇭" },
  { name: "普吉島", flag: "🇹🇭" },
  { name: "新加坡", flag: "🇸🇬" },
  { name: "吉隆坡", flag: "🇲🇾" }, { name: "蘭卡威", flag: "🇲🇾" },
  { name: "峇里島", flag: "🇮🇩" },
  { name: "胡志明市", flag: "🇻🇳" }, { name: "河內", flag: "🇻🇳" },
  { name: "峴港", flag: "🇻🇳" },
  { name: "香港", flag: "🇭🇰" }, { name: "澳門", flag: "🇲🇴" },
  { name: "上海", flag: "🇨🇳" }, { name: "北京", flag: "🇨🇳" },
  { name: "馬尼拉", flag: "🇵🇭" }, { name: "宿霧", flag: "🇵🇭" },
  { name: "杜拜", flag: "🇦🇪" },
  { name: "倫敦", flag: "🇬🇧" }, { name: "巴黎", flag: "🇫🇷" },
  { name: "關島", flag: "🇬🇺" }, { name: "帛琉", flag: "🇵🇼" },
];

const ARR_AIRPORTS: Record<string, { code: string; label: string }[]> = {
  首爾: [
    { code: "ICN", label: "仁川（ICN）── 多數國際航班" },
    { code: "GMP", label: "金浦（GMP）── 廉航 / 離市區近" },
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
    { code: "DMK", label: "廊曼（DMK）── 廉航常用" },
  ],
};

const STYLES = [
  "美食為主", "購物掃貨", "自然景觀", "文化歷史",
  "親子同遊", "蜜月浪漫", "輕鬆漫遊", "深度在地",
];
const DEP_CITIES = ["高雄", "台北", "台中", "台南"];

// ── 型別 ───────────────────────────────────────────────────
type DayNote = {
  morning: string; afternoon: string; evening: string;
  food: string; note: string;
};

interface WizardState {
  destination: string;
  depCity: string;
  arrAirport: string;
  depDate: string;
  retDate: string;
  people: number;
  budget: string;
  style: string;
  mustVisit: string;
  itinerary: DayNote[];
}

// ── 工具函式 ───────────────────────────────────────────────
function getDays(dep: string, ret: string) {
  if (!dep || !ret) return 0;
  return Math.max(2, Math.round(
    (new Date(ret).getTime() - new Date(dep).getTime()) / 86400000
  ) + 1);
}

function emptyDay(): DayNote {
  return { morning: "", afternoon: "", evening: "", food: "", note: "" };
}

// ── 步驟進度條 ─────────────────────────────────────────────
const STEP_LABELS = ["目的地", "日期", "旅伴 & 風格", "AI 規劃", "完成"];

function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 justify-center mb-10">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center gap-1">
            <div className={`flex flex-col items-center gap-1 ${active ? "" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-light border transition-all
                ${done ? "bg-[#A86F5A] border-[#A86F5A] text-white" :
                  active ? "bg-[#A86F5A]/10 border-[#A86F5A] text-[#A86F5A]" :
                  "bg-white border-[#D8D2C7] text-[#C4BCB4]"}`}>
                {done ? "✓" : n}
              </div>
              <span className="text-[10px] font-light text-[#8A7F73] hidden sm:block">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-6 sm:w-10 mb-4 transition-all
                ${done ? "bg-[#A86F5A]" : "bg-[#D8D2C7]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 主元件 ─────────────────────────────────────────────────
export default function WizardView() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const [state, setState] = useState<WizardState>({
    destination: "",
    depCity: "高雄",
    arrAirport: "",
    depDate: "",
    retDate: "",
    people: 2,
    budget: "",
    style: "",
    mustVisit: "",
    itinerary: [],
  });

  const set = (patch: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...patch }));

  const dayCount = getDays(state.depDate, state.retDate);

  // ── Step 1 ─────────────────────────────────────────────
  const Step1 = () => {
    const [custom, setCustom] = useState(
      DESTINATIONS.some((d) => d.name === state.destination) ? "" : state.destination
    );

    function pick(name: string) {
      const airports = ARR_AIRPORTS[name];
      set({
        destination: name,
        arrAirport: airports ? airports[0].code : "",
      });
    }

    function canNext() {
      return (state.destination || custom.trim()) !== "";
    }

    function next() {
      const dest = custom.trim() || state.destination;
      if (!dest) return;
      const airports = ARR_AIRPORTS[dest];
      set({
        destination: dest,
        arrAirport: airports ? airports[0].code : state.arrAirport,
      });
      setStep(2);
    }

    return (
      <div>
        <h2 className="text-2xl font-light tracking-wide mb-2 text-center">去哪裡旅行？</h2>
        <p className="text-sm font-light text-[#8A7F73] text-center mb-8">選一個目的地，或直接輸入城市名</p>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 mb-6">
          {DESTINATIONS.map(({ name, flag }) => (
            <button
              key={name}
              onClick={() => { pick(name); setCustom(""); }}
              className={`rounded-2xl border p-3 text-center transition-all
                ${state.destination === name && !custom
                  ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A] hover:bg-[#FFFDF8]"}`}
            >
              <div className="text-xl mb-1">{flag}</div>
              <div className="text-xs font-light">{name}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="其他城市（如：京都、清萊…）"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              if (e.target.value) set({ destination: e.target.value, arrAirport: "" });
            }}
            className="flex-1 rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-4 py-3 text-sm font-light outline-none focus:border-[#A86F5A]"
          />
        </div>

        {/* 出發城市 */}
        <div className="mb-8">
          <label className="block text-sm font-light text-[#6F675F] mb-2">從哪裡出發？</label>
          <div className="flex gap-2 flex-wrap">
            {DEP_CITIES.map((c) => (
              <button
                key={c}
                onClick={() => set({ depCity: c })}
                className={`rounded-full border px-5 py-2 text-sm font-light transition-all
                  ${state.depCity === c
                    ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                    : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 抵達機場（多機場城市） */}
        {ARR_AIRPORTS[state.destination] && (
          <div className="mb-8">
            <label className="block text-sm font-light text-[#6F675F] mb-2">抵達哪個機場？</label>
            <div className="flex flex-col gap-2">
              {ARR_AIRPORTS[state.destination].map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => set({ arrAirport: code })}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-light transition-all
                    ${state.arrAirport === code
                      ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                      : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={next}
          disabled={!canNext()}
          className="w-full rounded-full bg-[#A86F5A] py-4 text-base font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D] disabled:opacity-40"
        >
          下一步 →
        </button>
      </div>
    );
  };

  // ── Step 2 ─────────────────────────────────────────────
  const Step2 = () => {
    // Min date = today
    const today = new Date().toISOString().split("T")[0];

    function canNext() {
      return state.depDate !== "" && state.retDate !== "" &&
        new Date(state.retDate) > new Date(state.depDate);
    }

    return (
      <div>
        <h2 className="text-2xl font-light tracking-wide mb-2 text-center">出發日期？</h2>
        <p className="text-sm font-light text-[#8A7F73] text-center mb-8">選好出發和回程日期</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-light text-[#8A7F73] uppercase tracking-widest mb-2">✈️ 出發日</label>
            <input
              type="date"
              min={today}
              value={state.depDate}
              onChange={(e) => {
                set({ depDate: e.target.value });
                // 自動設回程（+5天）
                if (e.target.value && !state.retDate) {
                  const d = new Date(e.target.value);
                  d.setDate(d.getDate() + 5);
                  set({ retDate: d.toISOString().split("T")[0] });
                }
              }}
              className="w-full rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-4 py-3 text-sm font-light outline-none focus:border-[#A86F5A]"
            />
          </div>
          <div>
            <label className="block text-xs font-light text-[#8A7F73] uppercase tracking-widest mb-2">🏠 回程日</label>
            <input
              type="date"
              min={state.depDate || today}
              value={state.retDate}
              onChange={(e) => set({ retDate: e.target.value })}
              className="w-full rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-4 py-3 text-sm font-light outline-none focus:border-[#A86F5A]"
            />
          </div>
        </div>

        {dayCount > 0 && (
          <div className="rounded-2xl bg-[#A86F5A]/8 border border-[#A86F5A]/30 px-6 py-4 text-center mb-6">
            <span className="text-3xl font-light text-[#A86F5A]">{dayCount}</span>
            <span className="text-base font-light text-[#6F675F] ml-2">天行程</span>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setStep(1)}
            className="flex-1 rounded-full border border-[#D8D2C7] py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]">
            ← 上一步
          </button>
          <button onClick={() => setStep(3)} disabled={!canNext()}
            className="flex-[2] rounded-full bg-[#A86F5A] py-4 text-base font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D] disabled:opacity-40">
            下一步 →
          </button>
        </div>
      </div>
    );
  };

  // ── Step 3 ─────────────────────────────────────────────
  const Step3 = () => {
    const budgetOptions = [
      { label: "省錢型", value: "15000", desc: "TWD 15,000 以內" },
      { label: "舒適型", value: "30000", desc: "TWD 30,000 左右" },
      { label: "享受型", value: "50000", desc: "TWD 50,000 左右" },
      { label: "奢華型", value: "100000", desc: "TWD 100,000 以上" },
    ];

    return (
      <div>
        <h2 className="text-2xl font-light tracking-wide mb-2 text-center">旅伴 & 旅遊風格</h2>
        <p className="text-sm font-light text-[#8A7F73] text-center mb-8">告訴 AI 你的喜好，規劃更準確</p>

        {/* 人數 */}
        <div className="mb-6">
          <label className="block text-sm font-light text-[#6F675F] mb-3">幾個人出發？</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => set({ people: Math.max(1, state.people - 1) })}
              className="w-10 h-10 rounded-full border border-[#D8D2C7] text-xl font-light hover:border-[#A86F5A] transition"
            >−</button>
            <span className="text-3xl font-light w-12 text-center">{state.people}</span>
            <button
              onClick={() => set({ people: Math.min(20, state.people + 1) })}
              className="w-10 h-10 rounded-full border border-[#D8D2C7] text-xl font-light hover:border-[#A86F5A] transition"
            >+</button>
            <span className="text-sm font-light text-[#8A7F73]">人</span>
          </div>
        </div>

        {/* 預算 */}
        <div className="mb-6">
          <label className="block text-sm font-light text-[#6F675F] mb-3">旅費預算（每人，含機票）</label>
          <div className="grid grid-cols-2 gap-2">
            {budgetOptions.map(({ label, value, desc }) => (
              <button key={value}
                onClick={() => set({ budget: value })}
                className={`rounded-2xl border p-3 text-left transition-all
                  ${state.budget === value
                    ? "border-[#A86F5A] bg-[#A86F5A]/10"
                    : "border-[#D8D2C7] bg-[#FBF8F1] hover:border-[#A86F5A]"}`}>
                <div className="text-sm font-light">{label}</div>
                <div className="text-xs font-light text-[#8A7F73]">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 旅遊風格 */}
        <div className="mb-6">
          <label className="block text-sm font-light text-[#6F675F] mb-3">旅遊風格（可多選）</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => {
              const selected = state.style.includes(s);
              return (
                <button key={s}
                  onClick={() => {
                    const styles = state.style.split("、").filter(Boolean);
                    if (selected) {
                      set({ style: styles.filter((x) => x !== s).join("、") });
                    } else {
                      set({ style: [...styles, s].join("、") });
                    }
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                    ${selected
                      ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                      : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* 必去景點 */}
        <div className="mb-8">
          <label className="block text-sm font-light text-[#6F675F] mb-2">有沒有一定要去的景點？（選填）</label>
          <textarea
            value={state.mustVisit}
            onChange={(e) => set({ mustVisit: e.target.value })}
            placeholder="例如：淺草寺、築地市場、迪士尼……（AI 會優先安排）"
            rows={3}
            className="w-full rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-4 py-3 text-sm font-light outline-none focus:border-[#A86F5A] resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(2)}
            className="flex-1 rounded-full border border-[#D8D2C7] py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]">
            ← 上一步
          </button>
          <button onClick={() => setStep(4)}
            className="flex-[2] rounded-full bg-[#A86F5A] py-4 text-base font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]">
            下一步 →
          </button>
        </div>
      </div>
    );
  };

  // ── Step 4 ─────────────────────────────────────────────
  const Step4 = () => {
    async function generate() {
      setGenerating(true);
      setGenError("");
      try {
        const res = await fetch("/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: state.destination,
            arrAirport: state.arrAirport,
            depDate: state.depDate,
            retDate: state.retDate,
            people: state.people,
            style: state.style,
            mustVisit: state.mustVisit,
          }),
        });
        const data = await res.json();
        if (data.itinerary) {
          set({ itinerary: data.itinerary });
          setStep(5);
        } else {
          setGenError(data.error || "AI 生成失敗，請再試一次");
        }
      } catch {
        setGenError("網路錯誤，請稍後再試");
      } finally {
        setGenerating(false);
      }
    }

    return (
      <div>
        <h2 className="text-2xl font-light tracking-wide mb-2 text-center">AI 幫你規劃行程</h2>
        <p className="text-sm font-light text-[#8A7F73] text-center mb-8">
          根據你的設定，AI 會生成每日行程建議，約需 10-20 秒
        </p>

        {/* 行程摘要 */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 mb-8 space-y-3">
          <div className="flex justify-between text-sm font-light">
            <span className="text-[#8A7F73]">目的地</span>
            <span className="text-[#4B4037]">{state.destination}　{state.depCity} 出發</span>
          </div>
          <div className="flex justify-between text-sm font-light">
            <span className="text-[#8A7F73]">日期</span>
            <span className="text-[#4B4037]">{state.depDate} → {state.retDate}　（{dayCount} 天）</span>
          </div>
          <div className="flex justify-between text-sm font-light">
            <span className="text-[#8A7F73]">人數</span>
            <span className="text-[#4B4037]">{state.people} 人</span>
          </div>
          {state.style && (
            <div className="flex justify-between text-sm font-light">
              <span className="text-[#8A7F73]">風格</span>
              <span className="text-[#4B4037]">{state.style}</span>
            </div>
          )}
          {state.mustVisit && (
            <div className="flex justify-between text-sm font-light">
              <span className="text-[#8A7F73]">必去</span>
              <span className="text-[#4B4037] text-right max-w-[60%]">{state.mustVisit}</span>
            </div>
          )}
        </div>

        {genError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-6">
            {genError}
          </div>
        )}

        {generating ? (
          <div className="text-center py-10">
            <div className="inline-block w-10 h-10 border-2 border-[#A86F5A] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-light text-[#8A7F73]">AI 正在規劃 {dayCount} 天行程……</p>
          </div>
        ) : (
          <button
            onClick={generate}
            className="w-full rounded-full bg-[#A86F5A] py-5 text-base font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D] mb-4"
          >
            ✨ 開始 AI 規劃行程
          </button>
        )}

        {!generating && (
          <div className="flex gap-3">
            <button onClick={() => setStep(3)}
              className="flex-1 rounded-full border border-[#D8D2C7] py-3 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]">
              ← 上一步
            </button>
            <button
              onClick={() => { set({ itinerary: Array.from({ length: dayCount }, () => emptyDay()) }); setStep(5); }}
              className="flex-1 rounded-full border border-[#D8D2C7] py-3 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]">
              跳過，自己填
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── Step 5 ─────────────────────────────────────────────
  const Step5 = () => {
    function goToDocx() {
      sessionStorage.setItem("uturn_wizard_draft", JSON.stringify({
        destination: state.destination,
        depCity: state.depCity,
        arrAirport: state.arrAirport,
        depDate: state.depDate,
        retDate: state.retDate,
        people: String(state.people),
        budget: state.budget,
        style: state.style,
        mustVisit: state.mustVisit,
        memo: "",
        itinerary: state.itinerary,
      }));
      router.push("/docx");
    }

    const hasItinerary = state.itinerary.length > 0 && state.itinerary.some(
      (d) => d.morning || d.afternoon || d.evening
    );

    const visa = VISA_NOTE[state.destination];
    const hotel = HOTEL_ESTIMATES[state.destination];
    const picks = HOTEL_PICKS[state.destination];
    const budget = dayCount > 0
      ? estimateBudget(state.destination, dayCount, state.people)
      : null;

    return (
      <div>
        <h2 className="text-2xl font-light tracking-wide mb-2 text-center">🎉 規劃完成！</h2>
        <p className="text-sm font-light text-[#8A7F73] text-center mb-8">
          AI 已規劃好行程，以下是行前必知資訊
        </p>

        {/* ── 行程預覽 ── */}
        {hasItinerary && (
          <div className="mb-6">
            <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-3">行程概覽</p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {state.itinerary.map((day, i) => (
                <div key={i} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-5 py-3">
                  <span className="text-xs font-light text-[#A86F5A] mr-3">DAY {i + 1}</span>
                  <span className="text-sm font-light text-[#4B4037]">
                    {day.morning?.split("，")[0] || day.afternoon?.split("，")[0] || "–"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 簽證 ── */}
        {visa && (
          <div className="mb-4 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-5">
            <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-2">🛂 簽證須知</p>
            <p className="text-sm font-light leading-7 text-[#4B4037]">{visa}</p>
          </div>
        )}

        {/* ── 住宿 ── */}
        {hotel && (
          <div className="mb-4 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-5">
            <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-3">🏨 住宿參考</p>
            <div className="flex justify-between text-sm font-light mb-1">
              <span className="text-[#8A7F73]">每晚參考價</span>
              <span className="text-[#4B4037]">TWD {hotel.priceRange}</span>
            </div>
            <div className="flex justify-between text-sm font-light mb-3">
              <span className="text-[#8A7F73]">推薦住宿區</span>
              <span className="text-right text-[#4B4037] max-w-[60%]">{hotel.area}</span>
            </div>
            {picks && (
              <div className="space-y-2 mb-3">
                {picks.slice(0, 2).map((p) => (
                  <a key={p.name}
                    href={agodaUrl(p.agodaKeyword, state.depDate, state.retDate)}
                    target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl border border-[#E0D9D2] bg-white px-4 py-2 hover:border-[#A86F5A] transition">
                    <p className="text-sm font-light text-[#4B4037]">{p.name}</p>
                    <p className="text-xs font-light text-[#8A7F73]">{p.location}</p>
                  </a>
                ))}
              </div>
            )}
            <a href={bookingUrl(state.destination, state.depDate, state.retDate)}
              target="_blank" rel="noopener noreferrer"
              className="text-xs font-light text-[#A86F5A] hover:underline">
              Booking.com 查看更多 →
            </a>
          </div>
        )}

        {/* ── 預算估算 ── */}
        {budget && (
          <div className="mb-6 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-5">
            <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-3">💰 預算估算（{state.people} 人 · {dayCount} 天）</p>
            <div className="space-y-1">
              {[
                { label: "住宿", val: budget.hotel },
                { label: "餐飲", val: budget.food },
                { label: "交通", val: budget.transport },
                { label: "活動", val: budget.activity },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-sm font-light">
                  <span className="text-[#8A7F73]">{label}</span>
                  <span className="text-[#4B4037]">NT$ {val.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-[#D8D2C7] mt-2 pt-2 flex justify-between text-sm font-light">
                <span className="text-[#4B4037]">合計（不含機票）</span>
                <span className="font-medium text-[#A86F5A]">NT$ {(budget.total - budget.flight).toLocaleString()}</span>
              </div>
              <p className="text-xs font-light text-[#A79C91] mt-1">
                每人約 NT$ {Math.round((budget.total - budget.flight) / state.people).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={goToDocx}
          className="w-full rounded-full bg-[#A86F5A] py-5 text-lg font-light tracking-[0.2em] text-white shadow-md transition hover:bg-[#96604D] hover:shadow-lg mb-4"
        >
          進入計畫書 →
        </button>
        <button onClick={() => setStep(4)}
          className="w-full rounded-full border border-[#D8D2C7] py-3 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]">
          ← 重新生成行程
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      {/* Nav */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">Trip Wizard</span>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-6 pt-32 pb-20">
        <Progress step={step} />

        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {step === 5 && <Step5 />}
      </div>
    </main>
  );
}
