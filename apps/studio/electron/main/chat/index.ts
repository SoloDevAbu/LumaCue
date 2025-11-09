import { ipcMain } from "electron";
import { IPC_CHANNELS } from "@lumacue/ipc";
import LlmManager from "./llm.js";

export function registerChatHandlers(): void {
  ipcMain.on(IPC_CHANNELS.CHAT.STREAM_REQUEST, async (event, { messages, channel }) => {
    console.log("Main: Starting chat stream for channel:", channel);

    try {
      const aiMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log("Main: Starting LLM stream");
      let chunkCount = 0;

      for await (const chunk of LlmManager.streamText(aiMessages)) {
        chunkCount++;
        console.log(
          `Main: Sending chunk ${chunkCount}:`,
          typeof chunk,
          chunk?.substring(0, 30)
        );

        const chunkString = typeof chunk === "string" ? chunk : String(chunk);

        try {
          event.reply(IPC_CHANNELS.CHAT.streamData(channel), chunkString);
        } catch (replyError) {
          console.error("Main: Error sending chunk:", replyError);
          event.reply(IPC_CHANNELS.CHAT.streamError(channel), "Error sending data chunk");
          return;
        }
      }

      console.log(`Main: Stream complete. Sent ${chunkCount} chunks`);

      try {
        event.reply(IPC_CHANNELS.CHAT.streamEnd(channel));
      } catch (replyError) {
        console.error("Main: Error sending end signal:", replyError);
      }
    } catch (error) {
      console.error("Main: Stream error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      try {
        event.reply(IPC_CHANNELS.CHAT.streamError(channel), errorMessage);
      } catch (replyError) {
        console.error("Main: Error sending error message:", replyError);
      }
    }
  });

  ipcMain.on(IPC_CHANNELS.CHAT.STREAM_ABORT, () => {
    console.log("Main: Abort requested");
    LlmManager.abortStream();
  });
}