import { Suspense } from "react";
import AirportView from "./AirportView";

export default function AirportPage() {
  return (
    <Suspense>
      <AirportView />
    </Suspense>
  );
}
