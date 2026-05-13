import { Suspense } from "react";
import TrackingView from "./TrackingView";

export default function TrackingPage() {
  return (
    <Suspense>
      <TrackingView />
    </Suspense>
  );
}
