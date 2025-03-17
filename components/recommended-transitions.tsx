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

interface UserRating {
  rating: number;
  transitions: {
    song1_artist: string;
    song2_artist: string;
    id: string;
  };
}

export default function RecommendedTransitions() {
  const {user} = useSupabase();
  const supabase = createClientComponentClient();
  const [recommendations, setRecommendations] = useState<
    TransitionWithRatings[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchRecommendations() {
      setIsLoading(true);

      try {
        if (!user?.id) return;

        // Get user's rated transitions to find their preferences
        const {data: userRatingsData, error: ratingsError} = await supabase
          .from("ratings")
          .select(
            `
            rating,
            transitions (
              song1_artist,
              song2_artist,
              id
            )
          `
          )
          .eq("user_id", user.id)
          .eq("rating", 1); // Only consider upvoted transitions

        if (ratingsError) throw ratingsError;

        // Extract artists the user likes
        const likedArtists = new Set<string>();
        const userRatings = (userRatingsData as any[]) || [];

        userRatings.forEach((rating) => {
          if (rating.transitions) {
            likedArtists.add(rating.transitions.song1_artist);
            likedArtists.add(rating.transitions.song2_artist);
          }
        });

        // Get transitions with those artists that the user hasn't rated yet
        if (likedArtists.size > 0) {
          const likedArtistsArray = Array.from(likedArtists);

          // Find transitions with artists the user likes
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
              .or(
                `song1_artist.in.(${likedArtistsArray
                  .map((a) => `"${a}"`)
                  .join(",")}),song2_artist.in.(${likedArtistsArray
                  .map((a) => `"${a}"`)
                  .join(",")})`
              )
              .order("created_at", {ascending: false})
              .limit(6);

          if (recommendError) throw recommendError;

          // Filter out transitions the user has already rated
          const ratedTransitionIds = new Set(
            userRatings.map((r) => r.transitions?.id).filter(Boolean)
          );

          const filteredRecommendations = recommendedTransitions.filter(
            (t: TransitionWithRatings) => !ratedTransitionIds.has(t.id)
          );

          setRecommendations(filteredRecommendations);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
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
