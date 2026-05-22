import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.name) {
    return { error: "Not logged in", status: 401 };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Admin only", status: 403 };
  }

  return { session };
}

export async function GET() {
  const admin = await requireAdmin();

  if ("error" in admin) {
    return Response.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("key, value")
    .order("key", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ settings: data });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();

  if ("error" in admin) {
    return Response.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  const { key, value } = await req.json();

  if (typeof key !== "string" || typeof value !== "boolean") {
    return Response.json(
      { error: "Invalid key or value" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ key, value });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}