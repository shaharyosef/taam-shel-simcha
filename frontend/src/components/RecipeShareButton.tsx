import { useState, useEffect, useRef } from "react";
import {
  ClipboardIcon,
  MailIcon,
  LinkIcon,
  Share2,
  MessageCircle,
} from "lucide-react";
import { sendRecipeByEmail } from "../services/recipeService";

type RecipeShareButtonProps = {
  recipeId: number;
  title: string;
};

export default function RecipeShareButton({ recipeId, title }: RecipeShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${window.location.origin}/recipes/${recipeId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("שגיאה בהעתקה", err);
    }
  };

  const openWhatsApp = () => {
    const text = `מצאתי מתכון מגניב: ${title}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSendEmail = async () => {
    try {
      await sendRecipeByEmail(recipeId, email);
      setMessage("✅ המתכון נשלח בהצלחה!");
    } catch {
      setMessage("❌ שגיאה בשליחה. נסה שוב.");
    }
  };

  // סגירת התפריט בלחיצה מחוץ
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setEmailMode(false);
        setMessage("");
        setEmail("");
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="relative z-50" ref={wrapperRef}>
      <button
        className="text-xl"
        title="שיתוף"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
      >
        <Share2 />
      </button>

      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full right-0 mt-2 w-64 bg-white shadow-xl border rounded-xl z-50 text-sm p-3"
        >
          {/* חץ פינה ימנית עליונה */}
          <div className="absolute -top-2 right-3 w-3 h-3 rotate-45 bg-white border-t border-r border-gray-300" />

          {!emailMode ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full rounded"
              >
                <ClipboardIcon size={16} />
                {copied ? "הועתק קישור" : "העתק קישור"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEmailMode(true);
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full rounded"
              >
                <MailIcon size={16} />
                שלח במייל
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openWhatsApp();
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full rounded"
              >
                <MessageCircle size={16} />
                שתף בוואטסאפ
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full rounded"
              >
                <LinkIcon size={16} />
                פתח קישור
              </a>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="כתובת מייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded text-sm"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendEmail();
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                שלח מתכון
              </button>
              {message && <p className="text-xs text-green-600">{message}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
