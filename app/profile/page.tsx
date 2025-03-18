import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Achievements from "@/components/achievements";
import {formatDistanceToNow} from "date-fns";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ThumbsUp} from "lucide-react";

export const dynamic = "force-dynamic";

interface TransitionWithRatings {
  id: string;
  song1_id: string;
  song1_name: string;
  song1_artist: string;
  song1_image: string;
  song2_id: string;
  song2_name: string;
  song2_artist: string;
  song2_image: string;
  crossfade_length: number;
  description: string;
  created_at: string;
  ratings: {rating: number}[];
  [key: string]: any;
}

export default async function ProfilePage() {
  const supabase = createServerComponentClient({cookies});

  // Get the user's session
  const {
    data: {session},
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Get user's profile data from the profiles table instead of users
  const {data: profile, error: profileError} = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  // Get user's transitions
  const {data: transitionsData, error: transitionsError} = await supabase
    .from("transitions")
    .select(
      `
      *,
      ratings (
        rating
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", {ascending: false});

  // Get user's favorites
  const {data: favoritesData, error: favoritesError} = await supabase
    .from("favorites")
    .select(
      `
      transitions (
        *,
        ratings (
          rating
        )
      )
    `
    )
    .eq("user_id", session.user.id);

  // Process transitions to include rating counts
  const transitions = (transitionsData as TransitionWithRatings[]) || [];
  const processedTransitions = transitions.map((transition) => {
    const ratings = transition.ratings || [];
    const upvotes = ratings.filter((r) => r.rating > 0).length;
    const downvotes = ratings.filter((r) => r.rating < 0).length;

    return {
      ...transition,
      upvotes,
      downvotes,
    };
  });

  // Process favorites
  const favorites = favoritesData || [];
  const processedFavorites = favorites.map((favorite: any) => {
    const transition = favorite.transitions;
    const ratings = transition.ratings || [];
    const upvotes = ratings.filter((r: any) => r.rating > 0).length;
    const downvotes = ratings.filter((r: any) => r.rating < 0).length;

    return {
      ...transition,
      upvotes,
      downvotes,
    };
  });

  // Calculate stats
  const totalTransitions = processedTransitions.length;
  const totalUpvotes = processedTransitions.reduce(
    (sum, t) => sum + t.upvotes,
    0
  );
  const totalFavorites = processedFavorites.length;

  // Get username from profile or from user metadata
  const username =
    profile?.username ||
    session.user.user_metadata?.name ||
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.username ||
    session.user.email;

  // Format the created date - use profile created_at or user created_at
  const createdAt =
    profile?.created_at || session.user.created_at
      ? formatDistanceToNow(
          new Date(profile?.created_at || session.user.created_at),
          {addSuffix: true}
        )
      : "Unknown";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://transitionflow.vercel.app",
            name: "TransitionFlow",
            description: "Discover and share perfect Spotify song transitions",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://transitionflow.vercel.app/browse?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <div className="container px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8">
          {/* Profile header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{username}</h1>
                <p className="text-muted-foreground">
                  Member since {createdAt}
                </p>
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
                  <div className="flex justify-between items-center">
                    <p>You have submitted {totalTransitions} transitions</p>
                    <Button asChild variant="outline">
                      <Link href="/profile/transitions">
                        View all transitions
                      </Link>
                    </Button>
                  </div>
                  {/* Show a preview of the first few transitions */}
                  {processedTransitions.slice(0, 3).map((transition) => (
                    <Link
                      key={transition.id}
                      href={`/transitions/view/${transition.id}`}>
                      <Card className="overflow-hidden transition-all hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {transition.song1_name}
                              </div>
                              <span className="text-muted-foreground">→</span>
                              <div className="font-medium">
                                {transition.song2_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-primary" />
                              <span>{transition.upvotes}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No transitions yet</CardTitle>
                    <CardDescription>
                      You haven't submitted any transitions yet. Start sharing
                      your favorite song transitions!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              {processedFavorites.length > 0 ? (
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <p>You have {totalFavorites} favorite transitions</p>
                    <Button asChild variant="outline">
                      <Link href="/favorites">View all favorites</Link>
                    </Button>
                  </div>
                  {/* Show a preview of the first few favorites */}
                  {processedFavorites.slice(0, 3).map((transition) => (
                    <Link
                      key={transition.id}
                      href={`/transitions/view/${transition.id}`}>
                      <Card className="overflow-hidden transition-all hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {transition.song1_name}
                              </div>
                              <span className="text-muted-foreground">→</span>
                              <div className="font-medium">
                                {transition.song2_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-primary" />
                              <span>{transition.upvotes}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No favorites yet</CardTitle>
                    <CardDescription>
                      You haven't added any transitions to your favorites yet.
                      Browse transitions and start saving your favorites!
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
