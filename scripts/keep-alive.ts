// Create a file: scripts/keep-alive.ts
import {createClient} from "@supabase/supabase-js";

// This script can be run as a cron job every 6 days
async function keepAlive() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Simple query to keep the project active
    const {data, error} = await supabase
      .from("transitions")
      .select("id")
      .limit(1);

    if (error) throw error;

    console.log("Supabase keep-alive successful:", new Date().toISOString());
  } catch (error) {
    console.error("Supabase keep-alive failed:", error);
  }
}

keepAlive();
