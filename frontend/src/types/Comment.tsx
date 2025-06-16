export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name?: string;
  user?: {
    id: number;
    username: string;
  };
}


export interface CommentForm {
  content: string;
}
