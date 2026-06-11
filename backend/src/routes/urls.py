from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from typing import List
from src.database.connection import get_db
from src.models import models
from src.routes import schemas
from src.routes.auth import get_current_user
from src.services import url_service

router = APIRouter(prefix="", tags=["urls"])

@router.post("/shorten", response_model=schemas.UrlResponse, status_code=status.HTTP_201_CREATED)
def shorten_url(
    url_in: schemas.UrlCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Convert Pydantic HttpUrl to string
    original_url_str = str(url_in.original_url)
    
    # Generate unique short code
    short_code = url_service.generate_unique_short_code(db)
    
    # Save URL to database
    db_url = models.URL(
        user_id=current_user.id,
        original_url=original_url_str,
        short_code=short_code,
        click_count=0
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    
    # Dynamically build the short URL based on request host
    base_url = str(request.base_url).rstrip("/")
    short_url = f"{base_url}/{db_url.short_code}"
    
    return schemas.UrlResponse(
        id=db_url.id,
        original_url=db_url.original_url,
        short_code=db_url.short_code,
        short_url=short_url,
        click_count=db_url.click_count,
        created_at=db_url.created_at
    )

@router.get("/urls", response_model=List[schemas.UrlResponse])
def get_user_urls(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Query only the URLs belonging to the current user
    user_urls = db.query(models.URL).filter(models.URL.user_id == current_user.id).all()
    
    base_url = str(request.base_url).rstrip("/")
    
    response_urls = []
    for db_url in user_urls:
        short_url = f"{base_url}/{db_url.short_code}"
        response_urls.append(
            schemas.UrlResponse(
                id=db_url.id,
                original_url=db_url.original_url,
                short_code=db_url.short_code,
                short_url=short_url,
                click_count=db_url.click_count,
                created_at=db_url.created_at
            )
        )
        
    return response_urls

@router.get("/url/{id}", response_model=schemas.UrlResponse)
def get_url(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_url = db.query(models.URL).filter(models.URL.id == id).first()
    if not db_url or db_url.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found"
        )
    
    base_url = str(request.base_url).rstrip("/")
    short_url = f"{base_url}/{db_url.short_code}"
    
    return schemas.UrlResponse(
        id=db_url.id,
        original_url=db_url.original_url,
        short_code=db_url.short_code,
        short_url=short_url,
        click_count=db_url.click_count,
        created_at=db_url.created_at
    )

@router.put("/url/{id}", response_model=schemas.UrlResponse)
def update_url(
    id: int,
    url_in: schemas.UrlUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_url = db.query(models.URL).filter(models.URL.id == id).first()
    if not db_url or db_url.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found"
        )
    
    db_url.original_url = str(url_in.original_url)
    db.commit()
    db.refresh(db_url)
    
    base_url = str(request.base_url).rstrip("/")
    short_url = f"{base_url}/{db_url.short_code}"
    
    return schemas.UrlResponse(
        id=db_url.id,
        original_url=db_url.original_url,
        short_code=db_url.short_code,
        short_url=short_url,
        click_count=db_url.click_count,
        created_at=db_url.created_at
    )

@router.delete("/url/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_url(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_url = db.query(models.URL).filter(models.URL.id == id).first()
    if not db_url or db_url.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found"
        )
    
    db.delete(db_url)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

