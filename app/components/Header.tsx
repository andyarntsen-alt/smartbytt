import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MobileNav from "./MobileNav";
import HeaderUserMenu from "./HeaderUserMenu";

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

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300 md:flex">
          <a href="#hvordan" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            Hvordan funker det
          </a>
          <a href="#tillit" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            Tillit
          </a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            // Logged in - show dashboard link and user menu
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:block"
              >
                Gå til dashboard
              </Link>
              <HeaderUserMenu email={user.email || ""} />
            </>
          ) : (
            // Not logged in - show login and register
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 sm:block"
              >
                Logg inn
              </Link>
              <Link
                href="/register"
                className="hidden rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:block"
              >
                Kom i gang
              </Link>
            </>
          )}
          <MobileNav isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
