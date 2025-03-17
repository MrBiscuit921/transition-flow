"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {formatDistanceToNow} from "date-fns";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ThumbsDown, ThumbsUp} from "lucide-react";

interface Transition {
  id: string;
  song1_name: string;
  song1_artist: string;
  song1_image: string;
  song2_name: string;
  song2_artist: string;
  song2_image: string;
  crossfade_length: number;
  created_at: string;
  upvotes: number;
  downvotes: number;
}

export default function TransitionsList() {
  const supabase = createClientComponentClient();
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchTransitions() {
      setIsLoading(true);

      try {
        console.log("Fetching transitions list");

        let query = supabase
          .from("transitions")
          .select(
            `
            *,
            ratings (
              rating
            )
          `
          )
          .order("created_at", {ascending: false});

        // Apply search filters if provided
        const searchTerm = searchParams.get("q");
        if (searchTerm) {
          query = query.or(
            `song1_name.ilike.%${searchTerm}%,song1_artist.ilike.%${searchTerm}%,song2_name.ilike.%${searchTerm}%,song2_artist.ilike.%${searchTerm}%`
          );
        }

        // Apply genre filters if provided
        const genres = searchParams.get("genres");
        if (genres && genres.length > 0) {
          const genreArray = genres.split(",");
          // This is a simplified approach - in a real app, you'd have a genres table and relationships
          const genreConditions = genreArray
            .map(
              (genre) =>
                `song1_artist.ilike.%${genre}%,song2_artist.ilike.%${genre}%`
            )
            .join(",");

          query = query.or(genreConditions);
        }

        const {data, error} = await query;

        if (error) {
          console.error("Error fetching transitions:", error);
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} transitions`);

        // Process the transitions to include rating counts
        const processedTransitions = data.map((transition: any) => {
          const ratings = transition.ratings || [];
          const upvotes = ratings.filter((r: any) => r.rating > 0).length;
          const downvotes = ratings.filter((r: any) => r.rating < 0).length;

          // Remove the raw ratings array
          const {ratings: _, ...rest} = transition;

          return {
            ...rest,
            upvotes,
            downvotes,
          };
        });

        setTransitions(processedTransitions);
      } catch (error) {
        console.error("Error fetching transitions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransitions();
  }, [supabase, searchParams]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading transitions...</p>
      </div>
    );
  }

  if (transitions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No transitions found. Be the first to submit one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {transitions.map((transition) => (
        <Link
          key={transition.id}
          href={`/transitions/view/${transition.id}`}
          prefetch={false}>
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-0">
              <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto]">
                <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                  <div className="flex items-center gap-2 sm:flex-col">
                    <img
                      src={
                        transition.song1_image ||
                        "/placeholder.svg?height=64&width=64"
                      }
                      alt={transition.song1_name}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="hidden sm:flex h-8 items-center justify-center">
                      <div className="h-0.5 w-4 bg-primary" />
                    </div>
                    <img
                      src={
                        transition.song2_image ||
                        "/placeholder.svg?height=64&width=64"
                      }
                      alt={transition.song2_name}
                      className="h-16 w-16 rounded object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-2">
                    <div>
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
                          <p className="text-sm">
                            by {transition.song2_artist}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline">
                        {transition.crossfade_length}s crossfade
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transition.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {transition.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:flex-col">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    <span>{transition.upvotes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                    <span>{transition.downvotes}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
