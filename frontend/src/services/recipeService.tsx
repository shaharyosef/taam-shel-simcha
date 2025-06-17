import axios from "axios";

import { Recipe } from "../types/Recipe"
import api from "./api";
const BASE_URL = "http://localhost:8000";

// שליפת מתכונים ציבוריים רנדומליים (8)
export async function getPublicRecipes() {
  const response = await axios.get(`${BASE_URL}/recipes/public-random`, {
    headers: {}  // 👈 לא שולח Authorization בטעות
  });
  return response.data;
}

// שליפת כל המתכונים (ציבוריים ופרטיים – תלוי בהרשאות)
export async function getAllPublicRecipes() {
  const response = await axios.get(`${BASE_URL}/recipes`);
  return response.data;
}

// מיון מתכונים לפי קריטריון ודף (pagination)
export async function getSortedRecipes(sort: string, page: number = 1) {
  const response = await axios.get(`${BASE_URL}/recipes/sorted/${sort}?page=${page}`);
  return response.data;
}

// הוספה למועדפים
export async function addToFavorites(recipeId: number) {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}/favorites/${recipeId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// הסרה ממועדפים
export async function removeFromFavorites(recipeId: number) {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${BASE_URL}/favorites/${recipeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// שליפת רשימת ה-IDs של מתכונים שמסומנים כמועדפים
export async function getFavorites(): Promise<number[]> {
  const token = localStorage.getItem("token");

  if (!token) return [];

  const response = await axios.get(`${BASE_URL}/favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.map((recipe: any) => recipe.id);
}

export async function getmyFavorites(): Promise<Recipe[]> {
  const token = localStorage.getItem("token");

  if (!token) return [];

  const response = await axios.get(`${BASE_URL}/favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// דירוג מתכון
export async function rateRecipe(recipeId: number, rating: number) {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${BASE_URL}/recipes/recipe/${recipeId}/rate`,
    { rating },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// שליפת תגובות למתכון
export async function getComments(recipeId: number) {
  const response = await fetch(`${BASE_URL}/comments/${recipeId}`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return await response.json();
}

// הוספת תגובה למתכון
export async function addComment(recipeId: number, content: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/comments/${recipeId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw new Error("Failed to add comment");
  return await response.json();
}


// שליפת המתכונים של המשתמש הנוכחי
export async function getMyRecipes(): Promise<Recipe[]> {
  const token = localStorage.getItem("token");
  const response = await api.get("/recipes/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
