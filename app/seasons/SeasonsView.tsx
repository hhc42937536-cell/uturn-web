"use client";

import { useRouter } from "next/navigation";
import { SEASON_DATA } from "../lib/staticData";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function getCellStyle(month: number, best: number[], ok: number[], avoid: number[]) {
  if (best.includes(month)) return "bg-[#8FA39A] text-white";
  if (avoid.includes(month)) return "bg-red-100 text-red-400";
  if (ok.includes(month)) return "bg-[#C4A882]/50 text-[#6F675F]";
  return "bg-gray-100 text-gray-300";
}

function getCellDot(month: number, best: number[], ok: number[], avoid: number[]) {
  if (best.includes(month)) return "●";
  if (avoid.includes(month)) return "✕";
  if (ok.includes(month)) return "◑";
  return "·";
}

export default function SeasonsView() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">🗓️ 旅遊旺季月曆</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <div className="mb-2">
          <h1 className="text-2xl font-light tracking-wide">各城市最佳出遊月份</h1>
          <p className="mt-1 text-sm font-light text-[#8A7F73]">點選城市名稱可查看行程規劃</p>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4 text-xs font-light">
          <div className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded bg-[#8FA39A]" />
            <span className="text-[#6F675F]">最佳季節</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded bg-[#C4A882]/50" />
            <span className="text-[#6F675F]">還不錯</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded bg-red-100" />
            <span className="text-[#6F675F]">建議避開</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded bg-gray-100" />
            <span className="text-[#6F675F]">普通</span>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1]">
          <table className="w-full min-w-[640px] text-center text-xs">
            <thead>
              <tr className="border-b border-[#D8D2C7]">
                <th className="w-28 px-4 py-3 text-left text-xs font-light tracking-widest text-[#6F675F]">城市</th>
                {MONTHS.map((m) => (
                  <th key={m} className="px-1 py-3 font-light text-[#6F675F]">{m}月</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEASON_DATA.map((row, ri) => (
                <tr key={row.city} className={ri % 2 === 0 ? "" : "bg-[#F5F1EA]"}>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={() => router.push(`/trip/${encodeURIComponent(row.city)}`)}
                      className="flex items-center gap-1.5 text-sm font-light text-[#4B4037] hover:text-[#A86F5A] transition"
                    >
                      <span>{row.flag}</span>
                      <span className="underline underline-offset-2 decoration-dotted">{row.city}</span>
                    </button>
                  </td>
                  {MONTHS.map((m) => (
                    <td key={m} className="px-1 py-1.5">
                      <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${getCellStyle(m, row.best, row.ok, row.avoid)}`}>
                        {getCellDot(m, row.best, row.ok, row.avoid)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs font-light text-[#8A7F73]">
          ● 最佳出遊 ◑ 還不錯 ✕ 建議避開 · 普通（資料僅供參考）
        </p>
      </div>
    </main>
  );
}
