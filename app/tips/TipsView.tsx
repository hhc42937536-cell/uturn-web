"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Tip = {
  id: string; city: string; category: string; title: string; body: string;
  tags: string[]; source: "editor" | "community"; likes: number;
};

type Category = { key: string; label: string; icon: string };

const CATEGORIES: Category[] = [
  { key: "ticket", label: "票務時機", icon: "🎟️" },
  { key: "crowd", label: "人潮規律", icon: "👥" },
  { key: "transport", label: "交通眉角", icon: "🚇" },
  { key: "hidden", label: "隱藏景點", icon: "🗺️" },
  { key: "food", label: "美食在地", icon: "🍜" },
  { key: "idol", label: "追星專屬", icon: "⭐" },
  { key: "family", label: "親子玩法", icon: "👨‍👩‍👧" },
  { key: "budget", label: "省錢眉角", icon: "💰" },
];

const CITIES = ["首爾", "東京", "大阪", "沖繩", "曼谷", "新加坡", "香港", "胡志明市"];

const STATIC_TIPS: Tip[] = [
  // ── 首爾 ──
  { id: "s1", city: "首爾", category: "ticket", title: "K-ETA 申請時機", body: "出發前 72 小時以上申請，部分時段核准需 1–2 天。建議出發前一週申請，費用約 KRW 10,000。", tags: ["簽證", "入境"], source: "editor", likes: 42 },
  { id: "s2", city: "首爾", category: "crowd", title: "弘大週末人潮", body: "週五晚上 20:00–23:00 是弘大最擁擠時段，比平日多 40%。建議平日或週六下午抵達，購物、咖啡廳等位時間較短。", tags: ["弘大", "週末"], source: "editor", likes: 38 },
  { id: "s3", city: "首爾", category: "transport", title: "T-money 卡省錢技巧", body: "T-money 卡換乘有優惠（30 分鐘內換搭地鐵/公車免基本費），多人旅遊建議每人一張，省的比想像多。", tags: ["交通卡", "省錢"], source: "editor", likes: 55 },
  { id: "s4", city: "首爾", category: "hidden", title: "益善洞韓屋村避開人潮", body: "益善洞早上 9:00–10:30 遊客最少，能自在拍照。中午過後人潮激增，熱門咖啡廳門口等位超過 30 分鐘。", tags: ["益善洞", "韓屋"], source: "editor", likes: 29 },
  { id: "s5", city: "首爾", category: "food", title: "廣藏市場最佳入場時間", body: "早上 10:00–11:30 是廣藏市場最舒適的用餐時段，到了午餐時間 12:00 人龍可能排到市場外頭。", tags: ["廣藏市場", "美食"], source: "editor", likes: 61 },
  { id: "s6", city: "首爾", category: "idol", title: "HYBE Insight 預約攻略", body: "每週一 10:00 開放下週預約，需在官網提前登錄會員。連假前後場次秒殺，建議比開放時間早 5 分鐘候機搶票。", tags: ["HYBE", "BTS", "預約"], source: "editor", likes: 77 },
  { id: "s7", city: "首爾", category: "budget", title: "明洞退稅攻略", body: "單筆消費滿 ₩30,000 可辦即時退稅（Tax Refund）。明洞大部分店家支援，出機場前到退稅機確認即可，最高退 15%。", tags: ["退稅", "明洞", "省錢"], source: "editor", likes: 48 },

  // ── 東京 ──
  { id: "t1", city: "東京", category: "ticket", title: "TeamLab 訂票時機", body: "teamLab Planets（豐洲）每週一 10:00 開放 1 個月後的票，假日場次通常 15 分鐘內售完。購票需建立帳號並綁信用卡。", tags: ["teamLab", "預約"], source: "editor", likes: 53 },
  { id: "t2", city: "東京", category: "crowd", title: "淺草寺人潮預測", body: "淺草寺在新年（1/1–1/3）每日超過 30 萬人。旺季建議早上 7:00–8:30 前往，下午 14:00–17:00 是人潮高峰。", tags: ["淺草", "人潮"], source: "editor", likes: 44 },
  { id: "t3", city: "東京", category: "transport", title: "Suica 機場購買省時", body: "羽田/成田均可買 Suica，但羽田第三航廈 7/11 最快（不用排長隊）。到新宿搭山手線全程有 Suica 搞定，不用另購車票。", tags: ["Suica", "交通"], source: "editor", likes: 66 },
  { id: "t4", city: "東京", category: "hidden", title: "谷中銀座下午茶時間", body: "谷中銀座下午 15:00–17:00 人少、光線好，是最適合拍照的時段。貓咪出沒概率在傍晚前後最高。", tags: ["谷中", "老街"], source: "editor", likes: 31 },
  { id: "t5", city: "東京", category: "food", title: "築地場外市場最佳時機", body: "築地場外市場建議早上 8:00–9:30 前往，海鮮最新鮮。10:30 後部分攤販開始收攤或賣剩料；午餐時段人龍可達 1 小時。", tags: ["築地", "海鮮"], source: "editor", likes: 57 },
  { id: "t6", city: "東京", category: "idol", title: "Johnny's 原宿店入場機制", body: "原宿官方店每次入場需抽選（官網申請），抽中後 3 天前確認。抽選開放時間每月固定，建議追蹤 X (Twitter) 官方帳號。", tags: ["Johnny's", "J-POP"], source: "editor", likes: 69 },

  // ── 大阪 ──
  { id: "o1", city: "大阪", category: "ticket", title: "USJ 超級任天堂世界預約", body: "超級任天堂世界需事先在 USJ App 預約入場時段，早上 8:00 前抵達可搶首批。旺季（暑假、聖誕）門票建議提前 2 個月購買。", tags: ["USJ", "任天堂"], source: "editor", likes: 82 },
  { id: "o2", city: "大阪", category: "crowd", title: "道頓堀夜晚人潮", body: "道頓堀在晚上 19:00–21:00 人潮達到高峰，拍攝格力克人招牌幾乎不可能沒有其他遊客。建議早上 7:00–8:00 前往拍照。", tags: ["道頓堀", "夜晚"], source: "editor", likes: 39 },
  { id: "o3", city: "大阪", category: "transport", title: "大阪周遊卡選擇指南", body: "大阪周遊卡（1 日 ¥2,800）含地鐵無限搭＋40 個景點免費。若要去梅田空中庭園＋大阪城＋住吉大社，基本就回本了。2 日卡更划算。", tags: ["周遊卡", "省錢"], source: "editor", likes: 47 },
  { id: "o4", city: "大阪", category: "food", title: "黑門市場購物時機", body: "黑門市場在平日早上 9:00–11:00 最舒適，攤販最齊全。假日午餐時段擠到無法移動，海鮮、水果最好平日購買。", tags: ["黑門市場", "海鮮"], source: "editor", likes: 51 },

  // ── 曼谷 ──
  { id: "b1", city: "曼谷", category: "transport", title: "BTS Skytrain 免排隊技巧", body: "BTS 月票（Rabbit Card）加值後可加速通關，無須每次購票。從廊曼機場到市區推薦搭 A1 公車（¥30 泰銖），比計程車省一半。", tags: ["BTS", "交通"], source: "editor", likes: 36 },
  { id: "b2", city: "曼谷", category: "crowd", title: "大皇宮避人潮時機", body: "大皇宮開門（8:30）後前 30 分鐘遊客最少，正午 12:00–14:00 最熱且人最多。建議穿著輕薄長褲，避免租借圍裙等時間。", tags: ["大皇宮", "寺廟"], source: "editor", likes: 33 },
  { id: "b3", city: "曼谷", category: "food", title: "Or Tor Kor 市場採購", body: "Or Tor Kor 是曼谷最乾淨的生鮮市場，早上 8:00–10:00 水果最新鮮且品種最齊。芒果糯米飯比路邊攤貴但品質穩定。", tags: ["市場", "水果"], source: "editor", likes: 28 },
  { id: "b4", city: "曼谷", category: "hidden", title: "Talad Noi 小巷藝術區", body: "昭披耶河畔的 Talad Noi 是老城區中的隱藏藝術街區，下午 16:00–18:00 光線最美，壁畫、咖啡廳比 Samyan 少很多遊客。", tags: ["藝術", "壁畫"], source: "editor", likes: 22 },

  // ── 新加坡 ──
  { id: "sg1", city: "新加坡", category: "ticket", title: "濱海灣花園燈光秀時機", body: "濱海灣花園（Gardens by the Bay）免費燈光秀每晚 19:45 和 20:45 各一場，建議 19:30 前卡位，雨天可能取消。", tags: ["濱海灣", "夜景"], source: "editor", likes: 58 },
  { id: "sg2", city: "新加坡", category: "transport", title: "EZ-Link 卡省錢", body: "EZ-Link 卡（類似悠遊卡）搭 MRT 比購票便宜 20% 以上，機場可直接購買，餘額回國後可線上退款。", tags: ["EZ-Link", "省錢"], source: "editor", likes: 41 },
  { id: "sg3", city: "新加坡", category: "food", title: "麥士威熟食中心時機", body: "天天海南雞飯（Maxwell Food Centre）平日午餐 11:30 前等位約 10 分鐘，過了 12:00 等位超過 30 分鐘。下午 14:30 後再去最輕鬆。", tags: ["雞飯", "熟食中心"], source: "editor", likes: 64 },

  // ── 香港 ──
  { id: "hk1", city: "香港", category: "transport", title: "機場快綫省時", body: "機場快綫 25 分鐘直達香港站，可在市區辦登機手續（Hong Kong In-Town Check-in），行李免提。比巴士貴但省下至少 1 小時。", tags: ["機場", "交通"], source: "editor", likes: 46 },
  { id: "hk2", city: "香港", category: "food", title: "蘭芳園在地吃法", body: "蘭芳園的絲襪奶茶配西多士是最經典組合。中環總店平日 8:00–9:30 最不擠，假日建議去灣仔或旺角分店。", tags: ["奶茶", "茶餐廳"], source: "editor", likes: 52 },
  { id: "hk3", city: "香港", category: "hidden", title: "鯉魚門漁村黃昏", body: "鯉魚門是香港少有仍保有漁村風貌的地方，下午 17:00–19:00 有漁船歸航，配上維港對面夜景，比旺角更有香港味。", tags: ["鯉魚門", "漁村"], source: "editor", likes: 19 },

  // ── 胡志明市 ──
  { id: "vn1", city: "胡志明市", category: "transport", title: "Grab 叫車省荷包", body: "胡志明市計程車建議全程使用 Grab（類似 Uber），避免被坑。機場出口外即可叫車，比機場計程車便宜 40–60%。", tags: ["Grab", "交通"], source: "editor", likes: 67 },
  { id: "vn2", city: "胡志明市", category: "food", title: "Pho 早餐文化", body: "越南人吃河粉是早餐文化，早上 7:00–9:00 是最地道的時段，下午後部分店家打烊。Ben Thanh 市場附近多家在地河粉店可找到。", tags: ["河粉", "早餐"], source: "editor", likes: 43 },
  { id: "vn3", city: "胡志明市", category: "budget", title: "Ben Thanh 市場議價技巧", body: "Ben Thanh 市場標價通常是實際成交價的 2–3 倍，開口喊對方報價的 40–50% 是合理起點。禮貌但堅定，走掉通常會叫回你。", tags: ["市場", "議價"], source: "editor", likes: 35 },
];

export default function TipsView() {
  const router = useRouter();
  const [city, setCity] = useState("首爾");
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [communityTips, setCommunityTips] = useState<Tip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTip, setNewTip] = useState({ title: "", body: "", category: "hidden", tags: "" });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("uturn_tips");
      if (stored) setCommunityTips(JSON.parse(stored));
      const liked = localStorage.getItem("uturn_liked");
      if (liked) setLikedIds(new Set(JSON.parse(liked)));
    } catch {}
  }, []);

  const allTips = [...STATIC_TIPS, ...communityTips];

  const filtered = allTips.filter((t) => {
    const matchCity = t.city === city;
    const matchCat = cat === "all" || t.category === cat;
    const q = search.toLowerCase();
    const matchQ = !q || t.title.includes(q) || t.body.includes(q) || t.tags.some((tg) => tg.includes(q));
    return matchCity && matchCat && matchQ;
  });

  const handleLike = (id: string) => {
    const next = new Set(likedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setLikedIds(next);
    localStorage.setItem("uturn_liked", JSON.stringify([...next]));
  };

  const handleSubmit = () => {
    if (!newTip.title || !newTip.body) return;
    const tip: Tip = {
      id: `c${Date.now()}`, city, category: newTip.category,
      title: newTip.title, body: newTip.body,
      tags: newTip.tags.split(/[,，\s]+/).filter(Boolean),
      source: "community", likes: 0,
    };
    const next = [...communityTips, tip];
    setCommunityTips(next);
    localStorage.setItem("uturn_tips", JSON.stringify(next));
    setNewTip({ title: "", body: "", category: "hidden", tags: "" });
    setShowForm(false);
  };

  const inputClass = "h-10 w-full rounded-xl border border-[#D8D2C7] bg-white px-3 text-sm font-light text-[#4B4037] outline-none focus:border-[#8FA39A]";

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🧠 在地知識庫</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Local Knowledge · Insider Tips</p>
          <h1 className="text-3xl font-light tracking-wide">深度在地<br className="sm:hidden" />知識庫</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            票務時機、人潮規律、交通眉角、隱藏景點——這些是 Google 查不到、只有去過的人才知道的細節。
          </p>
        </div>

        {/* City tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {CITIES.map((c) => (
            <button key={c} onClick={() => { setCity(c); setCat("all"); }}
              className={`flex-shrink-0 rounded-full border px-5 py-2 text-sm font-light tracking-widest transition ${
                city === c ? "border-[#A86F5A] bg-[#A86F5A]/15 text-[#7D5548]" : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#A86F5A]/50"
              }`}
            >{c}</button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCat("all")}
            className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-light tracking-widest transition ${
              cat === "all" ? "border-[#8FA39A] bg-[#8FA39A]/20 text-[#4B6B63]" : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#8FA39A]/50"
            }`}
          >全部</button>
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-light tracking-widest transition ${
                cat === c.key ? "border-[#8FA39A] bg-[#8FA39A]/20 text-[#4B6B63]" : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#8FA39A]/50"
              }`}
            >{c.icon} {c.label}</button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋關鍵字…" className="h-10 flex-1 rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-5 text-sm font-light outline-none placeholder:text-[#A79C91] focus:border-[#8FA39A]" />
          <button onClick={() => setShowForm(true)}
            className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-5 py-2 text-sm font-light text-[#7D5548] transition hover:bg-[#B98774]/25">
            + 貢獻眉角
          </button>
        </div>

        {/* Tips */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm font-light text-[#A79C91]">
              這個分類目前還沒有 {city} 的眉角，成為第一個貢獻者！
            </div>
          )}
          {filtered.map((tip) => {
            const catInfo = CATEGORIES.find((c) => c.key === tip.category);
            const liked = likedIds.has(tip.id);
            return (
              <div key={tip.id} className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-5 transition hover:border-[#A86F5A]/30 hover:bg-[#FFFDF8]">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {catInfo && <span className="text-base">{catInfo.icon}</span>}
                    <span className="text-sm font-light tracking-wide text-[#3A2E26]">{tip.title}</span>
                    {tip.source === "community" && (
                      <span className="rounded-full border border-[#8FA39A]/50 bg-[#8FA39A]/10 px-2 py-0.5 text-[10px] font-light text-[#4B6B63]">社群</span>
                    )}
                  </div>
                  <button onClick={() => handleLike(tip.id)}
                    className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-light transition ${
                      liked ? "border-[#A86F5A] bg-[#A86F5A]/10 text-[#A86F5A]" : "border-[#D8D2C7] text-[#A79C91] hover:border-[#A86F5A]/50"
                    }`}>
                    {liked ? "♥" : "♡"} {tip.likes + (liked ? 1 : 0)}
                  </button>
                </div>
                <p className="mb-3 text-sm font-light leading-6 text-[#5C5248]">{tip.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tip.tags.map((tg) => (
                    <span key={tg} className="rounded-full border border-[#D8D2C7] bg-white px-2.5 py-0.5 text-[11px] font-light text-[#8A7F73]">#{tg}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contribute form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-lg rounded-[2rem] bg-[#FBF8F1] p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-5 text-lg font-light tracking-wide">分享你的在地眉角</h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-light tracking-widest text-[#6F675F]">分類</p>
                  <select value={newTip.category} onChange={(e) => setNewTip((p) => ({ ...p, category: e.target.value }))}
                    className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-xs font-light tracking-widest text-[#6F675F]">標題（簡短說明）</p>
                  <input type="text" value={newTip.title} onChange={(e) => setNewTip((p) => ({ ...p, title: e.target.value }))}
                    placeholder="如：弘大週末避人潮技巧" className={inputClass} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-light tracking-widest text-[#6F675F]">詳細內容</p>
                  <textarea rows={4} value={newTip.body} onChange={(e) => setNewTip((p) => ({ ...p, body: e.target.value }))}
                    placeholder="具體時間、地點、方法越詳細越好…"
                    className="w-full resize-none rounded-xl border border-[#D8D2C7] bg-white px-3 py-2 text-sm font-light text-[#4B4037] outline-none focus:border-[#8FA39A]" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-light tracking-widest text-[#6F675F]">標籤（逗號分隔）</p>
                  <input type="text" value={newTip.tags} onChange={(e) => setNewTip((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="弘大, 週末, 省時" className={inputClass} />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={handleSubmit}
                  className="flex-1 rounded-full border border-[#A86F5A] bg-[#B98774]/15 py-3 text-sm font-light tracking-wide text-[#7D5548] transition hover:bg-[#B98774]/25">
                  送出分享
                </button>
                <button onClick={() => setShowForm(false)}
                  className="rounded-full border border-[#D8D2C7] bg-white px-6 py-3 text-sm font-light text-[#6F675F]">
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
