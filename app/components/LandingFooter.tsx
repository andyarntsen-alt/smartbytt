"use client";

import { useLanguage } from "./LanguageToggle";
import { translations } from "@/lib/translations";
import DarkModeToggle from "./DarkModeToggle";

export default function LandingFooter() {
  const { language } = useLanguage();
  const t = translations[language];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">© {year} SmartBytt</p>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <a href="/personvern" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t.footer.privacy}
          </a>
          <a href="/vilkar" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t.footer.terms}
          </a>
          <a href="/kontakt" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t.footer.contact}
          </a>
          <DarkModeToggle />
        </div>
      </div>
    </footer>
  );
}
