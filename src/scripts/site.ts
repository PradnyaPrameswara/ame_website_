import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swiper from "swiper";

declare global { interface Window { __ameCleanup?: () => void; } }

gsap.registerPlugin(ScrollTrigger);

type Cleanup = () => void;
const noop: Cleanup = () => undefined;
const selectAll = <T extends Element>(selector: string, root: ParentNode = document): T[] => Array.from(root.querySelectorAll<T>(selector));
const compose = (...cleanups: Cleanup[]): Cleanup => () => cleanups.reverse().forEach((cleanup) => cleanup());
const scrollDefaults = { scrub: .8, invalidateOnRefresh: true } as const;

function initLoader(): Cleanup {
  const loader = document.querySelector<HTMLElement>("[data-page-loader]");
  if (!loader) return noop;
  const firstVisit = sessionStorage.getItem("loaderComplete") !== "true";
  if (!firstVisit) {
    loader.classList.add("is-complete");
    document.documentElement.classList.add("loader-shown");
    return noop;
  }

  document.documentElement.classList.add("is-loading");
  const essentialImages = selectAll<HTMLImageElement>("[data-hero] img[loading='eager']");
  const ready = Promise.race([
    Promise.allSettled([
      document.fonts.ready,
      ...essentialImages.map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined)),
    ]),
    new Promise((resolve) => window.setTimeout(resolve, 1800)),
  ]);
  let cancelled = false;
  let timeline: gsap.core.Timeline | null = null;
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
      .to(".page-loader__content", { yPercent: -35, autoAlpha: 0, duration: .45, ease: "power3.in" })
      .to(".page-loader__panel", { scaleY: 0, duration: .85, ease: "power4.inOut" }, "-=.05");
  });
  return () => { cancelled = true; timeline?.kill(); document.documentElement.classList.remove("is-loading"); };
}

function initNavigation(lenis: Lenis | null): Cleanup {
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-mobile-menu]");
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const createToggle = document.querySelector<HTMLButtonElement>("[data-create-toggle]");
  const createMenu = document.querySelector<HTMLElement>("[data-create-menu]");
  let lastFocus: HTMLElement | null = null;
  const closeCreate = (): void => {
    if (!header || !createToggle || !createMenu) return;
    createToggle.setAttribute("aria-expanded", "false");
    createMenu.setAttribute("aria-hidden", "true");
    createMenu.setAttribute("inert", "");
    header.classList.remove("is-create-open");
    if (!menu?.classList.contains("is-open")) lenis?.start();
  };
  const openCreate = (): void => {
    if (!header || !createToggle || !createMenu) return;
    createToggle.setAttribute("aria-expanded", "true");
    createMenu.setAttribute("aria-hidden", "false");
    createMenu.removeAttribute("inert");
    header.classList.add("is-create-open");
    lenis?.stop();
  };
  const onCreateToggle = (): void => createToggle?.getAttribute("aria-expanded") === "true" ? closeCreate() : openCreate();
  const close = (): void => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector<HTMLElement>(".sr-only")!.textContent = "Open navigation menu";
    menu.setAttribute("aria-hidden", "true");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    lenis?.start();
  };
  const open = (): void => {
    if (!toggle || !menu) return;
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector<HTMLElement>(".sr-only")!.textContent = "Close navigation menu";
    menu.setAttribute("aria-hidden", "false");
    menu.classList.add("is-open");
    document.body.classList.add("menu-open");
    lenis?.stop();
    menu.querySelector<HTMLAnchorElement>("a")?.focus();
  };
  const onToggle = (): void => toggle?.getAttribute("aria-expanded") === "true" ? close() : open();
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      if (createToggle?.getAttribute("aria-expanded") === "true") { closeCreate(); createToggle.focus(); return; }
      if (!menu?.classList.contains("is-open")) return;
      close(); lastFocus?.focus(); return;
    }
    if (!menu?.classList.contains("is-open")) return;
    if (event.key !== "Tab") return;
    const focusable = selectAll<HTMLElement>('a[href], button:not([disabled])', menu);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const menuLinks = selectAll<HTMLElement>("[data-menu-link]", menu ?? document);
  const createLinks = selectAll<HTMLElement>("a", createMenu ?? document);
  toggle?.addEventListener("click", onToggle);
  createToggle?.addEventListener("click", onCreateToggle);
  document.addEventListener("keydown", onKeydown);
  menuLinks.forEach((link) => link.addEventListener("click", close));
  createLinks.forEach((link) => link.addEventListener("click", closeCreate));
  return () => {
    toggle?.removeEventListener("click", onToggle);
    createToggle?.removeEventListener("click", onCreateToggle);
    document.removeEventListener("keydown", onKeydown);
    menuLinks.forEach((link) => link.removeEventListener("click", close));
    createLinks.forEach((link) => link.removeEventListener("click", closeCreate));
    closeCreate();
    close();
  };
}

function initHero(): Cleanup {
  const context = gsap.context(() => {
    gsap.timeline({ delay: .12, defaults: { ease: "power3.out" } })
      .from("[data-hero-wordmark] span", { yPercent: 115, duration: .9 })
      .from("[data-nav-link]", { y: -14, autoAlpha: 0, duration: .55, stagger: .055 }, "<.15")
      .from("[data-hero-line]", { y: 36, autoAlpha: 0, duration: .9 }, "<.08")
      .from("[data-hero-copy], [data-hero-cta]", { y: 20, autoAlpha: 0, duration: .65, stagger: .08 }, "<.18");
  });
  return () => context.revert();
}

function initImageTrail(): Cleanup {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const items = selectAll<HTMLElement>("[data-trail-item]", hero ?? document);
  const sources = selectAll<HTMLImageElement>("[data-trail-source]", hero ?? document);
  if (!hero || !items.length || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return noop;
  let index = 0;
  let zIndex = 10;
  let previous = { x: 0, y: 0 };
  let distance = 0;
  let ready = false;
  let threshold = window.innerWidth / 8;
  void Promise.allSettled(sources.map((image) => image.complete ? Promise.resolve() : image.decode())).then(() => { ready = true; });
  const onPointerMove = (event: PointerEvent): void => {
    if (!ready) return;
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (!previous.x && !previous.y) previous = { x, y };
    const deltaX = x - previous.x;
    const deltaY = y - previous.y;
    distance += Math.abs(deltaX) + Math.abs(deltaY);
    previous = { x, y };
    if (distance < threshold) return;
    distance = 0;
    const item = items[index];
    if (!item) return;
    index = (index + 1) % items.length;
    zIndex += 1;
    gsap.killTweensOf(item);
    const timeline = gsap.timeline({ onComplete: () => gsap.set(item, { autoAlpha: 0 }) });
    timeline.fromTo(item, {
      x, y, xPercent: -50 + gsap.utils.random(-40, 40), yPercent: -50 + gsap.utils.random(-5, 5),
      zIndex, autoAlpha: 1, scaleX: 1.3, scaleY: 1.3, rotation: gsap.utils.random(-10, 10),
    }, { scaleX: 1, scaleY: 1, duration: .6, ease: "elastic.out(2, .6)" })
      .to(item, { x: `+=${deltaX * 4}`, y: `+=${deltaY * 4}`, rotation: gsap.utils.random(-10, 10), duration: 1.5, ease: "power4.out" }, 0)
      .to(item, { scale: .5, duration: .3, delay: .1, ease: "back.in(1.5)" });
  };
  const onResize = (): void => { threshold = window.innerWidth / 8; };
  hero.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onResize, { passive: true });
  return () => { hero.removeEventListener("pointermove", onPointerMove); window.removeEventListener("resize", onResize); gsap.killTweensOf(items); gsap.set(items, { clearProps: "all" }); };
}

function initChapters(): Cleanup {
  const contexts = selectAll<HTMLElement>("[data-chapter-transition]").map((section) => gsap.context(() => {
    const label = section.querySelector("[data-chapter-label]");
    const number = section.querySelector("[data-chapter-number]");
    gsap.timeline({ scrollTrigger: { trigger: section, start: "top 78%", end: "bottom 22%", ...scrollDefaults } })
      .fromTo([label, number], { yPercent: 120 }, { yPercent: 0, ease: "none" })
      .to([label, number], { yPercent: -120, ease: "none" }, 1);
  }, section));
  return () => contexts.forEach((context) => context.revert());
}

function initAboutHeading(): Cleanup {
  const section = document.querySelector<HTMLElement>("[data-about-heading-section]");
  const heading = section?.querySelector<HTMLElement>("[data-about-heading]");
  if (!section || !heading) return noop;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    gsap.set(heading, { clearProps: "transform,opacity,visibility" });
    return noop;
  }

  const context = gsap.context(() => {
    gsap.fromTo(heading, {
      yPercent: 105,
      autoAlpha: 0,
    }, {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1.05,
      ease: "power4.out",
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
    });
  }, section);
  return () => context.revert();
}

function initStoryStatements(): Cleanup {
  const context = gsap.context(() => selectAll<HTMLElement>(".story-statement p").forEach((statement, index) => {
    gsap.from(statement, { xPercent: index % 2 ? 10 : -10, autoAlpha: 0, ease: "power3.out", scrollTrigger: { trigger: statement, start: "top 82%", end: "top 42%", scrub: .55, invalidateOnRefresh: true } });
  }));
  return () => context.revert();
}

function initWordSequence(sectionSelector: string, wordSelector: string): Cleanup {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const words = selectAll<HTMLElement>(wordSelector, section ?? document);
  if (!section || words.length < 2) return noop;
  const context = gsap.context(() => {
    gsap.set(words.slice(1), { yPercent: 110, autoAlpha: 0 });
    const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 85%", end: "bottom 15%", ...scrollDefaults } });
    words.slice(1).forEach((word, index) => {
      const transitionAt = .8 + index * 1.2;
      timeline.fromTo(word, { yPercent: 110, autoAlpha: 1 }, { yPercent: 0, autoAlpha: 1, ease: "none", duration: .4 }, transitionAt)
        .to(words[index]!, { yPercent: -110, autoAlpha: 1, ease: "none", duration: .4 }, transitionAt + .2);
    });
    timeline.to({}, { duration: .8 });
  }, section);
  return () => context.revert();
}

function initOperationalWords(): Cleanup { return initWordSequence("[data-operations]", "[data-operation-word]"); }

function initClientShowcase(desktop: boolean): Cleanup {
  const buttons = selectAll<HTMLButtonElement>("[data-client-button]");
  const previews = selectAll<HTMLElement>("[data-client-preview]");
  let activeIndex = 0;
  let timeline: gsap.core.Timeline | null = null;
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
    if (previous) timeline.to(previous, { autoAlpha: 0, scale: .75, x: 25, duration: .66, ease: "expo.inOut" })
      .to(previous.querySelector("img"), { scale: 0, y: -50, rotation: -45, duration: .66, ease: "expo.inOut" }, 0);
    if (next) {
      previous?.classList.remove("is-active");
      previous?.setAttribute("aria-hidden", "true");
      next.classList.add("is-active");
      next.setAttribute("aria-hidden", "false");
      timeline.fromTo(next, { autoAlpha: 0, scale: .75, x: -25 }, { autoAlpha: 1, scale: 1, x: 0, duration: .66, ease: "expo.out" })
        .fromTo(next.querySelector("img"), { scale: 0, y: 50, rotation: 45 }, { scale: 1, y: 0, rotation: 0, duration: .66, ease: "expo.out" }, 0);
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

function initCapabilities(): Cleanup { return initWordSequence("[data-capabilities]", "[data-capability-word]"); }

function initServicesStack(): Cleanup {
  const section = document.querySelector<HTMLElement>("[data-services-stack]");
  const cards = selectAll<HTMLElement>("[data-service-card]", section ?? document);
  if (!section || !cards.length) return noop;
  const context = gsap.context(() => {
    const rotations = [-15, 10, -10, 15];
    cards.forEach((card, index) => {
      gsap.from(card, {
        yPercent: 15,
        scale: 1.25,
        rotation: rotations[index % rotations.length],
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: card, start: "top bottom", end: "center center", scrub: .5, invalidateOnRefresh: true },
      });
    });
  }, section);
  return () => context.revert();
}

function initMobileServices(): Cleanup {
  const root = document.querySelector<HTMLElement>("[data-services-slider]");
  if (!root) return noop;
  const slider = new Swiper(root, { speed: 400, spaceBetween: 16, slidesPerView: 1.25 });
  return () => slider.destroy(true, true);
}

function initClosing(): Cleanup {
  const context = gsap.context(() => {
    gsap.from("[data-manifesto] h2", { y: 70, autoAlpha: 0, scrollTrigger: { trigger: "[data-manifesto]", start: "top 72%", end: "top 30%", scrub: .6, invalidateOnRefresh: true } });
    gsap.from("[data-closing] > *", { y: 45, autoAlpha: 0, stagger: .08, scrollTrigger: { trigger: "[data-closing]", start: "top 75%", end: "top 35%", scrub: .5, invalidateOnRefresh: true } });
    gsap.from("[data-footer] > *", { y: 30, autoAlpha: 0, stagger: .08, scrollTrigger: { trigger: "[data-footer]", start: "top 88%", once: true } });
  });
  return () => context.revert();
}

function initPageTransitions(lenis: Lenis | null): Cleanup {
  const overlay = document.querySelector<HTMLElement>("[data-page-transition]");
  if (!overlay) return noop;
  const enter = (): void => {
    lenis?.stop();
    gsap.set(overlay, { autoAlpha: 1, yPercent: 100 });
    gsap.to(overlay, { yPercent: 0, duration: .55, ease: "power3.inOut" });
  };
  const leave = (): void => {
    gsap.fromTo(overlay, { yPercent: 0, autoAlpha: 1 }, { yPercent: -100, duration: .62, ease: "power3.inOut", onComplete: () => { gsap.set(overlay, { autoAlpha: 0, yPercent: 100 }); lenis?.start(); } });
  };
  document.addEventListener("astro:before-preparation", enter);
  document.addEventListener("astro:after-swap", leave);
  return () => { document.removeEventListener("astro:before-preparation", enter); document.removeEventListener("astro:after-swap", leave); gsap.killTweensOf(overlay); };
}

async function refreshAfterAssets(): Promise<void> {
  await document.fonts.ready;
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

function initSite(): void {
  window.__ameCleanup?.();
  const cleanups: Cleanup[] = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = reducedMotion ? null : new Lenis({ lerp: .075, smoothWheel: true, wheelMultiplier: .8, touchMultiplier: 1, syncTouch: false });
  if (lenis) {
    const ticker = (time: number): void => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => { gsap.ticker.remove(ticker); lenis.destroy(); });
  }
  cleanups.push(initLoader(), initNavigation(lenis), initPageTransitions(lenis), initAboutHeading());
  if (!reducedMotion) {
    cleanups.push(initHero(), initImageTrail());
    const media = gsap.matchMedia();
    media.add("(min-width: 1024px)", () => compose(
      initChapters(), initStoryStatements(), initOperationalWords(),
      initClientShowcase(true), initCapabilities(), initServicesStack(), initClosing(),
    ));
    media.add("(min-width: 768px) and (max-width: 1023px)", () => compose(initClientShowcase(false), initClosing()));
    media.add("(max-width: 767px)", () => compose(initClientShowcase(false), initMobileServices(), initClosing()));
    cleanups.push(() => media.revert());
  } else cleanups.push(initClientShowcase(false));
  void refreshAfterAssets();
  window.__ameCleanup = () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    window.__ameCleanup = undefined;
  };
}

document.addEventListener("astro:page-load", initSite);
