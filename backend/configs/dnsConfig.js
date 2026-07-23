import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("Custom DNS configured");
} catch (e) {
  console.warn("Failed to configure custom DNS:", e);
}
