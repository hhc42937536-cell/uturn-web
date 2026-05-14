import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import visaData from "@/app/lib/visa.json";
import tipsData from "@/app/lib/insider_tips.json";

export const maxDuration = 60;

// 目的地名稱 → 簽證國碼
const DEST_TO_VISA: Record<string, string> = {
  東京: "JP", 大阪: "JP", 沖繩: "JP", 福岡: "JP", 北海道: "JP", 名古屋: "JP",
  首爾: "KR", 釜山: "KR", 濟州: "KR",
  曼谷: "TH", 清邁: "TH", 普吉島: "TH",
  新加坡: "SG", 吉隆坡: "MY", 蘭卡威: "MY",
  峇里島: "ID", 胡志明市: "VN", 河內: "VN", 峴港: "VN",
  香港: "HK", 澳門: "MO",
  馬尼拉: "PH", 宿霧: "PH",
  杜拜: "AE", 倫敦: "GB", 巴黎: "FR", 關島: "GU", 帛琉: "PW",
};

// 目的地名稱 → insider_tips 城市碼
const DEST_TO_TIPS: Record<string, string> = {
  東京: "TYO", 大阪: "OSA", 首爾: "SEL", 釜山: "PUS",
  曼谷: "BKK", 新加坡: "SIN", 香港: "HKG", 沖繩: "OKA", 胡志明市: "SGN",
};

type VisaEntry = {
  name: string; flag: string; visa: string; days: number;
  note: string; entry_tips: string; customs: string; taboos: string; sim: string;
};
type TipsEntry = {
  city: string;
  ticket: string[];
  crowd: string[];
  transport: string[];
};

function buildEmailHtml(destination: string, depDate: string): string {
  const visaCode = DEST_TO_VISA[destination];
  const tipsCode = DEST_TO_TIPS[destination];
  const visa = visaCode ? (visaData as unknown as Record<string, VisaEntry>)[visaCode] : null;
  const tips = tipsCode ? (tipsData as unknown as Record<string, TipsEntry>)[tipsCode] : null;

  const fmtDate = (s: string) => {
    const d = new Date(s);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const section = (title: string, body: string) => `
    <div style="margin-bottom:24px">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8FA39A;margin:0 0 8px">${title}</p>
      ${body}
    </div>`;

  const tipItem = (text: string) =>
    `<li style="margin-bottom:8px;padding-left:4px;color:#5C5248;font-size:14px;line-height:1.7">${text}</li>`;

  let visaSection = "";
  if (visa) {
    visaSection = section("簽證 & 入境", `
      <div style="background:#fff;border:1px solid #EDE7DD;border-radius:16px;padding:16px 20px">
        <p style="margin:0 0 6px;font-size:15px;color:#A86F5A">${visa.flag} ${visa.visa}・最長 ${visa.days} 天</p>
        <p style="margin:0 0 8px;font-size:13px;color:#6F675F">${visa.note}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#5C5248">🛃 ${visa.entry_tips}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#5C5248">🚫 ${visa.taboos}</p>
        <p style="margin:0;font-size:13px;color:#5C5248">📱 SIM：${visa.sim}</p>
      </div>
    `);
  }

  let tipsSection = "";
  if (tips) {
    const items = [
      ...(tips.ticket ?? []).slice(0, 2),
      ...(tips.crowd ?? []).slice(0, 1),
      ...(tips.transport ?? []).slice(0, 1),
    ];
    if (items.length) {
      tipsSection = section("在地眉角", `
        <ul style="margin:0;padding-left:16px;list-style:disc">
          ${items.map(tipItem).join("")}
        </ul>
      `);
    }
  }

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #E0D9D2">

    <!-- Header -->
    <div style="background:#A86F5A;padding:32px 32px 24px;text-align:center">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase">Pre-Trip Reminder</p>
      <h1 style="margin:0;font-size:26px;font-weight:300;color:#fff;letter-spacing:2px">出發倒數 7 天</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85)">${destination}　${fmtDate(depDate)} 出發</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">

      <p style="font-size:14px;font-weight:300;color:#6F675F;margin:0 0 28px;line-height:1.8">
        距離你的 ${destination} 之旅還有 7 天，出發前把這些事情確認好，讓旅途更順暢！
      </p>

      ${visaSection}

      ${section("行前必辦清單", `
        <ul style="margin:0;padding-left:16px;list-style:none">
          ${[
            "☐ 護照有效期限超過 6 個月",
            "☐ 已購買旅遊保險",
            "☐ 信用卡告知銀行出國",
            "☐ 訂位 / 票券再次確認",
            "☐ 備份護照照片（存手機 & 雲端）",
            "☐ 換匯（建議保留少量現金備用）",
          ].map(tipItem).join("")}
        </ul>
      `)}

      ${tipsSection}

      ${section("行李打包提醒", `
        <ul style="margin:0;padding-left:16px;list-style:none">
          ${[
            "☐ 行動電源（注意航空規定：≤ 100Wh 可帶上機）",
            "☐ 轉接插頭（日韓：A型，歐洲：C/E型，東南亞：通用）",
            "☐ 常備藥品（止痛藥、腸胃藥、防曬）",
            "☐ 緊急聯絡卡（放錢包）",
          ].map(tipItem).join("")}
        </ul>
      `)}

      <!-- CTA -->
      <div style="text-align:center;margin-top:32px">
        <a href="https://uturn-web.vercel.app/wizard"
           style="display:inline-block;padding:14px 36px;background:#A86F5A;color:#fff;border-radius:999px;text-decoration:none;font-size:14px;font-weight:300;letter-spacing:1px">
          查看完整行程規劃 →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F7F3EC;padding:20px 32px;text-align:center;border-top:1px solid #EDE7DD">
      <p style="margin:0;font-size:11px;color:#A79C91;font-weight:300">
        由 出國優轉 自動發送・<a href="https://uturn-web.vercel.app" style="color:#A86F5A;text-decoration:none">uturn-web.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmail(to: string, destination: string, depDate: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "出國優轉 <noreply@abroaduturn.com>",
      to: [to],
      subject: `✈️ ${destination} 出發前 7 天行前提醒`,
      html: buildEmailHtml(destination, depDate),
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

  // 找 7 天後出發、尚未寄過的訂閱
  const target = new Date();
  target.setDate(target.getDate() + 7);
  const targetDate = target.toISOString().split("T")[0];

  const { data: reminders, error } = await supabase
    .from("pre_trip_reminders")
    .select("id,user_email,destination,dep_date")
    .eq("dep_date", targetDate)
    .is("sent_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!reminders?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;
  for (const r of reminders) {
    const ok = await sendEmail(r.user_email, r.destination, r.dep_date);
    if (ok) {
      await supabase
        .from("pre_trip_reminders")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", r.id);
      sent++;
    }
  }

  return NextResponse.json({ sent, total: reminders.length });
}
