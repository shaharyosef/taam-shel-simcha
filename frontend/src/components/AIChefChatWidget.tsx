import { useEffect, useMemo, useRef, useState } from "react";
import { chatAIRecipe, ChatMessage } from "../services/aiChatService";



export default function AIChefChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "?היי 😊  איזה מה בא לך לבשל היום"},
  ]);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => !loading && input.trim().length > 0, [loading, input]);

  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
    setLoading(true);

    try {
      const data = await chatAIRecipe(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "משהו השתבש 😅 נסי שוב בעוד רגע." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* CHAT WINDOW */}
      <div
        className={[
          "absolute bottom-0 right-0 w-[360px] h-[520px] overflow-hidden rounded-2xl",
          "border border-white/10 bg-zinc-950/95 text-white shadow-2xl backdrop-blur",
          "transition-all duration-200",
          open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-3 scale-[0.98] pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/10 text-xs font-bold">
              AI
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">השף הפרטי</div>
              <div className="text-xs text-white/60">שף פרטי לבישול ביתי</div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition"
            aria-label="סגור"
            title="סגור"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="h-[calc(520px-56px-64px)] overflow-y-auto px-3 py-3 space-y-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                dir="rtl"
                className={[
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-white text-zinc-900"
                    : "bg-white/10 text-white border border-white/10",
                ].join(" ")}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-white/10 border border-white/10 text-white/80">
                ...כותב
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
              rows={1}
              placeholder="(Enter לשליחה, Shift+Enter לשורה חדשה) ...כתב/י כאן"
              className={[
                "flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2",
                "text-sm text-white placeholder:text-white/40 outline-none",
                "focus:border-white/20 focus:ring-2 focus:ring-white/10",
                loading ? "opacity-70" : "",
              ].join(" ")}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                canSend
                  ? "bg-white text-zinc-900 hover:bg-white/90"
                  : "bg-white/20 text-white/60 cursor-not-allowed",
              ].join(" ")}
            >
              שלח
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className={[
          "grid h-14 w-14 place-items-center rounded-full",
          "border border-white/10 bg-zinc-950/90 text-white shadow-2xl backdrop-blur",
          "hover:bg-zinc-900/90 transition active:scale-95",
          open ? "opacity-0 pointer-events-none scale-90" : "opacity-100",
        ].join(" ")}
        aria-label="פתח צ'אט AI"
        title="השף האישי"
      >
        {/* Bot icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-95">
          <path
            d="M12 2a6 6 0 0 0-6 6v1.2A4.2 4.2 0 0 0 2.5 13.3V18a3.5 3.5 0 0 0 3.5 3.5h12A3.5 3.5 0 0 0 21.5 18v-4.7A4.2 4.2 0 0 0 18 9.2V8a6 6 0 0 0-6-6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 13.2h.1M15.7 13.2h.1"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M9 17.2c.8.7 1.8 1.1 3 1.1s2.2-.4 3-1.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
