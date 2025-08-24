import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lumacueChatWindow", {
  close: () => ipcRenderer.send("lumacue:close-chat"),
  // allow the renderer to request a height change (main will clamp it)
  setHeight: (h: number) => ipcRenderer.send("lumacue:chat:set-height", Math.round(h)),
  // (optional) send messages to main or request state
  sendMessageToMain: (channel: string, payload: any) =>
    ipcRenderer.send(channel, payload),
});
