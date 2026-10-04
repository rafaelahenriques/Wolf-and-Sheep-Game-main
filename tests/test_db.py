import pytest

from storage import database
from storage.models import Base
from storage import db


@pytest.fixture
def clean_db(monkeypatch):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    url = "postgresql+psycopg2://localhost/wolfsheep_test"
    engine = create_engine(url)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine)

    monkeypatch.setattr(database, "engine", engine)
    monkeypatch.setattr(database, "SessionLocal", TestSession)
    monkeypatch.setattr(db, "get_session", lambda: TestSession())
    yield


def test_stats_and_win_rate(clean_db):
    moves = [((7, 0), (6, 1)), ((0, 1), (1, 0))]
    db.record_match(moves, "pvc", "hard", "w", 30)
    db.record_match(moves, "pvc", "hard", "s", 50)
    db.record_match(moves, "pvp", "easy", "s", 10)

    stats = db.get_stats()
    assert stats["total"] == 3
    assert stats["vs_computer"] == 2
    assert stats["wins"] == 1
    assert stats["win_rate"] == 50
    assert stats["by_level"]["hard"] == (2, 1)


def test_empty_database(clean_db):
    stats = db.get_stats()
    assert stats["total"] == 0
    assert stats["win_rate"] == 0