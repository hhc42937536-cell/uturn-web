import { Suspense } from "react";
import PretripView from "./PretripView";

export default function PretripPage() {
  return (
    <Suspense>
      <PretripView />
    </Suspense>
  );
}
