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
  {
    name: "BTS", country: "kr", genre: "K-POP",
    tags: ["防彈少年團", "RM", "SUGA", "j-hope"],
    pilgrimage: [
      { spot: "HYBE Insight（龍山）", desc: "官方展覽館，常設展+特展，建議提前預約" },
      { spot: "三成 SM TOWN", desc: "週末常有成員目擊，周邊商品一站買齊" },
      { spot: "弘大 BigHit 舊址周邊", desc: "早期練習室所在地，粉絲朝聖必去" },
    ],
    tip: "演唱會票在 Weverse Shop 優先開搶，信用卡建議備韓國代理人。",
  },
  {
    name: "BLACKPINK", country: "kr", genre: "K-POP",
    tags: ["YG", "Jennie", "Lisa", "Rosé", "Jisoo"],
    pilgrimage: [
      { spot: "YG 娛樂大樓（合井）", desc: "成員進出必經之地，周邊咖啡廳值得一坐" },
      { spot: "홍대 소녀상 附近", desc: "Jennie 出沒的弘大咖啡街區域" },
      { spot: "COEX Artium 購物中心", desc: "大型粉絲快閃活動常在此舉辦" },
    ],
    tip: "YG 相關演出多在高尺天空巨蛋，交通建議搭地鐵 1 號線。",
  },
  {
    name: "邊佑錫", country: "kr", genre: "韓劇演員",
    tags: ["변우석", "Byeon Woo Seok", "우석"],
    pilgrimage: [
      { spot: "建大入口站 커먼그라운드", desc: "《戀愛大腦》拍攝地，建大貨櫃屋商城" },
      { spot: "聖水洞咖啡街", desc: "劇中多個場景取景地，打卡熱點" },
      { spot: "乙支路 힙지로", desc: "復古氛圍劇照拍攝場景周邊" },
    ],
    tip: "見面會票常在 Naver 抽選，需要韓國手機號或代理人協助購票。",
  },
  {
    name: "Snow Man", country: "jp", genre: "J-POP",
    tags: ["目黒蓮", "渡辺翔太", "深澤辰哉"],
    pilgrimage: [
      { spot: "Johnny's 原宿店", desc: "官方周邊唯一實體店，入場需抽選" },
      { spot: "東京巨蛋周邊", desc: "大型巡演固定場地，周邊商品攤位超壯觀" },
      { spot: "澀谷 HMV & Books", desc: "粉絲留言板、簽名展示常在此" },
    ],
    tip: "Johnny's 演唱會票需日本住址，建議透過有信用粉絲代購或票務代理。",
  },
  {
    name: "乃木坂46", country: "jp", genre: "J-IDOL",
    tags: ["乃木坂", "賀喜遙香", "山下美月"],
    pilgrimage: [
      { spot: "乃木坂站 Type Moon Square", desc: "官方展覽空間，成員簽名板、限定周邊" },
      { spot: "明治神宮外苑", desc: "握手會、巡演場地之一，周邊花圃超美" },
      { spot: "六本木 Mori Art Museum", desc: "成員常出席活動的文化場域" },
    ],
    tip: "握手券附在 CD 裡，官方網站或日本 Amazon 購入最穩。",
  },
  {
    name: "YOASOBI", country: "jp", genre: "J-POP",
    tags: ["幾田りら", "Ayase", "夜に駆ける"],
    pilgrimage: [
      { spot: "澀谷 LINE CUBE", desc: "中小型演出常駐場地，音響超讚" },
      { spot: "東京 Zepp 系列", desc: "早期小型演出場地，現在已難買到票" },
      { spot: "原宿竹下通", desc: "MV 取景地，拍同款照" },
    ],
    tip: "Spotify / Apple Music 預存會員搶票有優先資格，國際卡可購。",
  },
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
    const matchQ =
      !q ||
      a.name.toLowerCase().includes(q) ||
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
            {filtered.length === 0 && (
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
