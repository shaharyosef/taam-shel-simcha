export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  image_url?: string;
  video_url?: string;
  is_public: boolean;  // הוספנו את זה
  creator_name: string;
  created_at: string;
  average_rating?: number;
  user_id: number;
}
