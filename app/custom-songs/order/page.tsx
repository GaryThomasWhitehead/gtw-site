import { Suspense } from "react";
import OrderClient from "./OrderClient";

export const dynamic = "force-dynamic";

export default function OrderPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const pkgRaw = searchParams?.pkg;
  const pkg = Array.isArray(pkgRaw) ? pkgRaw[0] : pkgRaw;

  return (
    <Suspense fallback={null}>
      <OrderClient initialPkg={pkg} />
    </Suspense>
  );
}
