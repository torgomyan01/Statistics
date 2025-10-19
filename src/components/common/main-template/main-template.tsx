import Header from "@/app/comparison/header";
import LeftMenu from "@/components/pages/home/left-menu";
import { useState, useCallback } from "react";

interface IThisProps {
  children: React.ReactNode;
}

function MainTemplate({ children }: IThisProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = useCallback((isOpenSidebar: boolean) => {
    setIsSidebarOpen(isOpenSidebar);
  }, []);

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} isOpenSidebar={isSidebarOpen} />
      <div className="w-full h-[calc(100dvh-60px)] flex-jsb-s">
        <LeftMenu isOpen={isSidebarOpen} />

        {children}
      </div>
    </>
  );
}

export default MainTemplate;
