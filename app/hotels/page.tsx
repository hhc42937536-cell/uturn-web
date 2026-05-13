import { Suspense } from "react";
import HotelsView from "./HotelsView";

export default function HotelsPage() {
  return (
    <Suspense>
      <HotelsView />
    </Suspense>
  );
}
