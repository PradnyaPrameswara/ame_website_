import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const output = join(process.cwd(), "qa", "screenshots");
await mkdir(output, { recursive: true });

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png" };
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
await new Promise((resolve) => server.listen(4328, "127.0.0.1", resolve));

const browser = await chromium.launch({ headless: true });
const viewports = [
  ["desktop-1440x900", 1440, 900],
  ["mobile-390x844", 390, 844],
  ["mobile-430x932", 430, 932],
  ["tablet-768x1024", 768, 1024],
  ["landscape-1024x768", 1024, 768],
  ["wide-1920x1080", 1920, 1080],
];
const report = [];

for (const [name, width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  await page.goto("http://127.0.0.1:4328/", { waitUntil: "load", timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: join(output, `${name}-top.png`) });

  const metrics = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    scrollHeight: document.documentElement.scrollHeight,
    htmlWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    heroHeight: document.querySelector("[data-hero]")?.getBoundingClientRect().height,
    menuDisplay: document.querySelector("[data-menu-toggle]") ? getComputedStyle(document.querySelector("[data-menu-toggle]")).display : null,
    desktopNavDisplay: document.querySelector(".desktop-nav") ? getComputedStyle(document.querySelector(".desktop-nav")).display : null,
    horizontalOffenders: [...document.querySelectorAll("body *")].map((element) => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, className: element.className, left: rect.left, right: rect.right, width: rect.width };
    }).filter((item) => item.left < -1 || item.right > innerWidth + 1).slice(0, 12),
  }));

  if (width >= 1024) {
    for (const [x, y] of [[160, 250], [270, 310], [390, 360], [520, 320], [650, 390], [780, 330]]) await page.mouse.move(x, y, { steps: 4 });
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(output, `${name}-trail.png`) });
  }

  let menu = null;
  if (width <= 1023) {
    await page.locator("[data-menu-toggle]").click();
    await page.waitForTimeout(700);
    menu = await page.evaluate(() => ({
      expanded: document.querySelector("[data-menu-toggle]")?.getAttribute("aria-expanded"),
      hidden: document.querySelector("[data-mobile-menu]")?.getAttribute("aria-hidden"),
      bodyLocked: document.body.classList.contains("menu-open"),
    }));
    await page.screenshot({ path: join(output, `${name}-menu.png`) });
    await page.keyboard.press("Escape");
    menu.closedByEscape = await page.locator("[data-menu-toggle]").getAttribute("aria-expanded");
  }

  report.push({ name, metrics, menu, errors });
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto("http://127.0.0.1:4328/", { waitUntil: "load", timeout: 15000 });
await page.waitForTimeout(1000);
const sectionChecks = [];
for (const [name, selector] of [["story", "[data-about-heading-section]"], ["operations", "[data-operations]"], ["clients", "[data-client-section]"], ["capabilities", "[data-capabilities]"], ["services", "[data-services-stack]"], ["closing", "[data-closing]"]]) {
  await page.locator(selector).evaluate((element) => window.scrollTo(0, element.offsetTop + element.offsetHeight * 0.42 - innerHeight * 0.5));
  await page.waitForTimeout(850);
  await page.screenshot({ path: join(output, `desktop-${name}.png`) });
  sectionChecks.push(await page.locator(selector).evaluate((element) => ({
    name: element.getAttribute("data-about-heading-section") !== null ? "story" : element.className,
    rect: element.getBoundingClientRect().toJSON(),
    scrollY,
    sectionBackground: getComputedStyle(element).backgroundColor,
    sticky: element.querySelector(":scope > div") ? { className: element.querySelector(":scope > div").className, rect: element.querySelector(":scope > div").getBoundingClientRect().toJSON(), background: getComputedStyle(element.querySelector(":scope > div")).backgroundColor } : null,
    points: [100, 450, 800].map((y) => { const item = document.elementFromPoint(innerWidth / 2, y); return { y, className: item?.className ?? "", tag: item?.tagName ?? "", background: item ? getComputedStyle(item).backgroundColor : "" }; }),
  })));
}

const progressStates = [];
for (const [name, selector] of [["operations", "[data-operations]"], ["capabilities", "[data-capabilities]"], ["services", "[data-services-stack]"]]) {
  const section = page.locator(selector);
  for (const progress of [.15, .5, .85]) {
    await section.evaluate((element, value) => window.scrollTo(0, element.offsetTop + (element.offsetHeight - innerHeight) * value), progress);
    await page.waitForTimeout(350);
    await page.screenshot({ path: join(output, `desktop-${name}-${String(progress).replace(".", "")}.png`) });
    progressStates.push(await section.evaluate((element, state) => ({
      name: state.name, progress: state.progress, scrollY,
      items: [...element.querySelectorAll("[data-operation-word], [data-capability-word], [data-service-card]")].map((item) => ({ text: item.textContent.trim().slice(0, 24), transform: getComputedStyle(item).transform, opacity: getComputedStyle(item).opacity, visibility: getComputedStyle(item).visibility })),
    }), { name, progress }));
  }
}

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto("http://127.0.0.1:4328/", { waitUntil: "load", timeout: 15000 });
const reduced = await reducedPage.evaluate(() => ({
  servicesPosition: getComputedStyle(document.querySelector(".services-stack__sticky")).position,
  operationsPosition: getComputedStyle(document.querySelector(".operations__sticky")).position,
  capabilityPosition: getComputedStyle(document.querySelector(".capabilities__sticky")).position,
}));

const results = { report, sectionChecks, progressStates, reduced };
await writeFile(join(output, "qa-report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ viewports: report.map(({ name, metrics, menu, errors }) => ({ name, widths: [metrics.htmlWidth, metrics.bodyWidth], scrollHeight: metrics.scrollHeight, offenders: metrics.horizontalOffenders.length, menu, errors })), reduced }, null, 2));
await reducedContext.close();
await context.close();
await browser.close();
await new Promise((resolve) => server.close(resolve));
