import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export function middleware(request: NextRequest) {
  // Log the request path for debugging
  console.log("Middleware processing path:", request.nextUrl.pathname);

  // Check if this is a transition detail page with the old pattern
  const transitionDetailRegex = /^\/transitions\/([^/]+)$/;
  const match = request.nextUrl.pathname.match(transitionDetailRegex);

  if (match && match[1] && match[1] !== "view") {
    const transitionId = match[1];
    console.log(
      `Redirecting from old transition URL pattern to new: ${transitionId}`
    );

    // Create the new URL
    const url = new URL(`/transitions/view/${transitionId}`, request.url);

    // Return a redirect response
    return NextResponse.redirect(url);
  }

  // Continue with the request for all other paths
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
