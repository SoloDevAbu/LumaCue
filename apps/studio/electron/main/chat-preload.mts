import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@lumacue/ipc";

const CHUNK_TIMEOUT_MS = 30_000;

contextBridge.exposeInMainWorld("lumacueChatWindow", {
  close: () => ipcRenderer.send(IPC_CHANNELS.SEND.CLOSE_CHAT),
  setHeight: (height: number) =>
    ipcRenderer.send(IPC_CHANNELS.SEND.CHAT_SET_HEIGHT, Math.round(height)),

  chat: async (messages: any) => {
    const channel = `chat-stream-${Date.now()}`;
    console.log("Preload: Starting chat with channel:", channel);

    const chunks: string[] = [];
    let isComplete = false;
    let error: Error | null = null;
    let resolveNext:
      | ((value: { done: boolean; value?: string }) => void)
      | null = null;

    const dataHandler = (_: any, data: string) => {
      console.log("Preload: Received data:", typeof data, data?.substring(0, 50));
      chunks.push(data);
      if (resolveNext) {
        resolveNext({ done: false, value: data });
        resolveNext = null;
      }
    };

    const endHandler = () => {
      console.log("Preload: Stream ended");
      isComplete = true;
      if (resolveNext) {
        resolveNext({ done: true });
        resolveNext = null;
      }
    };

    const errorHandler = (_: any, errorMsg: string) => {
      console.log("Preload: Received error:", errorMsg);
      error = new Error(errorMsg);
      if (resolveNext) {
        resolveNext({ done: true });
        resolveNext = null;
      }
    };

    ipcRenderer.on(IPC_CHANNELS.CHAT.streamData(channel), dataHandler);
    ipcRenderer.on(IPC_CHANNELS.CHAT.streamEnd(channel), endHandler);
    ipcRenderer.on(IPC_CHANNELS.CHAT.streamError(channel), errorHandler);

    ipcRenderer.send(IPC_CHANNELS.CHAT.STREAM_REQUEST, { messages, channel });

    function cleanup() {
      ipcRenderer.removeListener(IPC_CHANNELS.CHAT.streamData(channel), dataHandler);
      ipcRenderer.removeListener(IPC_CHANNELS.CHAT.streamEnd(channel), endHandler);
      ipcRenderer.removeListener(IPC_CHANNELS.CHAT.streamError(channel), errorHandler);
    }

    return {
      [Symbol.asyncIterator]() {
        let chunkIndex = 0;

        return {
          async next(): Promise<{ done: boolean; value?: string }> {
            if (error) {
              cleanup();
              throw error;
            }

            if (chunkIndex < chunks.length) {
              return { done: false, value: chunks[chunkIndex++] };
            }

            if (isComplete) {
              cleanup();
              return { done: true };
            }

            return new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error("Timeout waiting for chunk"));
              }, CHUNK_TIMEOUT_MS);

              resolveNext = (result) => {
                clearTimeout(timeoutId);
                if (result.done) {
                  cleanup();
                }
                resolve(result);
              };

              if (chunkIndex < chunks.length) {
                clearTimeout(timeoutId);
                resolveNext({ done: false, value: chunks[chunkIndex++] });
              } else if (isComplete) {
                clearTimeout(timeoutId);
                resolveNext({ done: true });
              } else if (error) {
                clearTimeout(timeoutId);
                cleanup();
                reject(error);
              }
            });
          },
        };
      },
    };
  },

  abort: () => ipcRenderer.send(IPC_CHANNELS.CHAT.STREAM_ABORT),
});