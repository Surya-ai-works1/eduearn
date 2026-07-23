/* eslint-disable */
const http = require("http");
const { exec } = require("child_process");

const urls = [
  "http://localhost:3000/dev",
  "http://localhost:3000/dev/student",
  "http://localhost:3000/dev/tutor",
  "http://localhost:3000/dev/admin"
];

function checkServerReady(callback) {
  const req = http.get("http://localhost:3000", (res) => {
    res.resume(); // consume response data to free up memory
    callback(null, true);
  });

  req.on("error", () => {
    // Server not ready, retry after 1 second
    setTimeout(() => checkServerReady(callback), 1000);
  });
}

console.log("Waiting for Next.js development server to start on http://localhost:3000...");

checkServerReady((err, ready) => {
  if (ready) {
    console.log("Next.js dev server is ready! Launching preview tabs...");
    urls.forEach((url) => {
      let command;
      if (process.platform === "win32") {
        command = `start "" "${url}"`;
      } else if (process.platform === "darwin") {
        command = `open "${url}"`;
      } else {
        command = `xdg-open "${url}"`;
      }
      exec(command, (execErr) => {
        if (execErr) {
          console.error(`Failed to open URL: ${url}`, execErr);
        }
      });
    });
  }
});
