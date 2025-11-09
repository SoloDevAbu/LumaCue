import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import Message from "./Message";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const SYSTEM_PROMPT = "You are LumaCue AI Assistant. You will be giving a brief explanation about what the user asks in less than 50 words.";

function appendOnlyNewText(current: string, chunk: string) {
  // Find largest overlap of current's end with chunk's start
  let maxOverlap = 0;
  const maxLen = Math.min(current.length, chunk.length);
  for (let i = 1; i <= maxLen; i++) {
    if (current.slice(-i) === chunk.slice(0, i)) {
      maxOverlap = i;
    }
  }
  return current + chunk.slice(maxOverlap);
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi, Welcome to LumaCue" },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const streamStateRef = useRef({ text: "", assistantIndex: -1 });

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function sendMessage(rawMessage: string) {
    const userMessage = rawMessage.trim();
    if (!userMessage || isProcessing) return;

    setIsProcessing(true);
    const payload = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ];

    setMessages((prev) => {
      const next = [
        ...prev,
        { role: "user" as const, text: userMessage },
        { role: "assistant" as const, text: "" },
      ];
      streamStateRef.current = { text: "", assistantIndex: next.length - 1 };
      return next;
    });
    setInput("");

    try {
      const stream = await window.lumacueChatWindow?.chat?.(payload);
      if (!stream) {
        return;
      }

      const iterator =
        typeof (stream as AsyncIterable<string>)[Symbol.asyncIterator] === "function"
          ? (stream as AsyncIterable<string>)
          : (async function* () {
              for (const chunk of stream as Iterable<string>) {
                yield chunk;
              }
            })();

      for await (const chunk of iterator) {
        if (typeof chunk !== "string") continue;

        const newText = appendOnlyNewText(streamStateRef.current.text, chunk);
        streamStateRef.current.text = newText;

        setMessages((prevMsgs) => {
          const index = streamStateRef.current.assistantIndex;
          if (index < 0 || index >= prevMsgs.length) {
            return prevMsgs;
          }
          const next = [...prevMsgs];
          next[index] = { role: "assistant", text: newText };
          return next;
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prevMsgs) => {
        const index = streamStateRef.current.assistantIndex;
        if (index < 0 || index >= prevMsgs.length) {
          return prevMsgs;
        }
        const next = [...prevMsgs];
        next[index] = {
          role: "assistant",
          text: "Sorry, there was an error processing your request.",
        };
        return next;
      });
    } finally {
      setIsProcessing(false);
      streamStateRef.current = { text: "", assistantIndex: -1 };
    }
  }

  return (
    <div style={{ width: 600 }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/6">
        <div className="text-sm opacity-85">Ask Anything to do</div>
        <button
          className="text-xs px-2 py-1 rounded-md bg-white/6 hover:bg-white/12"
          onClick={() => window.lumacueChatWindow?.close?.()}
        >
          Close
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <Message key={index} role={message.role} text={message.text} />
        ))}
      </div>

      <div className="p-3 border-t border-white/6 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-white/6 rounded-lg px-3 py-2 text-sm outline-none placeholder-white/50"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage(input);
            }
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          className="bg-white/6 hover:bg-white/20 px-4 py-2 rounded-lg text-sm disabled:opacity-40 disabled:hover:bg-white/6"
          disabled={!input.trim() || isProcessing}
        >
          <SendHorizontal height={16} width={16} />
        </button>
      </div>
    </div>
  );
}
