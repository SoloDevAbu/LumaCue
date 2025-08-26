import { ipcMain } from "electron";
import LlmManager from './llm.js';

ipcMain.on("lumacue:llm:chat-stream", async (event, { messages, channel }) => {
  console.log('Main: Starting chat stream for channel:', channel);

  try {
    // Convert to proper AI SDK format
    const aiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    console.log('Main: Starting LLM stream');
    let chunkCount = 0;

    for await (const chunk of LlmManager.streamText(aiMessages)) {
      chunkCount++;
      console.log(`Main: Sending chunk ${chunkCount}:`, typeof chunk, chunk?.substring(0, 30));
      
      // Ensure we're only sending primitive strings
      const chunkString = typeof chunk === 'string' ? chunk : String(chunk);
      
      // Send chunk with error handling
      try {
        event.reply(`${channel}:data`, chunkString);
      } catch (replyError) {
        console.error('Main: Error sending chunk:', replyError);
        event.reply(`${channel}:error`, 'Error sending data chunk');
        return;
      }
    }

    console.log(`Main: Stream complete. Sent ${chunkCount} chunks`);
    
    // Signal end of stream
    try {
      event.reply(`${channel}:end`);
    } catch (replyError) {
      console.error('Main: Error sending end signal:', replyError);
    }

  } catch (error) {
    console.error('Main: Stream error:', error);
    
    // Ensure error message is a primitive string
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    try {
      event.reply(`${channel}:error`, errorMessage);
    } catch (replyError) {
      console.error('Main: Error sending error message:', replyError);
    }
  }
});

ipcMain.on("lumacue:llm:abort", () => {
  console.log('Main: Abort requested');
  LlmManager.abortStream();
});