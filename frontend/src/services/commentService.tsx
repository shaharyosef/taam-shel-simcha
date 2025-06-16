import api from "./api"; // ודא שיש לך api עם axios שהוגדר עם baseURL ו־token

export async function getCommentsForRecipe(recipeId: number) {
  const res = await api.get(`/comments/${recipeId}`);
  return res.data;
}

export async function addComment(recipeId: number, content: string) {
  const res = await api.post(`/comments/${recipeId}`, { content });
  return res.data;
}
