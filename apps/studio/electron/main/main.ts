import { app, BrowserWindow } from "electron";
import "dotenv/config";
import { registerChatHandlers } from "./chat/index.js";
import { registerUiHandlers } from "./ipc/ui-handlers.js";
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from "./system/global-shortcuts.js";
import { createMainWindow } from "./windows/main-window.js";

function bootstrap() {
  createMainWindow();
  registerUiHandlers();
  registerChatHandlers();
  registerGlobalShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

app.whenReady().then(bootstrap);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  unregisterGlobalShortcuts();
});