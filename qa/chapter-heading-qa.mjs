import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = resolve("dist");
const output = resolve("qa/chapter-heading");
const port = 4331;
const sizes = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
];
const mime = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2" };

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? "/", `http://127.0.0.1:${port}`).pathname;
    let path = join(root, decodeURIComponent(pathname));
    if ((await stat(path).catch(() => null))?.isDirectory()) path = join(path, "index.html");
    response.writeHead(200, { "content-type": mime[extname(path)] ?? "application/octet-stream" });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await mkdir(output, { recursive: true });
await new Promise((ready) => server.listen(port, "127.0.0.1", ready));
const browser = await chromium.launch({ headless: true });
const report = [];

try {
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: size });
    await context.addInitScript(() => sessionStorage.setItem("loaderComplete", "true"));
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
    const before = await page.locator("[data-about-heading-section]").evaluate((section) => {
      const heading = section.querySelector("[data-about-heading]");
      const style = getComputedStyle(heading);
      return { opacity: Number(style.opacity), transform: style.transform, sectionTop: section.getBoundingClientRect().top };
    });
    await page.locator("[data-about-heading-section]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1250);
    const metrics = await page.locator("[data-about-heading-section]").evaluate((section) => {
      const heading = section.querySelector("[data-about-heading]");
      const mask = section.querySelector(".about_home_text_mask");
      const style = getComputedStyle(heading);
      const sectionStyle = getComputedStyle(section);
      const rect = heading.getBoundingClientRect();
      const lines = [...heading.querySelectorAll(".about_home_line")].map((line) => ({ text: line.textContent.trim(), display: getComputedStyle(line).display, left: Math.round(line.getBoundingClientRect().left * 10) / 10, top: Math.round(line.getBoundingClientRect().top * 10) / 10, width: Math.round(line.getBoundingClientRect().width * 10) / 10 }));
      return {
        viewport: { width: innerWidth, height: innerHeight },
        documentWidth: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        section: { height: Math.round(section.getBoundingClientRect().height * 10) / 10, minHeight: sectionStyle.minHeight, paddingTop: sectionStyle.paddingTop, paddingInline: sectionStyle.paddingInline, background: sectionStyle.backgroundColor, overflow: sectionStyle.overflow },
        maskOverflow: getComputedStyle(mask).overflow,
        heading: { text: heading.textContent.replace(/\s+/g, " ").trim(), width: Math.round(rect.width * 10) / 10, left: Math.round(rect.left * 10) / 10, fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, color: style.color, textAlign: style.textAlign, opacity: Number(style.opacity), visibility: style.visibility, transform: style.transform },
        lines,
      };
    });
    await page.locator("[data-about-heading-section]").screenshot({ path: join(output, `${size.name}.png`) });
    report.push({ size: size.name, before, metrics, runtimeErrors });
    await context.close();
  }

  const reducedContext = await browser.newContext({ viewport: sizes[0], reducedMotion: "reduce" });
  await reducedContext.addInitScript(() => sessionStorage.setItem("loaderComplete", "true"));
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  const reducedMotion = await reducedPage.locator("[data-about-heading]").evaluate((heading) => { const style = getComputedStyle(heading); return { opacity: style.opacity, visibility: style.visibility, transform: style.transform }; });
  await reducedContext.close();

  const noJsContext = await browser.newContext({ viewport: sizes[0], javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
  const noJavaScript = await noJsPage.locator("[data-about-heading]").evaluate((heading) => { const style = getComputedStyle(heading); return { text: heading.textContent.replace(/\s+/g, " ").trim(), opacity: style.opacity, visibility: style.visibility, transform: style.transform }; });
  await noJsContext.close();

  const result = { generatedAt: new Date().toISOString(), report, reducedMotion, noJavaScript };
  await writeFile(join(output, "report.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  await new Promise((closed) => server.close(closed));
}
