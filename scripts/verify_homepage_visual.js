/* eslint-disable */
const { chromium } = require("playwright");
const path = require("path");

async function capture() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1200 }
  });
  const page = await context.newPage();

  const url = "http://localhost:3002/";
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
    
    // Scroll down slowly to trigger RevealOnScroll animations
    console.log("Scrolling page to trigger animations...");
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const steps = 10;
    const delay = 300;
    for (let i = 1; i <= steps; i++) {
      await page.evaluate((top) => window.scrollTo(0, top), (scrollHeight / steps) * i);
      await page.waitForTimeout(delay);
    }
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    const destPath = "C:\\Users\\Sahiti\\.gemini\\antigravity\\brain\\6ddfddc1-e4da-4a1c-b20f-e147f3aa4770\\homepage_visual.png";
    console.log(`Saving screenshot to ${destPath}...`);
    await page.screenshot({ path: destPath, fullPage: true });
    console.log("Screenshot saved successfully!");
  } catch (e) {
    console.error("Failed to capture homepage:", e);
  } finally {
    await browser.close();
  }
}

capture();
