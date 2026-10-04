import pytest
from fastapi.testclient import TestClient

from api.main import app, games
from storage import db


@pytest.fixture
def client(monkeypatch):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from storage import database
    from storage.models import Base

    url = "postgresql+psycopg2://localhost/wolfsheep_test"
    engine = create_engine(url)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine)

    monkeypatch.setattr(database, "engine", engine)
    monkeypatch.setattr(database, "SessionLocal", TestSession)
    monkeypatch.setattr(db, "get_session", lambda: TestSession())

    games.clear()
    return TestClient(app)


def test_create_game(client):
    res = client.post("/games", json={"mode": "pvc", "level": "easy"})
    assert res.status_code == 201
    body = res.json()
    assert body["turn"] == "s"
    assert body["legal_moves"] == [[[7, 0], [6, 1]]]


def test_unknown_game_is_404(client):
    assert client.get("/games/nope").status_code == 404


def test_illegal_move_is_400(client):
    game_id = client.post("/games", json={"mode": "pvp"}).json()["id"]
    res = client.post(f"/games/{game_id}/moves", json={"start": [7, 0], "end": [5, 2]})
    assert res.status_code == 400


def test_pvp_move_switches_turn(client):
    game_id = client.post("/games", json={"mode": "pvp"}).json()["id"]
    res = client.post(f"/games/{game_id}/moves", json={"start": [7, 0], "end": [6, 1]})
    assert res.json()["turn"] == "w"


def test_pvc_computer_replies(client):
    game_id = client.post("/games", json={"mode": "pvc", "level": "easy"}).json()["id"]
    res = client.post(f"/games/{game_id}/moves", json={"start": [7, 0], "end": [6, 1]})
    body = res.json()
    assert body["turn"] == "s"
    assert body["move_count"] == 2


# Two-player game where the sheep walks up the left edge to the top row while
# one wolf steps out of its way and another wanders down the right side.
SHEEP_TO_TOP = [([7, 0], [6, 1]), ([6, 1], [5, 0]), ([5, 0], [4, 1]), ([4, 1], [3, 0]),
                ([3, 0], [2, 1]), ([2, 1], [1, 0]), ([1, 0], [0, 1])]
WOLF_MOVES = [([0, 1], [1, 2]), ([0, 7], [1, 6]), ([1, 6], [2, 7]),
              ([2, 7], [3, 6]), ([3, 6], [4, 7]), ([4, 7], [5, 6])]


def play_sheep_to_top(client):
    game_id = client.post("/games", json={"mode": "pvp"}).json()["id"]
    for i, (start, end) in enumerate(SHEEP_TO_TOP):
        res = client.post(f"/games/{game_id}/moves", json={"start": start, "end": end})
        if i < len(WOLF_MOVES):
            start, end = WOLF_MOVES[i]
            client.post(f"/games/{game_id}/moves", json={"start": start, "end": end})
    return res


def test_sheep_wins_on_top_row(client):
    res = play_sheep_to_top(client)
    assert res.status_code == 200
    assert res.json()["winner"] == "s"
    assert client.get("/stats").json()["total"] == 1


def test_win_survives_stats_failure(client, monkeypatch):
    def broken_record_match(*args, **kwargs):
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(db, "record_match", broken_record_match)
    res = play_sheep_to_top(client)
    assert res.status_code == 200
    assert res.json()["winner"] == "s"


def test_invalid_level_is_422(client):
    res = client.post("/games", json={"mode": "pvc", "level": "impossible"})
    assert res.status_code == 422


def test_save_and_list(client):
    game_id = client.post("/games", json={"mode": "pvp"}).json()["id"]
    client.post(f"/games/{game_id}/moves", json={"start": [7, 0], "end": [6, 1]})
    name = client.post(f"/games/{game_id}/save").json()["saved"]
    assert name in client.get("/saves").json()["saves"]


def test_load_save_restores_moves(client, tmp_path, monkeypatch):
    from storage import saves as saves_mod
    monkeypatch.setattr(saves_mod, "SAVE_DIR", str(tmp_path))
    import api.main as api_main
    monkeypatch.setattr(api_main, "SAVE_DIR", str(tmp_path))

    game_id = client.post("/games", json={"mode": "pvp"}).json()["id"]
    client.post(f"/games/{game_id}/moves", json={"start": [7, 0], "end": [6, 1]})
    name = client.post(f"/games/{game_id}/save").json()["saved"]

    loaded = client.post(f"/saves/{name}/load").json()
    assert loaded["move_count"] == 1


def test_missing_save_is_404(client):
    assert client.get("/saves/nope.json").status_code == 404