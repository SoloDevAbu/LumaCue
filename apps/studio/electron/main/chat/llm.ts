import { clipboard } from "electron";
import { streamText, type ModelMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createClipboardTool, LUMACUE_SYSTEM_PROMPT } from "@lumacue/ai";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
const DEFAULT_MODEL = "gemini-2.0-flash";
const clipboardTool = createClipboardTool(async () => clipboard.readText());

interface PreparedMessages {
  messages: ModelMessage[];
  errorMessage?: string;
}

class LlmManager {
  private static instance: LlmManager;
  private abortController: AbortController | null = null;

  public static getInstance(): LlmManager {
    if (!LlmManager.instance) {
      LlmManager.instance = new LlmManager();
    }
    return LlmManager.instance;
  }

  private async prepareMessages(messages: ModelMessage[]): Promise<PreparedMessages> {
    const withSystemPrompt = messages.some((msg) => msg.role === "system")
      ? messages
      : [{ role: "system" as const, content: LUMACUE_SYSTEM_PROMPT }, ...messages];

    const latestUserMessage = [...withSystemPrompt]
      .reverse()
      .find((msg) => msg.role === "user");

    if (!latestUserMessage) {
      return {
        messages: withSystemPrompt,
        errorMessage: "No user message provided.",
      };
    }

    return {
      messages: withSystemPrompt,
    };
  }

  public async *streamText(messages: ModelMessage[]) {
    this.abortController = new AbortController();

    try {
      const { messages: preparedMessages, errorMessage } = await this.prepareMessages(messages);

      if (errorMessage) {
        yield errorMessage;
        return;
      }

      const { fullStream } = await streamText({
        model: google(DEFAULT_MODEL),
        messages: preparedMessages,
        abortSignal: this.abortController.signal,
        maxOutputTokens: 300,
        temperature: 0.2,
        topP: 0.4,
        tools: { clipboardTool },
        stopWhen: [],
      });

      for await (const part of fullStream) {
        if (this.abortController?.signal.aborted) {
          break;
        }
        if (part.type === "text-delta" && part.text) {
          yield part.text;
        }
      }
    } catch (error) {
      if ((error as any).name === "AbortError") {
        console.log("LLM: Stream was aborted");
        return;
      }
      console.error("LLM: Error:", error);
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  public abortStream(): boolean {
    if (this.abortController) {
      console.log("LLM: Aborting current stream");
      this.abortController.abort();
      return true;
    }
    console.log("LLM: No active stream to abort");
    return false;
  }
}

export default LlmManager.getInstance();
