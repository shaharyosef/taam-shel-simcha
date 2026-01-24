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
      
      // --- תיקון חכם (Fallback) ---
      // אם השרת אמר שזה "question" אבל הטקסט נראה בבירור כמו מתכון
      let finalType = safeType;
      if (finalType !== "recipe" && finalType !== "confirm") {
        const replyText = data.reply || "";
        // רשימות מילים נרדפות כדי לא לפספס שום וריאציה
        const ingredientKeywords = ["מצרכים", "רכיבים", "מרכיבים", "המצרכים", "הרכיבים"];
        const instructionKeywords = ["הוראות", "הכנה", "אופן ההכנה", "שלבים", "תהליך"];

        const hasIngredients = ingredientKeywords.some(word => replyText.includes(word));
        const hasInstructions = instructionKeywords.some(word => replyText.includes(word));
        
        if (hasIngredients && hasInstructions) {
           console.log("⚠️ זוהה מתכון לפי מילות מפתח (הרחבה)", { hasIngredients, hasInstructions });
           finalType = "recipe";
        }
      }

      setLastType(finalType);

      // 3) מוסיפים תשובת בוט לצ'אט
      const afterBot: ChatMessage[] = [
        ...messagesRef.current,
        { role: "assistant", content: data.reply },
      ];
      messagesRef.current = afterBot;
      setMessages(afterBot);

      // 4) אם זה מתכון – פותחים גם מודאל גדול (והצ'אט נשאר פתוח)
      if (finalType === "recipe") {
        
        // חילוץ כותרת אם חסרה
        let titleToUse = data.title;
        if (!titleToUse) {
           titleToUse = data.reply.split("\n")[0].replace(/[*#]/g, "").trim(); 
        }

        setRecipeModal({
          title: titleToUse || "המתכון שלך",
          body: data.reply,
        });
      }
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      setLastType("question");
      
      let errorMessage = "משהו השתבש 😅 נסי שוב בעוד רגע.";
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          errorMessage = "לוקח לשף קצת זמן להתעורר... נסה לשלוח שוב!";
      }

      const afterErr: ChatMessage[] = [
        ...messagesRef.current,
        { role: "assistant", content: errorMessage },
      ];
      messagesRef.current = afterErr;
      setMessages(afterErr);
    } finally {
      setLoading(false);
      // החזרת פוקוס עם השהייה קטנה
      setTimeout(() => inputRef.current?.focus(), 100);
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
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-3 bg-white/5">
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
          className="h-[calc(520px-56px-82px)] overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar"
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
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-white/10 border border-white/10 text-white/80 animate-pulse">
                ...כותב
              </div>
            </div>
          )}
        </div>

        {/* Footer - אזור הכפתורים והטקסט המשודרג */}
        <div className="border-t border-white/10 bg-zinc-950 px-4 py-4">
          {isConfirmMode ? (
            <div className="flex gap-3">
              <button
                onClick={() => sendText("מאשר")}
                disabled={loading}
                className={[
                  "flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                  loading
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-900/20 hover:shadow-green-900/40 hover:-translate-y-0.5",
                ].join(" ")}
              >
                כן, אני מאשר/ת 👍
              </button>

              <button
                onClick={() => sendText("רוצה לערוך")}
                disabled={loading}
                className={[
                  "flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                  loading
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-white/10 text-white border border-white/10 hover:bg-white/15 hover:border-white/20",
                ].join(" ")}
              >
                עריכה ✏️
              </button>
            </div>
          ) : (
            <div className="relative flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading}
                rows={1}
                placeholder="כתוב כאן..."
                className={[
                  "w-full resize-none rounded-2xl border border-white/10 bg-white/5",
                  "px-4 py-3 text-sm text-white placeholder:text-white/30",
                  "focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-0",
                  "min-h-[50px] max-h-[120px]", // ✅ גובה התחלתי גדול יותר + מקסימום גובה
                  loading ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              />
              
              <button
                onClick={() => sendText(input)}
                disabled={!canSend}
                className={[
                  "flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
                  canSend
                    ? "bg-white text-zinc-950 shadow-lg hover:bg-zinc-200 hover:-translate-y-0.5 active:scale-95"
                    : "bg-white/10 text-white/20 cursor-not-allowed",
                ].join(" ")}
                title="שלח הודעה"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`h-5 w-5 ${!canSend && "opacity-50"}`}
                    style={{ transform: "rotate(180deg)" }} // הופך את החץ שיתאים לעברית
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                )}
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