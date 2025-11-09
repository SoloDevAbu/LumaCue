import { ipcMain } from "electron";
import { IPC_CHANNELS } from "@lumacue/ipc";
import {
  enterCompactMode,
} from "../windows/main-window.js";
import {
  closeChatWindow,
  repositionChatBelowHeader,
  setChatHeight,
  toggleChatWindow,
} from "../windows/chat-window.js";
import { consumeFirstLaunch } from "../state/app-state.js";

export function registerUiHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.INVOKE.FIRST_LAUNCH, () => consumeFirstLaunch());

  ipcMain.on(IPC_CHANNELS.SEND.ENTER_COMPACT, enterCompactMode);

  ipcMain.on(IPC_CHANNELS.SEND.OPEN_CHAT, () => {
    toggleChatWindow();
  });

  ipcMain.on(IPC_CHANNELS.SEND.CLOSE_CHAT, () => {
    closeChatWindow();
  });

  ipcMain.on(IPC_CHANNELS.SEND.CHAT_SET_HEIGHT, (_event, desiredHeight: number) => {
    setChatHeight(Number.isFinite(desiredHeight) ? desiredHeight : 0);
  });

  ipcMain.on(IPC_CHANNELS.SEND.REPOSITION_CHAT_BELOW_HEADER, () => {
    repositionChatBelowHeader();
  });
}
