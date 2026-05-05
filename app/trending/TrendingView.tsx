"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TrendItem = { emoji: string; name: string; note: string; tag?: string };
type Section = { title: string; items: TrendItem[] };
type Country = { id: string; flag: string; name: string; sections: Section[] };

const DATA: Country[] = [
  {
    id: "kr", flag: "🇰🇷", name: "韓國",
    sections: [
      {
        title: "Olive Young 本季熱銷",
        items: [
          { emoji: "🌿", name: "Anua 牛油果精華", note: "保濕神器，補貨速度比消耗快不了多少", tag: "斷貨中" },
          { emoji: "🫧", name: "COSRX 痘痘貼", note: "幾乎每個台灣人的行李都有一盒" },
          { emoji: "☀️", name: "Beauty of Joseon 防曬", note: "新款加了玻尿酸，質地超輕盈" },
          { emoji: "🌸", name: "Round Lab 樺木水精華", note: "整個系列都在瘋，早買早享受", tag: "話題款" },
          { emoji: "🧴", name: "Some By Mi AHA 去角質", note: "暗沉肌膚救星，77次挑戰系列" },
          { emoji: "💋", name: "Rom&nd 奶油唇釉", note: "本季新色 #17 裸棕超搶手" },
        ],
      },
      {
        title: "這個月最夯體驗",
        items: [
          { emoji: "♨️", name: "龍山汗蒸幕", note: "24小時營業，凌晨去最爽也最划算", tag: "在地首選" },
          { emoji: "🎨", name: "聖水洞咖啡街", note: "IG 打卡聖地，最新裝置藝術展持續更新" },
          { emoji: "🍺", name: "弘大夜生活", note: "週末人超多，建議平日去；Gopchang 必吃" },
          { emoji: "🎭", name: "SMTOWN 三成站", note: "藝人常出沒，周邊商店一站買齊" },
          { emoji: "🛍️", name: "東大門設計廣場", note: "深夜購物天堂，凌晨4點才關門" },
        ],
      },
    ],
  },
  {
    id: "jp", flag: "🇯🇵", name: "日本",
    sections: [
      {
        title: "Cosme 美妝排行",
        items: [
          { emoji: "💧", name: "肌研極潤玻尿酸化妝水", note: "日本藥妝第一名的常客，台灣賣兩倍價", tag: "必掃" },
          { emoji: "🌞", name: "安耐曬金瓶防曬", note: "超輕薄不油膩，日本媽媽人手一瓶" },
          { emoji: "🧖", name: "馬油護手霜", note: "保濕力驚人，冬天乾裂手必備", tag: "CP值王" },
          { emoji: "💄", name: "CANMAKE 腮紅", note: "平價又顯色，藥妝店必逛品項" },
          { emoji: "🌿", name: "DHC 橄欖卸妝油", note: "溫和不刺激，敏感肌也能用" },
          { emoji: "✨", name: "HAKU 美白精華", note: "資生堂旗艦保養，日本才有此款" },
        ],
      },
      {
        title: "近期最夯體驗",
        items: [
          { emoji: "🌸", name: "淺草雷門周邊漫步", note: "早上7點前去人最少，黃金拍照時段" },
          { emoji: "🍣", name: "築地場外市場早餐", note: "開門6點，金槍魚丼超推薦；8點後人龍超長" },
          { emoji: "🎮", name: "秋葉原電玩街", note: "SEGA 多層樓格鬥機台，夾娃娃機最划算" },
          { emoji: "🧴", name: "松本清大型旗艦店", note: "比一般店便宜5-10%，外國人還可退稅" },
          { emoji: "🌃", name: "涉谷 Sky 展望台", note: "夕陽後進場最美，天氣好可見富士山" },
        ],
      },
    ],
  },
  {
    id: "th", flag: "🇹🇭", name: "泰國",
    sections: [
      {
        title: "這個月熱搜行程",
        items: [
          { emoji: "🛺", name: "曼谷 Tuk Tuk 夜遊", note: "跟司機說 night market route，150泰銖搞定一晚" },
          { emoji: "🌺", name: "考山路周邊文青市集", note: "周末才有，傍晚17:00開始聚集" },
          { emoji: "🍜", name: "Or Tor Kor 市場美食", note: "本地人才去的生鮮市場，榴槤最新鮮" },
          { emoji: "💆", name: "Wat Pho 廟內按摩", note: "正宗泰式古法，300泰銖60分鐘", tag: "超值" },
          { emoji: "🌊", name: "Grab Boat 運河快艇", note: "Grab App 直接叫，比計程車快，便宜一半" },
        ],
      },
      {
        title: "必買伴手禮",
        items: [
          { emoji: "🥥", name: "椰子油護唇膏", note: "各大超市有賣，一條約10泰銖超便宜" },
          { emoji: "🌶️", name: "媽媽麵整箱", note: "Makro 量販店最划算，整箱帶回台灣" },
          { emoji: "🧴", name: "SNAIL WHITE 蝸牛霜", note: "泰國美白品牌，品質穩定、價格親切", tag: "名物" },
          { emoji: "🫚", name: "青草藥膏", note: "跌打損傷、防蚊都能用，觀光市場有賣" },
        ],
      },
    ],
  },
];

const TAG_COLOR: Record<string, string> = {
  "斷貨中": "bg-red-100 text-red-500 border-red-200",
  "話題款": "bg-purple-100 text-purple-600 border-purple-200",
  "在地首選": "bg-[#8FA39A]/15 text-[#5C7A73] border-[#8FA39A]/30",
  "必掃": "bg-[#A86F5A]/15 text-[#7D5548] border-[#A86F5A]/30",
  "CP值王": "bg-amber-100 text-amber-700 border-amber-200",
  "超值": "bg-green-100 text-green-700 border-green-200",
  "名物": "bg-[#C4A882]/30 text-[#7A6350] border-[#C4A882]/50",
};

export default function TrendingView() {
  const router = useRouter();
  const [active, setActive] = useState("kr");
  const country = DATA.find((d) => d.id === active)!;

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🔥 現在最夯</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Trending Now</p>
          <h1 className="text-3xl font-light tracking-wide">這個月出國<br className="sm:hidden" />必買必玩清單</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            整合 Dcard、Olive Young、Cosme 排行，每月更新。
          </p>
        </div>

        {/* Country tabs */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-1">
          {DATA.map((d) => (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={`flex-shrink-0 rounded-full border px-5 py-2 text-sm font-light tracking-widest transition ${
                active === d.id
                  ? "border-[#A86F5A] bg-[#A86F5A]/15 text-[#7D5548]"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#A86F5A]/50"
              }`}
            >
              {d.flag} {d.name}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {country.sections.map((sec) => (
            <div key={sec.title}>
              <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">{sec.title}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {sec.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 transition hover:border-[#A86F5A]/40 hover:bg-[#FFFDF8]"
                  >
                    <span className="mt-0.5 text-2xl">{item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-light tracking-wide text-[#3A2E26]">{item.name}</span>
                        {item.tag && (
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-light ${TAG_COLOR[item.tag] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-light leading-5 text-[#8A7F73]">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8 text-center">
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
