from sqlalchemy import text
from src.database.connection import engine

def run_migration():
    print("Starting SQL schema migration...")
    commands = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;",
        "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"
    ]
    with engine.connect() as conn:
        for cmd in commands:
            print(f"Executing: {cmd}")
            try:
                conn.execute(text(cmd))
                conn.commit()
                print("Command executed successfully!")
            except Exception as e:
                print(f"Error executing command: {e}")
                
    print("SQL schema migration process finished!")

if __name__ == "__main__":
    run_migration()
