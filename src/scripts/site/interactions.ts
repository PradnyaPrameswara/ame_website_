import gsap from "gsap";
import Swiper from "swiper";
import { selectAll } from "./dom";
import { noop, type Cleanup } from "./types";

export function initClientShowcase(desktop: boolean): Cleanup {
  const buttons = selectAll<HTMLButtonElement>("[data-client-button]");
  const previews = selectAll<HTMLElement>("[data-client-preview]");
  let activeIndex = 0;
  let timeline: gsap.core.Timeline | undefined;
  const activate = (index: number): void => {
    if (index === activeIndex) return;
    const previous = previews[activeIndex];
    const next = previews[index];
    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    timeline?.kill();
    timeline = gsap.timeline();
    if (previous) timeline.to(previous, { autoAlpha: 0, scale: 0.75, x: 25, duration: 0.66, ease: "expo.inOut" })
      .to(previous.querySelector("img"), { scale: 0, y: -50, rotation: -45, duration: 0.66, ease: "expo.inOut" }, 0);
    if (next) {
      previous?.classList.remove("is-active");
      previous?.setAttribute("aria-hidden", "true");
      next.classList.add("is-active");
      next.setAttribute("aria-hidden", "false");
      timeline.fromTo(next, { autoAlpha: 0, scale: 0.75, x: -25 }, { autoAlpha: 1, scale: 1, x: 0, duration: 0.66, ease: "expo.out" })
        .fromTo(next.querySelector("img"), { scale: 0, y: 50, rotation: 45 }, { scale: 1, y: 0, rotation: 0, duration: 0.66, ease: "expo.out" }, 0);
    }
    activeIndex = index;
  };
  const listeners: Array<[HTMLButtonElement, string, () => void]> = [];
  buttons.forEach((button, index) => {
    const handler = (): void => activate(index);
    (desktop ? ["pointerenter", "focus", "click"] : ["focus", "click"]).forEach((eventName) => {
      button.addEventListener(eventName, handler);
      listeners.push([button, eventName, handler]);
    });
  });
  return () => { timeline?.kill(); listeners.forEach(([button, eventName, handler]) => button.removeEventListener(eventName, handler)); };
}

export function initMobileServices(): Cleanup {
  const root = document.querySelector<HTMLElement>("[data-services-slider]");
  if (!root) return noop;
  const slider = new Swiper(root, { speed: 400, spaceBetween: 16, slidesPerView: 1.25 });
  return () => slider.destroy(true, true);
}
