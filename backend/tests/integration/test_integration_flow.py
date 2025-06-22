from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import random

# הגדרת בסיס נתונים זמני
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# החלפת תלות במסד נתונים בבדיקה
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

random_int = random.randint(1000, 9999)

username = f"testuser{random_int}"
email = f"test{random_int}@example.com"
update_username = f"updatetestuser{random_int}"


def test_full_integration_flow():
    client = TestClient(app)

    # 1. הרשמה
    
    
    register_data = {
        "username": username,
        "email": email,
        "password": "test1234"
    }
    res = client.post("/auth/signup", json=register_data)
    assert res.status_code == 200

    # 2. התחברות
    login_data = {
        "email": email,
        "password": "test1234"
    }
    res = client.post("/auth/login", json=login_data)
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. הוספת מתכון
    recipe_data = {
    "title": "פסטה אינטגרציה",
    "description": "מתכון אינטגרציה",
    "ingredients": "פסטה, רוטב",
    "instructions": "לבשל הכל",
    "is_public": True,
    "difficulty": "קל",  # 🟢 חובה - מהEnum שלך
    "prep_time": "20 דקות"  # 🟢 חובה
}

    res = client.post("/recipes/add", data=recipe_data, headers=headers)
    print(res.json())
    assert res.status_code == 200
    recipe_id = res.json()["recipe_id"]

    # 4. הוספת תגובה
    comment_data = {"content": "נשמע טעים מאוד!"}
    res = client.post(f"/comments/{recipe_id}", json=comment_data, headers=headers)
    assert res.status_code == 200
    comment_id = res.json()["id"]


    # 6. עריכת מתכון
    update_recipe = {"title": "פסטה חדשה", "description": "עודכן"}
    res = client.put(f"/recipes/{recipe_id}", json=update_recipe, headers=headers)
    assert res.status_code == 200

    # 7. מחיקת מתכון
    res = client.delete(f"/recipes/{recipe_id}", headers=headers)
    assert res.status_code == 200

    # 8. שינוי פרטי המשתמש
    update_user = {"username": update_username, "password": "newpass123"}
    res = client.put("/auth/profile", json=update_user, headers=headers)
    assert res.status_code == 200

    # 9. הוספת מתכון נוסף
    second_recipe = {
        "title": "עוגה טעימה",
        "description": "עוגת שוקולד",
        "ingredients": "קמח, ביצים, שוקולד",
        "instructions": "לאפות בתנור",
        "is_public": True,
        "difficulty": "קל",  # 🟢 חובה - מהEnum שלך
        "prep_time": "20 דקות"
    }
    res = client.post("/recipes/add", data=second_recipe, headers=headers)
    assert res.status_code == 200
    second_id = res.json()["recipe_id"]

    # 10. הוספת למועדפים
    res = client.post(f"/favorites/{second_id}", headers=headers)
    assert res.status_code == 200
