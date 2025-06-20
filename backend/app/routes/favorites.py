from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import Favorite, Recipe, User
from app.services import users_services
from app.schemas.recipe_schema import RecipeResponse

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.post("/{recipe_id}")
def add_favorite(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(users_services.get_current_user)
):
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


@router.get("/", response_model=list[RecipeResponse])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(users_services.get_current_user)
):
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


@router.delete("/{recipe_id}")
def remove_favorite(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(users_services.get_current_user)
):
    Recipe = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.recipe_id == recipe_id).first()
    if not Recipe:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(Recipe)
    db.commit()
    
    return {"message": "Recipe removed from favorites"}