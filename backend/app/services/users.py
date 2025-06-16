from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from dotenv import load_dotenv
import os
import datetime

# טוען את משתני הסביבה
load_dotenv()

# 🔑 קונפיג של JWT
SECRET_KEY = os.getenv("SECRET_KEY") 
ALGORITHM = "HS256"

print("🔑 SECRET_KEY:", SECRET_KEY)


# 📥 טופס התחברות של OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 🔐 קונטקסט להצפנת סיסמאות
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ הצפנת סיסמה
def hash_password(password: str):
    return pwd_context.hash(password)

# ✅ אימות סיסמה מול מוצפנת
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# ✅ יצירת טוקן עם user_id כ־sub
def create_access_token(data: dict, expires_delta: int = 60):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta)
    to_encode["exp"] = expire
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ✅ שליפת המשתמש לפי הטוקן
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


def create_reset_token(user_id: int, expires_minutes: int = 15):
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_minutes)
    to_encode = {"sub": str(user_id), "exp": expire}
    reset_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return reset_token


def admin_required(
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
