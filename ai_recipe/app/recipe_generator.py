import json
import re
from urllib import response
from openai import OpenAI
from app.config import OPENAI_API_KEY
from typing import List, Dict, Tuple, Optional

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_recipe_with_openai(ingredients: str) -> dict:
    prompt = f"""
You are a professional Israeli home chef and AI recipe generator.

Your task is to create a realistic, tasty home-style recipe using only the ingredients provided by the user.

The user wrote this free-text ingredients list:
"{ingredients}"
"""
    prompt += """
Instructions:
1. Understand the ingredients, even if written in Hebrew with typos or informal phrasing.
2. Remove any items that are NOT edible or not food-related (e.g., soap, batteries, shampoo, paper, laptop, etc.).
3. Create ONE complete dish using only the remaining edible ingredients (you may add basic pantry items like salt, pepper, oil, water).
4. If ALL provided items are non-edible / not food-related, return a valid JSON object that asks the user to provide edible ingredients.
5. The output MUST be in Hebrew.
6. The output MUST be a valid JSON object and nothing else.

The JSON format MUST be exactly:

{
  "title": "<short appealing Hebrew dish name OR a short Hebrew message asking for edible ingredients>",
  "ingredients": "<the original ingredients string exactly as received>",
  "ingredients_text": "- <ingredient with quantity>\\n- <ingredient with quantity>\\n...",
  "instructions": "1. <step one>\\n2. <step two>\\n3. <step three>\\n..."
}

Rules:
- The recipe must be realistic and something a person can actually cook.
- Do NOT invent main ingredients that were not mentioned by the user (except basic pantry items: salt, pepper, oil, water).
- Any ingredients identified as non-edible or not food-related must be completely excluded from the recipe output and must not appear in the title, ingredients_text, or instructions.
- If ALL items are non-edible, set:
  - "title" to something like: "נא להזין רכיבים אכילים להכנת מתכון"
  - "ingredients_text" to an empty string ""
  - "instructions" to an empty string ""
- The title should be a short, appealing Hebrew dish name (or the short request message if no edible ingredients exist).
- Ingredients must include quantities (כוס, כף, יחידה, גרם וכו').
- Instructions must be clear, short, and written as numbered steps.
- Do not include explanations, notes, emojis or extra text — only the JSON in the exact format.
"""



    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.7,
        max_tokens=700
    )

    content = response.choices[0].message.content
    recipe = json.loads(content)
    return recipe

   


TYPE_RE = re.compile(r"\[\[TYPE:(QUESTION|RECIPE)\]\]\s*$", re.IGNORECASE)

CHATBOT_SYSTEM_PROMPT = """
You are a warm, professional AI culinary concierge for a home-cooking website called "טעם של שמחה".

Your goal:
Help the user decide what to cook based on mood, occasion, and preferences,
then generate ONE complete, realistic, home-style recipe.

General behavior:
- Speak naturally, friendly, and confidently, like a personal chef.
- Respond in Hebrew only.
- Do NOT ask for ingredients unless the user explicitly mentions having ingredients.
- Choose common, accessible supermarket ingredients on your own.
- Keep everything realistic and home-cook friendly.

Conversation rules:
- If important information is missing, ask ONLY ONE short and clear question.
- Never ask more than one question in a single response.
- If the user answers your question, continue directly to recipe generation.
- Do not repeat questions that were already answered in the conversation.

Defaults (if the user did not specify):
- Servings: 2
- Cooking time: around 30 minutes
- Difficulty: easy
- Spice level: mild

Only ask a question if truly necessary, such as:
- Dietary restrictions or allergies
- Strong dislikes (e.g., no fish, no spicy)
- Time limitation if the user indicates urgency

When generating a recipe:
- Generate ONE full recipe only.
- The FIRST line MUST be ONLY the dish name (no emojis, no explanations).
- The dish name should be short, appealing, and sound like a real menu item.

Recipe structure (in this exact order, in plain text):
1) Dish name (first line only)
2) Short description (1–2 sentences explaining why it fits the occasion)
3) Cooking time + servings
4) Ingredients list with quantities
5) Step-by-step instructions (numbered)
6) A small plating or serving tip
7) 1–2 optional variations (e.g., lighter / richer / vegetarian)

Tone & style:
- Warm, inviting, and slightly elegant (especially for romantic occasions).
- Avoid generic phrases like “מצוין! הנה מתכון…”.
- Avoid excessive enthusiasm or emojis.

IMPORTANT OUTPUT TAG RULE (for backend parsing):
- If you are asking a question (and NOT providing a full recipe), append exactly:
  [[TYPE:QUESTION]]
- If you are providing a full recipe, append exactly:
  [[TYPE:RECIPE]]
- Do not add any other tags or explanations.
""".strip()


def _extract_type_and_clean(text: str) -> Tuple[str, str]:
    m = TYPE_RE.search(text or "")
    if not m:
        # fallback: if missing tag, treat as question for safety
        return "question", (text or "").strip()

    raw = m.group(1).upper()
    cleaned = TYPE_RE.sub("", text).strip()
    return ("recipe" if raw == "RECIPE" else "question"), cleaned


def _extract_title_if_recipe(cleaned_text: str, msg_type: str) -> Optional[str]:
    if msg_type != "recipe":
        return None
    for line in cleaned_text.splitlines():
        line = line.strip()
        if line:
            return line[:120]
    return None


def generate_chat_recipe_with_openai(messages: List[Dict[str, str]]) -> Dict[str, object]:
    """
    messages: full conversation history from frontend:
    [
      {"role":"user","content":"..."},
      {"role":"assistant","content":"..."},
      ...
    ]
    Returns:
    {
      "type": "question"|"recipe",
      "done": bool,
      "title": str|None,
      "reply": str
    }
    """
    # You can receive "all history", but send only the last N to the model:
    MAX_TO_MODEL = 30
    trimmed = messages[-MAX_TO_MODEL:]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": CHATBOT_SYSTEM_PROMPT},
            *trimmed
        ],
        temperature=0.7,
        max_tokens=900
    )

    text = (response.choices[0].message.content or "").strip()
    msg_type, cleaned = _extract_type_and_clean(text)
    title = _extract_title_if_recipe(cleaned, msg_type)

    return {
        "type": msg_type,
        "done": (msg_type == "recipe"),
        "title": title,
        "reply": cleaned
    }