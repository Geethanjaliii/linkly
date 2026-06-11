from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.models import models

router = APIRouter(prefix="", tags=["redirect"])

@router.get("/{short_code}", response_class=RedirectResponse)
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    # Query database for the short code
    db_url = db.query(models.URL).filter(models.URL.short_code == short_code).first()
    
    if not db_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found or has expired"
        )
    
    # Increment click count
    db_url.click_count += 1
    db.add(db_url)
    db.commit()
    
    # Redirect to the original URL
    return RedirectResponse(url=db_url.original_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
