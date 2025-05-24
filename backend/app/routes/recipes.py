from fastapi import APIRouter, HTTPException, Depends, Query, Form, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app import models
from app.models import User, Rating, Recipe
from app.services.users import get_current_user, admin_required 
from app.schemas.recipe_schema import RecipeAdminUpdate, ratingRequest, RecipeUpdate, RecipeResponse, RecipeCreate
from sqlalchemy import func
from fastapi import UploadFile, File
from app.services.cloudinary_service import upload_image_to_cloudinary
from datetime import datetime
from typing import Optional
from uuid import uuid4
from app.services.email import send_recipe_email_with_pdf, send_rating_notification_email
from app.services import recipe_services
import random

PAGE_SIZE = 8

router = APIRouter(prefix="/recipes", tags=["recipes"])



@router.get("/", response_model=list[RecipeResponse])
def get_all_recipes(db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).filter(models.Recipe.is_public == True).all()

    response = []
    
    for recipe in recipes:
        response.append(RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            user_id=recipe.user_id,
            share_token = recipe.share_token,
            is_public = recipe.is_public,
            creator_name = recipe.creator.username if recipe.creator else "Unknown",
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
        ))

    return response

@router.post("/add")
def add_recipe(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    ingredients: str = Form(...),
    instructions: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None, description="YouTube video link (not a file upload)"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    is_public: bool = Form(...),
    current_user: User = Depends(get_current_user)
):
    image_url = None

    if image and image.filename:  # ✅ בדיקה כפולה כדי לוודא שהועלתה תמונה בפועל
        try:
            image_url = upload_image_to_cloudinary(image, folder="recipes")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
        
   

    new_recipe = Recipe(
        title=title,
        description=description,
        ingredients=ingredients,
        instructions=instructions,
        image_url=image_url,
        video_url=video_url,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        share_token=str(uuid4()),
        is_public=is_public,
    )
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    return {
        "message": "Recipe created successfully",
        "recipe_id": new_recipe.id,
        "image_url": image_url,
        "share_token": new_recipe.share_token,
        "is_public": new_recipe.is_public
    }



@router.get("/public/{recipe_id}", response_model=RecipeResponse)
def get_public_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter_by(id=recipe_id, is_public=True).first()
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Public recipe not found")
    
    return RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        image_url=recipe.image_url,
        video_url=recipe.video_url,
        user_id=recipe.user_id,
        share_token = recipe.share_token,
        is_public = recipe.is_public,
        creator_name = recipe.creator.username if recipe.creator else "Unknown",
        created_at = recipe.created_at.isoformat() if recipe.created_at else None
    )

@router.get("/me", response_model=list[RecipeResponse])
def get_my_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recipes = db.query(models.Recipe).filter(models.Recipe.user_id == current_user.id).all()

    return [
        RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            user_id=recipe.user_id,
            share_token=recipe.share_token,
            is_public=recipe.is_public,
            creator_name=recipe.creator.username,
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
        )
        for recipe in recipes
    ]


@router.delete("/{recipe_id}")
def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own recipes")

    db.delete(recipe)
    db.commit()

    return {"message": "Recipe deleted successfully"}


@router.put("/{recipe_id}")
def update_recipe(
    recipe_id: int,
    updated_data: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own recipes")

    # נעדכן רק שדות שנשלחו
    if updated_data.title is not None:
        recipe.title = updated_data.title
    if updated_data.description is not None:
        recipe.description = updated_data.description
    if updated_data.ingredients is not None:
        recipe.ingredients = updated_data.ingredients
    if updated_data.instructions is not None:
        recipe.instructions = updated_data.instructions
    if updated_data.image_url is not None:
        recipe.image_url = updated_data.image_url
    if updated_data.video_url is not None:
        recipe.video_url = updated_data.video_url
    if updated_data.is_public is not None:
        recipe.is_public = updated_data.is_public

    db.commit()
    db.refresh(recipe)

    return {"message": "Recipe updated successfully"}


@router.get("/admin/recipes", response_model=list[RecipeResponse])
def get_all_recipes_admin(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    recipes = db.query(models.Recipe).all()
    
    response = []
    
    for recipe in recipes:
        
        creator_name = recipe.creator.username if  recipe.creator else "Unknown"
        response.append(RecipeResponse(
            id = recipe.id,
            title =  recipe.title,
            description = recipe.description,
            ingredients = recipe.ingredients,
            instructions = recipe.instructions,
            image_url = recipe.image_url,
            video_url = recipe.video_url,
            user_id = recipe.user_id,
            share_token = recipe.share_token,
            is_public = recipe.is_public,
            creator_name = creator_name,
            created_at = recipe.created_at.isoformat() if recipe.created_at else None,
        ))

    return response
    

@router.delete("/admin/recipes/{recipe_id}")
def delete_recipe_admin(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db.delete(recipe)
    db.commit()

    return {"message": "Recipe deleted successfully"}

@router.put("/admin/recipes/{recipe_id}")
def update_recipe_admin(
    recipe_id: int,
    updated_data: RecipeAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):

    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found") 
    
    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(recipe, field, value)

    db.commit()
    db.refresh(recipe)
    return {"message": "Recipe updated successfully"}

@router.post("/recipe/{recipe_id}/rate")
def rate_recipe(
    recipe_id: int,
    rating_data: ratingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    existing_rating = db.query(models.Rating).filter(
        models.Rating.recipe_id == recipe_id,
        models.Rating.user_id == current_user.id
    ).first()

    if existing_rating:
        existing_rating.rating = rating_data.rating
    else:
        new_rating = Rating(
            user_id=current_user.id,
            recipe_id=recipe_id,
            rating=rating_data.rating
        )
        db.add(new_rating)

        # ✅ שליחת מייל לבעל המתכון רק בדירוג חדש
        if recipe.creator and recipe.creator.email:
            send_rating_notification_email(
                to_email=recipe.creator.email,
                recipe_title=recipe.title,
                rating=rating_data.rating
            )

    db.commit()
    return {"message": "Rating submitted successfully"}


@router.get("/{recipe_id}/average-rating")
def get_average_rating(recipe_id = int, db: Session = Depends(get_db)):
    
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code = 404, detail = "Recipe not found")
    
    avg = db.query(func.avg(Rating.rating)).filter(Recipe.id == recipe_id).scalar()

    return {
        "recipe_id": recipe_id,
        "average_rating": round(avg, 1) if avg is not None else None
    }



@router.get("/search", response_model=list[RecipeResponse])
def search_recipes(
    title: str = Query(None),
    ingredient: str = Query(None),
    creator_name: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Recipe).filter(models.Recipe.is_public == True)

    if title:
        query = query.filter(models.Recipe.title.ilike(f"%{title}%"))
    
    if ingredient:
        query = query.filter(models.Recipe.ingredients.ilike(f"%{ingredient}%"))
    
    if creator_name:
        query = query.join(models.User).filter(models.User.username.ilike(f"%{creator_name}%"))

    recipes = query.all()

    result = []
    for recipe in recipes:
        creator = recipe.creator.username if recipe.creator else "Unknown"
        result.append(RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            share_token=recipe.share_token,
            is_public=recipe.is_public,
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
            creator_name=creator
        ))

    return result


@router.get("/top-rated", response_model=list[RecipeResponse])
def get_top_rated_recipes(db: Session = Depends(get_db)):
    recipes = (
        db.query(models.Recipe)
        .join(models.Rating, models.Rating.recipe_id == models.Recipe.id)
        .filter(models.Recipe.is_public == True)
        .group_by(models.Recipe.id)
        .order_by(func.avg(models.Rating.rating).desc())
        .all()
    )

    result = []
    for recipe in recipes:
        creator_name = recipe.creator.username if recipe.creator else "Unknown"
        result.append(RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
            creator_name=creator_name,
        ))

    return result


@router.post("/upload-image")
def upload_recipe_image(file: UploadFile = File(...)):
    image_url = upload_image_to_cloudinary(file.file)
    return {"image_url": image_url}


@router.get("/share/{token}")
def get_shared_recipe(token: str, db: Session = Depends(get_db)):
    recipe = (
        db.query(models.Recipe)
        .filter_by(share_token=token, is_public=True)
        .first()
    )

    if not recipe:
        raise HTTPException(status_code=404, detail="Shared recipe not found")

    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "image_url": recipe.image_url,
        "video_url": recipe.video_url,
        "created_at": recipe.created_at.isoformat() if recipe.created_at else None,
        "share_token": str(recipe.share_token),
        "creator_name": recipe.creator.username if recipe.creator else "Unknown"
    }


@router.post("/share/send")
def send_recipe_via_email(
    recipe_id: int,
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    recipe = (db.query(Recipe).options(joinedload(Recipe.creator)).filter(Recipe.id == recipe_id, Recipe.is_public == True).first()
)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    background_tasks.add_task(send_recipe_email_with_pdf, email, recipe)
    return {"message": "Email is being sent"}



@router.get("/sorted/top-rated")
def get_top_rated_recipes(page: int = 1, db: Session = Depends(get_db)):
    recipes = recipe_services.get_top_rated_recipes(db)
    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            is_public=r.is_public,
            average_rating=round(avg_rating, 2) if avg_rating else None
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}


@router.get("/sorted/random")
def get_random_recipes(page: int = 1, db: Session = Depends(get_db)):
    recipes = (
        db.query(Recipe)
        .filter(Recipe.is_public == True)
        .options(joinedload(Recipe.creator))
        .all()
    )
    random.shuffle(recipes)
    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            is_public=r.is_public,
            average_rating=round(avg_rating, 2) if avg_rating else None
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}


@router.get("/sorted/recent")
def get_recent_recipes(page: int = 1, db: Session = Depends(get_db)):
    recipes = (
        db.query(Recipe)
        .filter(Recipe.is_public == True)
        .options(joinedload(Recipe.creator))
        .order_by(Recipe.created_at.desc())
        .all()
    )

    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            is_public=r.is_public,
            average_rating=round(avg_rating, 2) if avg_rating else None
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}



@router.get("/sorted/favorited")
def get_most_favorited_recipes(page: int = 1, db: Session = Depends(get_db)):
    recipes = recipe_services.get_most_favorited_recipes(db)

    if not recipes:
        recipes = recipe_services.get_top_rated_recipes(db)

    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            is_public=r.is_public,
            average_rating=round(avg_rating, 2) if avg_rating else None
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}



@router.get("/public-random", response_model=list[RecipeResponse])
def get_random_public_recipes(db: Session = Depends(get_db)):
    all_public = (
        db.query(Recipe)
        .options(joinedload(Recipe.creator))
        .filter(Recipe.is_public == True)
        .all()
    )

    random_recipes = random.sample(all_public, min(len(all_public), 8))

    results = []
    for r in random_recipes:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(
            RecipeResponse(
                id=r.id,
                title=r.title,
                description=r.description,
                ingredients=r.ingredients,
                instructions=r.instructions,
                image_url=r.image_url,
                video_url=r.video_url,
                created_at=r.created_at.isoformat() if r.created_at else None,
                creator_name=r.creator.username if r.creator else "לא ידוע",
                share_token=r.share_token,
                is_public=r.is_public,
                average_rating=round(avg_rating, 2) if avg_rating else None  # ⬅️ זה השדה החדש
            )
        )

    return results