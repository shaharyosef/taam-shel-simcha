import httpx

AI_SERVICE_URL = "http://ai-service:5002/generate-recipe"
AI_RECIPE_URL = "http://ai-service:5002"

async def request_ai_recipe(ingredients_text: str):
    payload = {"ingredients_text": ingredients_text}
    print("📤 שולח ל-AI:", payload)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(AI_SERVICE_URL, json=payload, timeout=25.0)
            print("📥 תשובה גולמית:", response.text)
            response.raise_for_status()
            result = response.json()  
            print("✅ JSON אחרי פיענוח:", result)
            return result

        except httpx.HTTPStatusError as e:
            print("❌ HTTPStatusError:", e.response.status_code, e.response.text)
            raise Exception(f"AI Service Error {e.response.status_code}: {e.response.text}")
        except Exception as e:
            print("❌ שגיאה כללית:", str(e))
            import traceback
            traceback.print_exc()
            raise Exception(f"שגיאה כללית: {str(e)}")


async def request_ai_chat_recipe(messages: list):
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(f"{AI_RECIPE_URL}/chat-recipe", json={"messages": messages})
        r.raise_for_status()
        return r.json()