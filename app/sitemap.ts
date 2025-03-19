import type {MetadataRoute} from "next";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {getBaseUrl} from "@/lib/get-base-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recommendations`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ] as MetadataRoute.Sitemap;

  // Get dynamic transition routes
  try {
    const supabase = createServerComponentClient({cookies});

    const {data: transitions} = await supabase
      .from("transitions")
      .select("id, created_at")
      .order("created_at", {ascending: false})
      .limit(100); // Limit to most recent 100 transitions

    if (transitions) {
      const transitionRoutes = transitions.map((transition) => ({
        url: `${baseUrl}/transitions/view/${transition.id}`,
        lastModified: new Date(transition.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

      routes.push(...transitionRoutes);
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}
