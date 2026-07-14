import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    let file = normalize(join(root, pathname === "/" ? "index.html" : pathname));
    if (!file.startsWith(root)) throw new Error("invalid path");
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    response.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
await new Promise((resolve) => server.listen(4329, "127.0.0.1", resolve));

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
await page.goto("http://127.0.0.1:4329/", { waitUntil: "load" });
await page.waitForTimeout(1900);

const desktopState = await page.evaluate(() => {
  const css = (selector) => getComputedStyle(document.querySelector(selector));
  const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect().toJSON();
  const heights = Object.fromEntries([
    ["nav", ".site-header"], ["hero", "[data-hero]"], ["story", "[data-about-heading-section]"],
    ["operations", "[data-operations]"], ["clients", "[data-client-section]"],
    ["capabilities", "[data-capabilities]"], ["services", "[data-services-stack]"],
    ["cta", "[data-closing]"], ["footer", "[data-footer]"],
  ].map(([name, selector]) => [name, Number((document.querySelector(selector).getBoundingClientRect().height / innerHeight).toFixed(3))]));
  const sources = [...document.querySelectorAll("[data-trail-source]")].map((image) => {
    const style = getComputedStyle(image);
    const box = image.getBoundingClientRect();
    return { width: box.width, height: box.height, visibility: style.visibility, pointerEvents: style.pointerEvents };
  });
  return {
    viewport: [innerWidth, innerHeight],
    documentHeight: document.documentElement.scrollHeight,
    documentSvh: Number((document.documentElement.scrollHeight / innerHeight).toFixed(3)),
    documentWidth: document.documentElement.scrollWidth,
    body: { background: css("body").backgroundColor, color: css("body").color, font: css("body").fontFamily },
    hero: { rect: rect("[data-hero]"), columns: css(".hero__layout").gridTemplateColumns, gap: css(".hero__layout").gap, paddingBlock: [css(".hero__layout").paddingTop, css(".hero__layout").paddingBottom] },
    layers: { nav: css(".site-header").zIndex, transition: css("[data-page-transition]").zIndex, loader: css("[data-page-loader]").zIndex, landscape: css(".mobile-landscape-cover").zIndex },
    sourcePool: { count: sources.length, samples: sources.slice(0, 2) },
    stageCount: document.querySelectorAll("[data-trail-item]").length,
    loaderComplete: sessionStorage.getItem("loaderComplete"),
    heights,
  };
});

await page.locator("[data-create-toggle]").click();
await page.waitForTimeout(1800);
const createOpen = await page.evaluate(() => ({
  expanded: document.querySelector("[data-create-toggle]").getAttribute("aria-expanded"),
  hidden: document.querySelector("[data-create-menu]").getAttribute("aria-hidden"),
  inert: document.querySelector("[data-create-menu]").hasAttribute("inert"),
  panelTransform: getComputedStyle(document.querySelector("[data-create-menu]")).transform,
  columnTransform: getComputedStyle(document.querySelector(".create-menu__column")).transform,
  linkRects: [...document.querySelectorAll("[data-create-menu] a")].map((link) => {
    const box = link.getBoundingClientRect();
    return { text: link.textContent.trim(), left: Math.round(box.left), right: Math.round(box.right), visible: box.left >= 0 && box.right <= innerWidth };
  }),
}));
await page.keyboard.press("Escape");
const createClosedByEscape = await page.locator("[data-create-toggle]").getAttribute("aria-expanded");

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobile.newPage();
await mobilePage.goto("http://127.0.0.1:4329/", { waitUntil: "load" });
await mobilePage.waitForTimeout(1000);
const mobileState = await mobilePage.evaluate(() => ({
  sliderInitialized: document.querySelector("[data-services-slider]").classList.contains("swiper-initialized"),
  slides: document.querySelectorAll("[data-service-card]").length,
  sourcePoolDisplay: getComputedStyle(document.querySelector("[data-image-trail]")).display,
  landscapeCover: getComputedStyle(document.querySelector(".mobile-landscape-cover")).display,
}));

const landscape = await browser.newContext({ viewport: { width: 740, height: 390 } });
const landscapePage = await landscape.newPage();
await landscapePage.goto("http://127.0.0.1:4329/", { waitUntil: "load" });
const landscapeState = await landscapePage.evaluate(() => ({ display: getComputedStyle(document.querySelector(".mobile-landscape-cover")).display, zIndex: getComputedStyle(document.querySelector(".mobile-landscape-cover")).zIndex }));

console.log(JSON.stringify({ desktopState, createOpen, createClosedByEscape, mobileState, landscapeState, errors }, null, 2));
await landscape.close();
await mobile.close();
await desktop.close();
await browser.close();
await new Promise((resolve) => server.close(resolve));
