import { Metadata } from "next"
import Achievements from "@/components/achievements"
import RequireAuth from "@/components/require-auth"

export const metadata: Metadata = {
  title: "Achievements | TransitionFlow",
  description: "View your achievements and progress",
}

export default function AchievementsPage() {
  return (
    <RequireAuth>
      <div className="container px-4 py-8 md:px-6">
        <Achievements />
      </div>
    </RequireAuth>
  )
}
