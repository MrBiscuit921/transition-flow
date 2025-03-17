import {redirect} from "next/navigation";

export const dynamic = "force-dynamic";

// This ensures the page is not cached
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function TransitionDetailPageRedirect({
  params,
}: {
  params: {id: string};
}) {
  // Make sure we're using the correct path format
  const redirectUrl = `/transitions/view/${params.id}`;

  // Log for debugging
  console.log(`Redirecting from /transitions/${params.id} to ${redirectUrl}`);

  // Use the redirect function from next/navigation
  redirect(redirectUrl);

  // This return is never reached due to the redirect, but included for completeness
  return null;
}
