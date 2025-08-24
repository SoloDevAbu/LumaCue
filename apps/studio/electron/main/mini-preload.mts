import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("mini", {
  restore: () => ipcRenderer.send("lumacue:restore"),
});
