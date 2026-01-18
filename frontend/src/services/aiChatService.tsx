import axios from "axios";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function chatAIRecipe(messages: ChatMessage[]) {
  const response = await axios.post(
    "http://localhost:8000/ai/chat-recipe",
    { messages }
  );

  console.log("AI Chat Response:", response.data);
  return response.data; // { type, done, reply, title }
}
