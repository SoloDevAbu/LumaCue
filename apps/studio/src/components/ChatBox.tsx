import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { SendHorizonal } from "lucide-react";

export default function ChatBox() {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const currentMessageRef = useRef<string>("");

  useEffect(() => {
    setMessages([{ role: "ai", text: "Hi, Welcome to LumaCue" }]);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function sendMessage(userMessage: string) {
    const messages = [
      {
        role: "system",
        content:
          "You are LumaCue AI Assistant. You will be giving a brief explanation about what the user asks in less than 50 words.",
      },
      { role: "user", content: userMessage },
    ];

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    setInput("");
    let aiText = "";

    try {
    const stream = await window.lumacueChatWindow?.chat(messages);
    if (stream) {
      for await (const chunk of stream) {
        console.log('Real-time chunk received:', chunk);
        aiText = chunk;
        currentMessageRef.current = currentMessageRef.current + chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: currentMessageRef.current };
          return updated;
        });
      }
    }
    console.log('ChatBox: Stream completed');
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: "Sorry, there was an error processing your request.",
        };
        return updated;
      });
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
        {messages.map((m, i) => (
          <Message key={i} role={m.role} text={m.text} />
        ))}
      </div>

      <div className="p-3 border-t border-white/6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-white/6 rounded-lg px-3 py-2 text-sm outline-none placeholder-white/50"
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          className="bg-white/6 hover:bg-white/20 px-4 py-2 rounded-lg text-sm"
        >
          <SendHorizonal height={16} width={16} />
        </button>
      </div>
    </div>
  );
}
