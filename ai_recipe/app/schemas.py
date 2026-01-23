from pydantic import BaseModel,Field
from typing import List, Literal, Optional

class RecipeRequest(BaseModel):
    ingredients_text: str

class RecipeResponse(BaseModel):
    title: str
    ingredients: str
    ingredients_text: str  # ⬅️ חדש – הטקסט הגולמי של המצרכים
    instructions: str


Role = Literal["user", "assistant"]

class ChatMessage(BaseModel):
    role: Role
    content: str = Field(min_length=1, max_length=6000)

class ChatRecipeRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1, max_length=500)

class ChatRecipeResponse(BaseModel):
    type: Literal["question", "confirm", "recipe"]
    done: bool
    reply: str
    title: Optional[str] = None