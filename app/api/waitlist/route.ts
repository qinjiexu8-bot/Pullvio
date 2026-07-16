import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2048) return NextResponse.json({ ok: false }, { status: 413 });

  let body: { email?: unknown; company?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "en";
  if (email.length > 320 || !emailPattern.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false }, { status: 503 });

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await supabase.from("waitlist_signups").insert({ email, locale, source: "get-media" });
  if (error && error.code !== "23505") {
    console.error("Waitlist insert failed", { code: error.code, message: error.message });
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
