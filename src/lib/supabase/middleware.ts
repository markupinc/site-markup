import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CORRETOR_COOKIE, verifyCorretorToken } from "@/lib/auth/corretor";

const CORRETOR_PUBLIC_PATHS = ["/corretores/login", "/corretores/cadastro"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
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

  // Protect /admin routes (except /admin/login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Corretor area protection
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/corretores")) {
    const isPublicPath = CORRETOR_PUBLIC_PATHS.includes(pathname);
    const token = request.cookies.get(CORRETOR_COOKIE)?.value;
    const session = token ? await verifyCorretorToken(token) : null;

    if (!session && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/corretores/login";
      return NextResponse.redirect(url);
    }
    if (session && isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/corretores/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
