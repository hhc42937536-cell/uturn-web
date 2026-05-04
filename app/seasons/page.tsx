import { Metadata } from "next";
import SeasonsView from "./SeasonsView";

export const metadata: Metadata = {
  title: "旅遊旺季月曆 | 出國優轉",
  description: "一眼看懂各城市最佳出遊月份，避開人潮和雨季",
};

export default function SeasonsPage() {
  return <SeasonsView />;
}
