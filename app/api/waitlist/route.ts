import type { NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n";
import {
  assertSameOrigin,
  jsonNoStore,
  MediaHttpError,
  readSmallJson,
} from "@/lib/media/http";
import { createAdminClient } from "@/lib/supabase/admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const rawBody = await readSmallJson(request);
    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return jsonNoStore({ ok: false }, { status: 400 });
    }
    const body = rawBody as { email?: unknown; company?: unknown; locale?: unknown };

    if (typeof body.company === "string" && body.company.trim()) {
      return jsonNoStore({ ok: true });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "en";
    if (email.length > 320 || !emailPattern.test(email)) {
      return jsonNoStore({ ok: false }, { status: 400 });
    }

    const { error } = await createAdminClient()
      .from("waitlist_signups")
      .insert({ email, locale, source: "get-media" });
    if (error && error.code !== "23505") {
      console.error("Waitlist insert failed", { code: error.code, message: error.message });
      return jsonNoStore({ ok: false }, { status: 503 });
    }

    return jsonNoStore({ ok: true });
  } catch (error) {
    if (error instanceof MediaHttpError) {
      return jsonNoStore({ ok: false }, { status: error.status });
    }
    console.error("Waitlist request failed", error instanceof Error ? error.message : "Unknown error");
    return jsonNoStore({ ok: false }, { status: 503 });
  }
}
