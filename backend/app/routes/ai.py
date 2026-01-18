from fastapi import APIRouter, HTTPException
from app.services.ai_service import request_ai_recipe, request_ai_chat_recipe
from pydantic import BaseModel
from app.schemas.ai_schema import RecipeAIResponse, ChatRecipeRequest, ChatRecipeResponse


router = APIRouter()

class AIRequest(BaseModel):
    ingredients_text: str

@router.post("/ai/recipe", response_model=RecipeAIResponse)
async def generate_ai_recipe(data: AIRequest):
    try:
        print("🔍 קיבלנו מהפרונט:", data.ingredients_text)
        result = await request_ai_recipe(data.ingredients_text)
        print("✅ קיבלנו תשובה מה-AI:", result)

        return RecipeAIResponse(
        title=result["title"],
        ingredients=result["ingredients"],
        ingredients_text=result["ingredients_text"],
        instructions=result["instructions"],
    )

    except Exception as e:
        print("❌ שגיאה ב-AI:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/chat-recipe", response_model=ChatRecipeResponse)
async def chat_recipe(payload: ChatRecipeRequest):
    try:
        # payload.messages הם Pydantic objects -> להפוך ל-dict
        messages = [{"role": m.role, "content": m.content} for m in payload.messages]
        result = await request_ai_chat_recipe(messages)
        return ChatRecipeResponse(**result)
    except Exception as e:
        print("❌ שגיאה בבאקנד chat-recipe:", e)
        raise HTTPException(status_code=500, detail=str(e))