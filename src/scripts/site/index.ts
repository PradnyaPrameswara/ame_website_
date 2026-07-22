import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { composeCleanups } from "./dom";
import { initClientShowcase, initMobileServices } from "./interactions";
import { initLoader } from "./loader";
import { initNavigation } from "./navigation";
import { initPageTransitions } from "./transitions";
import { initChapterOne, initChapters, initClosing, initHero, initImageTrail, initServicesStack, initStoryStatements, initWordSequence } from "./animations";
import type { Cleanup } from "./types";

gsap.registerPlugin(ScrollTrigger);

function initSmoothScroll(reducedMotion: boolean): [Lenis | null, Cleanup] {
  if (reducedMotion) return [null, () => undefined];
  const lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.8, touchMultiplier: 1, syncTouch: false });
  const ticker = (time: number): void => lenis.raf(time * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);
  return [lenis, () => { gsap.ticker.remove(ticker); lenis.destroy(); }];
}

function initSite(): void {
  window.__ameCleanup?.();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [lenis, destroySmoothScroll] = initSmoothScroll(reducedMotion);
  const cleanups: Cleanup[] = [destroySmoothScroll, initLoader(), initNavigation(lenis), initPageTransitions(lenis), initChapterOne()];

  if (reducedMotion) {
    cleanups.push(initClientShowcase(false));
  } else {
    cleanups.push(initHero(), initImageTrail());
    const media = gsap.matchMedia();
    media.add("(min-width: 1024px)", () => composeCleanups(
      initChapters(), initStoryStatements(), initWordSequence("[data-operations]", "[data-operation-word]"),
      initClientShowcase(true), initWordSequence("[data-capabilities]", "[data-capability-word]"), initServicesStack(), initClosing(),
    ));
    media.add("(min-width: 768px) and (max-width: 1023px)", () => composeCleanups(initClientShowcase(false), initClosing()));
    media.add("(max-width: 767px)", () => composeCleanups(initClientShowcase(false), initMobileServices(), initClosing()));
    cleanups.push(() => media.revert());
  }

  void document.fonts.ready.then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
  window.__ameCleanup = () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    window.__ameCleanup = undefined;
  };
}

document.addEventListener("astro:page-load", initSite);
