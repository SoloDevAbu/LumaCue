// src/chat/ChatApp.tsx
import { useEffect, useRef } from "react";
import ChatBox from "../components/ChatBox";

declare global {
  interface Window {
    lumacueChatWindow?: {
      close: () => void;
      setHeight: (h: number) => void;
      chat: (messages: { role: string; content: string }[]) => Promise<string[]>;
      chatStream: (
        messages: { role: string; content: string }[],
        onChunk: (chunk: string) => void
      ) => Promise<void>;
      abort: () => void;
    };
  }
}

export default function ChatApp() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // When mounted, ensure the window is sized to content
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      // add some padding and send to main (main will clamp height)
      const desired = Math.ceil(rect.height + 12);
      if (window.lumacueChatWindow?.setHeight) {
        window.lumacueChatWindow.setHeight(desired);
      }
    });
    ro.observe(el);
    // initial send
    const initial = Math.ceil(el.getBoundingClientRect().height + 12);
    if (window.lumacueChatWindow?.setHeight) {
      window.lumacueChatWindow.setHeight(initial);
    }
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-black/60 backdrop-blur-md text-white rounded-2xl shadow-xl border border-white/10 overflow-x-hidden"
    >
      <ChatBox />
    </div>
  );
}
