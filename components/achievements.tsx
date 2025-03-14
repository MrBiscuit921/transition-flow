"use client";

import {useEffect, useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useSupabase} from "@/components/supabase-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Award, Star, Music, ThumbsUp, Trophy} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  requirement: number;
  type: "transitions" | "ratings" | "upvotes";
}

interface UserStats {
  transitions: number;
  ratings: number;
  upvotes: number;
}

const achievements: Achievement[] = [
  {
    id: "first_transition",
    title: "First Transition",
    description: "Submit your first transition",
    icon: <Music className="h-8 w-8 text-primary" />,
    requirement: 1,
    type: "transitions",
  },
  {
    id: "transition_enthusiast",
    title: "Transition Enthusiast",
    description: "Submit 5 transitions",
    icon: <Music className="h-8 w-8 text-primary" />,
    requirement: 5,
    type: "transitions",
  },
  {
    id: "transition_master",
    title: "Transition Master",
    description: "Submit 20 transitions",
    icon: <Trophy className="h-8 w-8 text-primary" />,
    requirement: 20,
    type: "transitions",
  },
  {
    id: "first_rating",
    title: "First Rating",
    description: "Rate your first transition",
    icon: <ThumbsUp className="h-8 w-8 text-primary" />,
    requirement: 1,
    type: "ratings",
  },
  {
    id: "rating_enthusiast",
    title: "Rating Enthusiast",
    description: "Rate 10 transitions",
    icon: <Star className="h-8 w-8 text-primary" />,
    requirement: 10,
    type: "ratings",
  },
  {
    id: "popular_transition",
    title: "Popular Transition",
    description: "Get 5 upvotes on one of your transitions",
    icon: <Award className="h-8 w-8 text-primary" />,
    requirement: 5,
    type: "upvotes",
  },
];

export default function Achievements() {
  const {user} = useSupabase();
  const supabase = createClientComponentClient();
  const {toast} = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    transitions: 0,
    ratings: 0,
    upvotes: 0,
  });
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchUserStats() {
      setIsLoading(true);

      try {
        if (!user?.id) return;

        // Get transition count
        const {count: transitionCount, error: transitionError} = await supabase
          .from("transitions")
          .select("*", {count: "exact", head: true})
          .eq("user_id", user.id);

        // Get rating count
        const {count: ratingCount, error: ratingError} = await supabase
          .from("ratings")
          .select("*", {count: "exact", head: true})
          .eq("user_id", user.id);

        // Get most upvoted transition
        const {data: transitions, error: upvoteError} = await supabase
          .from("transitions")
          .select(
            `
      id,
      ratings (
        rating
      )
    `
          )
          .eq("user_id", user.id);

        let maxUpvotes = 0;
        if (transitions) {
          transitions.forEach((transition) => {
            const upvotes =
              transition.ratings?.filter((r: {rating: number}) => r.rating > 0)
                .length || 0;
            if (upvotes > maxUpvotes) {
              maxUpvotes = upvotes;
            }
          });
        }

        const newStats: UserStats = {
          transitions: transitionCount || 0,
          ratings: ratingCount || 0,
          upvotes: maxUpvotes,
        };

        setUserStats(newStats);

        // Check which achievements are earned
        const earned = achievements
          .filter((achievement) => {
            const stat = newStats[achievement.type];
            return stat >= achievement.requirement;
          })
          .map((a) => a.id);

        setEarnedAchievements(earned);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserStats();
  }, [user, supabase]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Achievements</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const isEarned = earnedAchievements.includes(achievement.id);
          const progress = Math.min(
            100,
            (userStats[achievement.type] / achievement.requirement) * 100
          );

          return (
            <Card
              key={achievement.id}
              className={isEarned ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-full p-2 ${
                      isEarned ? "bg-primary/20" : "bg-muted"
                    }`}>
                    {achievement.icon}
                  </div>
                  {isEarned && <Award className="h-5 w-5 text-primary" />}
                </div>
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {userStats[achievement.type]}/{achievement.requirement}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
