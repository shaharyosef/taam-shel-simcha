export interface Recipe {
  id: number;
  title: string;
  description?: string;
  ingredients: string;
  instructions?: string;
  image_url?: string;
  video_url?: string;
  user_id: number;
  share_token: string;
  is_public: boolean;
  creator_name: string;
  created_at?: string;
}
