import { clipboard } from "electron";
import { streamText, type ModelMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createClipboardTool } from "@lumacue/ai";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
const DEFAULT_MODEL = "gemini-2.0-flash";
const CLIPBOARD_REQUEST_REGEX = /\b(summarize|summary|summarise|summarize)\b.*\b(clipboard|copied|paste[d]?)\b|\bclipboard\b/i;
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
    const latestUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");

    if (!latestUserMessage) {
      return { messages };
    }

    const latestUserText = typeof latestUserMessage.content === "string"
      ? latestUserMessage.content
      : Array.isArray(latestUserMessage.content)
        ? latestUserMessage.content
            .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
            .join(" ")
        : "";

    if (!CLIPBOARD_REQUEST_REGEX.test(latestUserText)) {
      return { messages };
    }

    const clipboardResult = await clipboardTool.execute({ purpose: "summarize clipboard" });
    const clipboardText = clipboardResult?.clipboardText?.trim();

    if (!clipboardText) {
      return {
        messages,
        errorMessage: "I couldn't find any text in your clipboard. Copy the content again and try summarizing once more.",
      };
    }

    const annotationLines = [
      "The user requested a clipboard summary.",
      clipboardResult?.note ? `Tool note: ${clipboardResult.note}` : null,
      clipboardResult?.truncated ? "Clipboard text was truncated for processing." : null,
    ].filter(Boolean);

    const augmentedMessages: ModelMessage[] = [
      ...messages,
      {
        role: "assistant",
        content: annotationLines.join(" "),
      },
      {
        role: "user",
        content: `Clipboard text to summarize:\n${clipboardText}`,
      },
    ];

    return {
      messages: augmentedMessages,
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
