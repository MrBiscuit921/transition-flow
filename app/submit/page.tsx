// app/submit/page.tsx
"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useToast} from "@/components/ui/use-toast";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Slider} from "@/components/ui/slider";
import {Card, CardContent} from "@/components/ui/card";
import {Search, ArrowRight} from "lucide-react";
import SpotifyTrackSearch from "@/components/spotify-track-search";
import {useSupabase} from "@/components/supabase-provider";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import RequireAuth from "@/components/require-auth";

export default function SubmitTransitionPage() {
  return (
    <RequireAuth>
      <SubmitTransitionForm />
    </RequireAuth>
  );
}

function SubmitTransitionForm() {
  const router = useRouter();
  const {toast} = useToast();
  const {session} = useSupabase();
  const supabase = createClientComponentClient();

  const [isSearching, setIsSearching] = useState<"first" | "second" | null>(
    null
  );
  const [firstTrack, setFirstTrack] = useState<any>(null);
  const [secondTrack, setSecondTrack] = useState<any>(null);
  const [crossfadeLength, setCrossfadeLength] = useState(8);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen for track selection events
  // For the event handlers in useEffect
  useEffect(() => {
    const handleTrackSelected = (
      event: CustomEvent<{trackKey: string; track: any}>
    ) => {
      const {trackKey, track} = event.detail;

      if (trackKey === "first-track") {
        setFirstTrack(track);
        setIsSearching(null);
      } else if (trackKey === "second-track") {
        setSecondTrack(track);
        setIsSearching(null);
      }
    };

    const handleSearchCancelled = (event: CustomEvent<{action: string}>) => {
      setIsSearching(null);
    };

    window.addEventListener(
      "trackSelected",
      handleTrackSelected as EventListener
    );
    window.addEventListener(
      "searchCancelled",
      handleSearchCancelled as EventListener
    );

    return () => {
      window.removeEventListener(
        "trackSelected",
        handleTrackSelected as EventListener
      );
      window.removeEventListener(
        "searchCancelled",
        handleSearchCancelled as EventListener
      );
    };
  }, []);

  // Check localStorage for previously selected tracks on component mount
  useEffect(() => {
    const firstTrackData = localStorage.getItem("first-track");
    const secondTrackData = localStorage.getItem("second-track");

    if (firstTrackData) {
      try {
        setFirstTrack(JSON.parse(firstTrackData));
      } catch (e) {
        localStorage.removeItem("first-track");
      }
    }

    if (secondTrackData) {
      try {
        setSecondTrack(JSON.parse(secondTrackData));
      } catch (e) {
        localStorage.removeItem("second-track");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a transition",
        variant: "destructive",
      });
      return;
    }

    if (!firstTrack || !secondTrack) {
      toast({
        title: "Missing tracks",
        description: "Please select both tracks for your transition",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const {data, error} = await supabase
        .from("transitions")
        .insert({
          user_id: session.user.id,
          song1_id: firstTrack.id,
          song1_name: firstTrack.name,
          song1_artist: firstTrack.artists[0].name,
          song1_image: firstTrack.album.images[0]?.url,
          song2_id: secondTrack.id,
          song2_name: secondTrack.name,
          song2_artist: secondTrack.artists[0].name,
          song2_image: secondTrack.album.images[0]?.url,
          crossfade_length: crossfadeLength,
          description,
        })
        .select();

      if (error) throw error;

      // Clear localStorage after successful submission
      localStorage.removeItem("first-track");
      localStorage.removeItem("second-track");

      toast({
        title: "Transition submitted!",
        description: "Your transition has been added successfully",
      });

      router.push("/browse");
    } catch (error) {
      console.error("Error submitting transition:", error);
      toast({
        title: "Submission failed",
        description:
          "There was an error submitting your transition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Submit a Transition
          </h1>
          <p className="text-muted-foreground">
            Share your favorite seamless song transitions with the community
          </p>
        </div>

        {isSearching ? (
          session ? (
            <SpotifyTrackSearch
              onSelectTrack={`${isSearching}-track`}
              onCancel="cancel-search"
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You need to sign in with Spotify to search for tracks
              </p>
              <Button onClick={() => router.push("/login")}>
                Sign in with Spotify
              </Button>
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="first-track">First Track</Label>
                {firstTrack ? (
                  <Card className="mt-2">
                    <CardContent className="p-3 flex items-center gap-3">
                      {firstTrack.album.images[0] && (
                        <img
                          src={
                            firstTrack.album.images[0].url || "/placeholder.svg"
                          }
                          alt={firstTrack.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {firstTrack.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {firstTrack.artists
                            .map((a: any) => a.name)
                            .join(", ")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearching("first")}>
                        Change
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full justify-start gap-2"
                    onClick={() => setIsSearching("first")}>
                    <Search className="h-4 w-4" />
                    Search for a track
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="second-track">Second Track</Label>
                {secondTrack ? (
                  <Card className="mt-2">
                    <CardContent className="p-3 flex items-center gap-3">
                      {secondTrack.album.images[0] && (
                        <img
                          src={
                            secondTrack.album.images[0].url ||
                            "/placeholder.svg"
                          }
                          alt={secondTrack.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {secondTrack.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {secondTrack.artists
                            .map((a: any) => a.name)
                            .join(", ")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearching("second")}>
                        Change
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full justify-start gap-2"
                    onClick={() => setIsSearching("second")}>
                    <Search className="h-4 w-4" />
                    Search for a track
                  </Button>
                )}
              </div>
            </div>

            {firstTrack && secondTrack && (
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 max-w-[120px] text-center">
                  <p className="text-sm font-medium truncate">
                    {firstTrack.name}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 max-w-[120px] text-center">
                  <p className="text-sm font-medium truncate">
                    {secondTrack.name}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="crossfade">Crossfade Length (seconds)</Label>
                <span className="text-sm">{crossfadeLength}s</span>
              </div>
              <Slider
                id="crossfade"
                min={1}
                max={15}
                step={1}
                value={[crossfadeLength]}
                onValueChange={(value: number[]) =>
                  setCrossfadeLength(value[0])
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe why these songs transition well together..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!firstTrack || !secondTrack || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Transition"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
