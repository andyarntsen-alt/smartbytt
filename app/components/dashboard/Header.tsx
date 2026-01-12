"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";
import { useLanguage } from "@/app/components/LanguageToggle";
import LanguageToggle from "@/app/components/LanguageToggle";

interface HeaderProps {
  user: User;
  profile: Profile | null;
}

export default function DashboardHeader({ user, profile }: HeaderProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const defaultName = language === "no" ? "Bruker" : "User";
  const displayName = profile?.full_name || user.email?.split("@")[0] || defaultName;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const t = {
    hi: language === "no" ? "Hei" : "Hi",
    welcome: language === "no" ? "Velkommen til din spareoversikt" : "Welcome to your savings overview",
    notifications: language === "no" ? "Varsler" : "Notifications",
    newTip: language === "no" ? "Nytt sparetips!" : "New savings tip!",
    tipDesc: language === "no" ? "Du kan spare opptil 220 kr/mnd på strøm" : "You can save up to 220 kr/mo on electricity",
    settings: language === "no" ? "Innstillinger" : "Settings",
    logout: language === "no" ? "Logg ut" : "Log out",
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/75 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/75">
      <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Spacer for mobile hamburger */}
        <div className="w-10 lg:hidden" />
        
        {/* Title - hidden on mobile */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold dark:text-zinc-100">
            {t.hi}, {displayName}! 👋
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.welcome}
          </p>
        </div>

        {/* Mobile title */}
        <h1 className="text-sm font-semibold lg:hidden dark:text-zinc-100">
          SmartBytt
        </h1>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle */}
          <LanguageToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Notification badge */}
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                <p className="text-sm font-medium dark:text-zinc-100">{t.notifications}</p>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {t.newTip}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                      {t.tipDesc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                {initials}
              </div>
              <svg
                className="h-4 w-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                  <p className="text-sm font-medium dark:text-zinc-100">{displayName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                </div>
                <div className="py-1">
                  <a
                    href="/dashboard/innstillinger"
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {t.settings}
                  </a>
                </div>
                <div className="border-t border-zinc-200 py-1 dark:border-zinc-700">
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 dark:text-red-400 dark:hover:bg-zinc-700"
                  >
                    {t.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
