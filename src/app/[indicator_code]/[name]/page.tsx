"use client";

import dynamic from "next/dynamic";
import PreloaderPage from "@/components/pages/home/preloader-page";

const DynamicMap = dynamic(() => import("@/components/pages/home/home"), {
  ssr: false,
  loading: () => <PreloaderPage />,
});

function Page() {
  return <DynamicMap />;
}

export default Page;
