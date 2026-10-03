import json
import sqlite3
from datetime import datetime

DB_PATH = "wolfsheep.db"


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                played_at TEXT NOT NULL,
                mode TEXT NOT NULL,
                level TEXT NOT NULL,
                winner TEXT NOT NULL,
                move_count INTEGER NOT NULL,
                seconds INTEGER NOT NULL,
                moves TEXT NOT NULL
            )
        """)


def record_match(moves, mode, level, winner, seconds):
    init_db()
    data = json.dumps([[list(a), list(b)] for a, b in moves])
    with connect() as conn:
        conn.execute(
            "INSERT INTO matches (played_at, mode, level, winner, move_count, seconds, moves) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (datetime.now().isoformat(timespec="seconds"), mode, level, winner,
             len(moves), seconds, data),
        )


def get_stats():
    """Totals plus the human's win rate against the computer (the human plays sheep)."""
    init_db()
    with connect() as conn:
        total = conn.execute("SELECT COUNT(*) FROM matches").fetchone()[0]
        row = conn.execute(
            "SELECT COUNT(*) AS games, "
            "COALESCE(SUM(winner = 's'), 0) AS wins, "
            "COALESCE(AVG(move_count), 0) AS avg_moves, "
            "COALESCE(SUM(seconds), 0) AS seconds "
            "FROM matches WHERE mode = 'pvc'"
        ).fetchone()
        by_level = {
            r["level"]: (r["games"], r["wins"])
            for r in conn.execute(
                "SELECT level, COUNT(*) AS games, SUM(winner = 's') AS wins "
                "FROM matches WHERE mode = 'pvc' GROUP BY level"
            )
        }
    games = row["games"]
    return {
        "total": total,
        "vs_computer": games,
        "wins": row["wins"],
        "win_rate": round(100 * row["wins"] / games) if games else 0,
        "avg_moves": round(row["avg_moves"]),
        "seconds": row["seconds"],
        "by_level": by_level,
    }