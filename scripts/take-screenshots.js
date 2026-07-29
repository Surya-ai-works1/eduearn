const { chromium } = require("playwright");
const path = require("path");

const urls = [
  { name: "tutor_assignments_page.png", url: "http://localhost:3000/tutor/assignments" },
  { name: "tutor_calendar_page.png", url: "http://localhost:3000/tutor/calendar" },
  { name: "tutor_resources_page.png", url: "http://localhost:3000/tutor/resources" },
  { name: "tutor_ai_studio_page.png", url: "http://localhost:3000/tutor/ai-studio" }
];

async function capture() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  // Create a new context and set DEV_MODE on window or set localstorage if needed
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // Set the DEV_MODE localstorage / cookies if needed
  await page.addInitScript(() => {
    window.process = { env: { NEXT_PUBLIC_DEV_MODE: "true" } };
  });

  const destDir = "C:\\Users\\Sahiti\\.gemini\\antigravity\/\/brain\\6ddfddc1-e4da-4a1c-b20f-e147f3aa4770";

  for (const item of urls) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: "networkidle", timeout: 25000 });
      // Wait extra 2 seconds for animations to settle
      await page.waitForTimeout(3000);
      const destPath = path.join(destDir, item.name);
      console.log(`Saving screenshot to ${destPath}...`);
      await page.screenshot({ path: destPath, fullPage: false });
    } catch (e) {
      console.error(`Failed to capture ${item.url}:`, e);
    }
  }

  await browser.close();
  console.log("Done capturing all screenshots.");
}

capture();
