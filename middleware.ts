import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, only protect admin routes
  if (!supabaseUrl || !supabaseAnonKey) {
    // Admin routes - check for admin password
    if (pathname.startsWith("/admin")) {
      const adminPassword = process.env.ADMIN_PASSWORD;
      const authCookie = request.cookies.get("admin_auth");
      
      if (!adminPassword) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      if (authCookie?.value !== adminPassword && pathname !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    // For dashboard routes without Supabase, redirect to home
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin routes - check for admin password
  if (pathname.startsWith("/admin")) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authCookie = request.cookies.get("admin_auth");
    
    // If no admin password is set in env, block access
    if (!adminPassword) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    // Check if authenticated as admin
    if (authCookie?.value !== adminPassword) {
      // Redirect to admin login if not authenticated
      if (pathname !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  // Protected dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
