import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, ChefHat } from "lucide-react";
import { type Recipe } from "../types/Recipe";
import StarRating from "./StarRating";
import RecipeShareButton from "./RecipeShareButton";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
  onRate: (rating: number) => void;
  onClick?: () => void;
  isMine?: boolean;
}

export default function RecipeCard({
  recipe,
  isFavorited,
  onToggleFavorite,
  onRate,
  onClick,
}: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/recipes/${recipe.id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(recipe.id);
  };

  const handleRateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-visible border border-gray-100 hover:border-gray-200 h-full flex flex-col w-[300px]"
      dir="rtl"
    >
      <div className="absolute top-3 left-3 flex gap-2 z-50">
        <RecipeShareButton recipeId={recipe.id} title={recipe.title} />
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-white transition-all duration-200 group/heart"
          title={isFavorited ? "הסר מהמועדפים" : "הוסף למועדפים"}
          type="button"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isFavorited
                ? "fill-red-500 text-red-500 group-hover/heart:scale-110"
                : "text-gray-700 group-hover/heart:text-red-500 group-hover/heart:scale-110"
            }`}
          />
        </button>
      </div>

      <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {!imageError && recipe.image_url?.trim() ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <ChefHat className="w-16 h-16 text-orange-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {recipe.average_rating && recipe.average_rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
            <span className="text-sm font-semibold text-gray-800">
              {recipe.average_rating.toFixed(1)}
            </span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-3 min-h-[3.5rem]">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-200 text-right leading-tight mb-1 line-clamp-2">
            {recipe.title}
          </h3>
          <div className="flex items-center justify-end gap-1.5 text-sm text-gray-600" dir="ltr">
            <span className="truncate">{recipe.creator_name}</span>
            <ChefHat className="w-4 h-4 flex-shrink-0" />
          </div>
        </div>

        <div className="mb-3 min-h-[4rem] max-h-[6rem] overflow-y-auto pr-1 text-right">
          <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-line">
            {recipe.description || "אין תיאור זמין"}
          </p>
        </div>

        <div
          onClick={handleRateClick}
          className="pt-3 border-t border-gray-100 mt-auto"
        >
          <div className="flex items-center justify-between min-h-[2.5rem]">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">דרג מתכון:</span>
              <span className="text-xs">
                ({recipe.average_rating ? recipe.average_rating.toFixed(1) : "0"})
              </span>
            </div>
            <div className="flex-shrink-0">
              <StarRating onRate={onRate} size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
