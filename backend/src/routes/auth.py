from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import requests
from src.config import settings
from src.database.connection import get_db
from src.models import models
from src.routes import schemas
from src.services import auth_service

router = APIRouter(prefix="", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth_service.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pwd = auth_service.get_password_hash(user_in.password)
    db_user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/auth/google", response_model=schemas.Token)
def auth_google(auth_in: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    # Exchange authorization code with PKCE verifier for access token
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": auth_in.code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code_verifier": auth_in.code_verifier,
        "redirect_uri": auth_in.redirect_uri,
        "grant_type": "authorization_code",
    }
    
    try:
        response = requests.post(token_url, data=data)
        response_data = response.json()
        if not response.ok:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=response_data.get("error_description") or "Google token exchange failed"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to communicate with Google token endpoint: {str(e)}"
        )
        
    access_token = response_data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google access token missing in response"
        )
        
    # Fetch user details
    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        userinfo_response = requests.get(userinfo_url, headers=headers)
        userinfo = userinfo_response.json()
        if not userinfo_response.ok:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve Google user profile"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to communicate with Google userinfo: {str(e)}"
        )
        
    google_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name") or email.split("@")[0]
    picture = userinfo.get("picture")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not provide email address"
        )
        
    # Find user by email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Create user automatically if first login
        user = models.User(
            name=name,
            email=email,
            hashed_password=None,
            google_id=google_id,
            profile_picture=picture
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Link Google ID and update profile picture if needed
        updated = False
        if not user.google_id:
            user.google_id = google_id
            updated = True
        if user.profile_picture != picture:
            user.profile_picture = picture
            updated = True
        if updated:
            db.commit()
            db.refresh(user)
            
    # Generate Linkly JWT
    jwt_token = auth_service.create_access_token(data={"sub": user.email})
    return {"access_token": jwt_token, "token_type": "bearer"}



