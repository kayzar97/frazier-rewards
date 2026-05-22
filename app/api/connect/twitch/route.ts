import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export async function GET() {
const session = await auth();

if (!session?.user?.name) {
  return NextResponse.redirect(new URL("/api/auth/signin", process.env.AUTH_URL));
}

const redirectUri = `${process.env.AUTH_URL}/api/connect/twitch/callback`;

const params = new URLSearchParams({
  client_id: process.env.AUTH_TWITCH_ID!,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "user:read:email",
  state: session.user.name ?? "",
  force_verify: "true",
});

  return NextResponse.redirect(
    `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
  );
}