import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { SendHorizonal } from "lucide-react";

export default function ChatBox() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const currentMessageRef = useRef({ text: "", aiMessageIndex: -1 });
  const isProcessingRef = useRef(false);

  useEffect(() => {
    setMessages([{ role: "ai", text: "Hi, Welcome to LumaCue" }]);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

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

  async function sendMessage(userMessage: string) {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    const messages = [
      {
        role: "system",
        content: "You are LumaCue AI Assistant. You will be giving a brief explanation about what the user asks in less than 50 words.",
      },
      { role: "user", content: userMessage },
    ];

    // Add user message and empty AI message
    setMessages(prev => {
      const newMessages = [
        ...prev,
        { role: "user" as const, text: userMessage },
        { role: "ai" as const, text: "" }
      ];
      currentMessageRef.current = { text: "", aiMessageIndex: newMessages.length - 1 };
      return newMessages;
    });

    setInput("");

    try {
      const stream = await window.lumacueChatWindow?.chat(messages);
      if (!stream) {
        isProcessingRef.current = false;
        return;
      }

      for await (const chunk of stream) {
        if (typeof chunk !== 'string') continue;
        
        const prev = currentMessageRef.current.text;
        const newText = appendOnlyNewText(prev, chunk);
        currentMessageRef.current.text = newText;
        
        setMessages(prevMsgs => {
          const msgsCopy = [...prevMsgs];
          const aiIdx = currentMessageRef.current.aiMessageIndex;
          
          if (aiIdx >= 0 && aiIdx < msgsCopy.length) {
            msgsCopy[aiIdx] = {
              ...msgsCopy[aiIdx],
              text: newText
            };
          }
          
          return msgsCopy;
        });
      }
      
      console.log('ChatBox: Stream completed');
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages(prevMsgs => {
        const msgsCopy = [...prevMsgs];
        const aiIdx = currentMessageRef.current.aiMessageIndex;
        
        if (aiIdx >= 0 && aiIdx < msgsCopy.length) {
          msgsCopy[aiIdx] = {
            role: "ai",
            text: "Sorry, there was an error processing your request.",
          };
        }
        
        return msgsCopy;
      });
    } finally {
      isProcessingRef.current = false;
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
