import json
import os
from datetime import datetime

from engine.state import new_game, apply_move

SAVE_DIR = "saves"


def save_game(moves, mode, level):
    """Write the move list to saves/<timestamp>.json and return the path."""
    os.makedirs(SAVE_DIR, exist_ok=True)
    name = datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + ".json"
    path = os.path.join(SAVE_DIR, name)
    data = {"mode": mode, "level": level, "moves": [[list(a), list(b)] for a, b in moves]}
    with open(path, "w") as f:
        json.dump(data, f)
    return path


def load_game(path):
    """Return (moves, mode, level) from a save file."""
    with open(path) as f:
        data = json.load(f)
    moves = [(tuple(a), tuple(b)) for a, b in data["moves"]]
    return moves, data["mode"], data["level"]


def list_saves():
    """Save file names, newest first."""
    if not os.path.isdir(SAVE_DIR):
        return []
    return sorted((f for f in os.listdir(SAVE_DIR) if f.endswith(".json")), reverse=True)


def rebuild(moves):
    """Replay a move list from the start and return the resulting state."""
    state = new_game()
    for move in moves:
        state = apply_move(state, move)
    return state