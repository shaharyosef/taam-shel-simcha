from fastapi import APIRouter, Depends, Query, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from app.services.users_services import get_current_user, admin_required 
from app.schemas.recipe_schema import RecipeAdminUpdate, ratingRequest, RecipeUpdate, RecipeResponse, ShareRequest, DifficultyLevel
from fastapi import UploadFile, File
from typing import Optional
from app.services import recipe_services


PAGE_SIZE = 8

router = APIRouter(prefix="/recipes", tags=["recipes"])



@router.get("/", response_model=dict)
def get_all_recipes(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = PAGE_SIZE
):
    return recipe_services.get_all_recipes(db, page, page_size)



@router.get("/public-random", response_model=list[RecipeResponse])
def get_random_public_recipes(db: Session = Depends(get_db)):
    return recipe_services.get_random_public_recipes(db)



@router.post("/add")
def add_recipe(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    ingredients: str = Form(...),
    instructions: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    is_public: bool = Form(...),
    current_user: User = Depends(get_current_user),
    difficulty: DifficultyLevel = Form(...),
    prep_time: str = Form(...)
):
    return recipe_services.create_recipe(
        db=db,
        title=title,
        description=description,
        ingredients=ingredients,
        instructions=instructions,
        video_url=video_url,
        image=image,
        is_public=is_public,
        difficulty=difficulty,
        prep_time=prep_time,
        current_user=current_user
    )



@router.get("/public/{recipe_id}", response_model=RecipeResponse)
def get_public_recipe(recipe_id: int, db: Session = Depends(get_db)):
    return recipe_services.get_public_recipe(recipe_id, db)
    

@router.get("/me", response_model=list[RecipeResponse])
def get_my_recipes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return recipe_services.get_my_recipes(db, current_user)
    


@router.delete("/{recipe_id}")
def delete_recipe( recipe_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return recipe_services.delete_recipe(db, recipe_id, current_user)
    


@router.put("/{recipe_id}")
def update_recipe(recipe_id: int,updated_data: RecipeUpdate,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return recipe_services.update_recipe(db, recipe_id, updated_data, current_user)



@router.get("/search", response_model=list[RecipeResponse])
def search_recipes(title: Optional[str] = Query(default=None),ingredient: Optional[str] = Query(default=None),
    creator_name: Optional[str] = Query(default=None),db: Session = Depends(get_db)):
    return recipe_services.search_recipes(title, ingredient, creator_name, db)
    


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe_by_id(recipe_id: int,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return recipe_services.get_recipe_by_id(recipe_id, db, current_user)
    




@router.get("/admin/recipes", response_model=list[RecipeResponse])
def get_all_recipes_admin(current_user: User = Depends(admin_required),db: Session = Depends(get_db)):
    return recipe_services.get_all_recipes_admin(current_user, db)
    

@router.delete("/admin/recipes/{recipe_id}")
def delete_recipe_admin(recipe_id: int,db: Session = Depends(get_db),current_user: User = Depends(admin_required)):
    return recipe_services.delete_recipe_admin(recipe_id, db, current_user)

@router.put("/admin/recipes/{recipe_id}")
def update_recipe_admin(recipe_id: int,updated_data: RecipeAdminUpdate,db: Session = Depends(get_db),current_user: User = Depends(admin_required)):
    return recipe_services.update_recipe_admin(recipe_id, updated_data, db, current_user)


@router.post("/recipe/{recipe_id}/rate")
def rate_recipe(recipe_id: int,rating_data: ratingRequest,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return recipe_services.rate_recipe(recipe_id, rating_data, db, current_user)
    

@router.get("/{recipe_id}/average-rating")
def get_average_rating(recipe_id: int, db: Session = Depends(get_db)):
    return recipe_services.get_average_rating(recipe_id, db)



@router.get("/top-rated", response_model=list[RecipeResponse])
def get_top_rated_recipes(db: Session = Depends(get_db)):
    return recipe_services.get_top_rated_recipes(db)


@router.post("/upload-image")
def upload_recipe_image(file: UploadFile = File(...)):
    return recipe_services.upload_recipe_image(file)


@router.get("/share/{token}")
def get_shared_recipe(token: str, db: Session = Depends(get_db)):
   return recipe_services.get_shared_recipe(token, db)


@router.post("/share/send")
def send_recipe_via_email(data: ShareRequest,background_tasks: BackgroundTasks,db: Session = Depends(get_db)):
    return recipe_services.send_recipe_via_email(data, background_tasks, db)


@router.get("/sorted/top-rated")
def get_top_rated_recipes(db: Session = Depends(get_db),page: int = 1):
    return recipe_services.get_top_rated_recipes( db, page)


@router.get("/sorted/random")
def get_random_recipes(db: Session = Depends(get_db), page: int = 1,):
    return recipe_services.get_random_recipes(db, page)


@router.get("/sorted/recent")
def get_recent_recipes(db: Session = Depends(get_db), page: int = 1):
    return recipe_services.get_recent_recipes(db, page)



@router.get("/sorted/favorited")
def get_most_favorited_recipes(db: Session = Depends(get_db), page: int = 1):
    return recipe_services.get_most_favorited_recipes(db, page)


@router.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db),current_user: User = Depends(admin_required)):
    return recipe_services.get_admin_stats(db, current_user)

