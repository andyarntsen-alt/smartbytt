import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MobileNav from "./MobileNav";
import HeaderUserMenu from "./HeaderUserMenu";
import LanguageToggle from "./LanguageToggle";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  // Check if user is logged in
  let user = null;
  
  // Only try to get user if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Error getting user - user stays null
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/75 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/brand/smartbytt-icon-64.png"
            alt="SmartBytt"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="text-sm font-semibold tracking-tight">
            SmartBytt <span className="text-zinc-400 dark:text-zinc-500">beta</span>
          </span>
        </Link>

        <HeaderNav isLoggedIn={!!user} />

        <div className="flex items-center gap-3">
          <LanguageToggle />
          {user && <HeaderUserMenu email={user.email || ""} />}
          <MobileNav isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
