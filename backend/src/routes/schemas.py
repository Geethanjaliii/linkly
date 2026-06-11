from pydantic import BaseModel, EmailStr, Field, HttpUrl
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    profile_picture: str | None = None

    class Config:
        from_attributes = True

class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str
    code_verifier: str

class UrlCreate(BaseModel):
    original_url: HttpUrl

class UrlUpdate(BaseModel):
    original_url: HttpUrl

class UrlResponse(BaseModel):

    id: int
    original_url: str
    short_code: str
    short_url: str
    click_count: int
    created_at: datetime

    class Config:
        from_attributes = True

