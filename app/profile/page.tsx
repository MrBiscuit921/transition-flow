// app/profile/page.tsx
"use client";
export const dynamic = "force-dynamic";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useSupabase} from "@/components/supabase-provider";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Music, ThumbsUp, Calendar, User} from "lucide-react";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns";

export default function ProfilePage() {
  const {session} = useSupabase();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [userTransitions, setUserTransitions] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !session.user) {
      // If there's no session or user, don't try to fetch data
      setIsLoading(false);
      return;
    }

    // Redirect if not logged in
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchUserData() {
      if (!session || !session.user) {
        // If there's no session or user, don't try to fetch data
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch user details including created_at
        const {data: userData, error: userError} =
          await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else if (userData && userData.user) {
          // Set the created_at date
          setCreatedAt(userData.user.created_at);
          console.log("User created at:", userData.user.created_at);
        }

        // Fetch user's transitions
        const {data: transitions, error: transitionsError} = await supabase
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
          .eq("user_id", session.user.id)
          .order("created_at", {ascending: false});

        if (transitionsError) {
          console.error("Error fetching transitions:", transitionsError);
          throw transitionsError;
        }
        setUserTransitions(transitions || []);

        // Fetch transitions the user has rated
        const {data: ratings, error: ratingsError} = await supabase
          .from("ratings")
          .select(
            `
            *,
            transitions (
              *
            )
          `
          )
          .eq("user_id", session.user.id)
          .order("created_at", {ascending: false});

        if (ratingsError) {
          console.error("Error fetching ratings:", ratingsError);
          throw ratingsError;
        }
        setUserRatings(ratings || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [session, supabase, router]);

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!session?.user) return "U";

    if (session.user.user_metadata?.full_name) {
      return session.user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
    }

    return session.user.email?.charAt(0).toUpperCase() || "U";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "Unknown";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={session.user.user_metadata?.avatar_url}
                  alt={session.user.email || ""}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {session.user.user_metadata?.full_name || session.user.email}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span>Member since {formatDate(createdAt)}</span>
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/settings">Edit Profile</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 shadow-sm">
                <div className="text-3xl font-bold">
                  {userTransitions.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Transitions Shared
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 shadow-sm">
                <div className="text-3xl font-bold">
                  {userRatings.filter((r) => r.rating > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Upvotes Given
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 shadow-sm">
                <div className="text-3xl font-bold">
                  {userRatings.filter((r) => r.rating < 0).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Downvotes Given
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="transitions">
          <TabsList className="mb-4">
            <TabsTrigger value="transitions">My Transitions</TabsTrigger>
            <TabsTrigger value="ratings">My Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="transitions">
            <h2 className="text-xl font-bold mb-4">
              Transitions You've Shared
            </h2>
            {isLoading ? (
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
            ) : userTransitions.length > 0 ? (
              <div className="space-y-4">
                {userTransitions.map((transition) => {
                  // Calculate ratings
                  const ratings = transition.ratings || [];
                  const upvotes = ratings.filter(
                    (r: any) => r.rating > 0
                  ).length;
                  const downvotes = ratings.filter(
                    (r: any) => r.rating < 0
                  ).length;

                  return (
                    <Link
                      key={transition.id}
                      href={`/transitions/${transition.id}`}>
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
                              <div className="text-center text-sm font-medium">
                                to
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

                            <div className="flex flex-col justify-center">
                              <div className="flex items-baseline gap-2">
                                <h3 className="font-medium">
                                  {transition.song1_name}
                                </h3>
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
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                  {transition.crossfade_length}s crossfade
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(transition.created_at),
                                      {addSuffix: true}
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
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
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <Music className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  No transitions shared yet
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't shared any transitions yet. Start by submitting
                  your first transition!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/submit">Submit a Transition</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ratings">
            <h2 className="text-xl font-bold mb-4">Transitions You've Rated</h2>
            {isLoading ? (
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
            ) : userRatings.length > 0 ? (
              <div className="space-y-4">
                {userRatings.map((rating) => {
                  const transition = rating.transitions;
                  if (!transition) return null;

                  return (
                    <Link
                      key={rating.id}
                      href={`/transitions/${transition.id}`}>
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
                              <div className="text-center text-sm font-medium">
                                to
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

                            <div className="flex flex-col justify-center">
                              <div className="flex items-baseline gap-2">
                                <h3 className="font-medium">
                                  {transition.song1_name}
                                </h3>
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
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline">
                                  {transition.crossfade_length}s crossfade
                                </Badge>
                                <Badge
                                  variant={
                                    rating.rating > 0
                                      ? "default"
                                      : "destructive"
                                  }>
                                  {rating.rating > 0 ? "Upvoted" : "Downvoted"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <ThumbsUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No ratings yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't rated any transitions yet. Browse transitions and
                  start rating!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/browse">Browse Transitions</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
