import {
  app,
  BrowserWindow,
  Menu,
  screen,
} from "electron";
import path from "path";
import { IPC_CHANNELS, WINDOW_MODES } from "@lumacue/ipc";
import { isDev } from "../../utils/is-dev.js";

let mainWindow: BrowserWindow | null = null;
let currentMode: keyof typeof WINDOW_MODES = "DEFAULT";

function getPreloadPath() {
  return path.join(app.getAppPath(), "dist-electron/main/preload.mjs");
}

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }

  const window = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    window.loadURL("http://localhost:5000");
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    window.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }

  window.once("ready-to-show", () => {
    window.center();
    window.show();
  });

  window.on("closed", () => {
    mainWindow = null;
    currentMode = "DEFAULT";
  });

  Menu.setApplicationMenu(null);

  mainWindow = window;
  return window;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
}

export function enterCompactMode(): void {
  const window = getMainWindow();
  if (!window) return;

  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  const width = 300;
  const height = 60;

  window.setSize(width, height);
  window.setAlwaysOnTop(true, "screen-saver");
  window.setVisibleOnAllWorkspaces(true);
  window.setResizable(false);
  window.setFullScreenable(false);
  window.setPosition(Math.floor(screenWidth / 2 - width / 2), 20);
  window.webContents.send(IPC_CHANNELS.PUSH.MODE_CHANGED, WINDOW_MODES.COMPACT);
  currentMode = "COMPACT";
}

export function getCurrentMode(): keyof typeof WINDOW_MODES {
  return currentMode;
}
