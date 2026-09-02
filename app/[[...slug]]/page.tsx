"use client";

import dynamic from "next/dynamic";

// Load ClientApp without SSR — it uses browser APIs (localStorage, react-idle-timer)
const ClientApp = dynamic(() => import("@/components/ClientApp"), { ssr: false });

export default function CatchAllPage() {
  return <ClientApp />;
}
