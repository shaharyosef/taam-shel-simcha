import axios from "axios";
import { Recipe } from "../types/Recipe";

const BASE_URL = "http://localhost:8000";

export async function getPublicRecipes() {
  const response = await axios.get(`${BASE_URL}/recipes/public-random`);
  return response.data;
}

export async function getAllPublicRecipes() {
  const response = await axios.get(`${BASE_URL}/recipes`);
  return response.data;
}

export async function getSortedRecipes(sort: string, page: number = 1) {
  const response = await axios.get(`${BASE_URL}/recipes/sorted/${sort}?page=${page}`);
  return response.data;
}


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

export async function removeFromFavorites(recipeId: number) {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${BASE_URL}/favorites/${recipeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getFavorites(): Promise<number[]> {
  const token = localStorage.getItem("token");

  if (!token) return []; // למקרה של Guest או בעיה

  const response = await axios.get(`${BASE_URL}/favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.map((recipe: any) => recipe.id);
}



export async function rateRecipe(recipeId: number, rating: number) {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `http://localhost:8000/recipes/recipe/${recipeId}/rate`,
    { rating },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}


export async function getComments(recipeId: number) {
  const response = await fetch(`http://localhost:8000/comments/${recipeId}`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return await response.json();
}

export async function addComment(recipeId: number, content: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:8000/comments/${recipeId}`, {
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