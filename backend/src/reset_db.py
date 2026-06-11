from src.database.connection import engine, Base
from src.models import models

def reset_database():
    print("Connecting to database and dropping existing tables to update schema...")
    # Drop all tables managed by Base metadata
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped successfully!")
    
    # Recreate tables with clean schema
    print("Recreating tables with Phase 2 schema...")
    Base.metadata.create_all(bind=engine)
    print("Database reset completed successfully!")

if __name__ == "__main__":
    reset_database()
