import { app, BrowserWindow, screen } from "electron";
import path from "path";
import { CHAT_WINDOW_DEFAULTS } from "@lumacue/ipc";
import { isDev } from "../../utils/is-dev.js";
import { getMainWindow } from "./main-window.js";

let chatWindow: BrowserWindow | null = null;

function getPreloadPath() {
  return path.join(app.getAppPath(), "dist-electron/main/chat-preload.mjs");
}

function calculateInitialPosition(width: number) {
  const mainWindow = getMainWindow();
  if (mainWindow) {
    const headerBounds = mainWindow.getBounds();
    const x = Math.floor(
      headerBounds.x + headerBounds.width / 2 - width / 2
    );
    const y = headerBounds.y + headerBounds.height + CHAT_WINDOW_DEFAULTS.GAP_FROM_HEADER;
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
    return {
      x: Math.max(8, Math.min(x, screenWidth - width - 8)),
      y,
    };
  }

  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  return {
    x: Math.floor((screenWidth - width) / 2),
    y: 120,
  };
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow && !chatWindow.isDestroyed() ? chatWindow : null;
}

function createChatWindow(): BrowserWindow {
  const width = CHAT_WINDOW_DEFAULTS.WIDTH;
  const height = CHAT_WINDOW_DEFAULTS.HEIGHT;
  const position = calculateInitialPosition(width);

  const window = new BrowserWindow({
    width,
    height,
    x: position.x,
    y: position.y,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    window.loadURL("http://localhost:5000/chat.html");
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    window.loadFile(path.join(app.getAppPath(), "dist-react/chat.html"));
  }

  window.on("closed", () => {
    chatWindow = null;
  });

  window.setAlwaysOnTop(true, "screen-saver");

  chatWindow = window;
  return window;
}

export function toggleChatWindow(): void {
  const window = getChatWindow();
  if (window) {
    window.close();
    chatWindow = null;
    return;
  }

  const created = createChatWindow();
  created.show();
  created.focus();
}

export function closeChatWindow(): void {
  const window = getChatWindow();
  if (!window) return;
  window.close();
  chatWindow = null;
}

export function setChatHeight(desiredHeight: number): void {
  const window = getChatWindow();
  if (!window) return;

  const display = screen.getPrimaryDisplay();
  const maxAllowed = Math.floor(
    display.workAreaSize.height * CHAT_WINDOW_DEFAULTS.MAX_HEIGHT_RATIO
  );
  const finalHeight = Math.max(
    CHAT_WINDOW_DEFAULTS.MIN_HEIGHT,
    Math.min(desiredHeight, maxAllowed)
  );
  const [width] = window.getSize();
  window.setSize(width, finalHeight, true);
}

export function repositionChatBelowHeader(): void {
  const window = getChatWindow();
  const mainWindow = getMainWindow();
  if (!window || !mainWindow) return;

  const headerBounds = mainWindow.getBounds();
  const [chatWidth, chatHeight] = window.getSize();
  const x = Math.floor(
    headerBounds.x + headerBounds.width / 2 - chatWidth / 2
  );
  const y = headerBounds.y + headerBounds.height + CHAT_WINDOW_DEFAULTS.GAP_FROM_HEADER;
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  const clampedX = Math.max(8, Math.min(x, screenWidth - chatWidth - 8));
  window.setPosition(clampedX, y, true);
}
