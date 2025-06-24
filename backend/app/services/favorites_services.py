from fastapi import   HTTPException
from sqlalchemy.orm import Session
from app.models import Favorite, Recipe, User
from app.schemas.recipe_schema import RecipeResponse


def add_favorite(recipe_id: int,db: Session ,current_user: User):
    # נבדוק אם המתכון קיים
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # נבדוק אם הוא כבר נמצא במועדפים
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.recipe_id == recipe_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Recipe already in favorites")

    # נוסיף למועדפים
    favorite = Favorite(user_id=current_user.id, recipe_id=recipe_id)
    db.add(favorite)
    db.commit()

    return {"message": "Recipe added to favorites"}

def get_favorites(db: Session ,current_user: User):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()

    response = []

    for f in favorites:
        if f.recipe is not None:
            response.append(RecipeResponse(
                    id=f.recipe.id,
                    title=f.recipe.title,
                    description=f.recipe.description,
                    ingredients=f.recipe.ingredients,
                    instructions=f.recipe.instructions,
                    image_url=f.recipe.image_url,
                    video_url=f.recipe.video_url,
                    user_id=f.recipe.user_id,
                    creator_name=f.recipe.creator.username if f.recipe.creator else "Unknown",
                    created_at=f.recipe.created_at.isoformat() if f.recipe.created_at else None,
                    share_token=f.recipe.share_token,
                    is_public=f.recipe.is_public,
                    prep_time=f.recipe.prep_time,
                    difficulty=f.recipe.difficulty
                ))


    return response


def remove_favorite(recipe_id: int, db: Session, current_user: User):
    fav_to_delete = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.recipe_id == recipe_id
    ).first()

    if not fav_to_delete:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav_to_delete)
    db.commit()

    return {"message": "Recipe removed from favorites"}
