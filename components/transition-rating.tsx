// components/transition-rating.tsx
"use client";

import {useState, useEffect} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import {ThumbsDown, ThumbsUp} from "lucide-react";
import {useSupabase} from "@/components/supabase-provider";

interface TransitionRatingProps {
  transitionId: string;
  initialRatings: {
    upvotes: number;
    downvotes: number;
  };
}

export default function TransitionRating({
  transitionId,
  initialRatings,
}: TransitionRatingProps) {
  const {session} = useSupabase();
  const supabase = createClientComponentClient();
  const {toast} = useToast();

  const [upvotes, setUpvotes] = useState(initialRatings.upvotes);
  const [downvotes, setDownvotes] = useState(initialRatings.downvotes);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the user's existing rating when the component mounts
  useEffect(() => {
    async function fetchUserRating() {
      if (!session) return;

      try {
        console.log("Fetching user rating for transition:", transitionId);

        // Use a simpler query approach
        const {data, error} = await supabase
          .from("ratings")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("transition_id", transitionId);

        console.log("Rating data:", data);
        console.log("Rating error:", error);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setUserRating(data[0].rating);
        }
      } catch (error) {
        console.error("Error fetching user rating:", error);
      }
    }

    fetchUserRating();
  }, [session, transitionId, supabase]);

  const handleRating = async (rating: number) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate transitions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Handling rating:", rating);

      // Check if the user has already rated this transition
      const {data: existingRatings, error: fetchError} = await supabase
        .from("ratings")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("transition_id", transitionId);

      console.log("Existing ratings:", existingRatings);
      if (fetchError) {
        console.log("Fetch error:", fetchError);
        throw fetchError;
      }

      const existingRating =
        existingRatings && existingRatings.length > 0
          ? existingRatings[0]
          : null;

      // If user already rated the same way, remove their rating
      if (userRating === rating) {
        console.log("Removing existing rating");

        const {error: deleteError} = await supabase
          .from("ratings")
          .delete()
          .eq("user_id", session.user.id)
          .eq("transition_id", transitionId);

        if (deleteError) {
          console.log("Delete error:", deleteError);
          throw deleteError;
        }

        if (rating > 0) {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }

        setUserRating(null);
      }
      // If user rated the opposite way or hasn't rated yet
      else {
        if (existingRating) {
          console.log("Updating existing rating");

          // Update existing rating
          const {error: updateError} = await supabase
            .from("ratings")
            .update({rating})
            .eq("id", existingRating.id);

          if (updateError) {
            console.log("Update error:", updateError);
            throw updateError;
          }

          // Update counts
          if (existingRating.rating > 0 && rating < 0) {
            // Changed from upvote to downvote
            setUpvotes(upvotes - 1);
            setDownvotes(downvotes + 1);
          } else if (existingRating.rating < 0 && rating > 0) {
            // Changed from downvote to upvote
            setUpvotes(upvotes + 1);
            setDownvotes(downvotes - 1);
          }
        } else {
          console.log("Inserting new rating");

          // Insert new rating
          const {error: insertError} = await supabase.from("ratings").insert({
            user_id: session.user.id,
            transition_id: transitionId,
            rating,
          });

          if (insertError) {
            console.log("Insert error:", insertError);
            throw insertError;
          }

          // Update counts
          if (rating > 0) {
            setUpvotes(upvotes + 1);
          } else {
            setDownvotes(downvotes + 1);
          }
        }

        setUserRating(rating);
      }

      toast({
        title: "Rating submitted",
        description: "Your rating has been saved successfully",
      });
    } catch (error) {
      console.error("Error rating transition:", error);
      toast({
        title: "Rating failed",
        description:
          "There was an error submitting your rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userRating === 1 ? "default" : "outline"}
        size="sm"
        className="gap-1"
        disabled={isLoading}
        onClick={() => handleRating(1)}>
        <ThumbsUp className="h-4 w-4" />
        <span>{upvotes}</span>
      </Button>
      <Button
        variant={userRating === -1 ? "default" : "outline"}
        size="sm"
        className="gap-1"
        disabled={isLoading}
        onClick={() => handleRating(-1)}>
        <ThumbsDown className="h-4 w-4" />
        <span>{downvotes}</span>
      </Button>
    </div>
  );
}
