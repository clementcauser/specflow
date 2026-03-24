import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_PATH = "/maintenance";

export function middleware(request: NextRequest) {
  const isUnderConstruction =
    process.env.IS_UNDER_CONSTRUCTION === "true";

  const { pathname } = request.nextUrl;

  if (isUnderConstruction) {
    // Already on the maintenance page — let through
    if (pathname === MAINTENANCE_PATH) {
      return NextResponse.next();
    }
    // Redirect everything else to /maintenance
    return NextResponse.redirect(new URL(MAINTENANCE_PATH, request.url));
  }

  // Site is live — block direct access to /maintenance
  if (pathname === MAINTENANCE_PATH) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
