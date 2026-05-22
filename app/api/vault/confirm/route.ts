import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { claimId } = await req.json();

  if (!claimId) {
    return Response.json({ error: "Missing claimId" }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, spartans_username")
    .eq("Discord_Username", session.user.name)
    .single();

  if (!profile?.spartans_username) {
    return Response.json(
      { error: "No Spartans username linked" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("wager_reward_claims")
    .update({
      spartans_confirmed: true,
    })
    .eq("id", claimId)
    .eq("profile_id", profile.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    claim: data,
  });
}