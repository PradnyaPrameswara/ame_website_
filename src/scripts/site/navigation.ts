import type Lenis from "lenis";
import { selectAll } from "./dom";
import { noop, type Cleanup } from "./types";

export function initNavigation(lenis: Lenis | null): Cleanup {
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-mobile-menu]");
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const createToggle = document.querySelector<HTMLButtonElement>("[data-create-toggle]");
  const createMenu = document.querySelector<HTMLElement>("[data-create-menu]");
  if (!toggle && !createToggle) return noop;

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
  const close = (): void => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector<HTMLElement>(".sr-only")?.replaceChildren("Open navigation menu");
    menu.setAttribute("aria-hidden", "true");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    lenis?.start();
  };
  const open = (): void => {
    if (!toggle || !menu) return;
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector<HTMLElement>(".sr-only")?.replaceChildren("Close navigation menu");
    menu.setAttribute("aria-hidden", "false");
    menu.classList.add("is-open");
    document.body.classList.add("menu-open");
    lenis?.stop();
    menu.querySelector<HTMLAnchorElement>("a")?.focus();
  };
  const onToggle = (): void => toggle?.getAttribute("aria-expanded") === "true" ? close() : open();
  const onCreateToggle = (): void => createToggle?.getAttribute("aria-expanded") === "true" ? closeCreate() : openCreate();
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      if (createToggle?.getAttribute("aria-expanded") === "true") { closeCreate(); createToggle.focus(); return; }
      if (menu?.classList.contains("is-open")) { close(); lastFocus?.focus(); }
      return;
    }
    if (event.key !== "Tab" || !menu?.classList.contains("is-open")) return;
    const focusable = selectAll<HTMLElement>("a[href], button:not([disabled])", menu);
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
