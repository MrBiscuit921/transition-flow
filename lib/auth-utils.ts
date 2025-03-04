// lib/auth-utils.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function checkEmailVerification() {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    // Check if email is confirmed
    return user.email_confirmed_at !== null
  } catch (error) {
    console.error("Error checking email verification:", error)
    return false
  }
}