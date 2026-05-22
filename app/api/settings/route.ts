import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const settings = Object.fromEntries(
    data.map((item) => [item.key, item.value])
  );

  return NextResponse.json(settings);
}