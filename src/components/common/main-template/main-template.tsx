import Header from "@/app/comparison/header";
import LeftMenu from "@/components/pages/home/left-menu";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
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

      <Dialog
        open={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Please connect me</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            As you may have seen my account in upwork was suspended, As the
            project of almost done, please let me know if you’d like to continue
            working outside of upwork. My email is{" "}
            <a
              href="mailto:hakobyaniskuhi25@gmail.com"
              className="text-blue-500"
            >
              hakobyaniskuhi25@gmail.com
            </a>{" "}
            Would be great to hear from you in any case.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MainTemplate;
