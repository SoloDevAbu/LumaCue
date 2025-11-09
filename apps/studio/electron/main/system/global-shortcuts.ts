import { globalShortcut } from "electron";
import { GLOBAL_SHORTCUTS } from "@lumacue/ipc";
import { getMainWindow } from "../windows/main-window.js";

export function registerGlobalShortcuts(): void {
  const success = globalShortcut.register(
    GLOBAL_SHORTCUTS.TOGGLE_MAIN_VISIBILITY,
    () => {
      const window = getMainWindow();
      if (!window) return;
      if (window.isVisible()) {
        window.hide();
      } else {
        window.show();
        window.focus();
      }
    }
  );

  if (!success) {
    console.warn("Global shortcut registration failed");
  }
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}
