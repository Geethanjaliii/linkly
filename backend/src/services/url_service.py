import string
import secrets
from sqlalchemy.orm import Session
from src.models import models

def generate_unique_short_code(db: Session) -> str:
    alphabet = string.ascii_letters + string.digits
    while True:
        # Generate a code of random length between 6 and 8
        length = secrets.choice([6, 7, 8])
        code = "".join(secrets.choice(alphabet) for _ in range(length))
        
        # Check uniqueness in the database
        exists = db.query(models.URL).filter(models.URL.short_code == code).first()
        if not exists:
            return code

