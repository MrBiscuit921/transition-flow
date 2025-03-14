import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { ThumbsUp } from "lucide-react"
import CreatePlaylist from "@/components/create-playlist"

export const dynamic = "force-dynamic"

interface Transition {
  id: string
  song1_id: string
  song1_name: string
  song1_artist: string
  song1_image: string
  song2_id: string
  song2_name: string
  song2_artist: string
  song2_image: string
  crossfade_length: number
  description: string
  created_at: string
  upvotes: number
  downvotes: number
}

interface TransitionWithRatings {
  id: string
  song1_id: string
  song1_name: string
  song1_artist: string
  song1_image: string
  song2_id: string
  song2_name: string
  song2_artist: string
  song2_image: string
  crossfade_length: number
  description: string
  created_at: string
  ratings: { rating: number }[]
}

interface FavoriteItem {
  transitions: TransitionWithRatings
}

export default async function FavoritesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user's favorites
  const { data: favoritesData, error } = await supabase
    .from("favorites")
    .select(`
      transitions (
        *,
        ratings (
          rating
        )
      )
    `)
    .eq("user_id", session.user.id)

  if (error) {
    console.error("Error fetching favorites:", error)
  }

  // Process favorites - properly cast the data
  const favorites = (favoritesData as unknown as FavoriteItem[]) || []

  // Process favorites
  const processedFavorites: Transition[] = favorites.map((favorite) => {
    const transition = favorite.transitions
    const ratings = transition.ratings || []
    const upvotes = ratings.filter((r) => r.rating > 0).length
    const downvotes = ratings.filter((r) => r.rating < 0).length

    return {
      id: transition.id,
      song1_id: transition.song1_id,
      song1_name: transition.song1_name,
      song1_artist: transition.song1_artist,
      song1_image: transition.song1_image,
      song2_id: transition.song2_id,
      song2_name: transition.song2_name,
      song2_artist: transition.song2_artist,
      song2_image: transition.song2_image,
      crossfade_length: transition.crossfade_length,
      description: transition.description,
      created_at: transition.created_at,
      upvotes,
      downvotes,
    }
  })

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your Favorites</h1>
            <p className="text-muted-foreground">Transitions you've saved for later</p>
          </div>

          {processedFavorites.length > 0 && <CreatePlaylist transitions={processedFavorites} />}
        </div>

        {processedFavorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't added any transitions to your favorites yet.</p>
            <Link href="/browse" className="text-primary hover:underline mt-2 inline-block">
              Browse transitions
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {processedFavorites.map((transition) => (
              <Link key={transition.id} href={`/transitions/${transition.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto]">
                      <div className="flex items-center gap-2">
                        <img
                          src={transition.song1_image || "/placeholder.svg?height=64&width=64"}
                          alt={transition.song1_name}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div className="text-center text-sm font-medium">to</div>
                        <img
                          src={transition.song2_image || "/placeholder.svg?height=64&width=64"}
                          alt={transition.song2_name}
                          className="h-16 w-16 rounded object-cover"
                        />
                      </div>

                      <div className="flex flex-col justify-center">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-medium">{transition.song1_name}</h3>
                          <p className="text-sm text-muted-foreground">by {transition.song1_artist}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>to</span>
                          <div className="flex items-baseline gap-2">
                            <h3 className="font-medium text-foreground">{transition.song2_name}</h3>
                            <p className="text-sm">by {transition.song2_artist}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transition.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-primary" />
                          <span>{transition.upvotes}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

