"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import {useSupabase} from "@/components/supabase-provider";
import {Heart} from "lucide-react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

interface FavoriteButtonProps {
  transitionId: string;
}

export default function FavoriteButton({transitionId}: FavoriteButtonProps) {
  const {user} = useSupabase();
  const supabase = createClientComponentClient();
  const {toast} = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function checkIfFavorite() {
      if (!user?.id) return;

      try {
        const {data, error} = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id)
          .eq("transition_id", transitionId)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no favorite exists

        if (error && error.code !== "PGRST116") {
          console.error("Error checking favorite:", error);
          return;
        }

        setIsFavorite(!!data);
      } catch (err) {
        console.error("Unexpected error checking favorite:", err);
      }
    }

    checkIfFavorite();
  }, [user, transitionId, supabase]);

  const toggleFavorite = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const {error} = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("transition_id", transitionId);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "This transition has been removed from your favorites",
        });
      } else {
        // Add to favorites
        const {error} = await supabase.from("favorites").insert({
          user_id: user.id,
          transition_id: transitionId,
        });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "This transition has been added to your favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Action failed",
        description:
          "There was an error updating your favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-1 ${isFavorite ? "text-red-500" : ""}`}
      onClick={toggleFavorite}
      disabled={isLoading}>
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Favorited" : "Favorite"}
    </Button>
  );
}
