// app/auth/error/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = useState({
    error: "",
    errorCode: "",
    errorDescription: ""
  })

  useEffect(() => {
    // Get error details from URL parameters
    const error = searchParams.get("error") || ""
    const errorCode = searchParams.get("error_code") || ""
    const errorDescription = searchParams.get("error_description") || ""
    
    setErrorDetails({ error, errorCode, errorDescription })
  }, [searchParams])

  const isSpotifyEmailVerificationError = 
    errorDetails.errorCode === "provider_email_needs_verification" && 
    errorDetails.error === "access_denied"

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 md:px-6">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`rounded-full ${isSpotifyEmailVerificationError ? "bg-primary/20" : "bg-destructive/20"} p-3`}>
              {isSpotifyEmailVerificationError ? (
                <Mail className="h-8 w-8 text-primary" />
              ) : (
                <AlertCircle className="h-8 w-8 text-destructive" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isSpotifyEmailVerificationError 
              ? "One More Step" 
              : "Authentication Issue"}
          </CardTitle>
          <CardDescription>
            {isSpotifyEmailVerificationError 
              ? "Verify your Spotify email to continue" 
              : "There was a problem signing you in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isSpotifyEmailVerificationError ? (
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="mb-3">
                  We just need to verify your Spotify email before you can start using TransitionFlow.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    <p>Check your email inbox for a verification message from Spotify</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    <p>Click the verification link in that email</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    <p>Return to TransitionFlow and sign in again</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="font-medium mb-2">Error details:</p>
                <p><strong>Error:</strong> {errorDetails.error}</p>
                {errorDetails.errorCode && <p><strong>Error code:</strong> {errorDetails.errorCode}</p>}
                {errorDetails.errorDescription && (
                  <p><strong>Description:</strong> {errorDetails.errorDescription}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> 
              {isSpotifyEmailVerificationError ? "Return when verified" : "Return to login"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}