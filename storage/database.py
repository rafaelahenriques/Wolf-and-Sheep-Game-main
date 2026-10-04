import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Local default; Render provides DATABASE_URL in production.
DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql+psycopg2://localhost/wolfsheep"
)

# Render's DATABASE_URL has no driver (postgres:// or postgresql://). SQLAlchemy
# rejects postgres://, and since 2.1 a bare postgresql:// means psycopg 3, which
# isn't installed, so always pin the psycopg2 driver.
for prefix in ("postgres://", "postgresql://"):
    if DATABASE_URL.startswith(prefix):
        DATABASE_URL = DATABASE_URL.replace(prefix, "postgresql+psycopg2://", 1)
        break

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_session():
    return SessionLocal()