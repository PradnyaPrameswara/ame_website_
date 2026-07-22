import gsap from "gsap";
import { selectAll } from "./dom";
import { noop, type Cleanup } from "./types";

const scrollDefaults = { scrub: 0.8, invalidateOnRefresh: true } as const;

export function initHero(): Cleanup {
  const context = gsap.context(() => {
    gsap.timeline({ delay: 0.12, defaults: { ease: "power3.out" } })
      .from("[data-hero-wordmark] span", { yPercent: 115, duration: 0.9 })
      .from("[data-nav-link]", { y: -14, autoAlpha: 0, duration: 0.55, stagger: 0.055 }, "<.15")
      .from("[data-hero-line]", { y: 36, autoAlpha: 0, duration: 0.9 }, "<.08")
      .from("[data-hero-copy], [data-hero-cta]", { y: 20, autoAlpha: 0, duration: 0.65, stagger: 0.08 }, "<.18");
  });
  return () => context.revert();
}

export function initImageTrail(): Cleanup {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const items = selectAll<HTMLElement>("[data-trail-item]", hero ?? document);
  const sources = selectAll<HTMLImageElement>("[data-trail-source]", hero ?? document);
  const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
  if (!hero || !items.length || !enabled) return noop;

  let index = 0, zIndex = 10, distance = 0, ready = false, threshold = window.innerWidth / 8;
  let previous = { x: 0, y: 0 };
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
    gsap.timeline({ onComplete: () => gsap.set(item, { autoAlpha: 0 }) })
      .fromTo(item, { x, y, xPercent: -50 + gsap.utils.random(-40, 40), yPercent: -50 + gsap.utils.random(-5, 5), zIndex, autoAlpha: 1, scaleX: 1.3, scaleY: 1.3, rotation: gsap.utils.random(-10, 10) }, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(2, .6)" })
      .to(item, { x: `+=${deltaX * 4}`, y: `+=${deltaY * 4}`, rotation: gsap.utils.random(-10, 10), duration: 1.5, ease: "power4.out" }, 0)
      .to(item, { scale: 0.5, duration: 0.3, delay: 0.1, ease: "back.in(1.5)" });
  };
  const onResize = (): void => { threshold = window.innerWidth / 8; };
  hero.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onResize, { passive: true });
  return () => { hero.removeEventListener("pointermove", onPointerMove); window.removeEventListener("resize", onResize); gsap.killTweensOf(items); gsap.set(items, { clearProps: "all" }); };
}

export function initChapters(): Cleanup {
  const contexts = selectAll<HTMLElement>("[data-chapter-transition]").map((section) => gsap.context(() => {
    const label = section.querySelector("[data-chapter-label]");
    const number = section.querySelector("[data-chapter-number]");
    gsap.timeline({ scrollTrigger: { trigger: section, start: "top 78%", end: "bottom 22%", ...scrollDefaults } })
      .fromTo([label, number], { yPercent: 120 }, { yPercent: 0, ease: "none" })
      .to([label, number], { yPercent: -120, ease: "none" }, 1);
  }, section));
  return () => contexts.forEach((context) => context.revert());
}

// Explicit parallax config per story image (1-based index matching data-story-image).
// Each image gets a distinct speed so they move independently during scroll.
const storyImageMotion: Record<string, { fromY: number; toY: number; start: string; end: string }> = {
  // image 1 — top-left, slow upward
  "1": { fromY: 20,  toY: -10, start: "top 90%", end: "bottom 20%" },
  // image 2 — top-right, moderate upward
  "2": { fromY: 40,  toY: -25, start: "top 85%", end: "bottom 20%" },
  // image 3 — bottom-left, delayed upward
  "3": { fromY: 60,  toY: -15, start: "top 80%", end: "bottom 15%" },
  // image 4 — bottom-right, latest and smallest
  "4": { fromY: 75,  toY:  -5, start: "top 75%", end: "bottom 10%" },
};

export function initChapterOne(): Cleanup {
  const section = document.querySelector<HTMLElement>("[data-chapter-one]");
  if (!section) return noop;

  const context = gsap.context(() => {
    gsap.from("[data-chapter-elem]", {
      y: 30,
      autoAlpha: 0,
      stagger: 0.1,
      ease: "power3.out",
      duration: 0.8,
      scrollTrigger: { trigger: section, start: "top 80%", once: true }
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ── Clip-path text reveal ──────────────────────────────────
    const activeLayer = section.querySelector<HTMLElement>("[data-story-progress-active]");
    const storyOuter = section.querySelector<HTMLElement>("[data-story-outer]");
    if (activeLayer && storyOuter) {
      gsap.set(activeLayer, { clipPath: "inset(0 0 100% 0)" });
      gsap.to(activeLayer, {
        clipPath: "inset(0 0 0% 0)",
        ease: "none",
        scrollTrigger: {
          trigger: storyOuter,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    // ── Per-image parallax ────────────────────────────────────
    // Skip on mobile — CSS handles layout without scroll animation
    if (window.matchMedia("(max-width: 47.99rem)").matches) return;

    const storyImages = gsap.utils.toArray<HTMLElement>("[data-story-image]");
    storyImages.forEach((img) => {
      const key = img.dataset.storyImage ?? "";
      const motion = storyImageMotion[key];
      if (!motion || !storyOuter) return;
      gsap.fromTo(
        img,
        { yPercent: motion.fromY },
        {
          yPercent: motion.toY,
          ease: "none",
          scrollTrigger: {
            trigger: storyOuter,
            start: motion.start,
            end: motion.end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
  }, section);

  return () => context.revert();
}

export function initStoryStatements(): Cleanup {
  const context = gsap.context(() => selectAll<HTMLElement>(".story-statement p").forEach((statement, index) => gsap.from(statement, { xPercent: index % 2 ? 10 : -10, autoAlpha: 0, ease: "power3.out", scrollTrigger: { trigger: statement, start: "top 82%", end: "top 42%", scrub: 0.55, invalidateOnRefresh: true } })));
  return () => context.revert();
}

export function initWordSequence(sectionSelector: string, wordSelector: string): Cleanup {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const words = selectAll<HTMLElement>(wordSelector, section ?? document);
  if (!section || words.length < 2) return noop;
  const context = gsap.context(() => {
    gsap.set(words.slice(1), { yPercent: 110, autoAlpha: 0 });
    const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 85%", end: "bottom 15%", ...scrollDefaults } });
    words.slice(1).forEach((word, index) => {
      const transitionAt = 0.8 + index * 1.2;
      timeline.fromTo(word, { yPercent: 110, autoAlpha: 1 }, { yPercent: 0, autoAlpha: 1, ease: "none", duration: 0.4 }, transitionAt)
        .to(words[index]!, { yPercent: -110, autoAlpha: 1, ease: "none", duration: 0.4 }, transitionAt + 0.2);
    });
    timeline.to({}, { duration: 0.8 });
  }, section);
  return () => context.revert();
}

export function initServicesStack(): Cleanup {
  const section = document.querySelector<HTMLElement>("[data-services-stack]");
  const cards = selectAll<HTMLElement>("[data-service-card]", section ?? document);
  if (!section || !cards.length) return noop;
  const rotations = [-15, 10, -10, 15];
  const context = gsap.context(() => cards.forEach((card, index) => gsap.from(card, { yPercent: 15, scale: 1.25, rotation: rotations[index % rotations.length], ease: "back.out(1.4)", scrollTrigger: { trigger: card, start: "top bottom", end: "center center", scrub: 0.5, invalidateOnRefresh: true } })), section);
  return () => context.revert();
}

export function initClosing(): Cleanup {
  const context = gsap.context(() => {
    gsap.from("[data-manifesto] h2", { y: 70, autoAlpha: 0, scrollTrigger: { trigger: "[data-manifesto]", start: "top 72%", end: "top 30%", scrub: 0.6, invalidateOnRefresh: true } });
    gsap.from("[data-closing] > *", { y: 45, autoAlpha: 0, stagger: 0.08, scrollTrigger: { trigger: "[data-closing]", start: "top 75%", end: "top 35%", scrub: 0.5, invalidateOnRefresh: true } });
    gsap.from("[data-footer] > *", { y: 30, autoAlpha: 0, stagger: 0.08, scrollTrigger: { trigger: "[data-footer]", start: "top 88%", once: true } });
  });
  return () => context.revert();
}
