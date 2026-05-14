import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

const TW_AIRPORTS = new Set(["TPE", "TSA", "KHH", "RMQ", "TNN"]);

function dedupe(flights: TpFlight[], limit = 12): TpFlight[] {
  const seen = new Map<string, TpFlight>();
  for (const f of flights) {
    const dest = f.destination;
    if (!dest || TW_AIRPORTS.has(dest)) continue;
    const cur = seen.get(dest);
    if (!cur || f.price < cur.price) seen.set(dest, f);
  }
  return [...seen.values()].sort((a, b) => a.price - b.price).slice(0, limit);
}

type TpFlight = {
  origin: string;
  destination: string;
  price: number;
  airline: string;
  departure_at: string;
  return_at: string;
  transfers: number;
  duration_to?: number;
  duration_back?: number;
};

export async function GET(req: NextRequest) {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "no_token" }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const origin      = searchParams.get("origin") ?? "TPE";
  const destination = searchParams.get("destination") ?? "";
  const departure   = searchParams.get("departure_at") ?? "";
  const returnAt    = searchParams.get("return_at") ?? "";

  const params: Record<string, string> = {
    token,
    origin,
    currency: "twd",
    sorting: "price",
    limit: "50",
    one_way: "false",
  };
  if (destination) params.destination = destination;
  if (departure)   params.departure_at = departure;
  if (returnAt)    params.return_at = returnAt;

  const qs = new URLSearchParams(params).toString();
  const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "UturnWeb/1.0" },
      next: { revalidate: 300 }, // 5分鐘快取
    });
    const json = await res.json();
    const raw: TpFlight[] = json.data ?? [];

    if (destination) {
      // 特定路線：直接回傳（不去重）
      return NextResponse.json({ flights: raw.slice(0, 10) });
    }
    // 探索：去重取最便宜
    return NextResponse.json({ flights: dedupe(raw) });
  } catch (e) {
    console.error("[tp_api]", e);
    return NextResponse.json({ error: "api_failed" }, { status: 502 });
  }
}
