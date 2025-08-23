import {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  screen,
  Menu,
} from "electron";
import * as path from 'path';
import { isDev } from "../utils/is-dev.js";

let mainWindow: BrowserWindow | null = null;
let miniWindow: BrowserWindow | null = null;

function createMainWindow(): void {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    show: false,
    resizable: true,
    frame: false,
    titleBarStyle: 'hidden',
    skipTaskbar: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist-electron/main/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    roundedCorners: true,
    hasShadow: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    fullscreenable: false,
  });
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5000");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.center();
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (isDev()) {
    mainWindow.webContents.openDevTools();
  }
  Menu.setApplicationMenu(null);
}

function setOverlayMode(): void {
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
  const w = 500;
  const h = 300;

  if (!mainWindow) return;

  mainWindow.setSize(w, h);
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setFullScreenable(false);
  mainWindow.setResizable(true);
  mainWindow.setPosition(sw - w - 20, 20);
  mainWindow.webContents.send("lumacue:mode", "overlay");
}

function createMiniWindow(): void {
  if (miniWindow) return;

  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
  const size = 32;

  miniWindow = new BrowserWindow({
    width: size,
    height: size,
    x: sw - size - 16,
    y: 16,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist-electron/main/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    roundedCorners: true,
    hasShadow: true,
  });

  miniWindow.loadFile(path.join(app.getAppPath(), "static/mini.html"));

  miniWindow.on("closed", () => {
    miniWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  const registered = globalShortcut.register("CommandOrControl+T", () => {
    if (!mainWindow) return;

    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  if (!registered) {
    console.warn("Global shortcut registration failed");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle("lumacue:enter-overlay", () => {
  setOverlayMode();
  return true;
});

ipcMain.on("lumacue:minimize", () => {
  if (mainWindow) {
    mainWindow.hide();
    createMiniWindow();
  }
});

ipcMain.on("lumacue:restore", () => {
  if (miniWindow) {
    miniWindow.close();
    miniWindow = null;
  }
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    setOverlayMode();
  }
});

ipcMain.handle("lumacue:get-position", () => {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  return { sw, sh };
});

// Handle app termination
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
