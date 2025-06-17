export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  recipe_id: number;
  username: string; // ← זה מה שה-API מחזיר בפועל
}


export interface CommentForm {
  content: string;
}
