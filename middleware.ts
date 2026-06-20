import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/disputes",
  "/proof",
  "/party",
  "/profile",
  "/create",
  "/verification",
  "/integrations",
  "/onboarding",
  "/api-docs",
]

// API routes that require authentication
const PROTECTED_API_PREFIXES = [
  "/api/proofs",
  "/api/disputes",
  "/api/parties",
  "/api/users",
]

// Routes that logged-in users shouldn't see (redirect to dashboard)
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected pages
  if ((isProtectedPage || isProtectedApi) && !token) {
    if (isProtectedApi) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })
    }
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|placeholder).*)",
  ],
}