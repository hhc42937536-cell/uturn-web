import { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUNTRY_INFO } from "../../lib/spotData";
import PlannerView from "./PlannerView";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: raw } = await params;
  const slug = decodeURIComponent(raw);
  const info = COUNTRY_INFO[slug];
  if (!info) return { title: "行程規劃 | 出國優轉" };
  return {
    title: `${info.flag} ${info.name} 行程地圖規劃 | 出國優轉`,
    description: `拖拉景點到各天，跨城市安排行程，地圖即時顯示分佈。${info.name}旅遊規劃神器。`,
  };
}

export default async function PlannerPage({ params }: Props) {
  const { city: raw } = await params;
  const slug = decodeURIComponent(raw);
  const info = COUNTRY_INFO[slug];
  if (!info) notFound();
  return <PlannerView country={slug} countryName={info.name} flag={info.flag} center={info.center} mapZoom={info.zoom} />;
}

export function generateStaticParams() {
  return Object.keys(COUNTRY_INFO).map((slug) => ({ city: slug }));
}
