import type { Metadata } from "next"
import RecommendedTransitions from "@/components/recommended-transitions"
import RequireAuth from "@/components/require-auth"

export const metadata: Metadata = {
  title: "Recommendations | TransitionFlow",
  description: "Discover transitions based on your preferences",
}

export default function RecommendationsPage() {
  return (
    <RequireAuth>
      <div className="container px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Recommended Transitions</h1>
          <p className="text-muted-foreground">Personalized recommendations based on your ratings and preferences</p>
        </div>

        <RecommendedTransitions />
      </div>
    </RequireAuth>
  )
}

