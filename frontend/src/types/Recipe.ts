export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;      // רשימת מרכיבים
  image_url?: string;       // תמונה (רשות)
  video_url?: string;       // קישור ליוטיוב (אם יש)
  creator_name: string;     // שם היוצר
  average_rating?: number; 
  instructions: string;
  created_at: string; 
           
}
