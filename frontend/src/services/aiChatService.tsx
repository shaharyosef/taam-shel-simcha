import axios from "axios";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  
};

export type ChatRecipeResponse = {
  type: "question" | "confirm" | "recipe";
  done: boolean;
  reply: string;
  title?: string | null;
};

export async function chatAIRecipe(
  messages: ChatMessage[]
): Promise<ChatRecipeResponse> {
  const response = await axios.post<ChatRecipeResponse>(
    "http://localhost:8000/ai/chat-recipe",
    { messages }
  );

  console.log("AI Chat Response:", response.data);
  return response.data;
}