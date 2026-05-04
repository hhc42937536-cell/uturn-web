"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const TABS = ["💱 匯率換算", "💰 預算計算", "🧳 行李清單", "🌤️ 天氣預報", "🕐 當地時間"];

const CITIES = ["首爾", "東京", "大阪", "沖繩", "釜山", "曼谷", "新加坡", "香港", "胡志明市"];

const CURRENCY_MAP: Record<string, string> = {
  首爾: "KRW", 東京: "JPY", 大阪: "JPY", 沖繩: "JPY", 釜山: "KRW",
  曼谷: "THB", 新加坡: "SGD", 香港: "HKD", 胡志明市: "VND",
};

const CURRENCY_NAMES: Record<string, string> = {
  KRW: "韓元", JPY: "日圓", THB: "泰銖", SGD: "新幣", HKD: "港幣", VND: "越盾",
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  首爾: { lat: 37.5665, lng: 126.978 },
  東京: { lat: 35.6762, lng: 139.6503 },
  大阪: { lat: 34.6937, lng: 135.5023 },
  沖繩: { lat: 26.2124, lng: 127.6792 },
  釜山: { lat: 35.1796, lng: 129.0756 },
  曼谷: { lat: 13.7563, lng: 100.5018 },
  新加坡: { lat: 1.3521, lng: 103.8198 },
  香港: { lat: 22.3193, lng: 114.1694 },
  胡志明市: { lat: 10.8231, lng: 106.6297 },
};

const CITY_TIMEZONES: Record<string, string> = {
  首爾: "Asia/Seoul",
  東京: "Asia/Tokyo",
  大阪: "Asia/Tokyo",
  沖繩: "Asia/Tokyo",
  釜山: "Asia/Seoul",
  曼谷: "Asia/Bangkok",
  新加坡: "Asia/Singapore",
  香港: "Asia/Hong_Kong",
  胡志明市: "Asia/Ho_Chi_Minh",
};

const CITY_TZ_DIFF: Record<string, string> = {
  首爾: "+1小時", 東京: "+1小時", 大阪: "+1小時", 沖繩: "+1小時", 釜山: "+1小時",
  曼谷: "-1小時", 新加坡: "同時區", 香港: "同時區", 胡志明市: "-1小時",
};

const PACKING_CATEGORIES = [
  { name: "證件類", items: ["護照", "機票訂位確認", "台幣現金", "信用卡", "國際學生證(選)"] },
  { name: "衣物類", items: ["上衣 × 天數", "褲子 / 裙子", "外套", "內衣褲 × 天數", "睡衣", "運動鞋"] },
  { name: "盥洗類", items: ["牙刷 + 牙膏", "洗髮精", "潤髮乳", "沐浴乳", "乳液", "刮鬍刀(選)"] },
  { name: "電子類", items: ["手機 + 充電器", "行動電源", "相機 + 記憶卡", "萬用轉接頭", "耳機"] },
  { name: "藥品類", items: ["感冒藥", "止痛藥", "腸胃藥", "暈車藥", "OK繃 + 碘酒"] },
  { name: "其他類", items: ["雨傘 / 雨衣", "太陽眼鏡", "防曬乳 SPF50+", "環保袋", "旅行枕(選)"] },
];

const ALL_ITEMS = PACKING_CATEGORIES.flatMap((c) => c.items.map((item) => `${c.name}::${item}`));

function weatherIcon(c: number): string {
  if (c === 0) return "☀️";
  if (c <= 3) return "⛅";
  if (c <= 48) return "🌫️";
  if (c <= 67) return "🌧️";
  if (c <= 77) return "❄️";
  if (c <= 82) return "🌦️";
  return "⛈️";
}

const DAY_NAMES = "日一二三四五六";

// ── Tab: 匯率換算 ──────────────────────────────────────────────
function CurrencyTab() {
  const [city, setCity] = useState("首爾");
  const [twd, setTwd] = useState(1000);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currency = CURRENCY_MAP[city];
    setLoading(true);
    fetch(`https://open.er-api.com/v6/latest/TWD`)
      .then((r) => r.json())
      .then((d) => {
        setRate(d.rates?.[currency] ?? null);
        setLoading(false);
      })
      .catch(() => {
        // fallback to Frankfurter
        fetch(`https://api.frankfurter.app/latest?from=TWD&to=${currency}`)
          .then((r) => r.json())
          .then((d) => { setRate(d.rates?.[currency] ?? null); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, [city]);

  const currency = CURRENCY_MAP[city];
  const converted = rate != null ? twd * rate : null;
  const checkAmounts = [100, 500, 1000, 5000, 10000];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-light text-[#6F675F]">目的地城市</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 w-full rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 text-sm font-light text-[#4B4037] outline-none focus:border-[#A86F5A]"
          >
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-light text-[#6F675F]">台幣金額 (TWD)</label>
          <input
            type="number"
            value={twd}
            onChange={(e) => setTwd(Number(e.target.value))}
            className="h-12 w-full rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 text-sm font-light text-[#4B4037] outline-none focus:border-[#A86F5A]"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-6 text-center">
        {loading ? (
          <p className="text-sm text-[#8FA39A]">載入匯率中…</p>
        ) : rate != null ? (
          <>
            <p className="text-5xl font-light tracking-wide text-[#A86F5A]">
              {Math.round(converted!).toLocaleString()}
            </p>
            <p className="mt-2 text-sm font-light text-[#6F675F]">{CURRENCY_NAMES[currency]}</p>
            <p className="mt-1 text-xs text-[#8A7F73]">1 TWD ≈ {rate.toFixed(4)} {currency}</p>
          </>
        ) : (
          <p className="text-sm text-red-400">匯率載入失敗，請稍後再試</p>
        )}
      </div>

      {rate != null && (
        <div className="overflow-hidden rounded-2xl border border-[#D8D2C7]">
          <table className="w-full text-sm font-light">
            <thead className="bg-[#EDE7DD]">
              <tr>
                <th className="px-4 py-3 text-left text-xs tracking-widest text-[#6F675F]">台幣 TWD</th>
                <th className="px-4 py-3 text-right text-xs tracking-widest text-[#6F675F]">{CURRENCY_NAMES[currency]} {currency}</th>
              </tr>
            </thead>
            <tbody>
              {checkAmounts.map((amt, i) => (
                <tr key={amt} className={i % 2 === 0 ? "bg-white" : "bg-[#FFFDF8]"}>
                  <td className="px-4 py-3 text-[#4B4037]">{amt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-[#A86F5A]">{Math.round(amt * rate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab: 預算計算 ──────────────────────────────────────────────
function BudgetTab() {
  const [city, setCity] = useState("首爾");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [people, setPeople] = useState(2);
  const [flight, setFlight] = useState(8000);
  const [hotel, setHotel] = useState(2000);
  const [food, setFood] = useState(800);
  const [activities, setActivities] = useState(500);
  const [shopping, setShopping] = useState(2000);

  const nights = departureDate && returnDate
    ? Math.max(0, Math.round((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / 86400000))
    : 0;

  const flightTotal = flight * people;
  const hotelTotal = hotel * nights * people;
  const foodTotal = food * nights * people;
  const actTotal = activities * nights * people;
  const total = flightTotal + hotelTotal + foodTotal + actTotal + shopping;

  const bars = [
    { label: "機票", value: flightTotal, color: "bg-[#8FA39A]" },
    { label: "住宿", value: hotelTotal, color: "bg-[#A86F5A]" },
    { label: "餐飲", value: foodTotal, color: "bg-[#C4A882]" },
    { label: "活動", value: actTotal, color: "bg-[#7A9A8A]" },
    { label: "購物", value: shopping, color: "bg-[#B8A090]" },
  ];

  const SliderRow = ({ label, value, onChange, min = 0, max, step = 100 }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max: number; step?: number;
  }) => (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-light text-[#6F675F]">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[#A86F5A]" />
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded-lg border border-[#D8D2C7] bg-[#FFFDF8] px-2 py-1 text-right text-xs text-[#4B4037] outline-none" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-light text-[#6F675F]">目的地</label>
          <select value={city} onChange={(e) => setCity(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] px-3 text-sm font-light outline-none focus:border-[#A86F5A]">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-light text-[#6F675F]">出發日期</label>
          <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] px-3 text-sm font-light outline-none focus:border-[#A86F5A]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-light text-[#6F675F]">回程日期</label>
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] px-3 text-sm font-light outline-none focus:border-[#A86F5A]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-light text-[#6F675F]">人數</label>
          <input type="number" min={1} max={10} value={people} onChange={(e) => setPeople(Number(e.target.value))}
            className="h-10 w-full rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] px-3 text-sm font-light outline-none focus:border-[#A86F5A]" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 space-y-4">
        <p className="text-xs font-light tracking-widest text-[#6F675F]">每人費用設定 (TWD)</p>
        <SliderRow label="機票/人" value={flight} onChange={setFlight} max={30000} />
        <SliderRow label="住宿/晚" value={hotel} onChange={setHotel} max={10000} />
        <SliderRow label="餐飲/天" value={food} onChange={setFood} max={3000} />
        <SliderRow label="活動/天" value={activities} onChange={setActivities} max={3000} />
        <SliderRow label="購物總額" value={shopping} onChange={setShopping} max={50000} step={500} />
      </div>

      {nights > 0 && (
        <div className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 space-y-4">
          <p className="text-xs font-light tracking-widest text-[#6F675F]">費用明細（{nights}晚 · {people}人 · {city}）</p>
          {bars.map(({ label, value, color }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs font-light text-[#6F675F]">
                <span>{label}</span>
                <span>TWD {value.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EDE7DD]">
                <div
                  className={`h-2 rounded-full ${color} transition-all`}
                  style={{ width: total > 0 ? `${(value / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
          <div className="border-t border-[#D8D2C7] pt-4 flex justify-between">
            <div>
              <p className="text-xs font-light text-[#6F675F]">總費用</p>
              <p className="text-3xl font-light text-[#A86F5A]">TWD {total.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-light text-[#6F675F]">每人</p>
              <p className="text-xl font-light text-[#4B4037]">TWD {Math.round(total / people).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: 行李清單 ──────────────────────────────────────────────
function PackingTab() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("uturn-packing-v1");
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
    setMounted(true);
  }, []);

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try { localStorage.setItem("uturn-packing-v1", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const checkAll = () => {
    const next = new Set(ALL_ITEMS);
    setChecked(next);
    try { localStorage.setItem("uturn-packing-v1", JSON.stringify([...next])); } catch {}
  };

  const clearAll = () => {
    setChecked(new Set());
    try { localStorage.removeItem("uturn-packing-v1"); } catch {}
  };

  const total = ALL_ITEMS.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);

  if (!mounted) return <div className="py-12 text-center text-sm text-[#8FA39A]">載入中…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs font-light text-[#6F675F]">
            <span>已勾選 {done} / {total} 項</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#EDE7DD]">
            <div className="h-2 rounded-full bg-[#8FA39A] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="ml-4 flex gap-2">
          <button onClick={clearAll} className="rounded-lg border border-[#D8D2C7] px-3 py-1 text-xs font-light text-[#6F675F] hover:border-red-300 hover:text-red-400">全部清除</button>
          <button onClick={checkAll} className="rounded-lg border border-[#A86F5A] px-3 py-1 text-xs font-light text-[#A86F5A] hover:bg-[#A86F5A] hover:text-white">全部勾選</button>
        </div>
      </div>

      {PACKING_CATEGORIES.map((cat) => (
        <div key={cat.name} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-4">
          <p className="mb-3 text-xs font-light tracking-widest text-[#6F675F]">{cat.name}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {cat.items.map((item) => {
              const key = `${cat.name}::${item}`;
              const isChecked = checked.has(key);
              return (
                <button
                  key={item}
                  onClick={() => toggle(key)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-light transition ${
                    isChecked
                      ? "bg-[#8FA39A]/20 text-[#4B4037] line-through decoration-[#8FA39A]"
                      : "bg-white text-[#4B4037] hover:bg-[#F0EBE3]"
                  }`}
                >
                  <span className={`h-4 w-4 flex-shrink-0 rounded border text-center text-xs leading-4 ${isChecked ? "border-[#8FA39A] bg-[#8FA39A] text-white" : "border-[#D8D2C7]"}`}>
                    {isChecked ? "✓" : ""}
                  </span>
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: 天氣預報 ──────────────────────────────────────────────
function WeatherTab() {
  const [city, setCity] = useState("首爾");
  const [forecast, setForecast] = useState<{ date: string; code: number; max: number; min: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { lat, lng } = CITY_COORDS[city];
    setLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
    )
      .then((r) => r.json())
      .then((d) => {
        const days = d.daily?.time?.map((date: string, i: number) => ({
          date,
          code: d.daily.weathercode[i],
          max: Math.round(d.daily.temperature_2m_max[i]),
          min: Math.round(d.daily.temperature_2m_min[i]),
        })) ?? [];
        setForecast(days);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [city]);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-light text-[#6F675F]">選擇城市</label>
        <select value={city} onChange={(e) => setCity(e.target.value)}
          className="h-12 w-full rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 text-sm font-light outline-none focus:border-[#A86F5A]">
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#8FA39A]">載入天氣中…</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {forecast.map(({ date, code, max, min }) => {
            const d = new Date(date);
            const dayName = `週${DAY_NAMES[d.getDay()]}`;
            const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;
            return (
              <div key={date} className="flex-shrink-0 w-28 rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-4 text-center">
                <p className="text-xs font-light text-[#8A7F73]">{dayName}</p>
                <p className="text-xs font-light text-[#A79C91]">{mmdd}</p>
                <p className="my-2 text-3xl">{weatherIcon(code)}</p>
                <p className="text-sm font-light text-[#A86F5A]">{max}°</p>
                <p className="text-xs font-light text-[#8A7F73]">{min}°</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: 當地時間 ──────────────────────────────────────────────
function TimeTab() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (date: Date, tz: string) =>
    date.toLocaleTimeString("zh-TW", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const fmtDate = (date: Date, tz: string) =>
    date.toLocaleDateString("zh-TW", { timeZone: tz, month: "long", day: "numeric", weekday: "short" });

  const twTime = fmt(now, "Asia/Taipei");
  const twDate = fmtDate(now, "Asia/Taipei");

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#A86F5A]/30 bg-[#FBF3EE] p-5 text-center">
        <p className="text-xs font-light tracking-widest text-[#6F675F]">🇹🇼 台灣時間</p>
        <p className="mt-2 text-4xl font-light tabular-nums text-[#A86F5A]">{twTime}</p>
        <p className="mt-1 text-sm font-light text-[#8A7F73]">{twDate}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city) => {
          const tz = CITY_TIMEZONES[city];
          const diff = CITY_TZ_DIFF[city];
          return (
            <div key={city} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-light text-[#4B4037]">{city}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-light ${
                  diff === "同時區" ? "bg-[#8FA39A]/20 text-[#8FA39A]" :
                  diff.startsWith("+") ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-500"
                }`}>{diff}</span>
              </div>
              <p className="mt-2 text-2xl font-light tabular-nums text-[#4B4037]">{fmt(now, tz)}</p>
              <p className="mt-0.5 text-xs font-light text-[#8A7F73]">{fmtDate(now, tz)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────
export default function ToolsView() {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🧰 旅行工具箱</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        {/* Tab bar */}
        <div className="mb-8 flex overflow-x-auto gap-2 pb-1">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-light transition ${
                tab === i
                  ? "bg-[#A86F5A] text-white"
                  : "border border-[#D8D2C7] bg-white text-[#6F675F] hover:border-[#A86F5A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && <CurrencyTab />}
        {tab === 1 && <BudgetTab />}
        {tab === 2 && <PackingTab />}
        {tab === 3 && <WeatherTab />}
        {tab === 4 && <TimeTab />}
      </div>
    </main>
  );
}
