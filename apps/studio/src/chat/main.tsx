import { createRoot } from "react-dom/client";
import ChatApp from "./ChatApp";
import "./chat.css";
const root = createRoot(document.getElementById("chat-root")!);
root.render(<ChatApp />);
