const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let nextProcess;

const SPLASH_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0f;
    color: #e4e4ef;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    -webkit-app-region: drag;
    user-select: none;
  }
  h1 {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-bottom: 16px;
  }
  .subtitle {
    font-size: 13px;
    color: #8888a0;
    animation: pulse 1.5s ease-in-out infinite;
  }
  .dot-loader {
    display: inline-flex;
    gap: 4px;
    margin-top: 24px;
  }
  .dot-loader span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4f8fff;
    animation: bounce 1.2s ease-in-out infinite;
  }
  .dot-loader span:nth-child(2) { animation-delay: 0.2s; }
  .dot-loader span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
</style>
</head>
<body>
  <h1>AgentForge</h1>
  <p class="subtitle">Starting...</p>
  <div class="dot-loader">
    <span></span><span></span><span></span>
  </div>
</body>
</html>
`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "AgentForge",
    backgroundColor: "#0a0a0f",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Show immediately with splash screen
  mainWindow.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(SPLASH_HTML)
  );
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

function navigateToDashboard() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL("http://localhost:3000/dashboard");
  }
}

app.whenReady().then(() => {
  // Show the splash screen immediately
  createWindow();

  // Start Next.js dev server
  nextProcess = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, ".."),
    shell: true,
    stdio: "pipe",
  });

  // Wait for server to be ready, then navigate away from splash
  const waitOn = require("wait-on");
  waitOn({ resources: ["http://localhost:3000"], timeout: 30000 })
    .then(navigateToDashboard)
    .catch((err) => {
      console.error("Failed to start Next.js:", err);
      app.quit();
    });
});

app.on("window-all-closed", () => {
  if (nextProcess) nextProcess.kill();
  app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
