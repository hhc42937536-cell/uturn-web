"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const destinations = ["首爾", "東京", "大阪", "曼谷", "新加坡", "香港", "沖繩", "胡志明市", "釜山"];
const departureCities = ["高雄", "台北", "台中", "台南"];

const inputClass =
  "h-14 w-full rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 text-base font-light text-[#4B4037] outline-none transition placeholder:text-[#A79C91] focus:border-[#8FA39A] focus:bg-white";

export default function HomePage() {
  const [form, setForm] = useState({
    destination: "首爾",
    departureDate: "",
    returnDate: "",
    departureCity: "高雄",
    people: "2",
    request: "",
  });

  const router = useRouter();

  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams({
      departureDate: form.departureDate,
      returnDate: form.returnDate,
      people: form.people,
      request: form.request,
    });
    router.push(`/trip/${encodeURIComponent(form.destination)}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-xl font-light tracking-[0.18em] text-[#4B4037]">
            ✈️ 出國優轉
          </div>
          <div className="flex gap-6 text-sm font-light tracking-widest text-[#6F675F]">
            <a href="/explore" className="transition hover:text-[#A86F5A]">社群行程</a>
            <a href="/nearby" className="transition hover:text-[#A86F5A]">📍 附近景點</a>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[#EDE7DD] pb-24 pt-36">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 text-xs font-light uppercase tracking-[0.45em] text-[#8FA39A]">
              AbroadUturn Travel Planner
            </p>
            <h1 className="text-5xl font-light leading-[1.18] tracking-wide text-[#4B4037] md:text-7xl">
              說走就走，<br />
              3分鐘搞定旅程
            </h1>
            <p className="mt-7 max-w-xl text-lg font-light leading-9 tracking-wide text-[#6F675F]">
              台灣人專屬出國旅程規劃師，替你把日期、目的地與小小願望，
              慢慢整理成一趟剛剛好的旅行。
            </p>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-[3rem] border border-[#D8D2C7] bg-[#F9F6EF] p-10">
              <div className="mx-auto h-64 w-64 rounded-full border border-[#CFC6B8] bg-[#E5DDD0]" />
              <div className="mt-8 space-y-3 text-center">
                <p className="text-3xl">☁️ 𓂃 ✈︎</p>
                <p className="text-sm font-light tracking-[0.3em] text-[#8A7F73]">
                  quiet travel, gentle plan
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto mt-14 max-w-7xl px-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1]/95 p-6 md:p-8"
          >
            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-6">
              <label className="block">
                <span className="mb-2 block text-sm font-light tracking-widest text-[#6F675F]">目的地</span>
                <select name="destination" value={form.destination} onChange={updateForm} className={inputClass}>
                  {destinations.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-light tracking-widest text-[#6F675F]">出發日期</span>
                <input type="date" name="departureDate" value={form.departureDate} onChange={updateForm} className={inputClass} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-light tracking-widest text-[#6F675F]">回程日期</span>
                <input type="date" name="returnDate" value={form.returnDate} onChange={updateForm} className={inputClass} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-light tracking-widest text-[#6F675F]">出發地</span>
                <select name="departureCity" value={form.departureCity} onChange={updateForm} className={inputClass}>
                  {departureCities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-light tracking-widest text-[#6F675F]">人數</span>
                <select name="people" value={form.people} onChange={updateForm} className={inputClass}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}人</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-light tracking-widest text-[#6F675F]">特別需求</span>
                <input
                  name="request"
                  value={form.request}
                  onChange={updateForm}
                  placeholder="咖啡店、老街、美術館…"
                  className={inputClass}
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-full border border-[#A86F5A] bg-[#B98774]/15 py-5 text-base font-light tracking-[0.2em] text-[#7D5548] transition hover:bg-[#B98774]/25"
            >
              立即規劃行程
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-24 md:grid-cols-3">
        {[
          { icon: "🗺️", title: "地圖式規劃", desc: "拖拉景點到各天，自動按地理位置排最佳路線。LINE Bot 做不到的事。", href: "/planner/首爾" },
          { icon: "📍", title: "附近景點", desc: "出國後開啟定位，立即找出你周圍最值得去的景點與美食。", href: "/nearby" },
          { icon: "🌏", title: "社群行程牆", desc: "看台灣旅客分享的行程，一鍵複製當自己的，Google 也搜尋得到。", href: "/explore" },
        ].map(({ icon, title, desc, href }) => (
          <a
            key={title}
            href={href}
            className="rounded-[2rem] border border-[#D8D2C7] bg-[#FBF8F1] p-10 transition hover:bg-[#FFFDF8] hover:border-[#A86F5A] block"
          >
            <div className="mb-6 text-4xl text-[#8FA39A]">{icon}</div>
            <h3 className="mb-4 text-2xl font-light tracking-wide text-[#4B4037]">{title}</h3>
            <p className="font-light leading-8 tracking-wide text-[#6F675F]">{desc}</p>
          </a>
        ))}
      </section>

      <footer className="border-t border-[#D8D2C7] bg-[#EFE9DF] px-6 py-10 text-center text-sm font-light tracking-widest text-[#7C7168]">
        © 2026 出國優轉 AbroadUturn
      </footer>
    </main>
  );
}
