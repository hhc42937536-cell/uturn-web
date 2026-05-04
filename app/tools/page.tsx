import { Metadata } from "next";
import ToolsView from "./ToolsView";

export const metadata: Metadata = {
  title: "旅行工具箱 | 出國優轉",
  description: "匯率換算、預算計算、行李清單、目的地天氣、當地時間 — 出國前必備工具",
};

export default function ToolsPage() {
  return <ToolsView />;
}
