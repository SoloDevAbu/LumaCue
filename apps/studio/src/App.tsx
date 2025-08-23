import "./App.css";
import { useState, useEffect } from "react";
import AuthScreen from "./screens/AuthScreen";
import SettingsScreen from "./screens/SeetingsScreen";
import Overlay from "./screens/OverlayScreen";
import MiniCircle from "./screens/Mini";

declare global {
  interface Window {
    lumacue: any;
  }
}

function useQueryParam(key: string) {
  return new URLSearchParams(window.location.search).get(key);
}

export default function App() {
  const mini = useQueryParam("mini");

  const [signedIn, setSignedIn] = useState(() => {
    return localStorage.getItem("lumacue:signedIn") === "true";
  });
  const [firstRunComplete, setFirstRunComplete] = useState(() => {
    return localStorage.getItem("lumacue:firstRunComplete") === "true";
  });

  const [mode, setMode] = useState<"auth" | "settings" | "overlay">(() => {
    if (!signedIn) return "auth";
    if (!firstRunComplete) return "settings";
    return "overlay";
  });

  // Effect to handle overlay mode when component mounts and mode is overlay
  useEffect(() => {
    if (mode === "overlay" && signedIn && firstRunComplete) {
      // Small delay to ensure window is ready
      setTimeout(() => {
        window.lumacue.enterOverlay();
      }, 100);
    }
  }, [mode, signedIn, firstRunComplete]);

  function handleSignIn() {
    localStorage.setItem("lumacue:signedIn", "true");
    setSignedIn(true);
    setMode("settings");
  }

  function handleSettingsDone() {
    localStorage.setItem("lumacue:firstRunComplete", "true");
    setFirstRunComplete(true);
    setMode("overlay");
    window.lumacue.enterOverlay();
  }

  if (mini) return <MiniCircle />;

  return (
    <div className="app-wrapper">
      {mode === "auth" && <AuthScreen onSignIn={handleSignIn} />}
      {mode === "settings" && <SettingsScreen onDone={handleSettingsDone} />}
      {mode === "overlay" && <Overlay />}
    </div>
  );
}