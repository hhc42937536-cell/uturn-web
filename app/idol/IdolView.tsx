"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Artist = {
  name: string; group?: string; country: "kr" | "jp";
  genre: string; tags: string[];
  pilgrimage: { spot: string; desc: string }[];
  tip: string;
};

const ARTISTS: Artist[] = [
  // ── K-POP 團體 ──
  {
    name: "BTS", country: "kr", genre: "K-POP",
    tags: ["防彈少年團", "RM", "SUGA", "j-hope", "HYBE"],
    pilgrimage: [
      { spot: "HYBE Insight（龍山）", desc: "官方展覽館，常設展+特展，建議提前預約" },
      { spot: "弘大 BigHit 舊址周邊", desc: "早期練習室所在地，粉絲朝聖必去" },
      { spot: "BTS 島（西江渡假島）", desc: "《Permission to Dance》拍攝地，可租船登島" },
    ],
    tip: "演唱會票在 Weverse Shop 優先開搶，成員個人活動看 Weverse 公告。",
  },
  {
    name: "BLACKPINK", country: "kr", genre: "K-POP",
    tags: ["YG", "Jennie", "Lisa", "Rosé", "Jisoo"],
    pilgrimage: [
      { spot: "YG 娛樂大樓（合井）", desc: "成員進出必經之地，周邊咖啡廳值得一坐" },
      { spot: "COEX Artium 購物中心", desc: "大型粉絲快閃活動常在此舉辦" },
      { spot: "高尺天空巨蛋周邊", desc: "BLACKPINK 巡演主場，地鐵 1 號線高尺站" },
    ],
    tip: "YG 演出多在高尺天空巨蛋，國際版票需透過 Weverse 或代理人購買。",
  },
  {
    name: "TWICE", country: "kr", genre: "K-POP",
    tags: ["JYP", "나연", "사나", "지효", "쯔위"],
    pilgrimage: [
      { spot: "JYP 娛樂大樓（청담）", desc: "清潭洞，偶遇概率最高的娛樂公司區" },
      { spot: "올림픽 공원（奧林匹克公園）", desc: "TWICE 多次在此舉辦演唱會" },
      { spot: "弘大 JYP 練習室周邊", desc: "早期成員活動的弘大區域" },
    ],
    tip: "JYP 演唱會票在 Weverse、Melon Ticket 同步開賣，手速要快。",
  },
  {
    name: "Stray Kids", country: "kr", genre: "K-POP",
    tags: ["JYP", "방찬", "리노", "창빈", "현진", "한", "필릭스", "승민", "아이엔"],
    pilgrimage: [
      { spot: "JYP 清潭洞大樓", desc: "成員出入最多的公司，早上 10 點前有機會偶遇" },
      { spot: "KSPO Dome（蠶室）", desc: "大型演唱會場地，蠶室地鐵站直達" },
      { spot: "弘大附近咖啡廳", desc: "成員喜愛活動的區域，粉絲應援咖啡廳集中地" },
    ],
    tip: "SKZ 演唱會票在 Weverse Shop 開搶，海外粉絲需用外幣卡或韓國代理人。",
  },
  {
    name: "SEVENTEEN", country: "kr", genre: "K-POP",
    tags: ["PLEDIS", "HYBE", "승관", "호시", "우지", "버논"],
    pilgrimage: [
      { spot: "HYBE Insight（龍山）", desc: "HYBE 旗下，展覽館內有 SEVENTEEN 專區" },
      { spot: "인천 아시아드 경기장", desc: "ITC（一個方向演唱會）常見場館" },
      { spot: "어도어 / PLEDIS 清潭洞周邊", desc: "公司周邊，偶遇率高的咖啡廳街" },
    ],
    tip: "SVT 票在 Weverse 開搶，Carat 會員有優先購票資格。",
  },
  {
    name: "aespa", country: "kr", genre: "K-POP",
    tags: ["SM", "카리나", "닝닝", "윈터", "지젤"],
    pilgrimage: [
      { spot: "SM TOWN 三成（COEX）", desc: "SM 官方體驗館，周邊商品最齊全，週末人潮多" },
      { spot: "SMTOWN & STORE", desc: "SM 旗下藝人統一官方商店，限定周邊在此" },
      { spot: "高尺天空巨蛋", desc: "SM 演唱會常見場地，地鐵可達" },
    ],
    tip: "SM 演唱會票在 SM Store App 或 Melon Ticket 開賣，先確認開賣時間。",
  },
  {
    name: "NewJeans", country: "kr", genre: "K-POP",
    tags: ["ADOR", "HYBE", "하니", "민지", "다니엘", "해린", "혜인"],
    pilgrimage: [
      { spot: "HYBE Insight（龍山）", desc: "ADOR 隸屬 HYBE，展覽館有 NewJeans 區域" },
      { spot: "성수동（聖水洞）", desc: "NewJeans MV 多在此取景，工業風咖啡廳密集" },
      { spot: "이태원 經理團길", desc: "成員私服街拍熱點，高檔餐廳與咖啡廳區" },
    ],
    tip: "NJ 活動資訊在 Phoning App，演唱會票 Melon / Interpark 同步開售。",
  },
  {
    name: "IVE", country: "kr", genre: "K-POP",
    tags: ["Starship", "안유진", "가을", "레이", "리즈", "이서", "wonyoung"],
    pilgrimage: [
      { spot: "Starship 娛樂（마포）", desc: "麻浦區，IVE 公司所在地" },
      { spot: "올림픽 공원", desc: "奧林匹克公園，IVE 演唱會主場之一" },
      { spot: "이태원 / 한남동", desc: "成員常被街拍的高級住宅區周邊" },
    ],
    tip: "IVE 票在 Melon、Interpark、YES24 同時開賣，建議三個平台同時嘗試。",
  },
  {
    name: "ENHYPEN", country: "kr", genre: "K-POP",
    tags: ["HYBE", "beomgyu", "jay", "jake", "sunghoon", "sunoo", "jungwon", "ni-ki"],
    pilgrimage: [
      { spot: "HYBE Insight（龍山）", desc: "HYBE 展覽館，ENHYPEN 粉絲應援牆必逛" },
      { spot: "Olympic Gymnastics Arena", desc: "MANIFEST 演唱會場地，蠶室地鐵站步行" },
      { spot: "홍대 입구 주변", desc: "成員常見的弘大咖啡廳街" },
    ],
    tip: "ENGENE 演唱會票在 Weverse 開搶，別忘記設好鬧鐘。",
  },
  {
    name: "(G)I-DLE", country: "kr", genre: "K-POP",
    tags: ["Cube", "전소연", "미연", "민니", "슈화", "우기"],
    pilgrimage: [
      { spot: "CUBE 娛樂（청담）", desc: "清潭洞，成員進出頻繁的公司周邊" },
      { spot: "홍대 인디씬", desc: "소연 等成員愛訪的獨立音樂場景區" },
      { spot: "인천 아시아드 주경기장", desc: "大型演唱會場地，直達地鐵可搭到" },
    ],
    tip: "Cube 演唱會票在 Melon Ticket、YES24 Ticket 同時開賣。",
  },
  // ── 韓劇演員 ──
  {
    name: "邊佑錫", country: "kr", genre: "韓劇演員",
    tags: ["변우석", "Byeon Woo Seok", "선재 업고 튀어"],
    pilgrimage: [
      { spot: "建大入口站 커먼그라운드", desc: "《我的幸福結局》拍攝地，建大貨櫃屋商城" },
      { spot: "聖水洞咖啡街", desc: "劇中多個場景取景地，打卡熱點" },
      { spot: "경복궁 서촌（景福宮西村）", desc: "劇中巷弄場景取景地，文青咖啡廳區" },
    ],
    tip: "見面會票在 Naver 抽選，需韓國手機號，建議找有信用的票務代理。",
  },
  {
    name: "朴寶劍", country: "kr", genre: "韓劇演員",
    tags: ["박보검", "Park Bo-gum", "請回答1988", "雲畫的月光"],
    pilgrimage: [
      { spot: "Blossom Entertainment（마포）", desc: "所屬公司，麻浦區" },
      { spot: "도봉구 骨目洞巷弄", desc: "《請回答1988》拍攝地，保存良好的復古街道" },
      { spot: "경복궁 일대", desc: "《雲畫的月光》古裝拍攝區域" },
    ],
    tip: "朴寶劍粉絲活動資訊看 Instagram @bogummy，見面會票透過 Weverse 關注。",
  },
  {
    name: "金秀賢", country: "kr", genre: "韓劇演員",
    tags: ["김수현", "Kim Soo-hyun", "來自星星的你", "皇后的傘兵"],
    pilgrimage: [
      { spot: "GOLDMEDALIST（강남）", desc: "江南區所屬公司，周邊高級咖啡廳多" },
      { spot: "남산 N서울타워", desc: "《來自星星的你》著名拍攝地，掛愛情鎖" },
      { spot: "인사동（仁寺洞）", desc: "劇中多處拍攝地，韓風餐廳與茶屋林立" },
    ],
    tip: "Kim Soo-hyun 見面會資訊在官方 Instagram，票務看 Interpark 公告。",
  },
  // ── J-POP / J-IDOL ──
  {
    name: "Snow Man", country: "jp", genre: "J-POP",
    tags: ["目黒蓮", "渡辺翔太", "深澤辰哉", "Johnny's"],
    pilgrimage: [
      { spot: "Johnny's 原宿店", desc: "官方周邊唯一實體店，入場需抽選" },
      { spot: "東京巨蛋周邊", desc: "大型巡演固定場地，周邊商品攤位超壯觀" },
      { spot: "代々木競技場", desc: "中型演唱會常用場地，原宿站步行 5 分" },
    ],
    tip: "Johnny's 演唱會票需日本住址，建議透過有信用粉絲代購或票務代理。",
  },
  {
    name: "乃木坂46", country: "jp", genre: "J-IDOL",
    tags: ["乃木坂", "賀喜遙香", "山下美月", "Sony Music"],
    pilgrimage: [
      { spot: "乃木坂站 Type Moon Square", desc: "官方展覽空間，成員簽名板、限定周邊" },
      { spot: "明治神宮外苑", desc: "握手會、巡演場地之一，周邊花圃超美" },
      { spot: "六本木ヒルズ", desc: "MV 拍攝地與媒體發布會常見場地" },
    ],
    tip: "握手券附在 CD 裡，官方網站或日本 Amazon 購入最穩。",
  },
  {
    name: "YOASOBI", country: "jp", genre: "J-POP",
    tags: ["幾田りら", "Ayase", "夜に駆ける", "Sony Music"],
    pilgrimage: [
      { spot: "澀谷 LINE CUBE", desc: "中小型演出常駐場地，音響超讚" },
      { spot: "さいたまスーパーアリーナ", desc: "大型演唱會場地，北浦和或大宮站轉接駁" },
      { spot: "原宿竹下通", desc: "MV 取景地，拍同款照" },
    ],
    tip: "Spotify / Apple Music 預存會員搶票有優先資格，國際信用卡可購。",
  },
  {
    name: "SixTONES", country: "jp", genre: "J-POP",
    tags: ["Johnny's", "京本大我", "ジェシー", "田中樹"],
    pilgrimage: [
      { spot: "Johnny's 原宿店", desc: "官方唯一實體周邊店，週末需排隊" },
      { spot: "横浜アリーナ", desc: "SixTONES 巡演常用場地，橫濱站轉接駁" },
      { spot: "東京ドームシティ Hall", desc: "中型巡演場地，春天開花季更美" },
    ],
    tip: "Johnny's 相關活動票券需日本地址，建議超早找代購安排。",
  },
  {
    name: "BE:FIRST", country: "jp", genre: "J-POP",
    tags: ["BMSG", "SKY-HI", "SOTA", "SHUNTO", "MANATO"],
    pilgrimage: [
      { spot: "渋谷 BMSG Office", desc: "BE:FIRST 所屬公司周邊，澀谷文化圈" },
      { spot: "Zepp 東京 / Zepp DiverCity", desc: "早期演出場地，小型演出票最搶手" },
      { spot: "さいたまスーパーアリーナ", desc: "大型演唱會場地" },
    ],
    tip: "BMSG 官方 App「BMSG MUSIC STORE」可直購周邊，票券在 e+ / Lawson 系統開賣。",
  },
  {
    name: "米津玄師", country: "jp", genre: "J-POP",
    tags: ["Kenshi Yonezu", "Lemon", "PaleBlue", "Sony Music"],
    pilgrimage: [
      { spot: "茨城県立カシマサッカースタジアム", desc: "YAN！YAN！YOU！演唱會拍攝地" },
      { spot: "澀谷 HMV record shop", desc: "米津作品展示與粉絲留言牆" },
      { spot: "東京都現代美術館（清澄白河）", desc: "PaleBlue 等 MV 取景地附近" },
    ],
    tip: "米津玄師演唱會票在 Sony Music 會員先行，競爭激烈建議加入 Fan Club。",
  },
  {
    name: "Official髭男dism", country: "jp", genre: "J-POP",
    tags: ["ヒゲダン", "pretender", "Subtitle", "IRORI Records"],
    pilgrimage: [
      { spot: "武道館（九段下）", desc: "日本最具歷史意義的演唱會場地" },
      { spot: "大阪城ホール", desc: "大阪巡演主場，大阪城公園站直達" },
      { spot: "松江市（島根）", desc: "成員出身地，鄉土情懷旅行" },
    ],
    tip: "票券在 e+ 或 Lawson Ticket 系統開賣，Fan Club 「BROTHERS & SISTERS」有先行資格。",
  },
];

// 無聖地資料的藝人（直接搜尋相關資訊）
const SIMPLE_ARTISTS = [
  { name: "ATEEZ", country: "kr" as const, genre: "K-POP", tags: ["KQ", "Hongjoong", "Mingi"] },
  { name: "MONSTA X", country: "kr" as const, genre: "K-POP", tags: ["Starship", "Shownu", "Joohoney"] },
  { name: "Red Velvet", country: "kr" as const, genre: "K-POP", tags: ["SM", "아이린", "슬기", "조이", "웬디", "예리"] },
  { name: "MAMAMOO", country: "kr" as const, genre: "K-POP", tags: ["RBW", "화사", "솔라", "문별", "휘인"] },
  { name: "TXT", country: "kr" as const, genre: "K-POP", tags: ["HYBE", "연준", "수빈", "범규", "태현", "휴닝카이"] },
  { name: "NMIXX", country: "kr" as const, genre: "K-POP", tags: ["JYP", "릴리", "해원", "설윤", "지우"] },
  { name: "LE SSERAFIM", country: "kr" as const, genre: "K-POP", tags: ["HYBE", "김채원", "사쿠라", "허윤진"] },
  { name: "DAY6", country: "kr" as const, genre: "K-POP", tags: ["JYP", "성진", "영케이", "원필", "도운"] },
  { name: "櫻坂46", country: "jp" as const, genre: "J-IDOL", tags: ["Sony Music", "森田ひかる", "藤吉夏鈴"] },
  { name: "日向坂46", country: "jp" as const, genre: "J-IDOL", tags: ["Sony Music", "小坂菜緒", "加藤史帆"] },
  { name: "King Gnu", country: "jp" as const, genre: "J-POP", tags: ["Ariola Japan", "常田大希", "井口理"] },
  { name: "藤井風", country: "jp" as const, genre: "J-POP", tags: ["hehn records", "死ぬのがいいわ", "岡山"] },
  { name: "Ado", country: "jp" as const, genre: "J-POP", tags: ["Universal Music", "うっせぇわ", "新時代"] },
  { name: "なにわ男子", country: "jp" as const, genre: "J-POP", tags: ["Johnny's", "道枝駿佑", "西畑大吾"] },
];

const COUNTRY_LABELS: Record<string, string> = { kr: "🇰🇷 韓國", jp: "🇯🇵 日本" };

export default function IdolView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Artist | null>(null);
  const [filter, setFilter] = useState<"all" | "kr" | "jp">("all");

  const filtered = ARTISTS.filter((a) => {
    const matchCountry = filter === "all" || a.country === filter;
    const q = query.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));
    return matchCountry && matchQ;
  });

  const simpleFiltered = SIMPLE_ARTISTS.filter((a) => {
    const matchCountry = filter === "all" || a.country === filter;
    const q = query.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));
    return matchCountry && matchQ;
  });

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">⭐ 追星行程</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        <div className="mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Idol Trip Planner</p>
          <h1 className="text-3xl font-light tracking-wide">追星也要<br className="sm:hidden" />規劃得剛剛好</h1>
          <p className="mt-3 text-sm font-light leading-7 text-[#6F675F]">
            選擇你的偶像，查演唱會資訊、聖地巡禮景點，一起規劃整趟追星旅程。
          </p>
        </div>

        {/* Search + filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            placeholder="搜尋藝人名稱，如：BTS、邊佑錫、Snow Man"
            className="h-12 flex-1 rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-5 text-sm font-light text-[#4B4037] outline-none placeholder:text-[#A79C91] focus:border-[#8FA39A]"
          />
          <div className="flex gap-2">
            {(["all", "kr", "jp"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-sm font-light transition ${
                  filter === f
                    ? "border-[#A86F5A] bg-[#A86F5A]/15 text-[#7D5548]"
                    : "border-[#D8D2C7] bg-[#FBF8F1] text-[#6F675F] hover:border-[#A86F5A]/50"
                }`}
              >
                {f === "all" ? "全部" : COUNTRY_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Artist cards */}
        {!selected && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((artist) => (
              <button
                key={artist.name}
                onClick={() => setSelected(artist)}
                className="rounded-[1.5rem] border border-[#D8D2C7] bg-[#FBF8F1] p-6 text-left transition hover:border-[#A86F5A]/60 hover:bg-[#FFFDF8] hover:shadow-sm"
              >
                <div className="mb-1 text-2xl">{artist.country === "kr" ? "🇰🇷" : "🇯🇵"}</div>
                <div className="mb-1 text-lg font-light tracking-wide text-[#3A2E26]">{artist.name}</div>
                <div className="mb-3 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">{artist.genre}</div>
                <div className="flex flex-wrap gap-1.5">
                  {artist.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full border border-[#D8D2C7] bg-white px-2.5 py-0.5 text-[11px] font-light text-[#6F675F]">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
            {/* 更多藝人（無聖地資料，顯示搜尋連結） */}
            {simpleFiltered.map((a) => (
              <a key={a.name}
                href={`https://www.google.com/search?q=${encodeURIComponent(a.name + " 演唱會 2026")}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-[1.5rem] border border-[#E0D9D2] bg-[#FAFAF8] p-6 text-left transition hover:border-[#A86F5A]/60 hover:bg-[#FFFDF8] block">
                <div className="mb-1 text-2xl">{a.country === "kr" ? "🇰🇷" : "🇯🇵"}</div>
                <div className="mb-1 text-lg font-light tracking-wide text-[#3A2E26]">{a.name}</div>
                <div className="mb-3 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">{a.genre}</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {a.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full border border-[#D8D2C7] bg-white px-2.5 py-0.5 text-[11px] font-light text-[#6F675F]">{t}</span>
                  ))}
                </div>
                <p className="text-[11px] font-light text-[#A86F5A]">查詢最新演唱會資訊 →</p>
              </a>
            ))}

            {filtered.length === 0 && simpleFiltered.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm font-light text-[#A79C91]">
                找不到「{query}」，試試其他名字？
              </div>
            )}
          </div>
        )}

        {/* Artist detail */}
        {selected && (
          <div>
            <button
              onClick={() => setSelected(null)}
              className="mb-6 text-sm font-light text-[#8A7F73] hover:text-[#A86F5A]"
            >
              ← 回列表
            </button>

            <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-8">
              <div className="mb-1 text-3xl">{selected.country === "kr" ? "🇰🇷" : "🇯🇵"}</div>
              <h2 className="mb-1 text-2xl font-light tracking-wide text-[#3A2E26]">{selected.name}</h2>
              <p className="mb-6 text-xs font-light uppercase tracking-widest text-[#8FA39A]">{selected.genre}</p>

              {/* Pilgrimage spots */}
              <div className="mb-8">
                <h3 className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-[#8FA39A]">聖地巡禮景點</h3>
                <div className="space-y-3">
                  {selected.pilgrimage.map((p, i) => (
                    <div key={i} className="flex gap-4 rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                      <span className="mt-0.5 flex-shrink-0 text-[#A86F5A]">𓂃</span>
                      <div>
                        <div className="text-sm font-light tracking-wide text-[#3A2E26]">{p.spot}</div>
                        <div className="mt-0.5 text-xs font-light leading-5 text-[#8A7F73]">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket tip */}
              <div className="mb-8 rounded-2xl border border-[#C4A882]/50 bg-[#FDF6ED] px-5 py-4">
                <div className="mb-1 text-[10px] font-light uppercase tracking-widest text-[#8FA39A]">購票小技巧</div>
                <p className="text-sm font-light leading-7 text-[#5C5248]">{selected.tip}</p>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    router.push(
                      `/trip/${encodeURIComponent(
                        selected.country === "kr" ? "首爾" : "東京"
                      )}?request=${encodeURIComponent(`追星 ${selected.name}`)}`
                    )
                  }
                  className="rounded-full border border-[#A86F5A] bg-[#B98774]/15 px-8 py-3 text-sm font-light tracking-[0.15em] text-[#7D5548] transition hover:bg-[#B98774]/25"
                >
                  ✈️ 規劃追星旅程
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-full border border-[#D8D2C7] bg-white px-8 py-3 text-sm font-light tracking-[0.15em] text-[#6F675F] transition hover:border-[#A86F5A]/50"
                >
                  選其他目的地
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
