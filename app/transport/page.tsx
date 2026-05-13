import { Suspense } from "react";
import TransportView from "./TransportView";

export default function TransportPage() {
  return (
    <Suspense>
      <TransportView />
    </Suspense>
  );
}
