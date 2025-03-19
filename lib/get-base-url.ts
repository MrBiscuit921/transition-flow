/**
 * Returns the base URL for the application, preferring the custom domain over deployment URL
 */
export function getBaseUrl(): string {
    // First check for NEXT_PUBLIC_SITE_URL which you can set in your project settings
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
  
    // For production, prefer the custom domain if available
    if (process.env.VERCEL_ENV === "production") {
      return "https://transitionflow.vercel.app"
    }
  
    // For preview deployments, use the deployment URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
  
    // Fallback for local development
    return "http://localhost:3000"
  }
  
  