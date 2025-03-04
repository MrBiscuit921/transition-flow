"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"

interface TransitionRatingProps {
  transitionId: string
  initialRatings: {
    upvotes: number
    downvotes: number
  }
}

export default function TransitionRating({ transitionId, initialRatings }: TransitionRatingProps) {
  const { session } = useSupabase()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const [upvotes, setUpvotes] = useState(initialRatings.upvotes)
  const [downvotes, setDownvotes] = useState(initialRatings.downvotes)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRating = async (rating: number) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate transitions",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // If user already rated the same way, remove their rating
      if (userRating === rating) {
        await supabase.from("ratings").delete().eq("user_id", session.user.id).eq("transition_id", transitionId)

        if (rating > 0) {
          setUpvotes(upvotes - 1)
        } else {
          setDownvotes(downvotes - 1)
        }

        setUserRating(null)
      }
      // If user rated the opposite way, update their rating
      else if (userRating !== null) {
        await supabase
          .from("ratings")
          .update({ rating })
          .eq("user_id", session.user.id)
          .eq("transition_id", transitionId)

        if (rating > 0) {
          setUpvotes(upvotes + 1)
          setDownvotes(downvotes - 1)
        } else {
          setUpvotes(upvotes - 1)
          setDownvotes(downvotes + 1)
        }

        setUserRating(rating)
      }
      // If user hasn't rated yet, insert new rating
      else {
        await supabase.from("ratings").insert({
          user_id: session.user.id,
          transition_id: transitionId,
          rating,
        })

        if (rating > 0) {
          setUpvotes(upvotes + 1)
        } else {
          setDownvotes(downvotes + 1)
        }

        setUserRating(rating)
      }
    } catch (error) {
      console.error("Error rating transition:", error)
      toast({
        title: "Rating failed",
        description: "There was an error submitting your rating. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userRating === 1 ? "default" : "outline"}
        size="sm"
        className="gap-1"
        disabled={isLoading}
        onClick={() => handleRating(1)}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upvotes}</span>
      </Button>
      <Button
        variant={userRating === -1 ? "default" : "outline"}
        size="sm"
        className="gap-1"
        disabled={isLoading}
        onClick={() => handleRating(-1)}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{downvotes}</span>
      </Button>
    </div>
  )
}

