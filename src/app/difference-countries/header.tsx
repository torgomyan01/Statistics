import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";

function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      typeof window !== "undefined" &&
      (localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches));
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-xl sticky top-0 z-20 transition-colors duration-500 border-b border-indigo-500/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-row justify-between items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-0">
          <span className="hidden md:block">Global Comparison Dashboard</span>
          <span className="block md:hidden"> Comparison Dashboard</span>
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-indigo-500 dark:bg-indigo-700 text-white dark:text-yellow-300
                     shadow-lg shadow-indigo-500/50 dark:shadow-indigo-700/50 hover:bg-indigo-600 dark:hover:bg-indigo-800 transition-all duration-300 transform hover:scale-105" // HeroUI style
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
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
