"use client";

import { useState, useEffect, createContext, useContext } from "react";

type Language = "no" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (no: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: "no" as Language, setLanguage: () => {}, t: (no: string) => no };
  }
  return context;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("no");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("smartbytt-lang") as Language;
    if (saved === "en" || saved === "no") {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Apply color scheme based on language
      if (language === "en") {
        document.documentElement.setAttribute("data-lang", "en");
      } else {
        document.documentElement.removeAttribute("data-lang");
      }
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("smartbytt-lang", lang);
  };

  const t = (no: string, en: string) => (language === "en" ? en : no);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-500 dark:border-zinc-700">
        <span className="opacity-50">🌐</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setLanguage(language === "no" ? "en" : "no")}
      className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      title={language === "no" ? "Switch to English" : "Bytt til norsk"}
    >
      <span>{language === "no" ? "🇬🇧" : "🇳🇴"}</span>
      <span>{language === "no" ? "EN" : "NO"}</span>
    </button>
  );
}
