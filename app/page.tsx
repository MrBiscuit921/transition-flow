export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {ArrowRight, Music, Star, Users} from "lucide-react";
import FeaturedTransitions from "@/components/featured-transitions";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/20 to-background pt-16 pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Discover Perfect Song Transitions
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Find, share, and rate seamless transitions between your favorite
              Spotify tracks. Create the ultimate flowing playlist experience.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="gap-1">
                <Link href="/browse">
                  Browse Transitions <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/submit">Submit a Transition</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Transitions */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Featured Transitions
            </h2>
            <Button asChild variant="link" className="gap-1">
              <Link href="/browse">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedTransitions />
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-center md:text-3xl">
            How It Works
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/browse" className="block">
              <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center shadow-sm transition-colors hover:bg-muted/50">
                <div className="rounded-full bg-primary/20 p-3">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Find Transitions</h3>
                <p className="text-muted-foreground">
                  Browse our database of user-submitted song transitions,
                  filtered by genre, rating, or artist.
                </p>
              </div>
            </Link>
            <Link href="/browse" className="block">
              <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center shadow-sm transition-colors hover:bg-muted/50">
                <div className="rounded-full bg-primary/20 p-3">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Rate & Comment</h3>
                <p className="text-muted-foreground">
                  Vote on transitions and leave feedback to help others find the
                  smoothest song pairings.
                </p>
              </div>
            </Link>
            <Link href="/submit" className="block">
              <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center shadow-sm transition-colors hover:bg-muted/50">
                <div className="rounded-full bg-primary/20 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Share Your Own</h3>
                <p className="text-muted-foreground">
                  Submit your favorite song transitions with recommended
                  crossfade times and descriptions.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
