import { NextRequest, NextResponse } from "next/server";

type DayPlan = {
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
  note: string;
};

function buildHtml(params: {
  destination: string;
  depDate: string;
  retDate: string;
  people: number;
  itinerary: DayPlan[];
}): string {
  const { destination, depDate, retDate, people, itinerary } = params;

  const fmt = (s: string) => {
    const d = new Date(s);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const dayRows = itinerary
    .map((day, i) => {
      const d = new Date(depDate);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      return `
      <div style="margin-bottom:20px;border:1px solid #EDE7DD;border-radius:16px;overflow:hidden">
        <div style="background:#EDE7DD;padding:10px 18px">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8FA39A">Day ${i + 1}</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:300;color:#4B4037">${dateStr}（${["日", "一", "二", "三", "四", "五", "六"][d.getDay()]}）</p>
        </div>
        <div style="padding:14px 18px;background:#fff">
          <p style="margin:0 0 8px;font-size:13px;color:#5C5248"><strong style="color:#A86F5A">☀️ 上午</strong>　${day.morning}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#5C5248"><strong style="color:#A86F5A">🌤 下午</strong>　${day.afternoon}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#5C5248"><strong style="color:#A86F5A">🌙 晚上</strong>　${day.evening}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#5C5248"><strong style="color:#A86F5A">🍜 美食</strong>　${day.food}</p>
          ${day.note ? `<p style="margin:8px 0 0;font-size:12px;color:#8A7F73;border-top:1px dashed #EDE7DD;padding-top:8px">💡 ${day.note}</p>` : ""}
        </div>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E0D9D2">

    <div style="background:#A86F5A;padding:32px;text-align:center">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase">Your Itinerary</p>
      <h1 style="margin:0;font-size:26px;font-weight:300;color:#fff;letter-spacing:2px">${destination} 旅遊行程</h1>
      <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.85)">
        ${fmt(depDate)} → ${fmt(retDate)}　·　${itinerary.length} 天　·　${people} 人
      </p>
    </div>

    <div style="padding:28px">
      <p style="font-size:13px;font-weight:300;color:#6F675F;margin:0 0 20px;line-height:1.8">
        以下是你的 ${destination} 完整行程，由 AI 規劃，每日包含上午 / 下午 / 晚上 / 美食建議。
      </p>

      ${dayRows}

      <div style="text-align:center;margin-top:24px">
        <a href="https://uturn-web.vercel.app/wizard"
           style="display:inline-block;padding:13px 32px;background:#A86F5A;color:#fff;border-radius:999px;text-decoration:none;font-size:13px;font-weight:300;letter-spacing:1px">
          重新規劃或下載 Word →
        </a>
      </div>
    </div>

    <div style="background:#F7F3EC;padding:16px 32px;text-align:center;border-top:1px solid #EDE7DD">
      <p style="margin:0;font-size:11px;color:#A79C91;font-weight:300">
        由 出國優轉 自動發送・<a href="https://uturn-web.vercel.app" style="color:#A86F5A;text-decoration:none">uturn-web.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "no key" }, { status: 500 });

  const body = await req.json();
  const { email, destination, depDate, retDate, people, itinerary } = body;
  if (!email || !destination || !itinerary?.length) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "出國優轉 <noreply@abroaduturn.com>",
      to: [email],
      subject: `✈️ 你的 ${destination} ${itinerary.length} 天行程來了`,
      html: buildHtml({ destination, depDate, retDate, people: Number(people) || 2, itinerary }),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err?.message ?? "send failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
