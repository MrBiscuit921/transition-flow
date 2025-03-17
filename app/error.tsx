"use client";

import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {AlertTriangle, RefreshCw} from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 md:px-6">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We encountered an error while trying to display this page.
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-red-50 text-red-900 rounded-md text-left max-w-lg mx-auto overflow-auto">
            <p className="font-semibold">Error details:</p>
            <p className="font-mono text-sm mt-2">{error.message}</p>
          </div>
        )}
        <Button onClick={reset} variant="default" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
