import { ipcMain } from "electron";
import LlmManager from './llm.js';

ipcMain.handle("lumacue:llm:chat", async (_event, messages) => {
  try {
    const result = await LlmManager.text(messages, "chat");
    return { success: true, text: result?.text };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});