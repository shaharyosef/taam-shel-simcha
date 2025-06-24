from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    wants_emails: bool = Field(
        default=True,
        description="האם המשתמש מעוניין לקבל מיילים עם עדכונים, הצעות ומתכונים מומלצים"
    )

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    wants_emails: Optional[bool] = Field(
        default=None,
        description="עדכון העדפה לקבלת דיוור במייל"
    )

    class Config:
        orm_mode = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_admin: bool
    created_at: datetime
    wants_emails: bool
    profile_image_url: Optional[str] = None  
    is_admin: bool   # 

    class Config:
        from_attributes = True  


