import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { selectAll } from "./dom";
import { noop, type Cleanup } from "./types";

export function initLoader(): Cleanup {
  const loader = document.querySelector<HTMLElement>("[data-page-loader]");
  if (!loader) return noop;

  if (sessionStorage.getItem("loaderComplete") === "true") {
    loader.classList.add("is-complete");
    document.documentElement.classList.add("loader-shown");
    return noop;
  }

  document.documentElement.classList.add("is-loading");
  const images = selectAll<HTMLImageElement>("[data-hero] img[loading='eager']");
  const ready = Promise.race([
    Promise.allSettled([
      document.fonts.ready,
      ...images.map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined)),
    ]),
    new Promise((resolve) => window.setTimeout(resolve, 1800)),
  ]);
  let cancelled = false;
  let timeline: gsap.core.Timeline | undefined;

  void ready.then(() => {
    if (cancelled) return;
    sessionStorage.setItem("loaderComplete", "true");
    document.documentElement.classList.add("loader-shown");
    timeline = gsap.timeline({
      onComplete: () => {
        loader.classList.add("is-complete");
        document.documentElement.classList.remove("is-loading");
        ScrollTrigger.refresh();
      },
    })
      .to(".page-loader__content", { yPercent: -35, autoAlpha: 0, duration: 0.45, ease: "power3.in" })
      .to(".page-loader__panel", { scaleY: 0, duration: 0.85, ease: "power4.inOut" }, "-=.05");
  });

  return () => {
    cancelled = true;
    timeline?.kill();
    document.documentElement.classList.remove("is-loading");
  };
}
