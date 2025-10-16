import { Moon, Sun } from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SITE_URL } from "@/utils/consts";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const menu = [
  {
    url: SITE_URL.HOME,
    name: "Home",
  },
  {
    url: SITE_URL.COMPARISON,
    name: "Comparison",
  },
];

interface HeaderProps {
  onToggleSidebar?: () => void;
}

function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-xl sticky top-0 z-20 transition-colors duration-500 border-b border-indigo-500/30">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-row justify-between items-center">
        <button
          className="md:hidden sm:mr-2 p-2 rounded-lg bg-indigo-500 min-w-10 text-white hover:bg-indigo-600 transition"
          aria-label="Toggle Menu"
          onClick={onToggleSidebar}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <Link
          href={SITE_URL.HOME}
          className="flex-jc-c sm:flex-js-c gap-2 md:min-w-[370px] sm:mr-6"
        >
          <Image
            src="/images/logo.svg"
            alt="logo site"
            width={300}
            height={300}
            className="w-[120px] sm:w-[190px] h-auto"
          />
          {/*<h1 className="text-xl sm:text-[18px] font-extrabold text-gray-900 dark:text-white tracking-tight mb-0">*/}
          {/*  RankinWorld*/}
          {/*</h1>*/}
        </Link>

        <div className="flex-je-c sm:flex-js-c gap-4 sm:w-full">
          {menu.map((menu) => (
            <Link
              key={menu.name}
              href={menu.url}
              className={clsx(
                "text-[14px] sm:text-[16px] text-gray-900 dark:text-white",
                {
                  "text-indigo-500": menu.url === pathname,
                },
              )}
            >
              {menu.name}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hidden sm:block p-3 rounded-full bg-indigo-500 dark:bg-indigo-700 text-white dark:text-yellow-300
                     shadow-lg shadow-indigo-500/50 dark:shadow-indigo-700/50 hover:bg-indigo-600 dark:hover:bg-indigo-800 transition-all duration-300 transform hover:scale-105" // HeroUI style
          aria-label="Toggle Dark Mode"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
