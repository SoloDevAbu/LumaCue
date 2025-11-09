import { tool } from "ai";
import { z } from "zod";

const DEFAULT_MAX_LENGTH = 4000;

export function createClipboardTool(getClipboardText, options = {}) {
  if (typeof getClipboardText !== "function") {
    throw new TypeError("createClipboardTool requires a getClipboardText function");
  }

  const { maxLength = DEFAULT_MAX_LENGTH } = options;

  return tool({
    name: "read_clipboard_text",
    description:
      "Retrieve the user's current clipboard text. Use this when the user mentions clipboard or copied content (e.g., summarize clipboard).",
    parameters: z.object({
      purpose: z
        .string()
        .describe("Brief explanation of why the clipboard text is needed")
        .optional(),
    }),
    execute: async ({ purpose }) => {
      const raw = await getClipboardText();
      const value = typeof raw === "string" ? raw : String(raw ?? "");
      const trimmed = value.trim();

      if (!trimmed) {
        console.log("Clipboard tool invoked: empty clipboard", { purpose });
        return {
          clipboardText: "",
          truncated: false,
          note: "Clipboard is empty or unavailable. Ask the user to copy the content again.",
          purpose: purpose ?? null,
        };
      }

      const limited = trimmed.slice(0, maxLength);
      const truncated = limited.length < trimmed.length;

      console.log("Clipboard tool invoked: returning text", {
        purpose,
        truncated,
        length: limited.length,
      });

      return {
        clipboardText: limited,
        truncated,
        maxLength,
        purpose: purpose ?? null,
        note: truncated
          ? "Clipboard content was truncated to protect performance."
          : undefined,
      };
    },
  });
}
