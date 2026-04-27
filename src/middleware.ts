import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Add cache headers for static assets and public pages
  const pathname = request.nextUrl.pathname;

  // Cache static assets for 1 year (immutable)
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|mp4|mov|webp)$/i)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  // Cache public pages briefly so tracking config changes propagate fast
  else if (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/corretores")
  ) {
    response.headers.set("Cache-Control", "public, max-age=0, s-maxage=60, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/corretores/:path*",
    // Também aplicar cache headers a assets
    "/:path*",
  ],
};
