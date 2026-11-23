"use client";
let done = false;
const waiting = new Set<() => void>();
const holds = new Set<Promise<void>>();

/** A new intro is starting (the home page can be shown again via client navigation): wait for it. */
export function startIntro() {
  done = false;
}

/** True while an intro covers the page and hasn't started opening. */
export function introRunning(): boolean {
  const loader = document.querySelector("[data-page-loader]");
  return !done && !!loader && !loader.classList.contains("page-loader-exit");
}

export function markIntroDone() {
  if (done) return;
  done = true;
  for (const run of [...waiting]) run();
  waiting.clear();
}

/** The intro logo waits for `promise` (see `introStartHolds`) before it starts writing. */
export function holdIntroStart(promise: Promise<void>) {
  holds.add(promise);
  void promise.finally(() => holds.delete(promise));
}

/** Resolves when every hold has settled, or after `maxMs` at the latest. */
export function introStartHolds(maxMs: number): Promise<void> {
  const all = Promise.allSettled([...holds]).then(() => undefined);
  const cap = new Promise<void>((resolve) => window.setTimeout(resolve, maxMs));
  return Promise.race([all, cap]);
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
  const timer = window.setTimeout(run, 10000); // safety net: never wait forever
  waiting.add(run);
  return () => {
    ran = true;
    window.clearTimeout(timer);
    waiting.delete(run);
  };
}
