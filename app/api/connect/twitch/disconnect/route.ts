import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { supabaseAdmin } from "../../../../../lib/supabaseadmin";

export async function POST() {
  const session = await auth();

  if (!session?.user?.name) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: profile, error: findError } = await supabaseAdmin
    .from("profiles")
    .select("twitch_id, twitch_username, twitch_display_name, twitch_image, previous_twitch_accounts, twitch_reconnect_count")
    .eq("Discord_Username", session.user.name)
    .single();

  if (findError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const history = profile.previous_twitch_accounts || [];

  const oldAccount = profile.twitch_username
    ? {
        twitch_id: profile.twitch_id,
        twitch_username: profile.twitch_username,
        twitch_display_name: profile.twitch_display_name,
        twitch_image: profile.twitch_image,
        disconnected_at: new Date().toISOString(),
      }
    : null;

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      twitch_id: null,
      twitch_username: null,
      twitch_display_name: null,
      twitch_image: null,
      twitch_disconnected_at: new Date().toISOString(),
      twitch_reconnect_count: (profile.twitch_reconnect_count || 0) + 1,
      previous_twitch_accounts: oldAccount ? [...history, oldAccount] : history,
    })
    .eq("Discord_Username", session.user.name);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}