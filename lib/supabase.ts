import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabasePublishableKey && typeof window !== "undefined") {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY fallback). Set it in .env.local to enable Supabase auth and data operations.",
  );
}

// Hard per-request abort so stale/hung requests don't pile up in the browser.
// Promise.race alone (used in withTimeout) only rejects in JS – it does NOT
// cancel the underlying fetch, so the network request keeps running until a
// hard reload. AbortController actually terminates it.
//
// We use different ceilings per request type to prevent zombie connections from
// filling the Supabase connection pool:
//   • REST / Auth queries  → 14 s  (app-level QUERY_TIMEOUT_MS is 12 s – 2 s margin)
//   • Storage uploads/gets → 65 s  (app-level UPLOAD_TIMEOUT_MS is 60 s – 5 s margin)
// Without this split, timed-out DB queries lingered for 30 s each, draining
// the default_pool_size=20 pool and causing cascading timeouts until a reload.
const REST_FETCH_ABORT_MS = 14_000;
const STORAGE_FETCH_ABORT_MS = 65_000;

const isStorageRequest = (input: RequestInfo | URL): boolean => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;
  return url.includes("/storage/v1/");
};

const abortingFetch: typeof fetch = (input, init) => {
  const timeoutMs = isStorageRequest(input)
    ? STORAGE_FETCH_ABORT_MS
    : REST_FETCH_ABORT_MS;
  const controller = new AbortController();

  // Honour any upstream signal (e.g. from Supabase realtime internals).
  const upstreamSignal = (init as RequestInit | undefined)?.signal ?? null;
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort(upstreamSignal.reason);
    } else {
      upstreamSignal.addEventListener("abort", abortFromUpstream, {
        once: true,
      });
    }
  }

  const timeoutId = setTimeout(
    () =>
      controller.abort(
        new Error(`Supabase request timed out after ${timeoutMs}ms`),
      ),
    timeoutMs,
  );

  return globalThis
    .fetch(input, { ...init, signal: controller.signal })
    .finally(() => {
      clearTimeout(timeoutId);
      upstreamSignal?.removeEventListener("abort", abortFromUpstream);
    });
};

export const supabase = createBrowserClient(
  supabaseUrl,
  supabasePublishableKey,
  { global: { fetch: abortingFetch } },
);
