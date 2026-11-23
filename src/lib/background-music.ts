/**
 * The home page's background music: one shared player for the whole visit, driven by the fixed
 * play/pause button (components/home/music-toggle.tsx) and drawn by the visualizer round the hero's
 * arch photo (music-burst.tsx). It starts by itself after the intro where browsers allow it (see
 * `autoplayMusic`); nothing downloads before then.
 *
 * Sound goes through Web Audio. iPhones and iPads ignore a media element's `volume`, so a gain node is
 * the only way to keep the music low everywhere, and an analyser feeds the visualizer. That needs the
 * file served with CORS (the R2 bucket's policy allows the site's origins). Where it isn't allowed (a
 * preview deployment's own domain, say), the load fails and the player falls back to the plain element:
 * the music still plays, at `volume` (full volume on iOS), and the visualizer moves without real levels.
 */

/** Background level. The track averages about −24 dB, so a quarter of it sits quietly under the page. */
export const MUSIC_VOLUME = 0.25;
const FADE_IN_SECONDS = 1.6;
const FADE_OUT_SECONDS = 0.6;

export type MusicState = {
  /** The visitor wants the music on (it may still be buffering). */
  on: boolean;
  /** Waiting for data: the first seconds of the file, or a slow connection. */
  buffering: boolean;
  /** The file could not be loaded. Pressing play tries again. */
  failed: boolean;
  /** Set to start by itself, but the browser is waiting for the visitor's first click, tap or key press. */
  waiting: boolean;
};

type Graph = { context: AudioContext; gain: GainNode; analyser: AnalyserNode };
type Player = { audio: HTMLAudioElement; graph: Graph | null; src: string };

const OFF: MusicState = { on: false, buffering: false, failed: false, waiting: false };
let state = OFF;
const listeners = new Set<() => void>();

let player: Player | null = null;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;
let volumeTimer: ReturnType<typeof setInterval> | undefined;
let pausedWithTab = false;
let watchingTab = false;
let attached = 0;
let resumeOnReturn = false;
let spectrum: Uint8Array<ArrayBuffer> | null = null;
/** Stops `autoplayMusic` waiting for a gesture (once the music starts some other way). */
let stopWaitingForGesture: (() => void) | null = null;

function update(patch: Partial<MusicState>) {
  const next = { ...state, ...patch };
  if ((Object.keys(next) as (keyof MusicState)[]).every((key) => next[key] === state[key])) return;
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribeMusic(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const getMusicState = () => state;
export const getServerMusicState = () => OFF;

function createPlayer(src: string, withWebAudio: boolean): Player {
  const audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";
  let graph: Graph | null = null;
  if (withWebAudio && typeof AudioContext !== "undefined") {
    audio.crossOrigin = "anonymous";
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.78;
    const gain = context.createGain();
    gain.gain.value = 0;
    // Analysed before the gain, so the bars follow the music, not the (low) volume.
    context.createMediaElementSource(audio).connect(analyser);
    analyser.connect(gain).connect(context.destination);
    graph = { context, gain, analyser };
  } else {
    audio.volume = 0;
  }
  audio.src = src;

  const created: Player = { audio, graph, src };
  // Fade in once sound actually flows, not while the first seconds are still downloading.
  audio.addEventListener("playing", () => {
    if (player !== created) return;
    update({ buffering: false });
    if (state.on) fadeTo(MUSIC_VOLUME, FADE_IN_SECONDS);
  });
  audio.addEventListener("waiting", () => {
    if (player === created && state.on) update({ buffering: true });
  });
  audio.addEventListener("error", () => {
    if (player === created) recoverFrom(created);
  });
  return created;
}

function discard(old: Player) {
  old.audio.pause();
  old.audio.removeAttribute("src");
  old.audio.load();
  void old.graph?.context.close();
}

/** A CORS load fails outright when the host doesn't allow this origin: retry once as a plain element. */
function recoverFrom(failed: Player) {
  const code = failed.audio.error?.code; // read first: discarding clears it
  discard(failed);
  if (failed.graph) {
    player = createPlayer(failed.src, false);
    if (state.on) start();
    return;
  }
  player = null;
  update({ on: false, buffering: false, failed: true });
  // Says why, for whoever opens the console: 4 = nothing playable arrived (the file, or a request
  // blocked or refused before any audio, e.g. by an extension), 2 = the connection dropped mid-way.
  console.warn(`Background music could not load (media error ${code ?? "unknown"}).`);
}

function fadeTo(target: number, seconds: number) {
  if (!player) return;
  const { audio, graph } = player;
  if (graph) {
    const level = graph.gain.gain;
    const now = graph.context.currentTime;
    // Hold wherever a running fade has got to, then ramp from there.
    if (typeof level.cancelAndHoldAtTime === "function") level.cancelAndHoldAtTime(now);
    else {
      level.cancelScheduledValues(now);
      level.setValueAtTime(level.value, now);
    }
    level.linearRampToValueAtTime(target, now + seconds);
    return;
  }
  clearInterval(volumeTimer);
  const from = audio.volume;
  const began = performance.now();
  volumeTimer = setInterval(() => {
    const progress = Math.min(1, (performance.now() - began) / (seconds * 1000));
    audio.volume = from + (target - from) * progress;
    if (progress === 1) clearInterval(volumeTimer);
  }, 50);
}

function silenceNow() {
  if (!player) return;
  clearInterval(volumeTimer);
  if (player.graph) {
    const level = player.graph.gain.gain;
    level.cancelScheduledValues(0);
    level.value = 0;
  } else player.audio.volume = 0;
}

function start() {
  if (!player) return;
  const { audio, graph } = player;
  clearTimeout(pauseTimer);
  void graph?.context.resume();
  // Pressed again while fading out: the element is still playing, so just fade back up.
  if (!audio.paused) return fadeTo(MUSIC_VOLUME, FADE_IN_SECONDS);
  if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) update({ buffering: true });
  audio.play().catch((error: unknown) => {
    if (player?.audio !== audio) return;
    // Blocked by the browser's autoplay rules (resuming without a fresh click, e.g. after a reload).
    // An AbortError only means it was paused again before it started; load errors arrive as `error`.
    if (error instanceof DOMException && error.name === "NotAllowedError") update({ on: false, buffering: false });
  });
}

function stop() {
  if (!player) return;
  const { audio } = player;
  clearTimeout(pauseTimer);
  if (audio.paused) return;
  fadeTo(0, FADE_OUT_SECONDS);
  pauseTimer = setTimeout(() => audio.pause(), FADE_OUT_SECONDS * 1000 + 60);
}

/** A hidden tab pauses the music at once (timers are throttled there, so no fade) and resumes it on return. */
function watchTab() {
  if (watchingTab) return;
  watchingTab = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!state.on || !player || player.audio.paused) return;
      pausedWithTab = true;
      clearTimeout(pauseTimer);
      player.audio.pause();
      silenceNow();
    } else if (pausedWithTab) {
      pausedWithTab = false;
      if (state.on) start();
    }
  });
}

export function playMusic(src: string) {
  stopWaitingForGesture?.();
  if (player?.src !== src) {
    if (player) discard(player);
    player = createPlayer(src, true);
  }
  pausedWithTab = false;
  update({ on: true, failed: false });
  watchTab();
  start();
}

export function pauseMusic() {
  pausedWithTab = false;
  update({ on: false, buffering: false });
  stop();
}

/** Remembers, for this visit (the tab's session), a visitor who turned the music off. */
const TURNED_OFF_KEY = "wedora:music-off";

function turnedOff() {
  try {
    return sessionStorage.getItem(TURNED_OFF_KEY) === "1";
  } catch {
    return false; // storage blocked: the choice can't be remembered across reloads
  }
}

function rememberTurnedOff(off: boolean) {
  try {
    if (off) sessionStorage.setItem(TURNED_OFF_KEY, "1");
    else sessionStorage.removeItem(TURNED_OFF_KEY);
  } catch {
    // Storage blocked: nothing to remember it in.
  }
}

/**
 * Tries to start without a gesture, which works where the visitor lets this site autoplay (a per-site
 * setting in Edge, Firefox and Safari). Nothing changes on screen unless sound really starts; when it's
 * blocked, the half-started download is dropped. Resolves whether it started.
 */
function tryQuietStart(src: string): Promise<boolean> {
  if (player?.src !== src) {
    if (player) discard(player);
    player = createPlayer(src, true);
  }
  const attempt = player;
  const blocked = () => {
    if (player !== attempt || state.on) return false; // a click got there first and owns it now
    discard(attempt);
    player = null;
    return false;
  };
  // Created without a gesture, a context the browser doesn't trust stays suspended: sound would go nowhere.
  if (attempt.graph && attempt.graph.context.state !== "running") return Promise.resolve(blocked());
  return attempt.audio.play().then(
    () => {
      if (player !== attempt) return false;
      if (!state.on) {
        update({ on: true, failed: false, buffering: false });
        watchTab();
        fadeTo(MUSIC_VOLUME, FADE_IN_SECONDS);
      }
      return true;
    },
    blocked,
  );
}

/** The visitor pressed the music button: play or pause, and remember the choice. */
export function toggleMusic(src: string) {
  if (state.on) pauseMusic();
  else playMusic(src);
  rememberTurnedOff(!state.on);
}

/**
 * Starts the music by itself (owner's choice), as far as browsers allow. Every major browser blocks
 * sound on a fresh page until the visitor clicks, taps or presses a key (measured in Chrome: a fresh
 * visit, a reload after clicking and a typed URL are all refused). So: it plays at once if they have
 * already interacted with this page (a click during the intro, or earlier in this visit) or if their
 * browser lets this site autoplay; otherwise it starts on their first click, tap or key press. Links
 * (they leave the page) and the music button (it decides for itself) don't count. Not for a visitor
 * who turned it off during this visit, nor with the browser's data saver on. Returns a cleanup.
 */
export function autoplayMusic(src: string): () => void {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (state.on || turnedOff() || connection?.saveData) return () => undefined;
  // Older Safari lacks this; there the music tries quietly, then waits for the first gesture.
  const activation: UserActivation | undefined = navigator.userActivation;
  if (activation?.hasBeenActive && !document.hidden) {
    playMusic(src);
    return () => undefined;
  }

  const events = ["pointerdown", "pointerup", "keydown", "click"] as const;
  const stopWaiting = () => {
    events.forEach((type) => document.removeEventListener(type, onGesture, true));
    if (stopWaitingForGesture === stopWaiting) stopWaitingForGesture = null;
    update({ waiting: false });
  };
  function onGesture(event: Event) {
    if (event.target instanceof Element && event.target.closest("a[href], [data-music-control]")) return;
    // Not every event lets sound start (a touch counts on release, Esc never does): wait for one that does.
    if (activation && !activation.isActive) return;
    stopWaiting();
    if (!state.on && !turnedOff()) playMusic(src);
  }
  // Listening first, so a click during the quiet attempt still counts.
  events.forEach((type) => document.addEventListener(type, onGesture, true));
  stopWaitingForGesture?.();
  stopWaitingForGesture = stopWaiting;
  update({ waiting: true });
  if (!document.hidden) {
    void tryQuietStart(src).then((started) => {
      if (started) stopWaiting();
    });
  }
  return stopWaiting;
}

/**
 * Each mounted control calls this: the music belongs to the home page. When the last one goes (the
 * visitor navigates away) it fades out, and it picks up again if they come back during this visit.
 */
export function attachMusic(src: string) {
  attached++;
  if (attached === 1 && resumeOnReturn) {
    resumeOnReturn = false;
    playMusic(src);
  }
  return () => {
    attached--;
    if (attached > 0) return;
    resumeOnReturn = state.on;
    if (state.on) pauseMusic();
  };
}

/** The analyser's current spectrum while music plays through Web Audio; null otherwise (no real levels). */
export function readMusicSpectrum(): { data: Uint8Array; sampleRate: number } | null {
  const graph = player?.graph;
  if (!graph || !state.on || state.buffering || player?.audio.paused) return null;
  if (spectrum?.length !== graph.analyser.frequencyBinCount) spectrum = new Uint8Array(graph.analyser.frequencyBinCount);
  graph.analyser.getByteFrequencyData(spectrum);
  return { data: spectrum, sampleRate: graph.context.sampleRate };
}

/** Whether real levels are available while playing (false in the plain-element fallback). */
export const musicHasLevels = () => Boolean(player?.graph);
