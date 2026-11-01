"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile — a free, mostly invisible check that the form is sent by a person.
// Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set (local development).
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: { sitekey: string; theme?: string; size?: string }) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptLoading: Promise<void> | null = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  scriptLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptLoading = null; reject(new Error("Turnstile failed to load")); };
    document.head.appendChild(s);
  });
  return scriptLoading;
}

/** Adds a hidden `cf-turnstile-response` field to the surrounding form. */
export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (!cancelled && ref.current && window.turnstile) {
          id = window.turnstile.render(ref.current, { sitekey: SITE_KEY, theme: "light", size: "flexible" });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}
