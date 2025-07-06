"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/login")
          return
        }

        if (data.session) {
          const redirectTo = searchParams.get("redirectTo") || "/"
          router.push(redirectTo)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Unexpected auth callback error:", error)
        router.push("/login")
      }
    }

    handleAuthCallback()
  }, [supabase, router, searchParams])

  return (
    <div className="container flex items-center justify-center min-h-screen px-4 py-8 md:px-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
