import { Metadata } from "next";
import VisaView from "./VisaView";

export const metadata: Metadata = {
  title: "簽證與緊急資訊 | 出國優轉",
  description: "台灣護照免簽一覽，大使館電話、當地SIM卡推薦、緊急醫院資訊",
};

export default function VisaPage() {
  return <VisaView />;
}
