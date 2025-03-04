// components/email-verification-notification.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail } from 'lucide-react'

export default function EmailVerificationNotification() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [isJustSignedIn, setIsJustSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Check if user just signed in by looking for a URL parameter or localStorage flag
    const params = new URLSearchParams(window.location.search)
    const justSignedIn = params.get("signed_in") === "true" || localStorage.getItem("just_signed_in") === "true"
    
    if (justSignedIn) {
      setIsJustSignedIn(true)
      // Clear the flag
      localStorage.removeItem("just_signed_in")
      // Remove the URL parameter
      if (params.has("signed_in")) {
        params.delete("signed_in")
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
        window.history.replaceState({}, "", newUrl)
      }
    }
  }, [])

  useEffect(() => {
    // If user is signed in and we just detected a sign-in
    if (session && isJustSignedIn) {
      const email = session.user.email
      
      if (email) {
        setUserEmail(email)
        setShowDialog(true)
        
        // Also show a toast notification
        toast({
          title: "Email Verification Required",
          description: "Please check your email for a verification link.",
          duration: 5000,
        })
      }
    }
  }, [session, isJustSignedIn, toast])

  const handleClose = () => {
    setShowDialog(false)
    router.push("/")
  }

  const handleResendEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      })
      
      if (error) throw error
      
      toast({
        title: "Verification Email Sent",
        description: "We've sent another verification email to your address.",
        duration: 5000,
      })
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Failed to Resend Email",
        description: "There was an error sending the verification email. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Verify Your Email Address</DialogTitle>
          <DialogDescription className="text-center">
            We've sent a verification email to <span className="font-medium">{userEmail}</span>.
            Please check your inbox and click the verification link to complete your registration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted p-4 text-sm">
            <p>After verifying your email:</p>
            <ol className="list-decimal pl-4 mt-2 space-y-1">
              <li>Return to this site</li>
              <li>Sign in again with Spotify</li>
              <li>You'll have full access to all features</li>
            </ol>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={handleClose}>
            I'll do this later
          </Button>
          <Button onClick={handleResendEmail}>
            Resend Verification Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}