from engine.state import new_game, apply_move
from storage import saves


def test_save_and_load_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setattr(saves, "SAVE_DIR", str(tmp_path))
    moves = [((7, 0), (6, 1)), ((0, 1), (1, 0))]
    path = saves.save_game(moves, "pvc", "hard")
    assert saves.load_game(path) == (moves, "pvc", "hard")


def test_rebuild_matches_manual_play():
    moves = [((7, 0), (6, 1)), ((0, 1), (1, 0))]
    state = new_game()
    for m in moves:
        state = apply_move(state, m)
    assert saves.rebuild(moves) == state


def test_list_saves_newest_first(tmp_path, monkeypatch):
    monkeypatch.setattr(saves, "SAVE_DIR", str(tmp_path))
    (tmp_path / "2026-01-01_10-00-00.json").write_text("{}")
    (tmp_path / "2026-02-01_10-00-00.json").write_text("{}")
    assert saves.list_saves()[0].startswith("2026-02-01")