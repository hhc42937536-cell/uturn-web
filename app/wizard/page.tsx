import { Suspense } from "react";
import WizardView from "./WizardView";

export default function WizardPage() {
  return (
    <Suspense>
      <WizardView />
    </Suspense>
  );
}
