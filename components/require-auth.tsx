// components/require-auth.tsx
"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useSupabase} from "@/components/supabase-provider";
import {checkEmailVerification} from "@/lib/auth-utils";
import {useToast} from "@/components/ui/use-toast";

export default function RequireAuth({children}: {children: React.ReactNode}) {
  const {session} = useSupabase();
  const router = useRouter();
  const {toast} = useToast();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    const verifyEmail = async () => {
      const verified = await checkEmailVerification();
      setIsVerified(verified);

      if (!verified) {
        toast({
          title: "Email Verification Required",
          description:
            "Please verify your email address to access this feature.",
          duration: 5000,
        });
        router.push("/");
      }
    };

    verifyEmail();
  }, [session, router, toast]);

  if (isVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        Loading...
      </div>
    );
  }

  if (isVerified === false) {
    return null;
  }

  return <>{children}</>;
}
