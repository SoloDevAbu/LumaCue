declare module "@lumacue/ai" {
  import type {
    ClipboardToolOptions,
    ClipboardToolResult,
  } from "../../../packages/ai/tools/clipboard";

  export type { ClipboardToolOptions, ClipboardToolResult };

  export function createClipboardTool(
    getClipboardText: () => string | Promise<string>,
    options?: ClipboardToolOptions
  ): any;
}
