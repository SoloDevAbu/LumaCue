import { streamText, type ModelMessage } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"  // provider
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
const DEFAULT_MODEL = "gemini-2.0-flash"  // confirm it exists in your SDK version

class LlmManager {
  private static instance: LlmManager;
  private abortController: AbortController | null = null;

  public static getInstance(): LlmManager {
    if (!LlmManager.instance) {
      LlmManager.instance = new LlmManager();
    }
    return LlmManager.instance;
  }

  public async text(
    messages: ModelMessage[],
    requestType: any,
    options?: {
      abortController?: AbortController;
    }
  ) {
    const ac = options?.abortController ?? new AbortController();

    try {
      const { fullStream, text, response } = await streamText({
        model: google(DEFAULT_MODEL),
        messages,
        abortSignal: this.abortController?.signal,
        maxOutputTokens: 300,
        temperature: 0.2,
        topP: 0.4,
      });

      const streamParts: string[] = [];

      for await (const part of fullStream) {
        if (part.type === "text-delta") {
          streamParts.push(part.text);
        }
      }

      return { text: streamParts.join("")};
    } catch (error) {
      if ((error as any).name === "AbortError") {
        console.log("Request was aborted");
      } else {
        console.error("Error during text generation:", error);
        throw error;
      }
    } finally {
      this.abortController = null;
    }
  }
  public abortStream(): boolean {
        if (this.abortController) {
            this.abortController.abort();
            return true;
        }
        return false;
    }
}

export default LlmManager.getInstance();