import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/record', '/auth/verify', '/api/auth/verify'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Always allow public paths
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) {
    // If already logged in and going to /login, redirect to home
    if (pathname === '/login') {
      const token = request.cookies.get('pb_auth')?.value;
      if (token) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes — check for auth cookie
  const token = request.cookies.get('pb_auth')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
