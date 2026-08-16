from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.user import UserRole


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
