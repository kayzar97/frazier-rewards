import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { supabaseAdmin } from "../../../../../lib/supabaseadmin";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const userEmail = url.searchParams.get("state");
  const redirectUri = `${process.env.AUTH_URL}/api/connect/twitch/callback`;

  if (!code || !userEmail) {
    return NextResponse.redirect(new URL("/profile?error=twitch", req.url));
  }

  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.AUTH_TWITCH_ID!,
      client_secret: process.env.AUTH_TWITCH_SECRET!,
      code,
      grant_type: "authorization_code",
redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenRes.json();

  const twitchRes = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Client-Id": process.env.AUTH_TWITCH_ID!,
    },
  });

  const twitchData = await twitchRes.json();
  const twitchUser = twitchData.data?.[0];

  if (!twitchUser) {
    return NextResponse.redirect(new URL("/profile?error=twitch_user", req.url));
  }

const session = await auth();

if (!session?.user?.name) {
  return NextResponse.redirect(new URL("/profile?error=no_session", req.url));
}

const { data: profile, error: findError } = await supabaseAdmin
  .from("profiles")
  .select("id")
  .eq("Discord_Username", session.user.name)
  .single();

if (findError || !profile) {
  console.error("PROFILE NOT FOUND:", findError);
  return NextResponse.redirect(new URL("/profile?error=no_profile", req.url));
}

const { error: updateError } = await supabaseAdmin
  .from("profiles")
  .update({
    twitch_id: twitchUser.id,
    twitch_username: twitchUser.login,
    twitch_display_name: twitchUser.display_name,
    twitch_image: twitchUser.profile_image_url,
  })
  .eq("id", profile.id);

if (updateError) {
  console.error("TWITCH UPDATE ERROR:", updateError);
  return NextResponse.redirect(new URL("/profile?error=twitch_update", req.url));
}

  return NextResponse.redirect(new URL("/profile?connected=twitch", req.url));
}