import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@lumacue/ipc";

contextBridge.exposeInMainWorld("lumacue", {
  isFirstLaunch: async (): Promise<boolean> => {
    return await ipcRenderer.invoke(IPC_CHANNELS.INVOKE.FIRST_LAUNCH);
  },
  enterCompact: () => ipcRenderer.send(IPC_CHANNELS.SEND.ENTER_COMPACT),
  openChat: () => ipcRenderer.send(IPC_CHANNELS.SEND.OPEN_CHAT),
  repositionChatBelowHeader: () =>
    ipcRenderer.send(IPC_CHANNELS.SEND.REPOSITION_CHAT_BELOW_HEADER),
});
