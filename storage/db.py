from sqlalchemy import func

from storage.database import get_session
from storage.models import Game, GamePlayer, Move
from sqlalchemy import func, Integer


def record_match(moves, mode, level, winner, seconds):
    """Save a finished game: one games row, two game_players rows, one moves row each."""
    session = get_session()
    try:
        game = Game(mode=mode, level=level, winner=winner, seconds=seconds)
        session.add(game)
        session.flush()   # assigns game.id without committing yet

        # The human is the sheep, the computer (or player 2) is the wolves
        sheep_result = "win" if winner == "s" else "loss"
        wolf_result = "win" if winner == "w" else "loss"
        session.add(GamePlayer(game_id=game.id, role="sheep", result=sheep_result))
        session.add(GamePlayer(game_id=game.id, role="wolf", result=wolf_result))

        for i, (start, end) in enumerate(moves):
            session.add(Move(
                game_id=game.id,
                move_number=i,
                from_pos=f"{start[0]},{start[1]}",
                to_pos=f"{end[0]},{end[1]}",
            ))

        session.commit()
    finally:
        session.close()


def get_stats():
    """Totals plus the sheep's win rate against the computer, computed from the tables."""
    session = get_session()
    try:
        total = session.query(Game).count()

        pvc = session.query(Game).filter(Game.mode == "pvc")
        vs_computer = pvc.count()
        wins = pvc.filter(Game.winner == "s").count()
        avg_moves = (
            session.query(func.avg(func.coalesce(
                session.query(func.count(Move.id))
                .filter(Move.game_id == Game.id)
                .scalar_subquery(), 0)))
            .filter(Game.mode == "pvc")
            .scalar()
        )
        seconds = (
            session.query(func.coalesce(func.sum(Game.seconds), 0))
            .filter(Game.mode == "pvc")
            .scalar()
        )

        by_level = {}
        rows = (
            session.query(Game.level, func.count(Game.id),
                          func.sum((Game.winner == "s").cast(Integer)))
            .filter(Game.mode == "pvc")
            .group_by(Game.level)
            .all()
        )
        for level, games, level_wins in rows:
            by_level[level] = (games, int(level_wins or 0))

        return {
            "total": total,
            "vs_computer": vs_computer,
            "wins": wins,
            "win_rate": round(100 * wins / vs_computer) if vs_computer else 0,
            "avg_moves": round(avg_moves or 0),
            "seconds": int(seconds),
            "by_level": by_level,
        }
    finally:
        session.close()