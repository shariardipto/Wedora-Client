"use client";

/**
 * Coordinates the full-page loader with entrance animations: hero/headline
 * timelines call `afterIntro` so they play once the loader has revealed the
 * page (immediately when there is no loader — dashboards, client navigation,
 * reduced motion).
 *
 * It also lets heavy start-up work hide inside the intro: once the intro logo has
 * finished writing, the panel shows a still logo until the page is ready, so a
 * blocked main thread isn't visible then (`whileIntroHolds`), and the intro can wait a
 * moment for such work before it opens (`holdIntroOpen`), e.g. the hero's 3D scene, so it
 * starts right as the intro fades.
 */
let done = false;
let logoWritten = false;
const waiting = new Set<() => void>();
const onLogoWritten = new Set<() => void>();
const holds = new Set<Promise<void>>();

/** A new intro is starting (the home page can be shown again via client navigation): wait for it. */
export function startIntro() {
  done = false;
  logoWritten = false;
}

/** True while an intro covers the page and hasn't started opening. */
export function introRunning(): boolean {
  const loader = document.querySelector("[data-page-loader]");
  return !done && !!loader && !loader.classList.contains("page-loader-exit");
}

/** The intro logo has finished writing: from now on the panel holds a still logo. */
export function markIntroLogoWritten() {
  if (logoWritten) return;
  logoWritten = true;
  for (const run of [...onLogoWritten]) run();
  onLogoWritten.clear();
}

export function markIntroDone() {
  markIntroLogoWritten(); // anything waiting for the still moment runs now at the latest
  if (done) return;
  done = true;
  for (const run of [...waiting]) run();
  waiting.clear();
}

/**
 * Runs `callback` while the intro shows its finished, still logo (right away when there is no
 * running intro). For heavy work whose blocked frames shouldn't be seen. Returns a cancel function.
 */
export function whileIntroHolds(callback: () => void): () => void {
  if (logoWritten || !introRunning()) {
    callback();
    return () => undefined;
  }
  onLogoWritten.add(callback);
  return () => onLogoWritten.delete(callback);
}

/** The intro waits for `promise` (see `introHolds`) before it opens. */
export function holdIntroOpen(promise: Promise<void>) {
  holds.add(promise);
  void promise.finally(() => holds.delete(promise));
}

/** Resolves when every hold has settled, or after `maxMs` at the latest. */
export function introHolds(maxMs: number): Promise<void> {
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
  const timer = window.setTimeout(run, 8000); // safety net: never wait forever
  waiting.add(run);
  return () => {
    ran = true;
    window.clearTimeout(timer);
    waiting.delete(run);
  };
}
