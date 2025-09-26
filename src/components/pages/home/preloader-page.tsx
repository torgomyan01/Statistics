import { Spinner } from "@heroui/react";

function PreloaderPage() {
  return (
    <div className="w-full h-[100dvh] flex-jc-c">
      <Spinner size="lg" />
    </div>
  );
}

export default PreloaderPage;
