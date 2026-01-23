from pydantic import BaseModel,Field
from typing import List, Literal, Optional
# backend/app/schemas/ai_schema.py

class RecipeAIResponse(BaseModel):
    title: str
    ingredients: str
    ingredients_text: str
    instructions: str


Role = Literal["user", "assistant"]

class ChatMessage(BaseModel):
    role: Role
    content: str = Field(min_length=1, max_length=6000)

class ChatRecipeRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1, max_length=500)

class ChatRecipeResponse(BaseModel):
    type: Literal["question", "recipe", "confirm"]
    done: bool
    reply: str
    title: Optional[str] = None