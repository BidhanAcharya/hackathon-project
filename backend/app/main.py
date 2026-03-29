
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.models import Base
from app.db.session import engine
from app.api.routes import auth, chat, help_request, web_socket_chat
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (new tables only; existing tables are not modified)
Base.metadata.create_all(bind=engine)

# ── Runtime column migrations ────────────────────────────────────────────────
# SQLAlchemy create_all never adds columns to existing tables.
# ADD COLUMN IF NOT EXISTS is idempotent on PostgreSQL — safe to run every startup.
with engine.connect() as conn:
    # help_sessions columns
    conn.execute(text("ALTER TABLE help_sessions ADD COLUMN IF NOT EXISTS message TEXT"))
    conn.execute(text("ALTER TABLE help_sessions ADD COLUMN IF NOT EXISTS helper_type VARCHAR(20)"))
    conn.execute(text("ALTER TABLE help_sessions ADD COLUMN IF NOT EXISTS categories TEXT"))
    # helper role, proof_id, alias
    conn.execute(text("ALTER TABLE helpers ADD COLUMN IF NOT EXISTS role VARCHAR(20)"))
    conn.execute(text("ALTER TABLE helpers ADD COLUMN IF NOT EXISTS proof_id TEXT"))
    conn.execute(text("ALTER TABLE helpers ADD COLUMN IF NOT EXISTS alias VARCHAR(100)"))
    # seeker alias
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS alias VARCHAR(100)"))
    conn.commit()
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Welcome to Chatbot"}


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(help_request.router)
app.include_router(web_socket_chat.router)
