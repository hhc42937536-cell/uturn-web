import { Suspense } from "react";
import ThemeView from "./ThemeView";

export default function ThemePage() {
  return (
    <Suspense>
      <ThemeView />
    </Suspense>
  );
}
