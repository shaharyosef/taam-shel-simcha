from fastapi import FastAPI, HTTPException
from app.recipe_generator import  generate_recipe_with_openai, generate_chat_recipe_with_openai
from app.schemas import RecipeRequest, RecipeResponse, ChatRecipeRequest, ChatRecipeResponse

app = FastAPI()

@app.post("/generate-recipe", response_model=RecipeResponse)
def generate_recipe(data: RecipeRequest):
    print("🔍 קלט מהבקאנד:", data.ingredients_text)

    try:
        result = generate_recipe_with_openai(data.ingredients_text)
        print("✅ תשובה מה-OpenAI:", result)

        return RecipeResponse(
            title=result["title"],
            ingredients=result["ingredients"],
            ingredients_text=result["ingredients_text"],
            instructions=result["instructions"]
        )
    except Exception as e:
        print("❌ שגיאה פנימית:", str(e))
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/chat-recipe", response_model=ChatRecipeResponse)
def chat_recipe(data: ChatRecipeRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in data.messages]
        result = generate_chat_recipe_with_openai(messages)
        return ChatRecipeResponse(**result)
    except Exception as e:
        print("❌ שגיאה פנימית:", str(e))
        raise HTTPException(status_code=500, detail=str(e))