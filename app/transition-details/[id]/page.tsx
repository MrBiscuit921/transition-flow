import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {notFound} from "next/navigation";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {ArrowLeft, Clock, Music} from "lucide-react";
import TransitionRating from "@/components/transition-rating";
import FavoriteButton from "@/components/favorite-button";
import ShareTransition from "@/components/share-transition";
import {Badge} from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function TransitionDetailPage({
  params,
}: {
  params: {id: string};
}) {
  const supabase = createServerComponentClient({cookies});

  try {
    // Fetch transition details directly
    const {data: transition, error} = await supabase
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
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching transition:", error);
      throw error;
    }

    if (!transition) {
      console.error("Transition not found for ID:", params.id);
      return notFound();
    }

    // Record view by incrementing views_count
    try {
      // First approach: Use RPC to call the function we created
      const {error: viewError} = await supabase.rpc(
        "increment_transition_views",
        {transition_id: params.id}
      );

      // Fallback approach if RPC fails: Direct update
      if (viewError) {
        console.error("Error recording view with RPC:", viewError);

        const {error: updateError} = await supabase
          .from("transitions")
          .update({views_count: (transition.views_count || 0) + 1})
          .eq("id", params.id);

        if (updateError) {
          console.error(
            "Error recording view with direct update:",
            updateError
          );
        }
      }
    } catch (viewError) {
      // Silently fail if view tracking fails
      console.error("Error tracking view:", viewError);
    }

    // Calculate ratings
    const ratings = transition.ratings || [];
    const upvotes = ratings.filter((r: any) => r.rating > 0).length;
    const downvotes = ratings.filter((r: any) => r.rating < 0).length;

    // Fetch user data from profiles table
    let username = "Anonymous";
    if (transition.user_id) {
      // First try to get from profiles table
      const {data: profileData, error: profileError} = await supabase
        .from("profiles")
        .select("username")
        .eq("id", transition.user_id)
        .single();

      if (profileData?.username) {
        username = profileData.username;
      } else {
        // If not found in profiles, try to get from auth
        const {data: userData, error: userError} =
          await supabase.auth.admin.getUserById(transition.user_id);

        if (userData?.user) {
          username =
            userData.user.user_metadata?.name ||
            userData.user.user_metadata?.full_name ||
            userData.user.user_metadata?.username ||
            userData.user.email ||
            "Anonymous";
        }
      }
    }

    // Get the current URL for sharing
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const shareUrl = `${baseUrl}/transition-details/${transition.id}`;

    return (
      <div className="container px-4 py-8 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Button asChild variant="ghost" className="mb-6 -ml-2 gap-1">
            <Link href="/browse">
              <ArrowLeft className="h-4 w-4" /> Back to transitions
            </Link>
          </Button>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                {/* Transition header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                      Transition Details
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Submitted by {username} •{" "}
                      {formatDistanceToNow(new Date(transition.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TransitionRating
                      transitionId={transition.id}
                      initialRatings={{upvotes, downvotes}}
                    />
                    <FavoriteButton transitionId={transition.id} />
                    <ShareTransition
                      transition={{
                        song1_name: transition.song1_name,
                        song1_artist: transition.song1_artist,
                        song2_name: transition.song2_name,
                        song2_artist: transition.song2_artist,
                      }}
                      url={shareUrl}
                    />
                  </div>
                </div>

                {/* Transition visualization */}
                <div className="flex flex-col items-center gap-4 rounded-lg bg-muted p-6 sm:flex-row">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <img
                      src={
                        transition.song1_image ||
                        "/placeholder.svg?height=80&width=80"
                      }
                      alt={transition.song1_name}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <div className="max-w-[150px]">
                      <p className="font-medium line-clamp-1">
                        {transition.song1_name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {transition.song1_artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="h-0.5 w-16 bg-primary sm:w-24" />
                    <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                      <Clock className="h-3 w-3" />
                      {transition.crossfade_length}s crossfade
                    </div>
                    <div className="h-0.5 w-16 bg-primary sm:w-24" />
                  </div>

                  <div className="flex flex-col items-center gap-2 text-center">
                    <img
                      src={
                        transition.song2_image ||
                        "/placeholder.svg?height=80&width=80"
                      }
                      alt={transition.song2_name}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <div className="max-w-[150px]">
                      <p className="font-medium line-clamp-1">
                        {transition.song2_name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {transition.song2_artist}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {transition.description && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Description</h2>
                    <p className="text-muted-foreground">
                      {transition.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {transition.tags && transition.tags.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(transition.tags) ? (
                        transition.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">
                          {String(transition.tags)}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Spotify links */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button variant="outline" className="gap-2" asChild>
                    <a
                      href={`https://open.spotify.com/track/${transition.song1_id}`}
                      target="_blank"
                      rel="noopener noreferrer">
                      <Music className="h-4 w-4" />
                      Listen to {transition.song1_name}
                    </a>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <a
                      href={`https://open.spotify.com/track/${transition.song2_id}`}
                      target="_blank"
                      rel="noopener noreferrer">
                      <Music className="h-4 w-4" />
                      Listen to {transition.song2_name}
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Unexpected error in transition detail page:", err);
    throw err;
  }
}
