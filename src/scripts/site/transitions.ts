import gsap from "gsap";
import type Lenis from "lenis";
import type { Cleanup } from "./types";

export function initPageTransitions(lenis: Lenis | null): Cleanup {
  const overlay = document.querySelector<HTMLElement>("[data-page-transition]");
  if (!overlay) return () => undefined;
  const enter = (): void => {
    lenis?.stop();
    gsap.set(overlay, { autoAlpha: 1, yPercent: 100 });
    gsap.to(overlay, { yPercent: 0, duration: 0.55, ease: "power3.inOut" });
  };
  const leave = (): void => {
    gsap.fromTo(overlay, { yPercent: 0, autoAlpha: 1 }, { yPercent: -100, duration: 0.62, ease: "power3.inOut", onComplete: () => { gsap.set(overlay, { autoAlpha: 0, yPercent: 100 }); lenis?.start(); } });
  };
  document.addEventListener("astro:before-preparation", enter);
  document.addEventListener("astro:after-swap", leave);
  return () => { document.removeEventListener("astro:before-preparation", enter); document.removeEventListener("astro:after-swap", leave); gsap.killTweensOf(overlay); };
}
