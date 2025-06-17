import { useEffect, useState } from "react";
import api, { deleteComment } from "../services/api";
import { Comment, CommentForm } from "../types/Comment";

interface CurrentUser {
  id: number;
  username: string;
  is_admin: boolean;
}

export default function CommentsSection({ recipeId }: { recipeId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [form, setForm] = useState<CommentForm>({ content: "" });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetchComments();
    fetchCurrentUser();
  }, [recipeId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);
    } catch {
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${recipeId}`);
      setComments(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת תגובות", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/comments/${recipeId}`, form);
      setForm({ content: "" });
      fetchComments();
    } catch {
      alert("שגיאה בהוספת תגובה");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("למחוק את התגובה?")) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("שגיאה במחיקת תגובה");
    }
  };

  return (
    <div className="text-right" dir="rtl">
      {!loadingUser ? (
        currentUser ? (
          <form onSubmit={handleSubmit} className="mb-6 animate-fadeIn">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm shadow focus:outline-none focus:ring focus:border-blue-300 resize-none transition"
              placeholder="כתוב תגובה..."
              value={form.content}
              onChange={(e) => setForm({ content: e.target.value })}
              rows={3}
              required
            />
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white px-5 py-2 rounded-xl hover:bg-blue-600 transition transform hover:scale-105 shadow"
            >
              שלח תגובה
            </button>
          </form>
        ) : (
          <p className="text-gray-500 text-sm mb-6 italic animate-fadeIn">
            יש להתחבר כדי להגיב.
          </p>
        )
      ) : (
        <p className="text-gray-400 text-sm mb-6 animate-pulse">טוען תגובות...</p>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 pl-10 relative hover:shadow-md transition-all max-w-3xl"
            >
              <p className="text-gray-800 text-sm mb-2 break-words whitespace-pre-wrap overflow-hidden">
                {comment.content}
              </p>
              <div className="text-xs text-gray-500 flex justify-between items-center">
                <span>
                  🧑‍💬 {comment.username || "משתמש"}
                </span>
                <span>
                  🗓 {new Date(comment.created_at).toLocaleString("he-IL")}
                </span>
              </div>
              {(currentUser?.is_admin ||
                currentUser?.id === comment.user_id) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="absolute top-2 left-3 text-red-600 hover:text-red-800 text-lg transition"
                  title="מחק תגובה"
                >
                  🗑️
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic animate-fadeIn">
            אין תגובות עדיין.
          </p>
        )}
      </div>
    </div>
  );
}
