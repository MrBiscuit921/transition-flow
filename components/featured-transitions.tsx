// components/featured-transitions.tsx
import Link from "next/link";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {formatDistanceToNow} from "date-fns";
import {Card, CardContent} from "@/components/ui/card";
import {ThumbsUp} from "lucide-react";

export default async function FeaturedTransitions() {
  const supabase = createServerComponentClient({cookies});

  // Fetch featured transitions without joining with users
  const {data: transitions, error} = await supabase
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
    .limit(3);

  console.log("Error:", error);

  if (error || !transitions || transitions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No transitions found. Be the first to submit one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {transitions.map((transition) => {
        // Calculate ratings
        const ratings = transition.ratings || [];
        const upvotes = ratings.filter((r: any) => r.rating > 0).length;
        const downvotes = ratings.filter((r: any) => r.rating < 0).length;
        const score = upvotes - downvotes;

        return (
          <Link key={transition.id} href={`/transitions/${transition.id}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 bg-muted p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {transition.song1_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {transition.song1_artist}
                    </p>
                  </div>
                  <div className="text-center text-xs font-medium">to</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {transition.song2_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {transition.song2_artist}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3">
                  <img
                    src={
                      transition.song1_image ||
                      "/placeholder.svg?height=120&width=120"
                    }
                    alt={transition.song1_name}
                    className="aspect-square w-full rounded object-cover"
                  />
                  <img
                    src={
                      transition.song2_image ||
                      "/placeholder.svg?height=120&width=120"
                    }
                    alt={transition.song2_name}
                    className="aspect-square w-full rounded object-cover"
                  />
                </div>
                <div className="flex items-center justify-between p-3 text-sm">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    <span>{score}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {formatDistanceToNow(new Date(transition.created_at), {
                      addSuffix: true,
                    })}
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
