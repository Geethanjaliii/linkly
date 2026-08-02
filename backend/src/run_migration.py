from sqlalchemy import text
from src.database.connection import engine

def run_migration():
    print("Starting SQL schema migration...")
    commands = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;",
        "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;",
        """CREATE TABLE IF NOT EXISTS click_events (
            id SERIAL PRIMARY KEY,
            url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
            clicked_at TIMESTAMP,
            browser VARCHAR,
            browser_version VARCHAR,
            os VARCHAR,
            os_version VARCHAR,
            device_type VARCHAR,
            referrer VARCHAR,
            country VARCHAR,
            city VARCHAR,
            ip_hash VARCHAR
        );""",
        "CREATE INDEX IF NOT EXISTS ix_click_events_url_id ON click_events (url_id);",
        "CREATE INDEX IF NOT EXISTS ix_click_events_clicked_at ON click_events (clicked_at);"
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