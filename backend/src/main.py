from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database.connection import engine, Base
from src.routes import auth, urls, redirect

# Auto-create tables on launch (since we are not using migrations for V1)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Linkly API",
    description="Secure URL Shortener and Redirect Engine",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(urls.router)
app.include_router(redirect.router)  # Wildcard route registered last to avoid route conflicts


@app.get("/")
def read_root():
    return {"message": "Welcome to Linkly Secure API"}
