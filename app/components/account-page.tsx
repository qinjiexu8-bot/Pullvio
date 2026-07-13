import { CreditCard, History, Play, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localePath, type Locale } from "@/lib/i18n";
import LanguageMenu from "./language-menu";
import SignOutButton from "./sign-out-button";

export default async function AccountPage({ locale }: { locale: Locale }) {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (supabase && !data.user) redirect(localePath(locale, "/login"));
  const email = data.user?.email || "Supabase connection pending";
  return <main className="account-page"><header className="auth-header"><a className="brand" href={localePath(locale)}><span className="brand-mark"><span /><Play size={13} fill="currentColor" strokeWidth={0} /></span><span>pullvio</span></a><div><LanguageMenu locale={locale} /><SignOutButton locale={locale} /></div></header><section className="account-shell"><div className="account-heading"><span className="kicker">YOUR ACCOUNT</span><h1>Good to have you here.</h1><p>{email}</p></div>{!supabase && <div className="setup-notice"><ShieldCheck size={21} /><div><strong>Authentication UI is ready</strong><p>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to connect real accounts.</p></div></div>}<div className="account-grid"><article><div><History size={22} /><span>RECENT LINKS</span></div><h2>Your history will appear here.</h2><p>Free accounts keep recent source links. Pro unlocks the complete history across devices.</p><a href={localePath(locale)}>Start a download</a></article><article className="account-pro"><div><Sparkles size={22} /><span>CURRENT PLAN</span></div><h2>Pullvio Free</h2><p>3 saves per day · up to 1080p · standard processing</p><a href={`${localePath(locale)}#pricing`}>Explore Pro</a></article><article><div><CreditCard size={22} /><span>BILLING</span></div><h2>No active subscription.</h2><p>Receipts, payment method, and cancellation controls will live here after Stripe is connected.</p></article></div></section></main>;
}
