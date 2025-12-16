import LoadingScreen from "@/components/LoadingScreen";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <section>{children}</section>
    </Suspense>
  );
}
