import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const maxDuration = 60;

const RESEND_API = "https://api.resend.com/emails";

// 每 5 天通知一次
const NOTIFY_INTERVAL_DAYS = 5;

function buildEmail(email: string, tracks: {
  dest_label: string; dest_flag: string;
  dep_date: string; price_ref: string;
  skyscanner_url: string; google_flights_url: string;
}[]): string {
  const rows = tracks.map((t) => `
    <div style="border:1px solid #EDE7DD;border-radius:16px;padding:16px 20px;margin-bottom:12px;background:#FFFDF8;">
      <p style="font-size:16px;font-weight:300;color:#4B4037;margin:0 0 4px">${t.dest_flag} ${t.dest_label}</p>
      <p style="font-size:12px;color:#8A7F73;margin:0 0 12px">出發日 ${t.dep_date}　追蹤時票價 <strong style="color:#A86F5A">${t.price_ref}</strong></p>
      <a href="${t.skyscanner_url}" style="display:inline-block;background:#A86F5A;color:white;border-radius:100px;padding:8px 20px;font-size:12px;font-weight:300;text-decoration:none;margin-right:8px">查 Skyscanner</a>
      <a href="${t.google_flights_url}" style="display:inline-block;border:1px solid #D8D2C7;color:#6F675F;border-radius:100px;padding:8px 16px;font-size:12px;font-weight:300;text-decoration:none">Google Flights</a>
    </div>`).join("");

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#F7F3EC;padding:40px 20px;max-width:600px;margin:0 auto">
    <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#8FA39A;margin:0 0 8px">✈️ 出國優轉</p>
    <h1 style="font-size:22px;font-weight:300;color:#4B4037;margin:0 0 6px">你追蹤的機票，記得去查價</h1>
    <p style="font-size:13px;color:#8A7F73;margin:0 0 24px">以下是你目前追蹤中的航線，低於當初參考價就是好時機。</p>
    ${rows}
    <p style="font-size:11px;color:#A79C91;margin-top:32px">
      這封信由出國優轉自動寄出，每 ${NOTIFY_INTERVAL_DAYS} 天提醒一次。<br>
      如要取消追蹤，請至網站 <a href="https://uturn.vercel.app/tracking" style="color:#A86F5A">/tracking</a> 頁面刪除紀錄。
    </p>
  </body></html>`;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });

  const cutoff = new Date(Date.now() - NOTIFY_INTERVAL_DAYS * 86400000).toISOString();

  // 找需要通知的紀錄（last_notified 為 null 或超過間隔）
  const { data: rows, error } = await supabase
    .from("flight_tracks")
    .select("*")
    .or(`last_notified.is.null,last_notified.lt.${cutoff}`)
    .order("email");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows?.length) return NextResponse.json({ sent: 0 });

  // 依 email 分組
  const byEmail: Record<string, typeof rows> = {};
  for (const r of rows) {
    (byEmail[r.email] ??= []).push(r);
  }

  let sent = 0;
  const now = new Date().toISOString();

  for (const [email, tracks] of Object.entries(byEmail)) {
    const html = buildEmail(email, tracks);
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: "出國優轉 <noreply@abroaduturn.com>",
        to: email,
        subject: `✈️ 你追蹤的 ${tracks.length} 條航線，記得去查價`,
        html,
      }),
    });
    if (res.ok) {
      // 更新 last_notified
      const ids = tracks.map((t) => t.id);
      await supabase.from("flight_tracks").update({ last_notified: now }).in("id", ids);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
