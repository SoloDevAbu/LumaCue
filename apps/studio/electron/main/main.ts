import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  globalShortcut,
  Menu,
} from "electron";
import * as path from "path";
import { isDev } from "../utils/is-dev.js";
import 'dotenv/config'
import "../main/chat/index.js";

let mainWindow: BrowserWindow | null = null;
let chatWindow: BrowserWindow | null = null;
let firstLaunch = true;

function createMainWindow(): void {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist-electron/main/preload.mjs"),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5000");
    // mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.center();
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // if (isDev()) {
  //   mainWindow.webContents.openDevTools();
  // }
  Menu.setApplicationMenu(null);
}

function setCompactMode(): void {
  if (!mainWindow) return;

  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
  const w = 300;
  const h = 60;

  mainWindow.setSize(w, h);
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setResizable(false);
  mainWindow.setFullScreenable(false);
  mainWindow.setPosition(Math.floor(sw / 2 - w / 2), 15);
  mainWindow.webContents.send("lumacue:mode", "compact");
}

function createChatWindow(): void {
  // if chat already open, focus it
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.show();
    chatWindow.focus();
    return;
  }

  // default chat size (will be adjustable by renderer via set-height)
  const defaultW = 600;
  const defaultH = 300;
  const gap = 8;

  // compute position under header if header exists, else center
  let x = undefined as number | undefined;
  let y = undefined as number | undefined;
  if (mainWindow && !mainWindow.isDestroyed()) {
    const headerBounds = mainWindow.getBounds();
    // center chat horizontally relative to header
    x = Math.floor(headerBounds.x + headerBounds.width / 2 - defaultW / 2);
    y = headerBounds.y + headerBounds.height + gap;
    // clamp to screen bounds
    const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
    x = Math.max(8, Math.min(x, sw - defaultW - 8));
  } else {
    // fallback center top-ish
    const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
    x = Math.floor((sw - defaultW) / 2);
    y = 120;
  }

  chatWindow = new BrowserWindow({
    width: defaultW,
    height: defaultH,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist-electron/main/chat-preload.mjs"),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    chatWindow.loadURL("http://localhost:5000/chat.html");
    // do not open devtools by default for chatWindow
    chatWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    chatWindow.loadFile(path.join(app.getAppPath(), "dist-react/chat.html"));
  }

  // Ensure the chat is independently closable
  chatWindow.on("closed", () => {
    chatWindow = null;
  });

  // Keep it above other windows
  chatWindow.setAlwaysOnTop(true, "screen-saver");
}

function clampAndSetChatHeight(desiredHeight: number) {
  if (!chatWindow) return;
  const display = screen.getPrimaryDisplay();
  const maxAllowed = Math.floor(display.workAreaSize.height * 0.8);
  const minAllowed = 120;
  const final = Math.max(minAllowed, Math.min(desiredHeight, maxAllowed));
  const [w] = chatWindow.getSize();
  chatWindow.setSize(w, final, true);
}

// IPC listener for Run button
ipcMain.on("lumacue:open-chat", () => {
  if (chatWindow) {
    chatWindow.close();
    chatWindow = null;
  } else {
    createChatWindow();
  }
});


app.whenReady().then(() => {
  createMainWindow();

  const registered = globalShortcut.register("CommandOrControl+T", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  if (!registered) console.warn("Global shortcut registration failed");

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  globalShortcut.unregisterAll();
});

// IPC Handlers
ipcMain.handle("lumacue:first-launch", () => {
  const wasFirst = firstLaunch;
  if (firstLaunch) {
    firstLaunch = false;
  }
  return wasFirst;
});

ipcMain.on("lumacue:enter-compact", () => {
  setCompactMode();
});

// CLOSE chat window (called from chat renderer)
ipcMain.on("lumacue:close-chat", () => {
  if (chatWindow) {
    chatWindow.close();
    chatWindow = null;
  }
});

// CHAT requests to set content height
ipcMain.on("lumacue:chat:set-height", (_evt, desired: number) => {
  clampAndSetChatHeight(Number(desired) || 0);
});

// Optional: if header moves in future, you can reposition chat to stay attached
ipcMain.on("lumacue:reposition-chat-below-header", () => {
  if (!chatWindow || !mainWindow) return;
  const gap = 8;
  const headerBounds = mainWindow.getBounds();
  const [cw, ch] = chatWindow.getSize();
  let x = Math.floor(headerBounds.x + headerBounds.width / 2 - cw / 2);
  let y = headerBounds.y + headerBounds.height + gap;
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
  x = Math.max(8, Math.min(x, sw - cw - 8));
  chatWindow.setPosition(x, y, true);
});