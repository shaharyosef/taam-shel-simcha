from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import user_schema 
from app.models import User
import os
from dotenv import load_dotenv
from app.services import users_services
load_dotenv()

frontend_url = os.getenv("FRONTEND_URL")

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
def signup(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    return users_services.signup(user, db)


@router.post("/login")
def login(user: user_schema.UserLogin, db: Session = Depends(get_db)):
    return users_services.login(user, db)


@router.put("/profile")
def update_profile(user_update: user_schema.UserUpdate,db: Session = Depends(get_db),current_user: User = Depends(users_services.get_current_user)):
    return users_services.update_profile(user_update, db, current_user)


@router.get("/me", response_model=user_schema.UserResponse)
def read_current_user(current_user: User = Depends(users_services.get_current_user)):
    return users_services.read_current_user(current_user)


@router.post("/forgot-password")
def forgot_password(request: user_schema.ForgotPasswordRequest,db: Session = Depends(get_db)):
    return users_services.forgot_password(request, db)


@router.post("/reset-password")
def reset_password(request: user_schema.ResetPasswordRequest,db: Session = Depends(get_db)):
    return users_services.reset_password(request, db)


@router.get("/admin/users", response_model=list[user_schema.UserResponse])  # או תיצור סכמת תגובה נפרדת אם צריך
def get_all_users(current_user: User = Depends(users_services.admin_required),db: Session = Depends(get_db)):
    return users_services.get_all_users(current_user, db)

@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int,current_user: User = Depends(users_services.admin_required),db: Session = Depends(get_db)):
    return users_services.delete_user(user_id, current_user, db)


@router.put("/update-profile-image")
def update_profile_image(image_url: str,db: Session = Depends(get_db),current_user: User = Depends(users_services.get_current_user)):
    return users_services.update_profile_image(image_url, db, current_user)


