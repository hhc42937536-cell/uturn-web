import { Metadata } from "next";
import FlightsView from "./FlightsView";

export const metadata: Metadata = {
  title: "機票比價 | 出國優轉",
  description: "即時搜尋台灣出發的最低票價，找到最划算的機票",
};

export default function FlightsPage() {
  return <FlightsView />;
}
