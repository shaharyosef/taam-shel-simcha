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
  const response = await fetch("http://localhost:8000/favorites", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch favorites");

  const data = await response.json();
  return data.map((recipe: any) => recipe.id);  // ← חשוב שזה באמת מחזיר מזהים בלבד
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


