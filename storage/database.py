import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Local default; Render provides DATABASE_URL in production.
DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql+psycopg2://localhost/wolfsheep"
)

# Render's DATABASE_URL starts with postgres://, which SQLAlchemy needs as postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_session():
    return SessionLocal()