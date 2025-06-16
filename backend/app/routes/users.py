from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app import models
from app.schemas.user_schema import UserCreate, UserLogin, TokenResponse, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest, UserResponse
from app.services.users import hash_password, verify_password, create_access_token, get_current_user, hash_password, create_reset_token, admin_required, SECRET_KEY, ALGORITHM
from app.models import User
from jose import JWTError, jwt
from app.services.email import send_reset_email
import os
from dotenv import load_dotenv
load_dotenv()

frontend_url = os.getenv("FRONTEND_URL")

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    email = user.email.lower()
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pw = hash_password(user.password)

    new_user = models.User(
        email=user.email,
        password=hashed_pw,
        username=user.username,
        wants_emails=user.wants_emails  # ✅ הוספה כאן
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    
    db_user = db.query(User).filter(User.email == user.email.lower()).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(db_user.id)})

    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.put("/profile")
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # אם נשלח שם משתמש – נעדכן
    if user_update.username:
        existing_username = db.query(User).filter(
            User.username == user_update.username,
            User.id != current_user.id
        ).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username

    # אם נשלחה סיסמה חדשה – נעדכן (עם הצפנה)
    if user_update.password:
        current_user.password = hash_password(user_update.password)

    # ✅ אם נשלח ערך לשדה wants_emails – נעדכן אותו
    if user_update.wants_emails is not None:
        current_user.wants_emails = user_update.wants_emails

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at,
        "wants_emails": current_user.wants_emails,
        "profile_image_url": current_user.profile_image_url,
    }




@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = create_reset_token(user.id)

    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    send_reset_email(user.email, reset_link)

    return {"message": "If this email exists, a reset link was sent"}


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    if request.new_password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(request.new_password)
    db.commit()

    return {"message": "Password reset successfully"}


@router.get("/admin/users", response_model=list[UserResponse])  # או תיצור סכמת תגובה נפרדת אם צריך
def get_all_users(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    return db.query(User).all()

@router.delete("/admin/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    user_to_delete = db.query(User).filter(User.id == user_id).first()

    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")

    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Admin cannot delete themselves")

    db.delete(user_to_delete)
    db.commit()
    return {"message": f"User with ID {user_id} deleted successfully"}


@router.put("/update-profile-image")
def update_profile_image(
    image_url: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.profile_image_url = image_url
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile image updated successfully", "image_url": image_url}


