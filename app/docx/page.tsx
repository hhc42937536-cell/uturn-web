import { Suspense } from "react";
import DocxView from "./DocxView";
export const metadata = { title: "計畫書工作室｜出國優轉" };
export default function Page() {
  return (
    <Suspense>
      <DocxView />
    </Suspense>
  );
}
