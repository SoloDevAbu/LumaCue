import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";

declare global {
  interface Window {
    lumacue: {
      isFirstLaunch: () => Promise<boolean>;
      enterCompact: () => void;
      openChat: () => void;
      repositionChatBelowHeader: () => void;
    };
  }
}

function App() {
  const [mode, setMode] = useState<"auth" | "compact">("auth");
  // const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.lumacue.isFirstLaunch().then((first) => {
      if (!first) {
        setMode("compact");
        window.lumacue.enterCompact();
      }
    });
  }, []);

  if (mode === "auth") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl space-y-4">
          <h1 className="text-xl font-bold">Sign In</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            onClick={() => {
              setMode("compact");
              window.lumacue.enterCompact();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]">
      {/* Header */}
      <div ref={headerRef}>
        <Header />
      </div>

      {/* ChatBox dialog */}
      {/* {open && (
        <div className="relative mt-2 flex justify-center">
          <ChatBox width={(headerRef.current?.offsetWidth ?? 300) * 2} />
        </div>
      )} */}
    </div>
  );
}

export default App;
