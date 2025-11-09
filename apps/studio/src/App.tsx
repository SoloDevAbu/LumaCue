import { useEffect, useState } from "react";
import Header from "./components/Header";

function App() {
  const [mode, setMode] = useState<"auth" | "compact">("auth");

  useEffect(() => {
    let isMounted = true;

    async function determineInitialMode() {
      try {
        const firstLaunch = await window.lumacue?.isFirstLaunch?.();
        if (isMounted && firstLaunch === false) {
          setMode("compact");
          window.lumacue?.enterCompact?.();
        }
      } catch (error) {
        console.error("Failed to determine launch state", error);
      }
    }

    determineInitialMode();

    return () => {
      isMounted = false;
    };
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
              window.lumacue?.enterCompact?.();
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
      <Header />
    </div>
  );
}

export default App;
