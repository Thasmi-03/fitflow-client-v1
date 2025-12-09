import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // Define public routes
    const publicRoutes = ["/auth/login", "/auth/register", "/auth/signup", "/partner-register"];
    if (pathname === "/" || publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Protected routes
    if (!token) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Role-based access (if applicable)
    // Note: Storing user role in cookie is not secure for critical checks, but okay for redirection
    const userCookie = request.cookies.get("user")?.value;
    if (userCookie) {
        try {
            const user = JSON.parse(userCookie);
            if (pathname.startsWith("/admin") && user.role !== "admin") {
                return NextResponse.redirect(new URL("/", request.url));
            }
        } catch (e) {
            // Ignore JSON parse error
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
