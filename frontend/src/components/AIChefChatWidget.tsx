import { useEffect, useMemo, useRef, useState } from "react";
import { chatAIRecipe, ChatMessage } from "../services/aiChatService";
import RecipeModal from "./RecipeModal";

type ReplyType = "question" | "confirm" | "recipe";

type RecipeModalData = {
  title: string;
  body: string;
};

export default function AIChefChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [lastType, setLastType] = useState<ReplyType>("question");
  const [recipeModal, setRecipeModal] = useState<RecipeModalData | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "היי 😊 איזה מה בא לך לבשל היום?" },
  ]);

  // ✅ תמיד מחזיק את ההיסטוריה הכי עדכנית (מונע “סטייט ישן”)
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(
    () => !loading && input.trim().length > 0,
    [loading, input]
  );

  const isConfirmMode = lastType === "confirm";

  // גלילה אוטומטית למטה
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, loading, recipeModal]);

  function normalizeType(t: unknown): ReplyType {
    const normalized = String(t ?? "").trim().toLowerCase();
    if (normalized === "confirm" || normalized === "recipe") {
      return normalized as ReplyType;
    }
    return "question";
  }

  async function sendText(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;

    // 1) מראים מיד את הודעת המשתמש
    const nextMessages: ChatMessage[] = [
      ...messagesRef.current,
      { role: "user", content: clean },
    ];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);

    // 2) מאפסים UI
    setInput("");
    setLoading(true);

    try {
      const data = await chatAIRecipe(nextMessages);
      console.log("AI Chat Response:", data);

      const safeType = normalizeType(data?.type);
      setLastType(safeType);

      // 3) מוסיפים תשובת בוט לצ'אט
      const afterBot: ChatMessage[] = [
        ...messagesRef.current,
        { role: "assistant", content: data.reply },
      ];
      messagesRef.current = afterBot;
      setMessages(afterBot);

      // 4) אם זה מתכון – פותחים גם מודאל גדול (והצ'אט נשאר פתוח)
      if (safeType === "recipe") {
        setRecipeModal({
          title: data.title || "המתכון שלך",
          body: data.reply,
        });
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setLastType("question");

      const afterErr: ChatMessage[] = [
        ...messagesRef.current,
        { role: "assistant", content: "משהו השתבש 😅 נסי שוב בעוד רגע." },
      ];
      messagesRef.current = afterErr;
      setMessages(afterErr);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) sendText(input);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* ✅ Recipe Modal */}
      <RecipeModal
        open={!!recipeModal}
        title={recipeModal?.title ?? ""}
        body={recipeModal?.body ?? ""}
        onClose={() => setRecipeModal(null)}
      />

      {/* CHAT WINDOW */}
      <div
        className={[
          "absolute bottom-0 right-0 w-[360px] h-[520px] overflow-hidden rounded-2xl",
          "border border-white/10 bg-zinc-950/95 text-white shadow-2xl backdrop-blur",
          "transition-all duration-200",
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-3 scale-[0.98] pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
          <div
            dir="rtl"
            className="flex flex-row-reverse items-center gap-2 text-right"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/10 text-xs font-bold">
              AI
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold" dir="rtl">
                השף הפרטי
              </div>
              <div className="text-xs text-white/60" dir="rtl">
                שף פרטי לבישול ביתי
              </div>
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
        <div
          ref={bodyRef}
          className="h-[calc(520px-56px-64px)] overflow-y-auto px-3 py-3 space-y-2"
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
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
          {isConfirmMode ? (
            <div className="flex gap-2">
              <button
                onClick={() => sendText("מאשר")}
                disabled={loading}
                className={[
                  "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  loading
                    ? "bg-white/20 text-white/60 cursor-not-allowed"
                    : "bg-white text-zinc-900 hover:bg-white/90",
                ].join(" ")}
              >
                מאשר
              </button>

              <button
                onClick={() => sendText("רוצה לערוך")}
                disabled={loading}
                className={[
                  "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  loading
                    ? "bg-white/20 text-white/60 cursor-not-allowed"
                    : "bg-white/10 text-white border border-white/10 hover:bg-white/15",
                ].join(" ")}
              >
                עריכה
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading}
                rows={1}
                placeholder={`כתב/י כאן מה מתחשק לך\n(Enter לשליחה · Shift+Enter לשורה חדשה)`}
                className={[
                  "flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2",
                  "text-sm text-white placeholder:text-white/40 outline-none",
                  "focus:border-white/20 focus:ring-2 focus:ring-white/10",
                  loading ? "opacity-70" : "",
                ].join(" ")}
              />
              <button
                onClick={() => sendText(input)}
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
          )}
        </div>
      </div>

      {/* Floating Button */}
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
        🤖
      </button>
    </div>
  );
}