import { useState, useRef, useEffect } from "react";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectTheme = (mode: ThemeMode) => {
    sounds.playClick();
    setTheme(mode);
    setOpen(false);
  };

  const currentIcon = () => {
    if (theme === "light") return <Sun className="size-4 text-amber-500 dark:text-amber-400" />;
    if (theme === "dark") return <Moon className="size-4 text-amber-500 dark:text-amber-400" />;
    return <Laptop className="size-4 text-amber-500 dark:text-amber-400" />;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Theme Trigger Button */}
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setOpen((prev) => !prev);
        }}
        className="flex size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/70 hover:border-amber-500/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm dark:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        aria-label={lang === "ar" ? "تغيير مظهر السطوع" : "Toggle Theme Menu"}
      >
        <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/15">
          {currentIcon()}
        </div>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`absolute ${
            lang === "ar" ? "start-0" : "end-0"
          } mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <span>{lang === "ar" ? "السطوع والمظهر" : "Appearance"}</span>
          </div>

          <div className="mt-1.5 space-y-1">
            {/* 1. Light Theme */}
            <button
              type="button"
              onClick={() => selectTheme("light")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                theme === "light"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400">
                  <Sun className="size-4" />
                </div>
                <span>{lang === "ar" ? "فاتح (نهاري)" : "Light"}</span>
              </div>
              {theme === "light" && <Check className="size-4 text-amber-500 dark:text-amber-400" />}
            </button>

            {/* 2. Dark Theme */}
            <button
              type="button"
              onClick={() => selectTheme("dark")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                theme === "dark"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400">
                  <Moon className="size-4" />
                </div>
                <span>{lang === "ar" ? "داكن (ليلي)" : "Dark"}</span>
              </div>
              {theme === "dark" && <Check className="size-4 text-amber-500 dark:text-amber-400" />}
            </button>

            {/* 3. System Theme */}
            <button
              type="button"
              onClick={() => selectTheme("system")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                theme === "system"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400">
                  <Laptop className="size-4" />
                </div>
                <span>{lang === "ar" ? "تلقائي (حسب النظام)" : "System"}</span>
              </div>
              {theme === "system" && <Check className="size-4 text-amber-500 dark:text-amber-400" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
