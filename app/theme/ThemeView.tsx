"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Dest = { name: string; flag: string; iata: string; note: string };
type Theme = {
  id: string;
  icon: string;
  label: string;
  desc: string;
  color: string;
  destinations: Dest[];
};

const THEMES: Theme[] = [
  {
    id: "beach",
    icon: "🏖️",
    label: "海島度假",
    desc: "沙灘・浮潛・度假村，放空首選",
    color: "from-[#3B82C4] to-[#60A5FA]",
    destinations: [
      { name: "峇里島", flag: "🇮🇩", iata: "DPS", note: "世界最美海島之一，烏布文化體驗" },
      { name: "宿霧", flag: "🇵🇭", iata: "CEB", note: "直飛4小時，OW潛水天堂" },
      { name: "普吉島", flag: "🇹🇭", iata: "HKT", note: "夜市+浮潛+料理課" },
      { name: "關島", flag: "🇬🇺", iata: "GUM", note: "美國領土免簽，藍海白沙" },
      { name: "沖繩", flag: "🇯🇵", iata: "OKA", note: "台灣直飛1.5小時，美海美食" },
    ],
  },
  {
    id: "food",
    icon: "🍜",
    label: "美食之旅",
    desc: "吃貨必去，每餐都是重點行程",
    color: "from-[#D97706] to-[#F59E0B]",
    destinations: [
      { name: "曼谷", flag: "🇹🇭", iata: "BKK", note: "街頭小吃天堂，米其林到夜市都有" },
      { name: "大阪", flag: "🇯🇵", iata: "KIX", note: "天下廚房，章魚燒/串炸/拉麵" },
      { name: "首爾", flag: "🇰🇷", iata: "ICN", note: "燒肉・部隊鍋・炸雞配啤酒" },
      { name: "香港", flag: "🇭🇰", iata: "HKG", note: "茶餐廳・點心・米其林最密集" },
      { name: "新加坡", flag: "🇸🇬", iata: "SIN", note: "小販中心4大族裔，海南雞飯必吃" },
    ],
  },
  {
    id: "shopping",
    icon: "🛍️",
    label: "購物血拼",
    desc: "藥妝・名牌・潮流，帶著空行李箱出發",
    color: "from-[#EC4899] to-[#F472B6]",
    destinations: [
      { name: "首爾", flag: "🇰🇷", iata: "ICN", note: "Olive Young・明洞・東大門24H" },
      { name: "東京", flag: "🇯🇵", iata: "NRT", note: "藥妝・電器・原宿・銀座" },
      { name: "大阪", flag: "🇯🇵", iata: "KIX", note: "心齋橋・難波・唐吉訶德" },
      { name: "香港", flag: "🇭🇰", iata: "HKG", note: "旺角・銅鑼灣・免稅精品" },
      { name: "新加坡", flag: "🇸🇬", iata: "SIN", note: "牛車水・ION・GST退稅" },
    ],
  },
  {
    id: "romantic",
    icon: "💑",
    label: "蜜月浪漫",
    desc: "情侶・求婚・紀念日，打造難忘回憶",
    color: "from-[#BE185D] to-[#EC4899]",
    destinations: [
      { name: "巴黎", flag: "🇫🇷", iata: "CDG", note: "愛的城市，鐵塔夜景永遠最浪漫" },
      { name: "峇里島", flag: "🇮🇩", iata: "DPS", note: "水上Villa，私人泳池+管家服務" },
      { name: "大阪", flag: "🇯🇵", iata: "KIX", note: "京都嵐山+大阪夜景" },
      { name: "新加坡", flag: "🇸🇬", iata: "SIN", note: "濱海灣花園燈光秀・遊輪晚餐" },
      { name: "東京", flag: "🇯🇵", iata: "NRT", note: "台場夜景・迪士尼・鐵塔求婚" },
    ],
  },
  {
    id: "family",
    icon: "👨‍👩‍👧",
    label: "親子同遊",
    desc: "迪士尼・樂園・孩子最愛的行程",
    color: "from-[#7C3AED] to-[#A78BFA]",
    destinations: [
      { name: "東京", flag: "🇯🇵", iata: "NRT", note: "迪士尼樂園・迪士尼海洋・teamLab" },
      { name: "香港", flag: "🇭🇰", iata: "HKG", note: "迪士尼・海洋公園・密集景點" },
      { name: "新加坡", flag: "🇸🇬", iata: "SIN", note: "環球影城・聖淘沙・動物園" },
      { name: "大阪", flag: "🇯🇵", iata: "KIX", note: "環球影城（哈利波特）・樂高樂園" },
      { name: "沖繩", flag: "🇯🇵", iata: "OKA", note: "美麗海水族館・短飛行距離親子友善" },
    ],
  },
  {
    id: "ski",
    icon: "⛷️",
    label: "滑雪看雪",
    desc: "粉雪・雪地活動・溫泉暖身",
    color: "from-[#0EA5E9] to-[#38BDF8]",
    destinations: [
      { name: "北海道", flag: "🇯🇵", iata: "CTS", note: "二世谷・富良野，全球最佳粉雪" },
      { name: "首爾", flag: "🇰🇷", iata: "ICN", note: "江原道・平昌，首爾2小時內" },
      { name: "大阪", flag: "🇯🇵", iata: "KIX", note: "白馬・野沢溫泉，關西雪場" },
      { name: "東京", flag: "🇯🇵", iata: "NRT", note: "苗場・草津，關東近郊雪場" },
    ],
  },
  {
    id: "culture",
    icon: "🏯",
    label: "文化歷史",
    desc: "古蹟・寺廟・博物館，深度旅行",
    color: "from-[#92400E] to-[#D97706]",
    destinations: [
      { name: "東京", flag: "🇯🇵", iata: "NRT", note: "淺草・皇居・江戶東京博物館" },
      { name: "首爾", flag: "🇰🇷", iata: "ICN", note: "景福宮・北村韓屋村・宗廟" },
      { name: "曼谷", flag: "🇹🇭", iata: "BKK", note: "大皇宮・玉佛寺・臥佛寺" },
      { name: "香港", flag: "🇭🇰", iata: "HKG", note: "九龍城・大館・摩羅街古董市場" },
      { name: "新加坡", flag: "🇸🇬", iata: "SIN", note: "牛車水・小印度・阿拉伯街" },
    ],
  },
  {
    id: "casino",
    icon: "🎰",
    label: "娛樂賭場",
    desc: "秀場・賭場・夜生活，成人的玩法",
    color: "from-[#1D4ED8] to-[#3B82F6]",
    destinations: [
      { name: "澳門", flag: "🇲🇴", iata: "MFM", note: "葡京・威尼斯人・大三巴，香港1小時" },
      { name: "新加坡", flag: "🇸🇬", iata: "SIN", note: "濱海灣金沙・聖淘沙名勝世界" },
    ],
  },
  {
    id: "nature",
    icon: "🌿",
    label: "自然療癒",
    desc: "森林・瀑布・火山，大自然充電",
    color: "from-[#15803D] to-[#4ADE80]",
    destinations: [
      { name: "清邁", flag: "🇹🇭", iata: "CNX", note: "叢林大象・梯田・蘭納文化" },
      { name: "峇里島", flag: "🇮🇩", iata: "DPS", note: "烏布梯田・阿貢火山・瀑布" },
      { name: "北海道", flag: "🇯🇵", iata: "CTS", note: "四季花田・知床・洞爺湖" },
      { name: "沖繩", flag: "🇯🇵", iata: "OKA", note: "珊瑚海・森林・離島徒步" },
      { name: "宿霧", flag: "🇵🇭", iata: "CEB", note: "與鯨鯊共泳・薄荷島巧克力山" },
    ],
  },
];

const DEST_TO_IATA: Record<string, string> = {
  東京: "NRT", 大阪: "KIX", 沖繩: "OKA", 福岡: "FUK", 北海道: "CTS",
  首爾: "ICN", 釜山: "PUS", 曼谷: "BKK", 清邁: "CNX", 普吉島: "HKT",
  新加坡: "SIN", 吉隆坡: "KUL", 峇里島: "DPS", 香港: "HKG", 澳門: "MFM",
  胡志明市: "SGN", 河內: "HAN", 宿霧: "CEB", 馬尼拉: "MNL",
  關島: "GUM", 巴黎: "CDG",
};

export default function ThemeView() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const activeTheme = THEMES.find((t) => t.id === selected);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">依心情選目的地</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Travel by Mood</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">你想要哪種旅行？</h1>
          <p className="text-sm font-light text-[#8A7F73]">選一個心情，找到最適合你的目的地</p>
        </div>

        {/* Theme 選擇 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 mb-10">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(selected === t.id ? null : t.id)}
              className={`rounded-[1.5rem] border p-5 text-left transition-all
                ${selected === t.id
                  ? "border-[#A86F5A] bg-[#A86F5A]/10 shadow-md"
                  : "border-[#D8D2C7] bg-[#FBF8F1] hover:border-[#A86F5A]/50 hover:bg-[#FFFDF8]"}`}
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-sm font-light tracking-wide text-[#4B4037]">{t.label}</div>
              <div className="text-xs font-light text-[#8A7F73] mt-1 leading-5">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* 展開的目的地清單 */}
        {activeTheme && (
          <div className="animate-in fade-in duration-300">
            <div className={`rounded-[2rem] bg-gradient-to-r ${activeTheme.color} p-px mb-6`}>
              <div className="rounded-[2rem] bg-[#FBF8F1] p-6">
                <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-1">
                  {activeTheme.icon} {activeTheme.label}
                </p>
                <p className="text-sm font-light text-[#6F675F]">{activeTheme.desc}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeTheme.destinations.map((dest) => (
                <div
                  key={dest.iata}
                  className="rounded-[1.5rem] border border-[#D8D2C7] bg-[#FBF8F1] p-5 hover:border-[#A86F5A] transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{dest.flag}</span>
                    <span className="text-base font-light tracking-wide">{dest.name}</span>
                  </div>
                  <p className="text-xs font-light text-[#6F675F] leading-5 mb-4">{dest.note}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/wizard?dest=${encodeURIComponent(dest.name)}`)}
                      className="flex-1 rounded-full bg-[#A86F5A] py-2.5 text-xs font-light tracking-wider text-white transition hover:bg-[#96604D]"
                    >
                      規劃行程 →
                    </button>
                    <a
                      href={`https://www.skyscanner.com.tw/transport/flights/tpe/${dest.iata.toLowerCase()}/?adults=1&currency=TWD&locale=zh-TW`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2.5 text-xs font-light text-[#6F675F] transition hover:border-[#A86F5A]"
                    >
                      查機票
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Bonus CTA */}
            <div className="mt-6 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-light text-[#4B4037]">不確定哪個最好？</p>
                <p className="text-xs font-light text-[#8A7F73]">讓 AI 根據你的偏好推薦完整行程</p>
              </div>
              <button
                onClick={() => router.push("/wizard")}
                className="rounded-full bg-[#A86F5A] px-8 py-3 text-sm font-light tracking-wider text-white transition hover:bg-[#96604D] whitespace-nowrap"
              >
                ✨ AI 客製行程 →
              </button>
            </div>
          </div>
        )}

        {/* 未選擇時的提示 */}
        {!selected && (
          <div className="rounded-[2rem] border border-dashed border-[#D8D2C7] bg-[#FBF8F1]/50 py-12 text-center">
            <p className="text-2xl mb-3">☝️</p>
            <p className="text-sm font-light text-[#8A7F73]">點選上方卡片，看符合主題的目的地推薦</p>
          </div>
        )}

        {/* 底部 CTA */}
        <div className="mt-10 flex gap-3">
          <button
            onClick={() => router.push("/flights")}
            className="flex-1 rounded-full border border-[#D8D2C7] bg-[#FBF8F1] py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]"
          >
            ✈️ 搜尋機票
          </button>
          <button
            onClick={() => router.push("/wizard")}
            className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-wider text-white shadow-md transition hover:bg-[#96604D]"
          >
            ✨ AI 規劃行程
          </button>
        </div>
      </div>
    </main>
  );
}
