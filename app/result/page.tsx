import { Suspense } from "react";
import PlanResult from "./PlanResult";

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EC]">
      <p className="text-sm font-light tracking-widest text-[#8FA39A]">整理行程中…</p>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PlanResult />
    </Suspense>
  );
}
