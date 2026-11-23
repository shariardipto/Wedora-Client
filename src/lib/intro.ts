"use client";

/**
 * Coordinates the full-page loader with entrance animations: hero/headline
 * timelines call `afterIntro` so they play once the loader has revealed the
 * page (immediately when there is no loader — dashboards, client navigation,
 * reduced motion).
 */
let done = false;
const waiting = new Set<() => void>();

/** A new intro is starting (the home page can be shown again via client navigation): wait for it. */
export function startIntro() {
  done = false;
}

export function markIntroDone() {
  if (done) return;
  done = true;
  for (const run of [...waiting]) run();
  waiting.clear();
}

/** Runs `callback` after the page loader finishes. Returns a cancel function. */
export function afterIntro(callback: () => void): () => void {
  const loader = document.querySelector("[data-page-loader]");
  // Nothing to wait for: this intro is done, there is none on this page, or it is already opening.
  if (done || !loader || loader.classList.contains("page-loader-exit")) {
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
