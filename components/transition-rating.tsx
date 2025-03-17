"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import {useSupabase} from "@/components/supabase-provider";
import {ThumbsUp, ThumbsDown} from "lucide-react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

interface TransitionRatingProps {
  transitionId: string;
  initialRatings?: {
    upvotes: number;
    downvotes: number;
  };
}

export default function TransitionRating({
  transitionId,
  initialRatings,
}: TransitionRatingProps) {
  const {user} = useSupabase();
  const supabase = createClientComponentClient();
  const {toast} = useToast();
  const [upvotes, setUpvotes] = useState(initialRatings?.upvotes || 0);
  const [downvotes, setDownvotes] = useState(initialRatings?.downvotes || 0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchUserRating() {
      if (!user?.id) return;

      try {
        const {data, error} = await supabase
          .from("ratings")
          .select("rating")
          .eq("user_id", user.id)
          .eq("transition_id", transitionId)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rating exists

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user rating:", error);
          return;
        }

        setUserRating(data?.rating || null);
      } catch (err) {
        console.error("Unexpected error fetching rating:", err);
      }
    }

    fetchUserRating();
  }, [user, transitionId, supabase]);

  const handleRating = async (rating: number) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate transitions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Optimistically update the UI
      if (rating === 1) {
        setUpvotes((prev) => prev + (userRating !== 1 ? 1 : 0));
        setDownvotes((prev) => prev - (userRating === -1 ? 1 : 0));
      } else if (rating === -1) {
        setDownvotes((prev) => prev + (userRating !== -1 ? 1 : 0));
        setUpvotes((prev) => prev - (userRating === 1 ? 1 : 0));
      } else {
        // Reset
        if (userRating === 1) {
          setUpvotes((prev) => prev - 1);
        } else if (userRating === -1) {
          setDownvotes((prev) => prev - 1);
        }
      }

      setUserRating(userRating === rating ? null : rating);

      const {error} = await supabase.from("ratings").upsert(
        {
          user_id: user.id,
          transition_id: transitionId,
          rating: userRating === rating ? 0 : rating,
        },
        {onConflict: "user_id, transition_id"}
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Action failed",
        description:
          "There was an error submitting your rating. Please try again.",
        variant: "destructive",
      });

      // Revert optimistic update on error
      if (rating === 1) {
        setUpvotes((prev) => prev - (userRating !== 1 ? 1 : 0));
        setDownvotes((prev) => prev + (userRating === -1 ? 1 : 0));
      } else if (rating === -1) {
        setDownvotes((prev) => prev - (userRating !== -1 ? 1 : 0));
        setUpvotes((prev) => prev + (userRating === 1 ? 1 : 0));
      } else {
        // Reset
        if (userRating === 1) {
          setUpvotes((prev) => prev + 1);
        } else if (userRating === -1) {
          setDownvotes((prev) => prev + 1);
        }
      }
      setUserRating(userRating);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1 ${userRating === 1 ? "text-primary" : ""}`}
        onClick={() => handleRating(1)}
        disabled={isLoading}>
        <ThumbsUp
          className={`h-4 w-4 ${userRating === 1 ? "fill-current" : ""}`}
        />
        {upvotes}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1 ${userRating === -1 ? "text-red-500" : ""}`}
        onClick={() => handleRating(-1)}
        disabled={isLoading}>
        <ThumbsDown
          className={`h-4 w-4 ${userRating === -1 ? "fill-current" : ""}`}
        />
        {downvotes}
      </Button>
    </div>
  );
}
