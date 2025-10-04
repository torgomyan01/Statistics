import Header from "@/app/comparison/header";
import LeftMenu from "@/components/pages/home/left-menu";

interface IThisProps {
  children: React.ReactNode;
}

function MainTemplate({ children }: IThisProps) {
  return (
    <>
      <Header />
      <div className="w-full h-[calc(100dvh-68px)] flex-jsb-s">
        <LeftMenu />

        {children}
      </div>
    </>
  );
}

export default MainTemplate;
