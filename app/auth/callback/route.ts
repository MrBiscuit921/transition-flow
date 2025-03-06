// app/auth/callback/route.ts
export const dynamic = 'force-dynamic';

import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Check for error parameters that might be returned from OAuth provider
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // If there's an error, redirect to the error page with the error details
  if (error) {
    const errorUrl = new URL(`${requestUrl.origin}/auth/error`);
    errorUrl.searchParams.set("error", error);
    if (errorCode) errorUrl.searchParams.set("error_code", errorCode);
    if (errorDescription)
      errorUrl.searchParams.set("error_description", errorDescription);
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabase = createRouteHandlerClient({cookies});

    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error("Error exchanging code for session:", err);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=session_exchange_failed`
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
