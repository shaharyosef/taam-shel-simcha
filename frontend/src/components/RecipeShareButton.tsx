import { useState, useEffect, useRef } from "react";
import {
  ClipboardIcon,
  MailIcon,
  LinkIcon,
  Share2,
  MessageCircle,
} from "lucide-react";

type RecipeShareButtonProps = {
  recipeId: number;
  title: string;
};

export default function RecipeShareButton({ recipeId, title }: RecipeShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null); // ← חדש

  const shareUrl = `${window.location.origin}/recipes/${recipeId}`;
  const mailSubject = encodeURIComponent(`מתכון שווה מ'טעם של שמחה'`);
  const mailBody = encodeURIComponent(
    `רציתי לשתף איתך את המתכון "${title}" שראיתי:\n\n${shareUrl}`
  );

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

  // סגירה אוטומטית בלחיצה מחוץ
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className="text-xl"
        title="שיתוף"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <Share2 />
      </button>

      {menuOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white shadow-lg border rounded-lg flex-col z-50 w-40 text-sm animate-fade-in">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full"
          >
            <ClipboardIcon size={16} />
            {copied ? "הועתק!" : "העתק קישור"}
          </button>
          <button
            onClick={() =>
              window.open(`mailto:?subject=${mailSubject}&body=${mailBody}`)
            }
            className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full"
          >
            <MailIcon size={16} />
            שלח במייל
          </button>
          <button
            onClick={openWhatsApp}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full"
          >
            <MessageCircle size={16} />
            שתף בוואטסאפ
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full"
          >
            <LinkIcon size={16} />
            פתח קישור
          </a>
        </div>
      )}
    </div>
  );
}
