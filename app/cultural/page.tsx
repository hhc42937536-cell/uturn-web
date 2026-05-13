import { Suspense } from "react";
import CulturalView from "./CulturalView";

export default function CulturalPage() {
  return (
    <Suspense>
      <CulturalView />
    </Suspense>
  );
}
