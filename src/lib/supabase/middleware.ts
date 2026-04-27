import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CORRETOR_COOKIE } from "@/lib/auth/corretor";

const CORRETOR_PUBLIC_PATHS = ["/corretores/login", "/corretores/cadastro"];

export async function updateSession(request: NextRequest) {
  // Encaminha o pathname como header para componentes server lerem
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
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
            request: { headers: requestHeaders },
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
    const corretorId = request.cookies.get(CORRETOR_COOKIE)?.value;

    if (!corretorId && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/corretores/login";
      return NextResponse.redirect(url);
    }
    if (corretorId && isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/corretores/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
