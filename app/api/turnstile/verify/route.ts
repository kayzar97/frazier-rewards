import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing token" },
        { status: 400 }
      );
    }

    const formData = new FormData();

    formData.append(
      "secret",
      process.env.TURNSTILE_SECRET_KEY as string
    );

    formData.append("response", token);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("TURNSTILE VERIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server verification failed",
      },
      { status: 500 }
    );
  }
}