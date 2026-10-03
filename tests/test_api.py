import pytest
from fastapi.testclient import TestClient

from api.main import app, games
from storage import db


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", str(tmp_path / "api.db"))
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


def test_invalid_level_is_422(client):
    res = client.post("/games", json={"mode": "pvc", "level": "impossible"})
    assert res.status_code == 422