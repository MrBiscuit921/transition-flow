import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, {params}: {params: {id: string}}) {
  try {
    const id = params.id;
    console.log(`Debug API: Checking transition with ID: ${id}`);

    const supabase = createRouteHandlerClient({cookies});

    // First, check if the transition exists with a simple query
    const {data: exists, error: existsError} = await supabase
      .from("transitions")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existsError) {
      console.error(
        "Debug API: Error checking if transition exists:",
        existsError
      );
      return NextResponse.json(
        {
          error: existsError.message,
          code: existsError.code,
          details: "Error checking if transition exists",
        },
        {status: 500}
      );
    }

    // If it doesn't exist, return 404
    if (!exists) {
      console.log(`Debug API: Transition with ID ${id} not found`);
      return NextResponse.json(
        {
          error: "Transition not found",
          exists: false,
        },
        {status: 404}
      );
    }

    // Now try to fetch the full transition data without the users join
    const {data: transition, error} = await supabase
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
      .eq("id", id)
      .single();

    if (error) {
      console.error("Debug API: Error fetching full transition data:", error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: "Error fetching full transition data",
          exists: true,
        },
        {status: 500}
      );
    }

    if (!transition) {
      console.log(`Debug API: Full transition data for ID ${id} not found`);
      return NextResponse.json(
        {
          error: "Full transition data not found",
          exists: true,
          fullDataExists: false,
        },
        {status: 404}
      );
    }

    // Try to fetch user data from profiles table instead of users table
    let userData = null;
    if (transition.user_id) {
      try {
        const {data: profile, error: profileError} = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", transition.user_id)
          .single();

        if (profileError) {
          console.log("Debug API: Error fetching profile data:", profileError);
        } else if (profile) {
          userData = profile;
        }
      } catch (userError) {
        console.error("Debug API: Error fetching profile:", userError);
      }
    }

    // Return success with the transition data
    const {song1_image, song2_image, ...logTransition} = transition;

    return NextResponse.json({
      success: true,
      exists: true,
      fullDataExists: true,
      transition: {
        ...logTransition,
        song1_image: song1_image ? "[image url]" : null,
        song2_image: song2_image ? "[image url]" : null,
        ratings: transition.ratings ? transition.ratings.length : 0,
      },
      userData,
    });
  } catch (err: any) {
    console.error("Debug API: Unexpected error:", err);
    return NextResponse.json(
      {
        error: err.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      {status: 500}
    );
  }
}
