import type { Tool } from "ai";

export interface ClipboardToolOptions {
  maxLength?: number;
}

export interface ClipboardToolResult {
  clipboardText: string;
  truncated: boolean;
  maxLength?: number;
  purpose: string | null;
  note?: string;
}

export declare function createClipboardTool(
  getClipboardText: () => string | Promise<string>,
  options?: ClipboardToolOptions
): unknown;
