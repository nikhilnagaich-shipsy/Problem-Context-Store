/**
 * Edge middleware — coarse-grained route guard.
 *
 * Does NOT import `@/auth` because that pulls in Prisma, which doesn't run
 * in the Edge runtime. Instead we check for the Auth.js session cookie's
 * presence (httpOnly, so JS-set attempts won't survive). Real session
 * validation (and forged-cookie rejection) happens server-side in
 * `getSession()` at the page/action level.
 */

import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

const PUBLIC_PREFIXES = [
  '/signin',
  '/verify-request',
  '/auth-error',
  '/invite/',
  '/api/auth/',
  '/api/ingest/', // webhooks come from external services with no session
];

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Public root: redirect signed-in users into the app, send others to signin.
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = req.cookies.get(COOKIE_NAME)?.value ? '/dashboard' : '/signin';
    return NextResponse.redirect(url);
  }

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Everything else requires a session cookie. Page-level getSession()
  // still validates that the cookie corresponds to a real user.
  const hasCookie = !!req.cookies.get(COOKIE_NAME)?.value;
  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
