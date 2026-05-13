import { Suspense } from "react";
import RestaurantView from "./RestaurantView";

export default function RestaurantPage() {
  return (
    <Suspense>
      <RestaurantView />
    </Suspense>
  );
}
