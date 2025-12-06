import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    console.log(`Middleware: Path: ${pathname}, Token found: ${!!token}`);

    // Define public routes
    const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/signup"];

    // Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Protected routes - redirect to login if no token
    if (!token) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Role-based access could be implemented here if user role is stored in cookie
    // For now, we rely on client-side role checks or backend validation

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
