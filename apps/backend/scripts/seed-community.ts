/**
 * Launch seed: publish a curated set of existing models as featured community posts,
 * so /discover isn't empty on day one. Only use models whose owners agreed to share them.
 * Run after applying sql/027_community_profiles_and_posts.sql in Supabase.
 *
 *   pnpm exec tsx scripts/seed-community.ts <jobId>[:Title] [<jobId>[:Title] ...]
 *
 * Each post is attributed to the job's own owner. Jobs that are not finished GLB
 * models, or are already in a post, are skipped.
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: pnpm exec tsx scripts/seed-community.ts <jobId>[:Title] ...");
    process.exit(1);
  }

  for (const arg of args) {
    const [jobId, ...titleParts] = arg.split(":");
    const { data: job, error } = await supabase
      .from("jobs")
      .select("id, user_id, status, prompt, result_glb_url, result_kind, preview_image_url")
      .eq("id", jobId)
      .maybeSingle();
    if (error) throw error;
    if (!job || !job.user_id || job.status !== "DONE" || !job.result_glb_url || (job.result_kind ?? "glb") !== "glb") {
      console.warn(`skip ${jobId}: not a finished GLB model with an owner`);
      continue;
    }

    const { count } = await supabase
      .from("community_post_items")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId);
    if (count) {
      console.warn(`skip ${jobId}: already posted`);
      continue;
    }

    const title = (titleParts.join(":") || job.prompt || "Untitled model").trim().slice(0, 70);
    const { data: post, error: postError } = await supabase
      .from("community_posts")
      .insert({
        user_id: job.user_id,
        title,
        cover_image_url: job.preview_image_url,
        featured_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (postError) throw postError;

    const { error: itemError } = await supabase
      .from("community_post_items")
      .insert({ post_id: post.id, position: 0, kind: "model", job_id: jobId });
    if (itemError) {
      await supabase.from("community_posts").delete().eq("id", post.id);
      throw itemError;
    }
    console.log(`posted ${jobId} → /posts/${post.id} (${title})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
