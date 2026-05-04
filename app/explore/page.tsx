import { Metadata } from "next";
import ExploreView from "./ExploreView";

export const metadata: Metadata = {
  title: "社群行程牆 | 出國優轉",
  description: "看看台灣旅客分享的出國行程，首爾、東京、大阪、曼谷最新攻略，一鍵複製當自己的行程。",
  openGraph: {
    title: "社群行程牆 | 出國優轉",
    description: "台灣旅客分享的出國行程，Google 可搜尋到的旅遊攻略",
    type: "website",
  },
};

export default function ExplorePage() {
  return <ExploreView />;
}
