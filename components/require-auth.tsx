"use client";

import type React from "react";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useSupabase} from "@/components/supabase-provider";

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({children}: RequireAuthProps) {
  const {user} = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (user === null || !user?.id) {
      router.push("/login");
    }
  }, [user, router]);

  if (user === null || !user?.id) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground mt-2">
            Please sign in to access this page
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
