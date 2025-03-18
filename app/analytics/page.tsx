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
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Skeleton} from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {ThumbsUp, Eye, Star, TrendingUp} from "lucide-react";
import RequireAuth from "@/components/require-auth";

export const dynamic = "force-dynamic";

interface MonthData {
  month: string;
  count: number;
}

interface RatingData {
  name: string;
  value: number;
}

interface TopTransition {
  id: string;
  name: string;
  upvotes: number;
  downvotes: number;
  views: number;
  score: number;
}

interface StatsData {
  totalTransitions: number;
  totalViews: number;
  totalUpvotes: number;
  totalDownvotes: number;
  transitionsByMonth: MonthData[];
  ratingDistribution: RatingData[];
  topTransitions: TopTransition[];
}

export default function AnalyticsPage() {
  const {user} = useSupabase();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalTransitions: 0,
    totalViews: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    transitionsByMonth: [],
    ratingDistribution: [],
    topTransitions: [],
  });

  useEffect(() => {
    if (!user) return;

    async function fetchAnalytics() {
      setIsLoading(true);

      try {
        if (!user?.id) return;

        // Get user's transitions
        const {data: transitions, error: transitionsError} = await supabase
          .from("transitions")
          .select(
            `
            *,
            ratings (
              id,
              rating,
              created_at
            ),
            views (
              id,
              created_at
            )
          `
          )
          .eq("user_id", user.id);

        if (transitionsError) {
          console.error(
            "Error fetching transitions for analytics:",
            transitionsError
          );
          return; // Exit early but don't throw to prevent crashing
        }

        // Calculate stats
        let totalViews = 0;
        let totalUpvotes = 0;
        let totalDownvotes = 0;

        // Process transitions
        const transitionsByMonth: Record<string, number> = {};
        const topTransitions: TopTransition[] = [];

        transitions?.forEach((transition) => {
          // Count views
          const views = transition.views?.length || 0;
          totalViews += views;

          // Count ratings
          const upvotes =
            transition.ratings?.filter((r: {rating: number}) => r.rating > 0)
              .length || 0;
          const downvotes =
            transition.ratings?.filter((r: {rating: number}) => r.rating < 0)
              .length || 0;
          totalUpvotes += upvotes;
          totalDownvotes += downvotes;

          // Group by month
          const date = new Date(transition.created_at);
          const monthYear = `${date.toLocaleString("default", {
            month: "short",
          })} ${date.getFullYear()}`;

          if (!transitionsByMonth[monthYear]) {
            transitionsByMonth[monthYear] = 0;
          }
          transitionsByMonth[monthYear]++;

          // Add to top transitions
          topTransitions.push({
            id: transition.id,
            name: `${transition.song1_name} → ${transition.song2_name}`,
            upvotes,
            downvotes,
            views,
            score: upvotes - downvotes,
          });
        });

        // Format data for charts
        const monthData: MonthData[] = Object.entries(transitionsByMonth).map(
          ([month, count]) => ({
            month,
            count,
          })
        );

        const ratingDistribution: RatingData[] = [
          {name: "Upvotes", value: totalUpvotes},
          {name: "Downvotes", value: totalDownvotes},
        ];

        // Sort top transitions by score
        topTransitions.sort((a, b) => b.score - a.score);

        setStats({
          totalTransitions: transitions?.length || 0,
          totalViews,
          totalUpvotes,
          totalDownvotes,
          transitionsByMonth: monthData,
          ratingDistribution,
          topTransitions: topTransitions.slice(0, 5), // Top 5
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-bold">Analytics Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="mt-8">
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <RequireAuth>
      <div className="container px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-bold">Analytics Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {stats.totalTransitions}
                </div>
                <div className="rounded-full bg-primary/20 p-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <div className="rounded-full bg-primary/20 p-2">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Upvotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.totalUpvotes}</div>
                <div className="rounded-full bg-primary/20 p-2">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Rating Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {stats.totalUpvotes + stats.totalDownvotes > 0
                    ? `${Math.round(
                        (stats.totalUpvotes /
                          (stats.totalUpvotes + stats.totalDownvotes)) *
                          100
                      )}%`
                    : "N/A"}
                </div>
                <div className="rounded-full bg-primary/20 p-2">
                  <Star className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="monthly" className="mt-8">
          <TabsList>
            <TabsTrigger value="monthly">Monthly Submissions</TabsTrigger>
            <TabsTrigger value="ratings">Rating Distribution</TabsTrigger>
            <TabsTrigger value="top">Top Transitions</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Transition Submissions</CardTitle>
                <CardDescription>
                  Number of transitions you've submitted each month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.transitionsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>
                  Distribution of upvotes and downvotes on your transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.ratingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }>
                        {stats.ratingDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Transitions</CardTitle>
                <CardDescription>
                  Your transitions with the highest scores (upvotes - downvotes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topTransitions.map((transition, index) => (
                    <div
                      key={transition.id}
                      className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {index + 1}
                        </div>
                        <div className="font-medium">{transition.name}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-primary" />
                          <span>{transition.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{transition.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequireAuth>
  );
}
