"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const WIDGET_SRC =
  "https://tp.media/content?trs=397492&shmarker=624752&locale=zh-tw&curr=twd&powered_by=true&border_radius=10&plain=true&color_button=%23A86F5A&color_button_text=%23ffffff&color_border=%23D8D2C7&color_focused_input=%23A86F5A&color_title=%234B4037&color_input_background=%23FBF8F1&width=800&promo_id=4132&campaign_id=121";

export default function FlightsView() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.charset = "utf-8";
    containerRef.current.appendChild(script);
    return () => {
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#4B4037]">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DDD6CA] bg-[#F7F3EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <button onClick={() => router.push("/")} className="text-sm font-light text-[#6F675F] hover:text-[#A86F5A]">← 返回</button>
          <div className="text-xl font-light tracking-[0.18em]">✈️ 機票比價</div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-light tracking-wide">即時機票比價</h1>
          <p className="mt-2 text-sm font-light text-[#8A7F73]">搜尋台灣出發的最低票價，比較各航空公司的價格</p>
        </div>

        <div className="rounded-2xl border border-[#D8D2C7] bg-[#FBF8F1] p-6 overflow-hidden">
          <div id="tp-widget-container" ref={containerRef} />
        </div>

        <p className="mt-4 text-xs font-light text-[#A79C91]">
          機票價格由第三方服務提供，實際票價以航空公司官方為準。本站為 Travelpayouts 聯盟合作夥伴，
          透過本站連結購票，可支持出國優轉持續營運，不影響您的購票價格。
        </p>
      </div>
    </main>
  );
}
