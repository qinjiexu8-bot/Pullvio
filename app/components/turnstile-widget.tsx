"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export default function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const reactId = useId();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    let canceled = false;
    const render = () => {
      if (canceled || !container.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        action: "youtube-download",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-pullvio-turnstile]");
    if (existing) {
      if (window.turnstile) render();
      else existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.pullvioTurnstile = "true";
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }
    return () => {
      canceled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [onToken, reactId, siteKey]);

  if (!siteKey) return null;
  return <div ref={container} className="turnstile-widget" aria-label="Security verification" />;
}
