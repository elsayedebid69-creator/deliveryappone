import { useState, useRef, useEffect } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { Globe, Check } from "lucide-react";

export function LanguageDropdown() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (newLang: Lang) => {
    sounds.playClick();
    setLang(newLang);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Pill Trigger Button */}
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/70 px-3 py-1.5 hover:border-amber-500/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm dark:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        aria-label={lang === "ar" ? "تغيير لغة المنصة" : "Change platform language"}
      >
        <div className="flex size-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400">
          <Globe className="size-3.5" />
        </div>
        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-amber-600 dark:text-amber-300 border border-amber-500/30 font-mono">
          {lang === "ar" ? "AR" : "EN"}
        </span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {lang === "ar" ? "العربية" : "English"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`absolute ${
            lang === "ar" ? "start-0" : "end-0"
          } mt-2 w-52 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
            <Globe className="size-3.5 text-amber-500 dark:text-amber-400" />
            <span>{lang === "ar" ? "اختر اللغة" : "Select Language"}</span>
          </div>

          <div className="mt-1.5 space-y-1">
            {/* 1. English */}
            <button
              type="button"
              onClick={() => selectLanguage("en")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                lang === "en"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono text-[11px] font-black">
                  EN
                </div>
                <div className="text-start">
                  <p className="font-bold">English</p>
                  <p className="text-[10px] text-slate-500 font-normal">English</p>
                </div>
              </div>
              {lang === "en" && <Check className="size-4 text-amber-500 dark:text-amber-400" />}
            </button>

            {/* 2. Arabic */}
            <button
              type="button"
              onClick={() => selectLanguage("ar")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                lang === "ar"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono text-[11px] font-black">
                  AR
                </div>
                <div className="text-start">
                  <p className="font-bold">العربية</p>
                  <p className="text-[10px] text-slate-500 font-normal">Arabic</p>
                </div>
              </div>
              {lang === "ar" && <Check className="size-4 text-amber-500 dark:text-amber-400" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
