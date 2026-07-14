import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const output = join(process.cwd(), "qa", "reference-screenshots");
await mkdir(output, { recursive: true });
const viewports = [
  ["390x844", 390, 844], ["430x932", 430, 932], ["768x1024", 768, 1024],
  ["1024x768", 1024, 768], ["1440x900", 1440, 900], ["1920x1080", 1920, 1080],
];
const browser = await chromium.launch({ headless: true });
const results = [];

for (const [name, width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("https://www.ashleybrookecs.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(output, `${name}-top.png`) });
    if (width >= 1024) {
      for (const [x, y] of [[150, 250], [280, 310], [410, 360], [550, 330], [690, 390], [820, 340]]) await page.mouse.move(x, y, { steps: 4 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(output, `${name}-trail.png`) });
    }
    const metrics = await page.evaluate(() => ({ viewport: [innerWidth, innerHeight], scrollHeight: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth }));
    if (name === "1440x900") {
      for (const progress of [.3, .5, .72, .9]) {
        await page.evaluate((value) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * value), progress);
        await page.waitForTimeout(650);
        await page.screenshot({ path: join(output, `1440x900-progress-${String(progress).replace(".", "")}.png`) });
      }
    }
    results.push({ name, metrics, errors });
  } catch (error) {
    results.push({ name, failure: error instanceof Error ? error.message : String(error), errors });
  }
  await context.close();
}

await browser.close();
await writeFile(join(output, "reference-report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
