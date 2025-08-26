// import { streamText, type ModelMessage } from "ai"
// import { createGoogleGenerativeAI } from "@ai-sdk/google"  // provider
// const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
// const DEFAULT_MODEL = "gemini-2.0-flash"  // confirm it exists in your SDK version

// class LlmManager {
//   private static instance: LlmManager;
//   private abortController: AbortController | null = null;

//   public static getInstance(): LlmManager {
//     if (!LlmManager.instance) {
//       LlmManager.instance = new LlmManager();
//     }
//     return LlmManager.instance;
//   }

//   public async text(
//     messages: ModelMessage[],
//     requestType: any,
//     options?: {
//       abortController?: AbortController;
//     }
//   ) {
//     const ac = options?.abortController ?? new AbortController();

//     try {
//       const { fullStream, text, response } = await streamText({
//         model: google(DEFAULT_MODEL),
//         messages,
//         abortSignal: this.abortController?.signal,
//         maxOutputTokens: 300,
//         temperature: 0.2,
//         topP: 0.4,
//       });

//       const streamParts: string[] = [];

//       for await (const part of fullStream) {
//         if (part.type === "text-delta") {
//           streamParts.push(part.text);
//         }
//       }

//       return { text: streamParts.join("")};
//     } catch (error) {
//       if ((error as any).name === "AbortError") {
//         console.log("Request was aborted");
//       } else {
//         console.error("Error during text generation:", error);
//         throw error;
//       }
//     } finally {
//       this.abortController = null;
//     }
//   }
//   public abortStream(): boolean {
//         if (this.abortController) {
//             this.abortController.abort();
//             return true;
//         }
//         return false;
//     }
// }

// export default LlmManager.getInstance();

import { streamText, type ModelMessage } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
const DEFAULT_MODEL = "gemini-2.0-flash"

class LlmManager {
  private static instance: LlmManager;
  private abortController: AbortController | null = null;

  public static getInstance(): LlmManager {
    if (!LlmManager.instance) {
      LlmManager.instance = new LlmManager();
    }
    return LlmManager.instance;
  }

  public async *streamText(messages: ModelMessage[]) {
    this.abortController = new AbortController();

    try {
      console.log('LLM: Creating stream for', messages.length, 'messages');
      
      const { fullStream } = await streamText({
        model: google(DEFAULT_MODEL),
        messages,
        abortSignal: this.abortController.signal,
        maxOutputTokens: 300,
        temperature: 0.2,
        topP: 0.4,
      });

      console.log('LLM: Processing stream...');
      
      for await (const part of fullStream) {
        if (this.abortController?.signal.aborted) {
          console.log('LLM: Stream aborted');
          break;
        }
        
        if (part.type === "text-delta" && part.text) {
          console.log('LLM: Yielding chunk:', part.text.substring(0, 20) + '...');
          yield part.text;
        }
      }
      
      console.log('LLM: Stream completed successfully');
      
    } catch (error) {
      console.error('LLM: Error:', error);
      if ((error as any).name === "AbortError") {
        console.log('LLM: Stream was aborted');
      } else {
        throw error;
      }
    } finally {
      this.abortController = null;
    }
  }

  public abortStream(): boolean {
    if (this.abortController) {
      console.log('LLM: Aborting current stream');
      this.abortController.abort();
      return true;
    }
    console.log('LLM: No active stream to abort');
    return false;
  }
}

export default LlmManager.getInstance();
