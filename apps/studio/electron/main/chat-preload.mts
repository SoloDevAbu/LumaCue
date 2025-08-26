import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lumacueChatWindow", {
  close: () => ipcRenderer.send("lumacue:close-chat"),
  setHeight: (h: number) =>
    ipcRenderer.send("lumacue:chat:set-height", Math.round(h)),

  chat: async (messages: any) => {
    const channel = `chat-stream-${Date.now()}`;
    console.log('Preload: Starting chat with channel:', channel);

    // Set up event listeners BEFORE sending the request
    const chunks: string[] = [];
    let isComplete = false;
    let error: Error | null = null;
    let resolveNext: ((value: { done: boolean; value?: string }) => void) | null = null;

    const dataHandler = (_: any, data: string) => {
      console.log('Preload: Received data:', typeof data, data?.substring(0, 50));
      chunks.push(data);
      if (resolveNext) {
        resolveNext({ done: false, value: data });
        resolveNext = null;
      }
    };

    const endHandler = () => {
      console.log('Preload: Stream ended');
      isComplete = true;
      if (resolveNext) {
        resolveNext({ done: true });
        resolveNext = null;
      }
    };

    const errorHandler = (_: any, errorMsg: string) => {
      console.log('Preload: Received error:', errorMsg);
      error = new Error(errorMsg);
      if (resolveNext) {
        resolveNext({ done: true });
        resolveNext = null;
      }
    };

    // Set up listeners
    ipcRenderer.on(`${channel}:data`, dataHandler);
    ipcRenderer.on(`${channel}:end`, endHandler);
    ipcRenderer.on(`${channel}:error`, errorHandler);

    // Send the request AFTER setting up listeners
    ipcRenderer.send("lumacue:llm:chat-stream", { messages, channel });

    // Return async iterable
    return {
      [Symbol.asyncIterator]: function () {
        let chunkIndex = 0;

        return {
          async next(): Promise<{ done: boolean; value?: string }> {
            // If we have an error, throw it
            if (error) {
              throw error;
            }

            // If we have unprocessed chunks, return the next one
            if (chunkIndex < chunks.length) {
              return { done: false, value: chunks[chunkIndex++] };
            }

            // If stream is complete and no more chunks, we're done
            if (isComplete) {
              // Clean up listeners
              ipcRenderer.removeListener(`${channel}:data`, dataHandler);
              ipcRenderer.removeListener(`${channel}:end`, endHandler);
              ipcRenderer.removeListener(`${channel}:error`, errorHandler);
              return { done: true };
            }

            // Wait for the next chunk
            return new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for chunk'));
              }, 30000);

              resolveNext = (result) => {
                clearTimeout(timeout);
                if (result.done) {
                  // Clean up listeners
                  ipcRenderer.removeListener(`${channel}:data`, dataHandler);
                  ipcRenderer.removeListener(`${channel}:end`, endHandler);
                  ipcRenderer.removeListener(`${channel}:error`, errorHandler);
                }
                resolve(result);
              };

              // Check again if we have chunks or completion while waiting
              if (chunkIndex < chunks.length) {
                clearTimeout(timeout);
                resolveNext({ done: false, value: chunks[chunkIndex++] });
              } else if (isComplete) {
                clearTimeout(timeout);
                resolveNext({ done: true });
              } else if (error) {
                clearTimeout(timeout);
                reject(error);
              }
            });
          }
        };
      }
    };
  },

  abort: () => ipcRenderer.send("lumacue:llm:abort"),
});