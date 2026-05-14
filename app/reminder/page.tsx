import { Suspense } from "react";
import dynamic from "next/dynamic";

const ReminderView = dynamic(() => import("./ReminderView"), { ssr: false });

export default function ReminderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F3EC]" />}>
      <ReminderView />
    </Suspense>
  );
}
