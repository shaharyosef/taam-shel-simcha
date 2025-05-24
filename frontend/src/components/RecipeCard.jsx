function RecipeCard({ recipe }) {
  const imageUrl = recipe.image_url || "/no_pic.png";

  return (
    <div className="recipe-card">
      <div className="rating-box">
        ⭐ {recipe.average_rating ?? "לא דורג"}
      </div>
      <img
        src={imageUrl}
        alt={recipe.title}
        className="recipe-image"
      />
      <h3>{recipe.title}</h3>
      <p><strong>יוצר:</strong> {recipe.creator_name}</p>
      {recipe.description && (
        <div className="description-block">
          <strong>תיאור:</strong>
          <p className="description">{recipe.description}</p>
        </div>
      )}
    </div>
  );
}
export default RecipeCard;