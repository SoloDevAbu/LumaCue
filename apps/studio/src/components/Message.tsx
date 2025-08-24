export default function Message({ role, text }: { role: "user" | "ai"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-xl leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white/10 text-white rounded-bl-none"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
