"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import rawData from "../lib/idol_events.json";

type Group  = { name: string; search_name: string; agency: string; genre: string; category?: string };
type Actor  = { name: string; search_name: string; known_for: string; agency: string; type: string };
type FanShop = { name: string; type: string; location: string };

type IdolData = {
  groups: { JP: Group[]; KR: Group[] };
  actors: { JP: Actor[]; KR: Actor[] };
  fan_shops: { JP: FanShop[]; KR: FanShop[] };
  tips: string[];
};

const DATA = rawData as unknown as IdolData;

// ── 搜尋連結生成 ──────────────────────────────────────────
function googleSearch(name: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(name + " 演唱會 2026 台灣")}`;
}
function ticketSearch(name: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(name + " 演唱會 台灣 售票")}`;
}
function youtubeSearch(name: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`;
}

// ── 分類 Tab ──────────────────────────────────────────────
type TabId = "kpop" | "kdrama" | "jpop_idol" | "jpop_singer" | "jp_actor" | "fanshop" | "tips";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "kpop",        label: "K-POP",     icon: "🇰🇷" },
  { id: "kdrama",      label: "韓劇演員",   icon: "🎬" },
  { id: "jpop_idol",   label: "日本偶像",   icon: "🇯🇵" },
  { id: "jpop_singer", label: "日本歌手",   icon: "🎤" },
  { id: "jp_actor",    label: "日本演員",   icon: "🎥" },
  { id: "fanshop",     label: "周邊商店",   icon: "🛍️" },
  { id: "tips",        label: "搶票攻略",   icon: "🎟️" },
];

// 分類資料
const KR_GROUPS = DATA.groups.KR;                              // 25 組
const KR_ACTORS = DATA.actors.KR;                             // 24 人
const JP_IDOLS  = DATA.groups.JP.filter((g) => g.category === "偶像");  // Johnny's / 坂道等
const JP_SINGERS = DATA.groups.JP.filter((g) => g.category === "歌手"); // YOASOBI / 髭男 等
const JP_ACTORS  = DATA.actors.JP;                            // 11 人

// ── 卡片元件 ─────────────────────────────────────────────
function GroupCard({ g, country }: { g: Group; country: "KR" | "JP" }) {
  const flag = country === "KR" ? "🇰🇷" : "🇯🇵";
  return (
    <div className="rounded-2xl border border-[#D8D2C7] bg-white p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-base font-light text-[#3A2E26]">{g.name}</p>
          <p className="text-xs font-light text-[#8A7F73] mt-0.5">{g.agency} · {g.genre}</p>
        </div>
        <span className="text-lg">{flag}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={googleSearch(g.search_name)} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-[#A86F5A]/40 bg-[#A86F5A]/5 px-3 py-1 text-xs font-light text-[#A86F5A] transition hover:bg-[#A86F5A]/15">
          查演唱會資訊 →
        </a>
        <a href={ticketSearch(g.search_name)} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-[#D8D2C7] px-3 py-1 text-xs font-light text-[#6F675F] transition hover:border-[#A86F5A]">
          售票資訊
        </a>
        <a href={youtubeSearch(g.search_name)} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-[#D8D2C7] px-3 py-1 text-xs font-light text-[#6F675F] transition hover:border-[#A86F5A]">
          YouTube
        </a>
      </div>
    </div>
  );
}

function ActorCard({ a, country }: { a: Actor; country: "KR" | "JP" }) {
  const flag = country === "KR" ? "🇰🇷" : "🇯🇵";
  return (
    <div className="rounded-2xl border border-[#D8D2C7] bg-white p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-base font-light text-[#3A2E26]">{a.name}</p>
          <p className="text-xs font-light text-[#A86F5A] mt-0.5">{a.type}</p>
          <p className="text-xs font-light text-[#8A7F73] mt-0.5 leading-5">{a.known_for}</p>
        </div>
        <span className="text-lg">{flag}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <a href={googleSearch(a.search_name)} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-[#A86F5A]/40 bg-[#A86F5A]/5 px-3 py-1 text-xs font-light text-[#A86F5A] transition hover:bg-[#A86F5A]/15">
          查粉絲見面會 →
        </a>
        <a href={`https://www.google.com/search?q=${encodeURIComponent(a.search_name + " 聖地巡禮 台灣粉絲")}`} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-[#D8D2C7] px-3 py-1 text-xs font-light text-[#6F675F] transition hover:border-[#A86F5A]">
          聖地巡禮
        </a>
      </div>
    </div>
  );
}

export default function IdolView() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("kpop");
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();

  const filtered = {
    kpop:        KR_GROUPS.filter((g) => !q || g.name.toLowerCase().includes(q) || g.agency.toLowerCase().includes(q) || g.search_name.toLowerCase().includes(q)),
    kdrama:      KR_ACTORS.filter((a) => !q || a.name.includes(q) || a.known_for.includes(q) || a.search_name.toLowerCase().includes(q)),
    jpop_idol:   JP_IDOLS.filter((g)  => !q || g.name.toLowerCase().includes(q) || g.agency.toLowerCase().includes(q)),
    jpop_singer: JP_SINGERS.filter((g) => !q || g.name.toLowerCase().includes(q) || g.agency.toLowerCase().includes(q)),
    jp_actor:    JP_ACTORS.filter((a) => !q || a.name.includes(q) || a.known_for.includes(q)),
  };

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => router.push("/")} className="text-lg font-light tracking-[0.18em]">✈️ 出國優轉</button>
          <span className="text-xs font-light text-[#8A7F73] tracking-widest uppercase">追星行程</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="mb-2 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">Idol Travel</p>
          <h1 className="text-3xl font-light tracking-wide mb-3">追星行程規劃</h1>
          <p className="text-sm font-light text-[#8A7F73]">
            K-POP {KR_GROUPS.length} 組・韓劇演員 {KR_ACTORS.length} 位・日本偶像 {JP_IDOLS.length} 組・日本歌手 {JP_SINGERS.length} 組・日本演員 {JP_ACTORS.length} 位
          </p>
        </div>

        {/* 搜尋 */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋藝人名稱、事務所…"
            className="w-full rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] px-5 py-3 text-sm font-light text-[#4B4037] outline-none focus:border-[#A86F5A] placeholder:text-[#A79C91]"
          />
        </div>

        {/* Tab */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`rounded-full border px-4 py-2 text-sm font-light transition-all
                ${tab === id
                  ? "border-[#A86F5A] bg-[#A86F5A] text-white"
                  : "border-[#D8D2C7] bg-[#FBF8F1] text-[#4B4037] hover:border-[#A86F5A]"}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* K-POP */}
        {tab === "kpop" && (
          <div>
            <p className="text-xs font-light text-[#8A7F73] mb-4">共 {filtered.kpop.length} 組</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.kpop.map((g) => <GroupCard key={g.name} g={g} country="KR" />)}
            </div>
          </div>
        )}

        {/* 韓劇演員 */}
        {tab === "kdrama" && (
          <div>
            <p className="text-xs font-light text-[#8A7F73] mb-4">共 {filtered.kdrama.length} 位</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.kdrama.map((a) => <ActorCard key={a.name} a={a} country="KR" />)}
            </div>
          </div>
        )}

        {/* 日本偶像 */}
        {tab === "jpop_idol" && (
          <div>
            <p className="text-xs font-light text-[#8A7F73] mb-4">共 {filtered.jpop_idol.length} 組（Johnny's・坂道系等）</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.jpop_idol.map((g) => <GroupCard key={g.name} g={g} country="JP" />)}
            </div>
          </div>
        )}

        {/* 日本歌手 */}
        {tab === "jpop_singer" && (
          <div>
            <p className="text-xs font-light text-[#8A7F73] mb-4">共 {filtered.jpop_singer.length} 組</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.jpop_singer.map((g) => <GroupCard key={g.name} g={g} country="JP" />)}
            </div>
          </div>
        )}

        {/* 日本演員 */}
        {tab === "jp_actor" && (
          <div>
            <p className="text-xs font-light text-[#8A7F73] mb-4">共 {filtered.jp_actor.length} 位</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.jp_actor.map((a) => <ActorCard key={a.name} a={a} country="JP" />)}
            </div>
          </div>
        )}

        {/* 周邊商店 */}
        {tab === "fanshop" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🇰🇷 韓國周邊商店</p>
              <div className="space-y-3">
                {DATA.fan_shops.KR.map((s) => (
                  <div key={s.name} className="rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                    <p className="text-sm font-light text-[#3A2E26]">{s.name}</p>
                    <p className="text-xs font-light text-[#A86F5A] mt-0.5">{s.type}</p>
                    <p className="text-xs font-light text-[#8A7F73] mt-0.5">📍 {s.location}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-4">🇯🇵 日本周邊商店</p>
              <div className="space-y-3">
                {DATA.fan_shops.JP.map((s) => (
                  <div key={s.name} className="rounded-2xl border border-[#D8D2C7] bg-white px-5 py-4">
                    <p className="text-sm font-light text-[#3A2E26]">{s.name}</p>
                    <p className="text-xs font-light text-[#A86F5A] mt-0.5">{s.type}</p>
                    <p className="text-xs font-light text-[#8A7F73] mt-0.5">📍 {s.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 搶票攻略 */}
        {tab === "tips" && (
          <div className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-7">
            <p className="text-xs font-light uppercase tracking-widest text-[#8A7F73] mb-5">🎟️ 搶票 & 追星攻略</p>
            <ul className="space-y-4">
              {DATA.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm font-light text-[#4B4037] leading-7">
                  <span className="shrink-0 mt-2 w-5 h-5 rounded-full bg-[#A86F5A]/10 text-[#A86F5A] text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://ticket.interpark.com" target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]">
                Interpark 售票 →
              </a>
              <a href="https://ticket.melon.com" target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]">
                Melon Ticket →
              </a>
              <a href="https://weverseshop.io" target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]">
                Weverse Shop →
              </a>
              <a href="https://eplus.jp" target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-[#D8D2C7] bg-white px-4 py-2 text-xs font-light text-[#4B4037] transition hover:border-[#A86F5A]">
                e+ 日本售票 →
              </a>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex gap-3">
          <button
            onClick={() => router.push("/wizard")}
            className="flex-1 rounded-full bg-[#A86F5A] py-4 text-sm font-light tracking-[0.15em] text-white shadow-md transition hover:bg-[#96604D]"
          >
            規劃追星行程 →
          </button>
          <button
            onClick={() => router.push("/flights")}
            className="rounded-full border border-[#D8D2C7] bg-[#FBF8F1] px-6 py-4 text-sm font-light text-[#6F675F] transition hover:border-[#A86F5A]"
          >
            查機票
          </button>
        </div>
      </div>
    </main>
  );
}
