import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITY_CODE, CITY_DATA, CITY_KEYWORDS, CITY_PHOTOS } from "../../lib/cityData";
import TripView from "./TripView";

// ── helpers ─────────────────────────────────────────────────────────────────

function calcDays(start: string, end: string): number {
  if (!start || !end) return 5;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(2, Math.round(diff / 86400000) + 1);
}

function nightCount(days: number): string {
  return `${days}天${days - 1}夜`;
}

// ── SEO Metadata ─────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { city: cityRaw } = await params;
  const city = decodeURIComponent(cityRaw);
  const sp = await searchParams;

  const code = CITY_CODE[city];
  if (!code) return { title: "出國優轉" };

  const totalDays = calcDays(sp.departureDate ?? "", sp.returnDate ?? "");
  const people = sp.people ?? "2";
  const flag = CITY_DATA[code]?.flag ?? "✈️";

  const title = `${flag} ${city} ${nightCount(totalDays)} ${people}人行程 | 出國優轉`;
  const description = `台灣出發，${city} ${nightCount(totalDays)}完整行程規劃。每日景點、必吃美食、交通攻略、在地眉角，一頁搞定。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "zh_TW",
      siteName: "出國優轉 AbroadUturn",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://uturn-web.vercel.app/trip/${encodeURIComponent(city)}`,
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TripPage({ params, searchParams }: Props) {
  const { city: cityRaw } = await params;
  const city = decodeURIComponent(cityRaw);
  const sp = await searchParams;

  const code = CITY_CODE[city];
  if (!code || !CITY_DATA[code]) notFound();

  const cityData = CITY_DATA[code];
  const photo = CITY_PHOTOS[code] ?? CITY_PHOTOS["SEL"];
  const totalDays = calcDays(sp.departureDate ?? "", sp.returnDate ?? "");
  const people = sp.people ?? "2";
  const request = sp.request ?? "";

  const fullDayCount = Math.max(0, totalDays - 2);
  const fullDays = cityData.full_days.slice(0, fullDayCount);

  // 找特別需求要插哪天
  const kwMap = CITY_KEYWORDS[code] ?? {};
  let requestDayIdx = -1;
  if (request && fullDayCount > 0) {
    for (const [kw, idx] of Object.entries(kwMap)) {
      if (request.includes(kw) && (idx as number) < fullDayCount) {
        requestDayIdx = idx as number;
        break;
      }
    }
    if (requestDayIdx === -1) requestDayIdx = Math.min(1, fullDayCount - 1);
  }

  return (
    <TripView
      city={city}
      code={code}
      flag={cityData.flag}
      photo={photo}
      totalDays={totalDays}
      people={people}
      request={request}
      requestDayIdx={requestDayIdx}
      departureDate={sp.departureDate ?? ""}
      returnDate={sp.returnDate ?? ""}
      cityData={cityData}
      fullDays={fullDays}
    />
  );
}

// 預先生成熱門城市的靜態頁（SEO 加速）
export function generateStaticParams() {
  return Object.keys(CITY_CODE).map((city) => ({ city: encodeURIComponent(city) }));
}
