import { Metadata } from "next";
import NearbyView from "./NearbyView";

export const metadata: Metadata = {
  title: "附近景點 | 出國優轉",
  description: "開啟定位，立即查看你現在位置附近最值得去的景點、美食、購物。",
};

export default function NearbyPage() {
  return <NearbyView />;
}
