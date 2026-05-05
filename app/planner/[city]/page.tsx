import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITY_CODE, CITY_DATA } from "../../lib/cityData";
import PlannerView from "./PlannerView";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: raw } = await params;
  const city = decodeURIComponent(raw);
  const flag = CITY_DATA[CITY_CODE[city]]?.flag ?? "✈️";
  return {
    title: `${flag} ${city} 行程地圖規劃 | 出國優轉`,
    description: `拖拉景點到各天，系統自動按地理位置排路線。${city}旅遊規劃神器。`,
  };
}

export default async function PlannerPage({ params }: Props) {
  const { city: raw } = await params;
  const city = decodeURIComponent(raw);
  const code = CITY_CODE[city];
  if (!code) notFound();

  const cityData = CITY_DATA[code];
  return <PlannerView city={city} code={code} flag={cityData.flag} />;
}

export function generateStaticParams() {
  return Object.keys(CITY_CODE).map((city) => ({ city }));
}
