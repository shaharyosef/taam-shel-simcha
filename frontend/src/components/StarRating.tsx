// components/StarRating.tsx
import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating = 0,
  onRate,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [currentRating, setCurrentRating] = useState<number>(rating);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (newRating: number): void => {
    if (readonly) return;
    setCurrentRating(newRating);
    if (onRate) {
      onRate(newRating);
    }
  };

  const handleMouseEnter = (star: number): void => {
    if (!readonly) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = (): void => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-transform duration-150 ${sizeClasses[size]}`}
          type="button"
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || currentRating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            } transition-colors duration-150`}
          />
        </button>
      ))}
      {currentRating > 0 && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {currentRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
