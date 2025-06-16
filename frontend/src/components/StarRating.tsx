// components/StarRating.tsx
import { useState } from "react";

export default function StarRating({ onRate }: { onRate: (rating: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1 text-yellow-400 text-xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={hovered >= star ? "cursor-pointer" : "cursor-pointer text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}
