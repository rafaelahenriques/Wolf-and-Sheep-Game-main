import logging
import time
import uuid
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from storage.saves import rebuild, save_game, list_saves, load_game, SAVE_DIR
from ai.players import choose_move
from api.schemas import GameOut, MoveIn, NewGame
from engine.state import apply_move, legal_moves, winner
from storage import db

log = logging.getLogger(__name__)

allowed = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(title="Wolf and Sheep API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory games for now: id -> session dict. Finished games go to SQLite.
games = {}


def to_out(game_id, game):
    state = rebuild(game["history"])
    who = winner(state)
    return GameOut(
        id=game_id,
        mode=game["mode"],
        level=game["level"],
        sheep=state.sheep,
        wolves=list(state.wolves),
        turn=state.turn,
        winner=who,
        legal_moves=[] if who else legal_moves(state),
        move_count=len(game["history"]),
    )


def get_game(game_id):
    game = games.get(game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


def record_if_finished(game):
    state = rebuild(game["history"])
    who = winner(state)
    if who and not game["recorded"]:
        seconds = int(time.time() - game["started"])
        try:
            db.record_match(game["history"], game["mode"], game["level"], who, seconds)
        except Exception:
            # Stats are a bonus: if the database is down or unmigrated, the
            # player should still see the move that won the game (a 500 here
            # also lacks CORS headers, so browsers report it as unreachable).
            log.exception("Could not record finished game")
            return
        game["recorded"] = True


@app.get("/")
def root():
    return {"message": "Wolf and Sheep API. See /docs for the interactive docs."}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/games", response_model=GameOut, status_code=201)
def create_game(body: NewGame):
    game_id = uuid.uuid4().hex[:8]
    games[game_id] = {
        "mode": body.mode,
        "level": body.level,
        "history": [],
        "started": time.time(),
        "recorded": False,
    }
    return to_out(game_id, games[game_id])


@app.get("/games/{game_id}", response_model=GameOut)
def read_game(game_id: str):
    return to_out(game_id, get_game(game_id))


@app.post("/games/{game_id}/moves", response_model=GameOut)
def play_move(game_id: str, body: MoveIn):
    game = get_game(game_id)
    state = rebuild(game["history"])
    if winner(state):
        raise HTTPException(status_code=400, detail="Game is already over")

    move = (tuple(body.start), tuple(body.end))
    try:
        state = apply_move(state, move)
    except ValueError:
        raise HTTPException(status_code=400, detail="Illegal move")
    game["history"].append(move)

    # Computer plays the wolves, so the human is always the sheep
    if game["mode"] == "pvc" and not winner(state):
        reply = choose_move(state, game["level"])
        game["history"].append(reply)

    record_if_finished(game)
    return to_out(game_id, game)


@app.get("/stats")
def stats():
    return db.get_stats()


@app.post("/games/{game_id}/save")
def save(game_id: str):
    game = get_game(game_id)
    path = save_game(game["history"], game["mode"], game["level"])
    return {"saved": os.path.basename(path)}


@app.get("/saves")
def saves():
    return {"saves": list_saves()}


@app.get("/saves/{name}")
def read_save(name: str):
    if name not in list_saves():
        raise HTTPException(status_code=404, detail="Save not found")
    moves, mode, level = load_game(os.path.join(SAVE_DIR, name))
    return {
        "name": name,
        "mode": mode,
        "level": level,
        "moves": [[list(a), list(b)] for a, b in moves],
    }


@app.post("/saves/{name}/load", response_model=GameOut)
def load_save(name: str):
    if name not in list_saves():
        raise HTTPException(status_code=404, detail="Save not found")
    moves, mode, level = load_game(os.path.join(SAVE_DIR, name))
    game_id = uuid.uuid4().hex[:8]
    games[game_id] = {
        "mode": mode,
        "level": level,
        "history": moves,
        "started": time.time(),
        "recorded": winner(rebuild(moves)) is not None,
    }
    return to_out(game_id, games[game_id])