import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export const maxDuration = 60;

async function fetchCurrentPrice(origin: string, dest: string, depDate: string): Promise<number | null> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return null;
  try {
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${dest}&departure_at=${depDate}&currency=twd&sorting=price&limit=1&token=${token}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.price ?? null;
  } catch {
    return null;
  }
}

function buildAlertEmail(alert: {
  dest_label: string; dep_date: string; ref_price: number; current_price: number;
}): string {
  const drop = alert.ref_price - alert.current_price;
  const pct = Math.round((drop / alert.ref_price) * 100);
  const depFmt = new Date(alert.dep_date).toLocaleDateString("zh-TW", { month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E0D9D2">
    <div style="background:#4A7C6F;padding:32px;text-align:center">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase">Price Alert</p>
      <h1 style="margin:0;font-size:24px;font-weight:300;color:#fff">機票降價了！</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85)">${alert.dest_label}　${depFmt} 出發</p>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="font-size:13px;color:#8A7F73;margin:0 0 20px">你追蹤的航線票價下降了</p>
      <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:24px">
        <div>
          <p style="font-size:11px;color:#A79C91;margin:0 0 4px">原參考價</p>
          <p style="font-size:22px;color:#A79C91;text-decoration:line-through;margin:0">NT$ ${alert.ref_price.toLocaleString()}</p>
        </div>
        <div style="font-size:24px;color:#4A7C6F">↓</div>
        <div>
          <p style="font-size:11px;color:#4A7C6F;margin:0 0 4px">現在票價</p>
          <p style="font-size:32px;font-weight:300;color:#4A7C6F;margin:0">NT$ ${alert.current_price.toLocaleString()}</p>
        </div>
      </div>
      <div style="background:#F0FAF7;border-radius:16px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#4A7C6F">便宜了 NT$ ${drop.toLocaleString()}（${pct}%）</p>
      </div>
      <a href="https://www.skyscanner.com.tw/transport/flights/tpe/${alert.dest_label.substring(0, 3)}/"
         style="display:inline-block;padding:14px 36px;background:#4A7C6F;color:#fff;border-radius:999px;text-decoration:none;font-size:14px;font-weight:300;letter-spacing:1px">
        立即搶購 →
      </a>
    </div>
    <div style="background:#F7F3EC;padding:16px 32px;text-align:center;border-top:1px solid #EDE7DD">
      <p style="margin:0;font-size:11px;color:#A79C91">由 出國優轉 自動發送・<a href="https://uturn-web.vercel.app" style="color:#A86F5A;text-decoration:none">uturn-web.vercel.app</a></p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmail(to: string, destLabel: string, depDate: string, refPrice: number, currentPrice: number): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "出國優轉 <noreply@abroaduturn.com>",
      to: [to],
      subject: `📉 ${destLabel} 機票降價！現在 NT$${currentPrice.toLocaleString()}`,
      html: buildAlertEmail({ dest_label: destLabel, dep_date: depDate, ref_price: refPrice, current_price: currentPrice }),
    }),
  });
  return res.ok;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 只查 90 天內出發、尚未過期的追蹤
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const { data: alerts, error } = await supabase
    .from("flight_price_alerts")
    .select("id,user_email,origin_code,dest_code,dest_label,dep_date,ref_price")
    .gte("dep_date", today)
    .lte("dep_date", maxDateStr);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!alerts?.length) return NextResponse.json({ checked: 0, sent: 0 });

  let sent = 0;
  for (const alert of alerts) {
    const currentPrice = await fetchCurrentPrice(alert.origin_code, alert.dest_code, alert.dep_date);
    if (!currentPrice) continue;

    // 降幅超過 5% 才通知
    const dropPct = (alert.ref_price - currentPrice) / alert.ref_price;
    if (dropPct < 0.05) continue;

    const ok = await sendEmail(alert.user_email, alert.dest_label, alert.dep_date, alert.ref_price, currentPrice);
    if (ok) {
      await supabase
        .from("flight_price_alerts")
        .update({ sent_at: new Date().toISOString(), last_notified_price: currentPrice })
        .eq("id", alert.id);
      sent++;
    }
  }

  return NextResponse.json({ checked: alerts.length, sent });
}
