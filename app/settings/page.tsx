// app/settings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { session } = useSupabase()
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()
  
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    // Redirect if not logged in
    if (!session) {
      router.push("/login")
      return
    }
    
    // Set initial values
    setUsername(session.user.user_metadata?.username || "")
  }, [session, router])
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username,
        }
      })
      
      if (error) throw error
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!session) {
    return null // Will redirect in useEffect
  }
  
  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile information</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={session.user.email || ""}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Your email address is managed by Spotify and cannot be changed here.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}