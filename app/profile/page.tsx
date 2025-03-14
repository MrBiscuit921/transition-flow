import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Achievements from "@/components/achievements"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

interface TransitionWithRatings {
  id: string
  ratings: { rating: number }[]
  [key: string]: any
}

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user's profile data
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  // Get user's transitions
  const { data: transitionsData, error: transitionsError } = await supabase
    .from("transitions")
    .select(`
      *,
      ratings (
        rating
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get user's favorites
  const { data: favoritesData, error: favoritesError } = await supabase
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

  // Process transitions to include rating counts
  const transitions = (transitionsData as TransitionWithRatings[]) || []
  const processedTransitions = transitions.map((transition) => {
    const ratings = transition.ratings || []
    const upvotes = ratings.filter((r) => r.rating > 0).length
    const downvotes = ratings.filter((r) => r.rating < 0).length

    return {
      ...transition,
      upvotes,
      downvotes,
    }
  })

  // Process favorites
  const favorites = favoritesData || []
  const processedFavorites = favorites.map((favorite: any) => {
    const transition = favorite.transitions
    const ratings = transition.ratings || []
    const upvotes = ratings.filter((r: any) => r.rating > 0).length
    const downvotes = ratings.filter((r: any) => r.rating < 0).length

    return {
      ...transition,
      upvotes,
      downvotes,
    }
  })

  // Calculate stats
  const totalTransitions = processedTransitions.length
  const totalUpvotes = processedTransitions.reduce((sum, t) => sum + t.upvotes, 0)
  const totalFavorites = processedFavorites.length

  // Format the created date
  const createdAt = profile?.created_at
    ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
    : "Unknown"

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="flex flex-col gap-8">
        {/* Profile header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {session.user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.username || session.user.email}</h1>
              <p className="text-muted-foreground">Member since {createdAt}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Card className="w-24">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{totalTransitions}</p>
                <p className="text-xs text-muted-foreground">Transitions</p>
              </CardContent>
            </Card>
            <Card className="w-24">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{totalUpvotes}</p>
                <p className="text-xs text-muted-foreground">Upvotes</p>
              </CardContent>
            </Card>
            <Card className="w-24">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{totalFavorites}</p>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="achievements">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="transitions">My Transitions</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-6">
            <Achievements />
          </TabsContent>

          <TabsContent value="transitions" className="mt-6">
            {processedTransitions.length > 0 ? (
              <div className="grid gap-4">
                {/* You can reuse your TransitionsList component here or create a simplified version */}
                <p>You have submitted {totalTransitions} transitions</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No transitions yet</CardTitle>
                  <CardDescription>
                    You haven't submitted any transitions yet. Start sharing your favorite song transitions!
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            {processedFavorites.length > 0 ? (
              <div className="grid gap-4">
                {/* You can reuse your TransitionsList component here or create a simplified version */}
                <p>You have {totalFavorites} favorite transitions</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No favorites yet</CardTitle>
                  <CardDescription>
                    You haven't added any transitions to your favorites yet. Browse transitions and start saving your
                    favorites!
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

