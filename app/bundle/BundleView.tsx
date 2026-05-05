"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Affiliate URL builders ────────────────────────────────────────────────────

function skyscanner(from: string, to: string, dep: string, ret: string) {
  const d = dep.replace(/-/g, ""), r = ret.replace(/-/g, "");
  let url = `https://www.skyscanner.com.tw/transport/flights/${from}/${to}`;
  if (d) { url += `/${d}`; if (r) url += `/${r}`; }
  return url + "/?adultsv2=1&cabinclass=economy&currency=TWD&locale=zh-TW";
}

function agoda(city: string, checkin: string, checkout: string) {
  const p = new URLSearchParams({ q: city, currency: "TWD", language: "zh-tw" });
  if (checkin) { p.set("checkIn", checkin); p.set("checkOut", checkout || checkin); }
  return `https://www.agoda.com/zh-tw/search?${p}`;
}

function booking(city: string) {
  return `https://www.booking.com/searchresults.zh-tw.html?ss=${encodeURIComponent(city)}`;
}

function kkday(city: string) {
  return `https://www.kkday.com/zh-tw/country?city=${encodeURIComponent(city)}`;
}

function klook(city: string) {
  return `https://www.klook.com/zh-TW/search/?query=${encodeURIComponent(city)}`;
}

// ── Static data ───────────────────────────────────────────────────────────────

const IATA: Record<string, string> = {
  首爾: "ICN", 東京: "NRT", 大阪: "KIX", 沖繩: "OKA",
  曼谷: "BKK", 新加坡: "SIN", 香港: "HKG", 胡志明市: "SGN", 吉隆坡: "KUL",
};

const ORIGINS = [
  { code: "KHH", label: "高雄（KHH）" },
  { code: "TPE", label: "台北（TPE）" },
  { code: "RMQ", label: "台中（RMQ）" },
  { code: "TNN", label: "台南（TNN）" },
];

const DESTINATIONS = ["首爾", "東京", "大阪", "沖繩", "曼谷", "新加坡", "香港", "胡志明市", "吉隆坡"];

// 參考住宿均價 / 晚 (NT$)
const HOTEL_REF: Record<string, { budget: number; mid: number; luxury: number }> = {
  首爾:   { budget: 1200, mid: 3000, luxury: 8000 },
  東京:   { budget: 1800, mid: 4500, luxury: 12000 },
  大阪:   { budget: 1500, mid: 3800, luxury: 10000 },
  沖繩:   { budget: 2000, mid: 4000, luxury: 9000 },
  曼谷:   { budget: 800,  mid: 2000, luxury: 6000 },
  新加坡: { budget: 2500, mid: 5500, luxury: 15000 },
  香港:   { budget: 2000, mid: 4500, luxury: 13000 },
  胡志明市:{ budget: 600, mid: 1500, luxury: 5000 },
  吉隆坡: { budget: 700,  mid: 1800, luxury: 5500 },
};

// 熱門票券 / 體驗 (NT$ 參考價)
const TICKETS: Record<string, { name: string; price: number; link: string }[]> = {
  首爾: [
    { name: "N首爾塔電梯票", price: 420, link: "https://www.klook.com/zh-TW/search/?query=N首爾塔" },
    { name: "HYBE Insight 展覽", price: 600, link: "https://www.klook.com/zh-TW/search/?query=HYBE" },
    { name: "Nanta 表演秀", price: 1200, link: "https://www.kkday.com/zh-tw/country?city=首爾" },
    { name: "DMZ 半日遊", price: 1800, link: "https://www.klook.com/zh-TW/search/?query=DMZ" },
  ],
  東京: [
    { name: "teamLab Planets", price: 1800, link: "https://www.klook.com/zh-TW/search/?query=teamlab" },
    { name: "東京迪士尼一日票", price: 5400, link: "https://www.klook.com/zh-TW/search/?query=東京迪士尼" },
    { name: "淺草人力車 30 分鐘", price: 1500, link: "https://www.klook.com/zh-TW/search/?query=淺草人力車" },
    { name: "富士山一日遊", price: 2500, link: "https://www.kkday.com/zh-tw/country?city=東京" },
  ],
  大阪: [
    { name: "USJ 一日票", price: 3200, link: "https://www.klook.com/zh-TW/search/?query=USJ" },
    { name: "大阪城天守閣", price: 240, link: "https://www.kkday.com/zh-tw/country?city=大阪" },
    { name: "道頓堀水上觀光船", price: 360, link: "https://www.klook.com/zh-TW/search/?query=道頓堀水上觀光船" },
    { name: "大阪周遊卡 2 日", price: 1100, link: "https://www.klook.com/zh-TW/search/?query=大阪周遊卡" },
  ],
  曼谷: [
    { name: "大皇宮＋臥佛寺", price: 600, link: "https://www.klook.com/zh-TW/search/?query=大皇宮" },
    { name: "昭披耶河夜遊", price: 900, link: "https://www.kkday.com/zh-tw/country?city=曼谷" },
    { name: "泰拳表演秀", price: 1200, link: "https://www.klook.com/zh-TW/search/?query=泰拳" },
    { name: "芭提雅一日遊", price: 1500, link: "https://www.klook.com/zh-TW/search/?query=芭提雅" },
  ],
  新加坡: [
    { name: "濱海灣花園入園", price: 900, link: "https://www.klook.com/zh-TW/search/?query=濱海灣花園" },
    { name: "環球影城一日票", price: 3200, link: "https://www.klook.com/zh-TW/search/?query=新加坡環球影城" },
    { name: "聖淘沙纜車", price: 600, link: "https://www.klook.com/zh-TW/search/?query=聖淘沙纜車" },
    { name: "新加坡動物園", price: 1500, link: "https://www.klook.com/zh-TW/search/?query=新加坡動物園" },
  ],
  香港: [
    { name: "山頂纜車", price: 600, link: "https://www.klook.com/zh-TW/search/?query=山頂纜車" },
    { name: "大嶼山纜車 + 天壇大佛", price: 900, link: "https://www.klook.com/zh-TW/search/?query=大嶼山" },
    { name: "維港夜遊", price: 450, link: "https://www.kkday.com/zh-tw/country?city=香港" },
    { name: "海洋公園", price: 1500, link: "https://www.klook.com/zh-TW/search/?query=海洋公園" },
  ],
  沖繩: [
    { name: "美麗海水族館門票", price: 900, link: "https://www.klook.com/zh-TW/search/?query=美麗海水族館" },
    { name: "浮潛體驗", price: 1500, link: "https://www.kkday.com/zh-tw/country?city=沖繩" },
    { name: "首里城入園", price: 300, link: "https://www.klook.com/zh-TW/search/?query=首里城" },
    { name: "古宇利島一日遊", price: 1800, link: "https://www.klook.com/zh-TW/search/?query=古宇利島" },
  ],
  胡志明市: [
    { name: "古芝地道半日遊", price: 600, link: "https://www.klook.com/zh-TW/search/?query=古芝地道" },
    { name: "湄公河三角洲一日遊", price: 1200, link: "https://www.kkday.com/zh-tw/country?city=胡志明市" },
    { name: "越南烹飪課", price: 900, link: "https://www.klook.com/zh-TW/search/?query=越南烹飪課" },
    { name: "西貢河夜遊", price: 750, link: "https://www.klook.com/zh-TW/search/?query=西貢河" },
  ],
  吉隆坡: [
    { name: "雙峰塔觀景台", price: 450, link: "https://www.klook.com/zh-TW/search/?query=雙峰塔" },
    { name: "黑風洞", price: 0, link: "https://www.kkday.com/zh-tw/country?city=吉隆坡" },
    { name: "吉隆坡一日遊", price: 1200, link: "https://www.klook.com/zh-TW/search/?query=吉隆坡一日遊" },
    { name: "環球影城（新山）", price: 2500, link: "https://www.klook.com/zh-TW/search/?query=新山環球影城" },
  ],
};

function fmt(n: number) { return n.toLocaleString("zh-TW"); }

// ── Component ─────────────────────────────────────────────────────────────────

export default function BundleView() {
  const router = useRouter();
  const [form, setForm] = useState({
    dest: "首爾", origin: "KHH", depDate: "", retDate: "", people: "2", hotelLevel: "mid",
  });
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const nights = form.depDate && form.retDate
    ? Math.max(0, Math.round((new Date(form.retDate).getTime() - new Date(form.depDate).getTime()) / 86400000))
    : 5;
  const peopleN = parseInt(form.people);
  const iata = IATA[form.dest] ?? "ICN";
  const hotel = HOTEL_REF[form.dest] ?? { budget: 1500, mid: 3500, luxury: 9000 };
  const hotelPerNight = hotel[form.hotelLevel as keyof typeof hotel];
  const tickets = TICKETS[form.dest] ?? [];

  const flightRef = { KHH: 4500, TPE: 4000, RMQ: 5000, TNN: 4800 }[form.origin] ?? 4500;
  const flightTotal = flightRef * peopleN * 2;
  const hotelTotal = hotelPerNight * nights;
  const ticketTotal = tickets.filter((t) => selected[t.name]).reduce((s, t) => s + t.price * peopleN, 0);
  const grandTotal = flightTotal + hotelTotal + ticketTotal;
  const perPerson = Math.round(grandTotal / peopleN);

  const inputClass = "h-11 w-full rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 text-sm font-light text-[#4B4037] outline-none focus:border-[#8FA39A]";

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🎒 打包比價</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Bundle Price · Total Cost Estimator</p>
          <h1 className="text-3xl font-light tracking-wide">機票＋住宿＋票券<br className="sm:hidden" />打包比價</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            選好目的地與行程天數，勾選想參加的活動，即時試算這趟旅行的真實總花費。
          </p>
        </div>

        {/* Form */}
        <div className="mb-8 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">目的地</span>
              <select value={form.dest} onChange={(e) => setForm((p) => ({ ...p, dest: e.target.value }))} className={inputClass}>
                {DESTINATIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">出發地</span>
              <select value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))} className={inputClass}>
                {ORIGINS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">人數</span>
              <select value={form.people} onChange={(e) => setForm((p) => ({ ...p, people: e.target.value }))} className={inputClass}>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}人</option>)}
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
              <span className="mb-1.5 block text-xs font-light tracking-widest text-[#6F675F]">住宿等級</span>
              <select value={form.hotelLevel} onChange={(e) => setForm((p) => ({ ...p, hotelLevel: e.target.value }))} className={inputClass}>
                <option value="budget">預算型（背包客）</option>
                <option value="mid">中級（舒適商旅）</option>
                <option value="luxury">豪華（4–5 星）</option>
              </select>
            </label>
          </div>
        </div>

        {/* Ticket picker */}
        <div className="mb-8">
          <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">🎟️ 選擇票券 / 體驗</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tickets.map((t) => (
              <label key={t.name}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  selected[t.name] ? "border-[#A86F5A] bg-[#FDF6ED]" : "border-[#D8D2C7] bg-[#FBF8F1] hover:border-[#A86F5A]/40"
                }`}
              >
                <input type="checkbox" className="mt-0.5 accent-[#A86F5A]"
                  checked={!!selected[t.name]}
                  onChange={(e) => setSelected((p) => ({ ...p, [t.name]: e.target.checked }))} />
                <div className="flex-1">
                  <div className="text-sm font-light text-[#3A2E26]">{t.name}</div>
                  <div className="mt-0.5 text-xs font-light text-[#A86F5A]">
                    {t.price === 0 ? "免費" : `NT$ ${fmt(t.price)} / 人`}
                    {t.price > 0 && <span className="ml-1 text-[#A79C91]">（{peopleN}人共 NT$ {fmt(t.price * peopleN)}）</span>}
                  </div>
                </div>
                <a href={t.link} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 text-[11px] font-light text-[#8FA39A] hover:text-[#A86F5A]">查票 →</a>
              </label>
            ))}
          </div>
        </div>

        {/* Cost summary */}
        <div className="mb-8 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 md:p-8">
          <h2 className="mb-5 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">💰 預算試算</h2>
          <div className="space-y-3">
            {[
              { label: `✈️ 機票（來回，${peopleN}人）`, note: "參考均價，實際請查 Skyscanner", amount: flightTotal, href: skyscanner(form.origin, iata, form.depDate, form.retDate) },
              { label: `🏨 住宿（${nights} 晚，${form.hotelLevel === "budget" ? "預算型" : form.hotelLevel === "mid" ? "中級" : "豪華"}）`, note: `約 NT$ ${fmt(hotelPerNight)} / 晚`, amount: hotelTotal, href: agoda(form.dest, form.depDate, form.retDate) },
              ...Object.keys(selected).filter((k) => selected[k]).map((k) => {
                const t = tickets.find((tk) => tk.name === k)!;
                return { label: `🎟️ ${k}`, note: `NT$ ${fmt(t.price)} × ${peopleN}人`, amount: t.price * peopleN, href: t.link };
              }),
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[#E8E2D8] bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-light text-[#3A2E26]">{row.label}</div>
                  <div className="text-[11px] font-light text-[#A79C91]">{row.note}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-light text-[#4B4037]">NT$ {fmt(row.amount)}</span>
                  <a href={row.href} target="_blank" rel="noopener noreferrer"
                    className="rounded-full border border-[#D8D2C7] px-3 py-1 text-[11px] font-light text-[#6F675F] hover:border-[#A86F5A]/50 hover:text-[#A86F5A]">
                    比價 →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[#A86F5A]/30 bg-[#FDF6ED] px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-light text-[#5C5248]">🧾 預估總花費</span>
              <span className="text-xl font-light text-[#A86F5A]">NT$ {fmt(grandTotal)}</span>
            </div>
            <div className="mt-1 text-right text-xs font-light text-[#A79C91]">每人約 NT$ {fmt(perPerson)}</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mb-8">
          <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">🔗 快速比價連結</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "✈️", label: "Skyscanner 機票", href: skyscanner(form.origin, iata, form.depDate, form.retDate) },
              { icon: "🏨", label: "Agoda 住宿", href: agoda(form.dest, form.depDate, form.retDate) },
              { icon: "🏨", label: "Booking.com", href: booking(form.dest) },
              { icon: "🎟️", label: "KKday 票券活動", href: kkday(form.dest) },
              { icon: "🎡", label: "Klook 體驗", href: klook(form.dest) },
              { icon: "🌏", label: "Google Flights 探索", href: "https://www.google.com/travel/explore?tfs=CBwQAxocagwIAhIIL20vMDRibnhyDAgEEggvbS8wMmo3MRocagwIBBIIL20vMDJqNzFyDAgCEggvbS8wNGJueEABSAFwAoIBCwj___________8BmAEBsgEEGAEgAQ&tfu=GgA&hl=zh-TW" },
            ].map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-5 py-4 text-sm font-light text-[#4B4037] transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]">
                <span className="text-lg">{l.icon}</span>
                <span>{l.label}</span>
                <span className="ml-auto text-[#A79C91]">→</span>
              </a>
            ))}
          </div>
        </div>

        <p className="mb-8 text-xs font-light text-[#A79C91]">
          ＊機票及住宿費用為歷史參考均價，實際請以各平台即時報價為準。票券價格以新台幣計算，部分平台以原幣計費請注意匯率。
          本站為 Travelpayouts 及相關平台聯盟合作夥伴，透過本站連結購買可支持出國優轉持續營運，不影響您的購買價格。
        </p>

        {/* CTA */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8 text-center">
          <p className="mb-2 text-sm font-light tracking-wide text-[#6F675F]">預算抓好了？</p>
          <p className="mb-6 text-xs font-light text-[#A79C91]">讓 AI 把完整 {form.dest} 行程一起規劃好</p>
          <button onClick={() => router.push(`/trip/${encodeURIComponent(form.dest)}`)}
            className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-10 py-3.5 text-sm font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25">
            規劃 {form.dest} 完整行程
          </button>
        </div>
      </div>
    </main>
  );
}
