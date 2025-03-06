// components/transitions-list.tsx
export const dynamic = 'force-dynamic';

import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsDown, ThumbsUp } from 'lucide-react'

export default async function TransitionsList() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch transitions without trying to join with users
  const { data: transitions, error } = await supabase
    .from("transitions")
    .select(`
      *,
      ratings (
        id,
        rating
      )
    `)
    .order("created_at", { ascending: false })

  console.log("Error:", error)

  if (error) {
    console.error("Error fetching transitions:", error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading transitions. Please try again later.</p>
        <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }

  if (!transitions || transitions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transitions found. Be the first to submit one!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {transitions.map((transition) => {
        // Calculate ratings
        const ratings = transition.ratings || []
        const upvotes = ratings.filter((r: any) => r.rating > 0).length
        const downvotes = ratings.filter((r: any) => r.rating < 0).length
        
        return (
          <Link key={transition.id} href={`/transitions/${transition.id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-0">
                <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto]">
                  <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                    <div className="flex items-center gap-2 sm:flex-col">
                      <img
                        src={transition.song1_image || "/placeholder.svg?height=64&width=64"}
                        alt={transition.song1_name}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="hidden sm:flex h-8 items-center justify-center">
                        <div className="h-0.5 w-4 bg-primary" />
                      </div>
                      <img
                        src={transition.song2_image || "/placeholder.svg?height=64&width=64"}
                        alt={transition.song2_name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-between gap-2">
                      <div>
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
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="outline">{transition.crossfade_length}s crossfade</Badge>
                        <span className="text-xs text-muted-foreground">
                          Added {formatDistanceToNow(new Date(transition.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-primary" />
                      <span>{upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                      <span>{downvotes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}