import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Kick off video preloading at the earliest possible moment — before React even renders.
// This gives the browser maximum head-start on buffering the first visible videos.
import("@/lib/video-preloader").then(({ preloadVideos }) => preloadVideos()).catch(() => {});

// Global error handler for uncaught errors (useful for native APK debugging)
window.addEventListener("error", (e) => {
  console.error("[GlobalError]", e.message, e.filename, e.lineno, e.colno);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[UnhandledRejection]", e.reason);
});

// Hide the inline splash as soon as React mounts
const initSplash = document.getElementById("init-splash");
if (initSplash) initSplash.style.display = "none";

createRoot(document.getElementById("root")!).render(<App />);
