"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/pages/home/home"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

function Page() {
  return <DynamicMap />;
}

export default Page;
