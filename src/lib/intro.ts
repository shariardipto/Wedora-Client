"use client";

/**
 * Coordinates the full-page loader with entrance animations: hero/headline
 * timelines call `afterIntro` so they play once the loader has revealed the
 * page (immediately when there is no loader — dashboards, client navigation,
 * reduced motion).
 */
let done = false;
const waiting = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  for (const run of [...waiting]) run();
  waiting.clear();
}

/** Runs `callback` after the page loader finishes. Returns a cancel function. */
export function afterIntro(callback: () => void): () => void {
  if (done || !document.querySelector("[data-page-loader]")) {
    callback();
    return () => undefined;
  }
  let ran = false;
  const run = () => {
    if (ran) return;
    ran = true;
    window.clearTimeout(timer);
    waiting.delete(run);
    callback();
  };
  const timer = window.setTimeout(run, 8000); // safety net: never wait forever
  waiting.add(run);
  return () => {
    ran = true;
    window.clearTimeout(timer);
    waiting.delete(run);
  };
}
