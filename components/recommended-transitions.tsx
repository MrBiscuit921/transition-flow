"use client";

import {useEffect, useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useSupabase} from "@/components/supabase-provider";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns";
import {ThumbsUp} from "lucide-react";

interface TransitionRating {
  id: string;
  rating: number;
}

interface TransitionWithRatings {
  id: string;
  song1_name: string;
  song1_artist: string;
  song1_image: string;
  song2_name: string;
  song2_artist: string;
  song2_image: string;
  created_at: string;
  ratings: TransitionRating[];
}

export default function RecommendedTransitions() {
  const {user} = useSupabase();
  const supabase = createClientComponentClient();
  const [recommendations, setRecommendations] = useState<
    TransitionWithRatings[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchRecommendations() {
      setIsLoading(true);
      setError(null);

      try {
        if (!user?.id) return;

        console.log("Fetching recommendations for user:", user.id);

        // First, get some recent transitions as a fallback
        const {data: recentTransitions, error: recentError} = await supabase
          .from("transitions")
          .select(
            `
            *,
            ratings (
              id,
              rating
            )
          `
          )
          .order("created_at", {ascending: false})
          .limit(6);

        if (recentError) {
          console.error("Error fetching recent transitions:", recentError);
          throw recentError;
        }

        // Get user's rated transitions to find their preferences
        const {data: userRatingsData, error: ratingsError} = await supabase
          .from("ratings")
          .select(
            `
            rating,
            transition_id,
            transitions (
              song1_artist,
              song2_artist
            )
          `
          )
          .eq("user_id", user.id)
          .eq("rating", 1); // Only consider upvoted transitions

        if (ratingsError) {
          console.error("Error fetching user ratings:", ratingsError);
          // Don't throw, just use recent transitions
          setRecommendations(recentTransitions);
          return;
        }

        console.log("User ratings data:", userRatingsData);

        // If user hasn't rated anything, just show recent transitions
        if (!userRatingsData || userRatingsData.length === 0) {
          console.log("No user ratings found, showing recent transitions");
          setRecommendations(recentTransitions);
          return;
        }

        // Extract artists the user likes
        const likedArtists = new Set<string>();
        userRatingsData.forEach((rating: any) => {
          if (rating.transitions) {
            if (rating.transitions.song1_artist)
              likedArtists.add(rating.transitions.song1_artist);
            if (rating.transitions.song2_artist)
              likedArtists.add(rating.transitions.song2_artist);
          }
        });

        console.log("Liked artists:", Array.from(likedArtists));

        // If no liked artists found, use recent transitions
        if (likedArtists.size === 0) {
          console.log("No liked artists found, showing recent transitions");
          setRecommendations(recentTransitions);
          return;
        }

        // Get transitions with those artists that the user hasn't rated yet
        const likedArtistsArray = Array.from(likedArtists);

        // Create a filter condition for artists
        let artistFilter = "";
        likedArtistsArray.forEach((artist, index) => {
          if (index > 0) artistFilter += ",";
          artistFilter += `song1_artist.ilike.%${artist}%,song2_artist.ilike.%${artist}%`;
        });

        console.log("Artist filter:", artistFilter);

        const {data: recommendedTransitions, error: recommendError} =
          await supabase
            .from("transitions")
            .select(
              `
            *,
            ratings (
              id,
              rating
            )
          `
            )
            .or(artistFilter)
            .order("created_at", {ascending: false})
            .limit(6);

        if (recommendError) {
          console.error(
            "Error fetching recommended transitions:",
            recommendError
          );
          // Fall back to recent transitions
          setRecommendations(recentTransitions);
          return;
        }

        console.log("Recommended transitions:", recommendedTransitions);

        // Get the IDs of transitions the user has already rated
        const ratedTransitionIds = new Set(
          userRatingsData.map((r: any) => r.transition_id).filter(Boolean)
        );

        console.log("Rated transition IDs:", Array.from(ratedTransitionIds));

        // Filter out transitions the user has already rated
        const filteredRecommendations = recommendedTransitions.filter(
          (t: TransitionWithRatings) => !ratedTransitionIds.has(t.id)
        );

        console.log("Filtered recommendations:", filteredRecommendations);

        // If we have recommendations, use them; otherwise, fall back to recent transitions
        if (filteredRecommendations.length > 0) {
          setRecommendations(filteredRecommendations);
        } else {
          console.log(
            "No filtered recommendations, showing recent transitions"
          );
          setRecommendations(recentTransitions);
        }
      } catch (error: any) {
        console.error("Error fetching recommendations:", error);
        setError(error.message || "Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Error: {error}</p>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          No recommendations available yet. Try rating more transitions!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((transition) => {
        // Calculate ratings
        const ratings = transition.ratings || [];
        const upvotes = ratings.filter((r) => r.rating > 0).length;
        const downvotes = ratings.filter((r) => r.rating < 0).length;

        return (
          <Link key={transition.id} href={`/transitions/view/${transition.id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto]">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        transition.song1_image ||
                        "/placeholder.svg?height=64&width=64"
                      }
                      alt={transition.song1_name}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="text-center text-sm font-medium">to</div>
                    <img
                      src={
                        transition.song2_image ||
                        "/placeholder.svg?height=64&width=64"
                      }
                      alt={transition.song2_name}
                      className="h-16 w-16 rounded object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-medium">{transition.song1_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {transition.song1_artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>to</span>
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-medium text-foreground">
                          {transition.song2_name}
                        </h3>
                        <p className="text-sm">by {transition.song2_artist}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(transition.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-primary" />
                      <span>{upvotes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
