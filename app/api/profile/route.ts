import { auth } from "../../../auth";
import { supabaseAdmin } from "../../../lib/supabaseadmin";
export async function GET() {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
.eq("Discord_Username", session.user.name)
    .single();

  if (error) {
    return Response.json({ profile: null });
  }

  return Response.json({ profile: data });
}
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();

  const { error } = await supabaseAdmin.from("profiles").upsert(
{
  Discord_Username: session.user.name,
  Discord_Image: session.user.image,
  spartans_username: body.spartansUsername,
},
    {
onConflict: "Discord_Username",
    }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}