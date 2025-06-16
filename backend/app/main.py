from fastapi import FastAPI
from app.db.database import engine
from app.models import Base
from app.routes import users, favorites, recipes, comments, ai
from contextlib import asynccontextmanager
from fastapi.openapi.utils import get_openapi  # ✅ חדש
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    import time
    from sqlalchemy.exc import OperationalError

    # ננסה עד 10 פעמים להתחבר (כל פעם נחכה חצי שנייה)
    for _ in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except OperationalError:
            time.sleep(0.5)

    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # זה הפרונט שלך ב־React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# ✅ הוספת הראוטים
app.include_router(users.router)
app.include_router(recipes.router)
app.include_router(favorites.router) 
app.include_router(comments.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "טעם של שמחה עולה!"}

# ✅ Swagger - הגדרת Bearer token ב-Authorize
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="טעם של שמחה",
        version="1.0",
        description="API לניהול משתמשים ומתכונים",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
    "OAuth2PasswordBearer": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"OAuth2PasswordBearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
