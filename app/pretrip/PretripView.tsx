"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VISA_NOTE, EMERGENCY, CUSTOMS } from "../lib/buildDocx";

// ── 插座 / 電壓資料 ─────────────────────────────────────────
const PLUG_INFO: Record<string, { type: string; voltage: string; note: string }> = {
  首爾:   { type: "A / C 型", voltage: "220V / 60Hz", note: "台灣插頭不相容，需帶 C 型轉接頭（圓形雙孔）" },
  釜山:   { type: "A / C 型", voltage: "220V / 60Hz", note: "同首爾，需帶 C 型轉接頭" },
  濟州:   { type: "A / C 型", voltage: "220V / 60Hz", note: "同韓國，需帶 C 型轉接頭" },
  東京:   { type: "A 型", voltage: "100V / 50–60Hz", note: "台灣插頭可直接使用，電壓較低（100V），一般電器通常沒問題" },
  大阪:   { type: "A 型", voltage: "100V / 60Hz", note: "台灣插頭可直接使用，電壓較低（100V）" },
  沖繩:   { type: "A 型", voltage: "100V / 60Hz", note: "台灣插頭可直接使用" },
  福岡:   { type: "A 型", voltage: "100V / 60Hz", note: "台灣插頭可直接使用" },
  札幌:   { type: "A 型", voltage: "100V / 50Hz", note: "台灣插頭可直接使用，電壓略低" },
  名古屋: { type: "A 型", voltage: "100V / 60Hz", note: "台灣插頭可直接使用" },
  曼谷:   { type: "A / B / C 型", voltage: "220V / 50Hz", note: "多數酒店有萬用插座，但建議備 C 型轉接頭" },
  清邁:   { type: "A / B / C 型", voltage: "220V / 50Hz", note: "同曼谷，多數酒店萬用插座" },
  普吉島: { type: "A / B / C 型", voltage: "220V / 50Hz", note: "同泰國，建議備 C 型轉接頭" },
  新加坡: { type: "G 型（英式三方腳）", voltage: "230V / 50Hz", note: "需帶 G 型轉接頭，不同於台灣插頭" },
  香港:   { type: "G 型（英式三方腳）", voltage: "220V / 50Hz", note: "需帶 G 型轉接頭" },
  澳門:   { type: "G / F 型", voltage: "220V / 50Hz", note: "需帶 G 型轉接頭，部分舊建築有 F 型" },
  胡志明市: { type: "A / C 型", voltage: "220V / 50Hz", note: "需帶 C 型轉接頭，部分地方有萬用插座" },
  河內:   { type: "A / C 型", voltage: "220V / 50Hz", note: "需帶 C 型轉接頭" },
  峴港:   { type: "A / C 型", voltage: "220V / 50Hz", note: "同越南，需帶 C 型轉接頭" },
  吉隆坡: { type: "G 型（英式三方腳）", voltage: "240V / 50Hz", note: "需帶 G 型轉接頭" },
  亞庇:   { type: "G 型", voltage: "240V / 50Hz", note: "需帶 G 型轉接頭" },
  蘭卡威: { type: "G 型", voltage: "240V / 50Hz", note: "需帶 G 型轉接頭" },
  檳城:   { type: "G 型", voltage: "240V / 50Hz", note: "需帶 G 型轉接頭" },
  馬尼拉: { type: "A / B 型", voltage: "220V / 60Hz", note: "台灣 A 型插頭可用，但電壓 220V 需確認電器規格" },
  宿霧:   { type: "A / B 型", voltage: "220V / 60Hz", note: "台灣 A 型插頭可用，確認電器規格" },
  峇里島: { type: "C / F 型", voltage: "230V / 50Hz", note: "需帶 C 型轉接頭（圓形雙孔）" },
  雅加達: { type: "C / F 型", voltage: "230V / 50Hz", note: "需帶 C 型轉接頭" },
  金邊:   { type: "A / C 型", voltage: "230V / 50Hz", note: "需帶 C 型轉接頭，部分飯店萬用插座" },
  暹粒:   { type: "A / C 型", voltage: "230V / 50Hz", note: "需帶 C 型轉接頭" },
  上海:   { type: "A / C / I 型", voltage: "220V / 50Hz", note: "需帶轉接頭，部分飯店提供萬用插座" },
  北京:   { type: "A / C / I 型", voltage: "220V / 50Hz", note: "需帶轉接頭" },
  廣州:   { type: "A / C / I 型", voltage: "220V / 50Hz", note: "需帶轉接頭" },
  杜拜:   { type: "G 型（英式三方腳）", voltage: "220V / 50Hz", note: "需帶 G 型轉接頭，高級飯店常有萬用插座" },
  倫敦:   { type: "G 型（英式三方腳）", voltage: "230V / 50Hz", note: "需帶 G 型轉接頭" },
  巴黎:   { type: "C / E 型", voltage: "230V / 50Hz", note: "需帶 C 型轉接頭" },
  羅馬:   { type: "C / F / L 型", voltage: "230V / 50Hz", note: "需帶 C 型轉接頭" },
  巴塞隆納: { type: "C / F 型", voltage: "230V / 50Hz", note: "需帶 C 型轉接頭" },
  雪梨:   { type: "I 型（斜三角）", voltage: "230V / 50Hz", note: "需帶 I 型轉接頭，台灣插頭不相容" },
  紐約:   { type: "A / B 型", voltage: "120V / 60Hz", note: "台灣 A 型插頭可直接用，但電壓 120V 需確認電器（多數支援）" },
  洛杉磯: { type: "A / B 型", voltage: "120V / 60Hz", note: "台灣 A 型插頭可直接用，電壓 120V" },
  溫哥華: { type: "A / B 型", voltage: "120V / 60Hz", note: "台灣 A 型插頭可直接用，電壓 120V" },
  多倫多: { type: "A / B 型", voltage: "120V / 60Hz", note: "台灣 A 型插頭可直接用，電壓 120V" },
  關島:   { type: "A / B 型", voltage: "110V / 60Hz", note: "台灣插頭可直接使用" },
  帛琉:   { type: "A / B 型", voltage: "120V / 60Hz", note: "台灣 A 型插頭可直接用" },
};

// ── 貨幣資料 ─────────────────────────────────────────────
const CURRENCY: Record<string, { code: string; name: string; tip: string }> = {
  首爾:     { code: "KRW", name: "韓元", tip: "市區換匯所（明洞/東大門）匯率優於機場，建議少量先在機場換，市區再換大額" },
  釜山:     { code: "KRW", name: "韓元", tip: "釜山市區換匯所匯率佳，或使用 ATM 提領" },
  濟州:     { code: "KRW", name: "韓元", tip: "濟州建議先在首爾換好，島內換匯選擇較少" },
  東京:     { code: "JPY", name: "日元", tip: "日本現金使用率高，建議多帶現金，7-11 / 郵局 ATM 可提領日幣" },
  大阪:     { code: "JPY", name: "日元", tip: "難波換匯街匯率好，或使用 7-11 ATM 提領" },
  沖繩:     { code: "JPY", name: "日元", tip: "現金為主，建議出發前換好或用 ATM" },
  福岡:     { code: "JPY", name: "日元", tip: "博多站周邊有換匯所，或 7-11 ATM" },
  札幌:     { code: "JPY", name: "日元", tip: "現金為主，ATM 提領方便" },
  名古屋:   { code: "JPY", name: "日元", tip: "名古屋站附近有換匯，或 ATM 提領" },
  曼谷:     { code: "THB", name: "泰銖", tip: "SuperRich（綠/橘）換匯所匯率最好，ATM 手續費高建議換匯" },
  清邁:     { code: "THB", name: "泰銖", tip: "古城區換匯所匯率佳，SuperRich 有設點" },
  普吉島:   { code: "THB", name: "泰銖", tip: "芭東/卡倫換匯所匯率可，或在曼谷換好" },
  新加坡:   { code: "SGD", name: "新加坡幣", tip: "牛車水（People's Park）換匯所匯率好，信用卡接受度高" },
  香港:     { code: "HKD", name: "港幣", tip: "旺角/灣仔換匯所匯率佳，信用卡普及" },
  澳門:     { code: "MOP", name: "澳門幣", tip: "港幣與澳門幣 1:1 等值通用，可帶港幣直接使用" },
  胡志明市: { code: "VND", name: "越南盾", tip: "面額大、匯率容易搞混，建議用計算機，市區金飾店換匯匯率好" },
  河內:     { code: "VND", name: "越南盾", tip: "同胡志明市，市區換匯所或 ATM 均可" },
  峴港:     { code: "VND", name: "越南盾", tip: "同越南，市區換匯或 ATM" },
  吉隆坡:   { code: "MYR", name: "馬來西亞令吉", tip: "KLCC 或武吉免登換匯所匯率好，信用卡普及" },
  亞庇:     { code: "MYR", name: "馬來西亞令吉", tip: "市區換匯或 ATM，匯率與吉隆坡相近" },
  蘭卡威:   { code: "MYR", name: "馬來西亞令吉", tip: "蘭卡威為免稅島，酒類特別便宜" },
  檳城:     { code: "MYR", name: "馬來西亞令吉", tip: "喬治市換匯方便，信用卡普及" },
  馬尼拉:   { code: "PHP", name: "菲律賓比索", tip: "機場換匯匯率差，建議到市區換或 ATM 提領" },
  宿霧:     { code: "PHP", name: "菲律賓比索", tip: "SM 購物中心附近換匯所匯率可接受" },
  峇里島:   { code: "IDR", name: "印尼盾", tip: "街邊換匯需小心被坑，建議到銀行或機場換匯，ATM 也方便" },
  雅加達:   { code: "IDR", name: "印尼盾", tip: "面額大，用 ATM 提領方便" },
  金邊:     { code: "USD", name: "美元（通用）", tip: "柬埔寨流通美金，帶美金最方便，找零可能給瑞爾（KHR）" },
  暹粒:     { code: "USD", name: "美元（通用）", tip: "同金邊，美金通行，ATM 提領美金" },
  上海:     { code: "CNY", name: "人民幣", tip: "支付寶 / 微信支付為主，建議辦理台版支付寶或帶人民幣備用" },
  北京:     { code: "CNY", name: "人民幣", tip: "行動支付為主，建議辦理支付寶（台灣版）" },
  廣州:     { code: "CNY", name: "人民幣", tip: "行動支付普及，現金備用即可" },
  杜拜:     { code: "AED", name: "阿聯酋迪拉姆", tip: "機場和市區換匯均可，信用卡普及度極高" },
  倫敦:     { code: "GBP", name: "英鎊", tip: "Wise/Revolut 卡匯率好，優於換現金，信用卡幾乎萬能" },
  巴黎:     { code: "EUR", name: "歐元", tip: "Wise/Revolut 卡最划算，ATM 次之，避免機場換匯" },
  羅馬:     { code: "EUR", name: "歐元", tip: "現金需求較高（小店），建議帶現金 + Wise 卡" },
  巴塞隆納: { code: "EUR", name: "歐元", tip: "信用卡普及，Wise 卡最省手續費" },
  雪梨:     { code: "AUD", name: "澳幣", tip: "信用卡普及度高，Wise 卡匯率佳，少用機場換匯" },
  紐約:     { code: "USD", name: "美元", tip: "信用卡幾乎萬能，建議帶少量現金備用，Wise/Revolut 卡省手續費" },
  洛杉磯:   { code: "USD", name: "美元", tip: "信用卡為主，Wise 卡省費用" },
  溫哥華:   { code: "CAD", name: "加幣", tip: "Wise 卡最划算，信用卡普及" },
  多倫多:   { code: "CAD", name: "加幣", tip: "Wise 卡最划算，信用卡普及" },
  關島:     { code: "USD", name: "美元", tip: "台灣可先換好美金，信用卡普及" },
  帛琉:     { code: "USD", name: "美元", tip: "帛琉流通美金，帶夠現金因ATM有限" },
};

// ── 打包清單（依地區分組）─────────────────────────────────
const PACKING_LIST: Record<string, { cat: string; items: string[] }[]> = {
  日本: [
    { cat: "📄 證件", items: ["護照（效期 6 個月以上）", "備份身分證", "日幣現金", "信用卡（Visa/Master）", "Visit Japan Web 登錄截圖"] },
    { cat: "👕 衣物", items: ["依季節準備", "舒適步行鞋（一定會走很多）", "折疊雨傘", "夏季防曬外套"] },
    { cat: "🔌 電子", items: ["手機 + 充電器", "行動電源（≤27,000mAh）", "A 型插頭可直接使用", "相機 / 記憶卡"] },
    { cat: "💊 健康", items: ["感冒藥、腸胃藥", "過敏藥", "口罩（日本習慣）", "防曬乳"] },
    { cat: "📱 必裝 App", items: ["Google Maps / Yahoo 乗換案内", "Google 翻譯（離線下載日文）", "Suica App / PASMO", "食べログ"] },
  ],
  韓國: [
    { cat: "📄 證件", items: ["護照（效期 6 個月以上）", "K-ETA 申請確認碼", "韓元現金", "信用卡", "台幣備用"] },
    { cat: "👕 衣物", items: ["冬季：超厚羽絨外套 + 保暖內層", "夏季：輕薄衣物 + 薄外套（冷氣）", "舒適步行鞋"] },
    { cat: "🔌 電子", items: ["手機 + 充電器", "C 型轉接頭（必備！）", "行動電源", "自拍棒"] },
    { cat: "💊 健康", items: ["感冒藥", "腸胃藥（吃辣可能不適）", "防曬乳", "保濕乳液（韓國冬天乾）"] },
    { cat: "📱 必裝 App", items: ["Naver Map（比 Google Maps 準）", "Kakao T（叫車）", "Papago（韓文翻譯）", "T-money 交通卡"] },
  ],
  東南亞: [
    { cat: "📄 證件", items: ["護照（效期 6 個月以上）", "簽證/E-Visa 確認碼", "美金現金（通用）", "信用卡"] },
    { cat: "👕 衣物", items: ["輕薄透氣衣物", "薄外套（冷氣超強）", "防水拖鞋", "參觀寺廟長褲/長裙"] },
    { cat: "🔌 電子", items: ["手機 + 充電器", "防水袋（雨季）", "C 型轉接頭", "行動電源"] },
    { cat: "💊 健康", items: ["防蚊液（必備！）", "腸胃藥、止瀉藥", "防曬乳（超強烈）", "濕紙巾 / 乾洗手"] },
    { cat: "📱 必裝 App", items: ["Grab（叫車/外送）", "Google Maps 離線地圖", "Google 翻譯（離線）", "XE Currency（匯率）"] },
  ],
  歐洲: [
    { cat: "📄 證件", items: ["護照", "ETIAS/ETA 申請確認（若已實施）", "Wise 卡 / 歐元現金", "旅遊保險單"] },
    { cat: "👕 衣物", items: ["多層次穿搭", "舒適步行鞋（重要！歐洲超多石板路）", "小後背包（防扒）"] },
    { cat: "🔌 電子", items: ["手機 + 充電器", "C 型轉接頭", "行動電源", "相機"] },
    { cat: "💊 健康", items: ["感冒藥、腸胃藥", "暈車藥（交通多）", "防曬乳", "OK 繃（磨腳）"] },
    { cat: "📱 必裝 App", items: ["Google Maps", "Citymapper（交通）", "Wise（匯率）", "Booking.com"] },
  ],
  美洲: [
    { cat: "📄 證件", items: ["護照", "ESTA（美國）/ eTA（加拿大）確認碼", "信用卡（必備）", "美金/加幣備用"] },
    { cat: "👕 衣物", items: ["依城市和季節準備", "舒適球鞋（走路多）", "薄外套（冷氣）"] },
    { cat: "🔌 電子", items: ["手機 + 充電器", "A 型插頭可直接使用", "行動電源", "充電線備份"] },
    { cat: "💊 健康", items: ["感冒藥", "腸胃藥", "防曬乳", "暈車藥"] },
    { cat: "📱 必裝 App", items: ["Google Maps", "Uber", "Yelp（餐廳評價）", "Google 翻譯"] },
  ],
};

function getPackingKey(dest: string): string {
  const japan = ["東京", "大阪", "沖繩", "福岡", "札幌", "名古屋"];
  const korea = ["首爾", "釜山", "濟州"];
  const europe = ["倫敦", "巴黎", "羅馬", "巴塞隆納"];
  const americas = ["紐約", "洛杉磯", "溫哥華", "多倫多", "關島", "帛琉"];
  if (japan.includes(dest)) return "日本";
  if (korea.includes(dest)) return "韓國";
  if (europe.includes(dest)) return "歐洲";
  if (americas.includes(dest)) return "美洲";
  return "東南亞";
}

// ── 目的地清單 ─────────────────────────────────────────────
const DEST_GROUPS = [
  {
    group: "🇯🇵 日本",
    cities: ["東京", "大阪", "沖繩", "福岡", "札幌", "名古屋"],
  },
  {
    group: "🇰🇷 韓國",
    cities: ["首爾", "釜山", "濟州"],
  },
  {
    group: "🇹🇭 泰國",
    cities: ["曼谷", "清邁", "普吉島"],
  },
  {
    group: "🌏 東南亞",
    cities: ["新加坡", "香港", "澳門", "胡志明市", "河內", "峴港", "吉隆坡", "檳城", "馬尼拉", "宿霧", "峇里島", "金邊", "暹粒"],
  },
  {
    group: "🌍 其他",
    cities: ["杜拜", "倫敦", "巴黎", "雪梨", "紐約", "洛杉磯", "溫哥華", "關島", "帛琉"],
  },
];

const ALL_CITIES = DEST_GROUPS.flatMap((g) => g.cities);

type Tab = "visa" | "customs" | "plug" | "currency" | "packing" | "emergency";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "visa",      label: "簽證",   icon: "🛂" },
  { id: "customs",   label: "海關禁品", icon: "🚫" },
  { id: "plug",      label: "插座電壓", icon: "🔌" },
  { id: "currency",  label: "貨幣換匯", icon: "💱" },
  { id: "packing",   label: "打包清單", icon: "🧳" },
  { id: "emergency", label: "緊急電話", icon: "📞" },
];

export default function PretripView() {
  const router = useRouter();
  const [dest, setDest] = useState("東京");
  const [tab, setTab] = useState<Tab>("visa");
  const [showGroups, setShowGroups] = useState(false);

  const visa      = VISA_NOTE[dest] ?? "請出發前確認最新簽證規定（外交部領事事務局 www.boca.gov.tw）";
  const customs   = CUSTOMS[dest] ?? ["請至目的地海關官網確認最新規定"];
  const plug      = PLUG_INFO[dest] ?? { type: "未知", voltage: "未知", note: "請查詢目的地電力規格" };
  const currency  = CURRENCY[dest] ?? { code: "—", name: "未知貨幣", tip: "請出發前確認當地貨幣" };
  const emergency = EMERGENCY[dest] ?? ["請查詢外交部領事事務局：www.boca.gov.tw"];
  const packingKey = getPackingKey(dest);
  const packing   = PACKING_LIST[packingKey] ?? [];

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      {/* Nav */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">行前必知</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Pre-Trip Checklist</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">行前必知懶人包</h1>
          <p className="text-sm font-light text-[#8A7F73]">簽證 · 海關禁品 · 插座電壓 · 換匯技巧 · 打包清單 · 緊急電話</p>
        </div>

        {/* 目的地選擇 */}
        <div className="mb-8">
          {DEST_GROUPS.map(({ group, cities }) => (
            <div key={group} className="mb-4">
              <p className="mb-2 text-xs font-light tracking-widest text-[#8A7F73]">{group}</p>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setDest(city)}
                    className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                      ${dest === city
                        ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]"
                        : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 選中目的地標題 */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] px-7 py-5 mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light tracking-wide">📍 {dest} 行前必知</h2>
            <p className="text-xs font-light text-[#8A7F73] mt-1">以下資訊僅供參考，出發前請至官網確認最新規定</p>
          </div>
          <button
            onClick={() => router.push(`/wizard?dest=${encodeURIComponent(dest)}`)}
            className="rounded-full bg-[#A86F5A] px-5 py-2.5 text-xs font-light tracking-wider text-white transition hover:bg-[#96604D]"
          >
            規劃行程 →
          </button>
        </div>

        {/* Tab 選擇 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                ${tab === id
                  ? "border-[#A86F5A] bg-[#A86F5A] text-white"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Tab 內容 */}
        <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-7">

          {tab === "visa" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🛂 簽證資訊</p>
              <p className="text-base font-light leading-8 text-[#4B4037]">{visa}</p>
              <a
                href="https://www.boca.gov.tw/mp-1.html"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-xs font-light text-[#A86F5A] underline"
              >
                外交部領事事務局官網（最新資訊）→
              </a>
            </div>
          )}

          {tab === "customs" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🚫 海關禁品 / 注意事項</p>
              <ul className="space-y-3">
                {customs.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                    <span className="text-[#A86F5A] shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "plug" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🔌 插座 & 電壓</p>
              <div className="grid gap-4 sm:grid-cols-3 mb-5">
                <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                  <p className="text-xs font-light text-[#8A7F73] mb-1">插座類型</p>
                  <p className="text-base font-light text-[#4B4037]">{plug.type}</p>
                </div>
                <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                  <p className="text-xs font-light text-[#8A7F73] mb-1">電壓 / 頻率</p>
                  <p className="text-base font-light text-[#4B4037]">{plug.voltage}</p>
                </div>
                <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                  <p className="text-xs font-light text-[#8A7F73] mb-1">台灣旅客注意</p>
                  <p className="text-sm font-light text-[#4B4037] leading-6">{plug.note}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#EDE7DD] bg-[#FFFDF8] px-5 py-3">
                <p className="text-xs font-light text-[#8A7F73]">💡 建議帶萬用轉接頭（旅行用）+ 確認電器是否支援當地電壓（充電器通常100–240V沒問題）</p>
              </div>
            </div>
          )}

          {tab === "currency" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">💱 貨幣 & 換匯</p>
              <div className="grid gap-4 sm:grid-cols-2 mb-5">
                <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                  <p className="text-xs font-light text-[#8A7F73] mb-1">當地貨幣</p>
                  <p className="text-lg font-light text-[#4B4037]">{currency.name}</p>
                  <p className="text-xs font-light text-[#A86F5A]">{currency.code}</p>
                </div>
                <div className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                  <p className="text-xs font-light text-[#8A7F73] mb-1">換匯眉角</p>
                  <p className="text-sm font-light text-[#4B4037] leading-7">{currency.tip}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wise.com/tw/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]"
                >
                  💚 Wise 卡（推薦）→
                </a>
                <a
                  href={`https://www.xe.com/currencyconverter/convert/?Amount=1&From=TWD&To=${currency.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]"
                >
                  📊 XE 即時匯率 →
                </a>
                <a
                  href="https://www.bot.com.tw/tw/personal/foreign-exchange/daily-exchange-rates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]"
                >
                  🏦 台灣銀行牌告匯率 →
                </a>
              </div>
            </div>
          )}

          {tab === "packing" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-1">🧳 打包清單</p>
              <p className="text-xs font-light text-[#A79C91] mb-5">（{packingKey}地區通用版）</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {packing.map(({ cat, items }) => (
                  <div key={cat} className="rounded-2xl border border-[#E0D9D2] bg-white px-5 py-4">
                    <p className="text-sm font-light tracking-wide text-[#4B4037] mb-3">{cat}</p>
                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs font-light text-[#6F675F] leading-6">
                          <span className="text-[#C4BCB4]">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "emergency" && (
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">📞 緊急聯絡電話</p>
              <ul className="space-y-3 mb-5">
                {emergency.map((line, i) => (
                  <li key={i} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                    <span className="text-[#A86F5A] shrink-0">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-[#EDE7DD] bg-[#FFFDF8] px-5 py-4">
                <p className="text-xs font-light text-[#8A7F73]">💡 建議出發前把緊急電話截圖存在手機，或印出來隨身攜帶</p>
              </div>
              <a
                href="https://www.boca.gov.tw/sp-abre-list-1.html"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-xs font-light text-[#A86F5A] underline"
              >
                外交部全球駐館查詢 →
              </a>
            </div>
          )}
        </div>

        {/* 底部 CTA */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.push(`/wizard`)}
            className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]"
          >
            用 AI 規劃 {dest} 行程 →
          </button>
          <button
            onClick={() => router.push("/visa")}
            className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-6 py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]"
          >
            簽證查詢
          </button>
        </div>
      </div>
    </main>
  );
}
