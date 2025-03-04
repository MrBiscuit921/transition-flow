// app/api/spotify/search/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Get the user's session to access their Spotify token
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    // Get the Spotify access token from the session
    const provider = session.user?.app_metadata?.provider
    const providerToken = session.provider_token

    // Debug information
    console.log("Provider:", provider)
    console.log("Provider token exists:", !!providerToken)

    if (provider !== "spotify" || !providerToken) {
      return NextResponse.json({ error: "Spotify authentication required" }, { status: 401 })
    }

    // Make request to Spotify API
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Spotify API error:", errorData)
      return NextResponse.json({ error: errorData.error?.message || "Failed to search Spotify" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error searching Spotify:", error)
    return NextResponse.json({ error: "Failed to search Spotify" }, { status: 500 })
  }
}