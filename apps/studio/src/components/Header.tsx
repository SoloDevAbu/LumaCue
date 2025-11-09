import { Minimize2, TerminalSquare } from "lucide-react";

export default function Header() {
  const handleOpenChat = () => {
    window.lumacue?.openChat?.();
    window.lumacue?.repositionChatBelowHeader?.();
  };

  const handleEnterCompact = () => {
    window.lumacue?.enterCompact?.();
  };

  return (
    <div className="flex items-center justify-between w-[300px] bg-black/60 backdrop-blur-md text-white rounded-2xl px-4 py-2 shadow-xl border border-white/10">
      <div className="flex gap-x-2 items-center">
        <button className="flex items-center" aria-label="LumaCue Logo">
          <img src="/LumaCue.png" alt="LumaCue Logo" className="h-6 w-6 rounded-full" />
        </button>
        <span className="font-semibold tracking-wide">LumaCue</span>
      </div>
      <div className="flex gap-x-2">
        <button
          onClick={handleOpenChat}
          className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1 cursor-pointer"
          title="Run command"
        >
          <TerminalSquare size={16} />
          Ask
        </button>
        <button
          onClick={handleEnterCompact}
          className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1 cursor-pointer"
          title="Minimize window"
        >
          <Minimize2 size={16} />
        </button>
      </div>
    </div>
  );
}
