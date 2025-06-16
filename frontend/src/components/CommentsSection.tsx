import { useEffect, useState } from "react";
import { getComments, addComment } from "../services/recipeService";

type Comment = {
  id: number;
  content: string;
  username: string;
  created_at: string;
};

type Props = {
  recipeId: number;
};

export default function CommentsSection({ recipeId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await getComments(recipeId);
      setComments(data);
    } catch (err) {
      console.error("שגיאה בהבאת תגובות:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const newC = await addComment(recipeId, newComment);
      setComments([newC, ...comments]); // הצג מיידית
      setNewComment("");
      setError("");
    } catch (err: any) {
      setError("נראה שאתה לא מחובר או שיש שגיאה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-lg font-bold mb-2">💬 תגובות</h3>

      {/* טופס תגובה */}
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-2 rounded w-full resize-none"
          rows={3}
          placeholder="כתוב תגובה..."
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="self-start px-4 py-2 bg-primary text-white rounded shadow hover:bg-hover transition disabled:opacity-50"
        >
          {loading ? "שולח..." : "שלח תגובה"}
        </button>
      </form>

      {/* רשימת תגובות */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-600">אין עדיין תגובות. תהיה הראשון!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="border p-3 rounded shadow-sm bg-gray-50">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>🧑 {c.username}</span>
                <span>{new Date(c.created_at).toLocaleString("he-IL")}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
