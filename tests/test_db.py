from storage import db


def test_stats_and_win_rate(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", str(tmp_path / "test.db"))
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


def test_empty_database(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", str(tmp_path / "empty.db"))
    stats = db.get_stats()
    assert stats["total"] == 0
    assert stats["win_rate"] == 0