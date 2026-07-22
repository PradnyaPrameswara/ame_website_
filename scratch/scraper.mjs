import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function run() {
  const outputBase = join(process.cwd(), "qa", "reference", "ashley-brooke-layout");
  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "desktop-1280", width: 1280, height: 800 },
    { name: "tablet-1024", width: 1024, height: 768 },
    { name: "tablet-768", width: 768, height: 1024 },
    { name: "mobile-430", width: 430, height: 932 },
    { name: "mobile-390", width: 390, height: 844 },
    { name: "mobile-375", width: 375, height: 667 }
  ];

  await mkdir(join(outputBase, "desktop"), { recursive: true });
  await mkdir(join(outputBase, "tablet"), { recursive: true });
  await mkdir(join(outputBase, "mobile"), { recursive: true });
  await mkdir(join(outputBase, "interactions"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let analysisData = {};

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto("https://www.ashleybrookecs.com/", { waitUntil: "networkidle", timeout: 60000 });
    
    const folder = vp.width >= 1280 ? "desktop" : vp.width >= 768 ? "tablet" : "mobile";
    
    // Initial top screenshot
    await page.screenshot({ path: join(outputBase, folder, `home-${vp.width}x${vp.height}-top.png`) });

    // Scroll a bit to see animations trigger, maybe 2000px down
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(outputBase, folder, `home-${vp.width}x${vp.height}-scrolled.png`) });
    
    // Only extract DOM structure once on the largest viewport
    if (vp.name === "desktop-1440") {
      analysisData.html = await page.evaluate(() => {
        // Simple DOM extraction
        function cleanNode(node) {
          if (node.nodeType === 3) return node.textContent.trim() ? "TEXT" : null;
          if (node.nodeType !== 1) return null;
          const tag = node.tagName.toLowerCase();
          if (['script', 'style', 'svg', 'noscript', 'link', 'meta'].includes(tag)) return null;
          
          let children = [];
          for (let child of node.childNodes) {
            const c = cleanNode(child);
            if (c) children.push(c);
          }
          
          return {
            tag,
            class: node.className || "",
            id: node.id || "",
            children: children.filter(c => c !== "TEXT").length > 0 ? children.filter(c => c !== "TEXT") : children,
          };
        }
        return cleanNode(document.body);
      });
      
      analysisData.styles = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('section, main > div, header, footer'));
        return sections.map(s => ({
          tag: s.tagName.toLowerCase(),
          class: s.className,
          rect: s.getBoundingClientRect(),
          display: window.getComputedStyle(s).display,
          padding: window.getComputedStyle(s).padding,
          margin: window.getComputedStyle(s).margin
        }));
      });
    }

    await context.close();
  }

  await writeFile(join(process.cwd(), "scratch", "reference_data.json"), JSON.stringify(analysisData, null, 2));
  await browser.close();
}

run().catch(console.error);
