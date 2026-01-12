"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageToggle";
import { translations } from "@/lib/translations";

interface HeaderNavProps {
  isLoggedIn: boolean;
}

export default function HeaderNav({ isLoggedIn }: HeaderNavProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300 md:flex">
        <a href="#hvordan" className="hover:text-zinc-900 dark:hover:text-zinc-200">
          {t.nav.howItWorks}
        </a>
        <a href="#tillit" className="hover:text-zinc-900 dark:hover:text-zinc-200">
          {t.nav.trust}
        </a>
        <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-200">
          {t.nav.faq}
        </a>
      </nav>

      {!isLoggedIn && (
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.nav.getStarted}
          </Link>
        </div>
      )}

      {isLoggedIn && (
        <Link
          href="/dashboard"
          className="hidden rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:block"
        >
          {t.nav.goToDashboard}
        </Link>
      )}
    </>
  );
}
