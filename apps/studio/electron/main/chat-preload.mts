import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lumacueChatWindow", {
  close: () => ipcRenderer.send("lumacue:close-chat"),
  // allow the renderer to request a height change (main will clamp it)
  setHeight: (h: number) => ipcRenderer.send("lumacue:chat:set-height", Math.round(h)),
  chat: (messages: any) => ipcRenderer.invoke("lumacue:llm:chat", messages),
  abort: () => ipcRenderer.send("lumacue:llm:abort")
});
