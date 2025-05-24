import axios from "axios";
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://backend:8000"; // בתוך Docker Network


export async function getPublicRecipes() {
  const res = await axios.get(`${API_URL}/recipes/public-random`);
  return res.data;
}


export async function generateRecipeWithAI(text) {
  const res = await axios.post("http://localhost:8000/ai/recipe", null, {
    params: { text },
  });
  return res.data;
}

