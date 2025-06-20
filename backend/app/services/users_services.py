from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import datetime
from app.db.database import get_db
from app.models import User
from app import models
from app.schemas.user_schema import UserCreate,UserLogin, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest
from app.services.email import send_reset_email



# טוען את משתני הסביבה
load_dotenv()

# 🔑 קונפיג של JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# 📥 טופס התחברות של OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 🔐 קונטקסט להצפנת סיסמאות
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ הצפנת סיסמה
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# ✅ אימות סיסמה מול מוצפנת
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ✅ יצירת טוקן עם user_id כ־sub
def create_access_token(data: dict, expires_delta: int = 60) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ יצירת טוקן איפוס סיסמה
def create_reset_token(user_id: int, expires_minutes: int = 15) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_minutes)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ שליפת המשתמש הנוכחי לפי הטוקן
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

# ✅ דרישה להרשאת אדמין
def admin_required(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

# ✅ הרשמה למערכת
def signup(user: UserCreate, db: Session) -> dict:
    email = user.email.lower()
    
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pw = hash_password(user.password)

    new_user = models.User(
        email=email,
        password=hashed_pw,
        username=user.username,
        wants_emails=user.wants_emails
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "user_id": new_user.id}

def login(user: UserLogin, db: Session):
    
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


def update_profile(user_update: UserUpdate,db: Session ,current_user: User ):
    # אם נשלח שם משתמש – נעדכן
    if user_update.username:
        existing_username = db.query(User).filter(
            User.username == user_update.username,
            User.id != current_user.id
        ).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username

    if user_update.password:
        current_user.password = hash_password(user_update.password)

    if user_update.wants_emails is not None:
        current_user.wants_emails = user_update.wants_emails

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}


def read_current_user(current_user: User):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at,
        "wants_emails": current_user.wants_emails,
        "profile_image_url": current_user.profile_image_url,
        "is_admin": current_user.is_admin
    }

def forgot_password(request: ForgotPasswordRequest, db: Session):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = create_reset_token(user.id)


    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    send_reset_email(user.email, reset_link)

    return {"message": "If this email exists, a reset link was sent"}


def reset_password(request: ResetPasswordRequest,db: Session):
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


def get_all_users(current_user: User ,db: Session):
    return db.query(User).all()


def delete_user(user_id: int,current_user: User ,db: Session ):
    user_to_delete = db.query(User).filter(User.id == user_id).first()

    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")

    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Admin cannot delete themselves")

    db.delete(user_to_delete)
    db.commit()
    return {"message": f"User with ID {user_id} deleted successfully"}


def update_profile_image(image_url: str, db: Session , current_user: User):
    current_user.profile_image_url = image_url
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile image updated successfully", "image_url": image_url}