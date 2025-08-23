import { contextBridge, ipcRenderer } from "electron";

// Lumacue API
contextBridge.exposeInMainWorld('lumacue', {
    enterOverlay: () => ipcRenderer.invoke('lumacue:enter-overlay'),
    minimize: () => ipcRenderer.send('lumacue:minimize'),
    restore: () => ipcRenderer.send('lumacue:restore'),
    getPosition: () => ipcRenderer.invoke('lumacue:get-position'),
    onModeChange: (callback: (mode: string) => void) => {
        ipcRenderer.on('lumacue:mode', (_event, mode) => callback(mode));
    },
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// AI API
contextBridge.exposeInMainWorld('ai', {
    // Initialize AI service
    initialize: (config: { apiKey: string }) => 
        ipcRenderer.invoke('ai:initialize', config),
    
    // Check initialization status
    isInitialized: () => 
        ipcRenderer.invoke('ai:is-initialized'),
    
    // Send chat message
    chat: (messages: any[], options?: any) => 
        ipcRenderer.invoke('ai:chat', messages, options),
    
    // Start streaming chat
    startStreamChat: (messages: any[], options?: any) => 
        ipcRenderer.invoke('ai:stream-chat-start', messages, options),
    
    // Listen to stream events
    onStreamChunk: (callback: (data: { streamId: string; chunk: any }) => void) => {
        ipcRenderer.on('ai:stream-chunk', (_event, data) => callback(data));
    },
    
    onStreamEnd: (callback: (data: { streamId: string }) => void) => {
        ipcRenderer.on('ai:stream-end', (_event, data) => callback(data));
    },
    
    onStreamError: (callback: (data: { streamId: string; error: string }) => void) => {
        ipcRenderer.on('ai:stream-error', (_event, data) => callback(data));
    },
    
    // Get available tools
    getTools: () => 
        ipcRenderer.invoke('ai:get-tools'),
    
    // Get tool categories
    getToolCategories: () => 
        ipcRenderer.invoke('ai:get-tool-categories'),
    
    // Get AI configuration
    getConfig: () => 
        ipcRenderer.invoke('ai:get-config'),
    
    // Remove listeners
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    }
});