export {};

type LumacueChatRole = "system" | "user" | "assistant";

interface LumacueChatMessage {
  role: LumacueChatRole;
  content: string;
}

interface LumacueChatWindow {
  close: () => void;
  setHeight: (height: number) => void;
  chat: (
    messages: LumacueChatMessage[]
  ) => Promise<AsyncIterable<string> | Iterable<string> | null>;
  chatStream?: (
    messages: LumacueChatMessage[],
    onChunk: (chunk: string) => void
  ) => Promise<void>;
  abort?: () => void;
}

interface LumacueAPI {
  isFirstLaunch?: () => Promise<boolean>;
  enterCompact?: () => void;
  openChat?: () => void;
  chat?: (messages: LumacueChatMessage[]) => Promise<{
    success: boolean;
    text?: string;
    error?: string;
  }>;
  repositionChatBelowHeader?: () => void;
}

declare global {
  interface Window {
    lumacue?: LumacueAPI;
    lumacueChatWindow?: LumacueChatWindow;
  }
}
