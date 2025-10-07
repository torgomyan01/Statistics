import Header from "@/app/comparison/header";
import LeftMenu from "@/components/pages/home/left-menu";
import { useState, useCallback } from "react";

interface IThisProps {
  children: React.ReactNode;
}

function MainTemplate({ children }: IThisProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((v) => !v);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="w-full h-[calc(100dvh-60px)] flex-jsb-s">
        <div className="hidden md:block h-full">
          <LeftMenu />
        </div>

        {/* Mobile drawer */}
        <div className="md:hidden">
          <LeftMenu isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>

        {children}
      </div>
    </>
  );
}

export default MainTemplate;
