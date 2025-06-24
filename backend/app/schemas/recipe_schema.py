from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from enum import Enum


class DifficultyLevel(str, Enum):
    קל = "קל"
    בינוני = "בינוני"
    קשה = "קשה"


class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: str  
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_public: bool = True
    difficulty: DifficultyLevel  
    prep_time: str

    class Config:
        orm_mode = True  

class RecipeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    ingredients: str
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    created_at: Optional[str] = None
    creator_name: str  
    share_token: UUID  
    is_public: bool
    average_rating: Optional[float] = None
    user_id: int
    difficulty: DifficultyLevel  
    prep_time: str

    class Config:
        orm_mode = True
        from_attributes = True



class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_public: Optional[bool] = None
    difficulty: Optional[DifficultyLevel] = None  
    prep_time: Optional[str] = None

    class Config:
        from_attributes = True

class RecipeAdminUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    ingredients: Optional[str]
    instructions: Optional[str]
    image_url: Optional[str]
    video_url: Optional[str]
    is_public: Optional[bool]
    difficulty: Optional[DifficultyLevel] = None  # 🆕

class ratingRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rate from 1-5")

class ShareRequest(BaseModel):
    recipe_id: int
    email: str
