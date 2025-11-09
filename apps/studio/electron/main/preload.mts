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


// // AI API
// contextBridge.exposeInMainWorld('ai', {
//     // Initialize AI service
//     initialize: (config: { apiKey: string }) => 
//         ipcRenderer.invoke('ai:initialize', config),
    
//     // Check initialization status
//     isInitialized: () => 
//         ipcRenderer.invoke('ai:is-initialized'),
    
//     // Send chat message
//     chat: (messages: any[], options?: any) => 
//         ipcRenderer.invoke('ai:chat', messages, options),
    
//     // Start streaming chat
//     startStreamChat: (messages: any[], options?: any) => 
//         ipcRenderer.invoke('ai:stream-chat-start', messages, options),
    
//     // Listen to stream events
//     onStreamChunk: (callback: (data: { streamId: string; chunk: any }) => void) => {
//         ipcRenderer.on('ai:stream-chunk', (_event, data) => callback(data));
//     },
    
//     onStreamEnd: (callback: (data: { streamId: string }) => void) => {
//         ipcRenderer.on('ai:stream-end', (_event, data) => callback(data));
//     },
    
//     onStreamError: (callback: (data: { streamId: string; error: string }) => void) => {
//         ipcRenderer.on('ai:stream-error', (_event, data) => callback(data));
//     },
    
//     // Get available tools
//     getTools: () => 
//         ipcRenderer.invoke('ai:get-tools'),
    
//     // Get tool categories
//     getToolCategories: () => 
//         ipcRenderer.invoke('ai:get-tool-categories'),
    
//     // Get AI configuration
//     getConfig: () => 
//         ipcRenderer.invoke('ai:get-config'),
    
//     // Remove listeners
//     removeAllListeners: (channel: string) => {
//         ipcRenderer.removeAllListeners(channel);
//     }
// });