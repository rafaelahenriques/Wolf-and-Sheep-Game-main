from typing import List, Literal, Optional, Tuple

from pydantic import BaseModel

Pos = Tuple[int, int]


class NewGame(BaseModel):
    mode: Literal["pvp", "pvc"] = "pvc"
    level: Literal["easy", "medium", "hard"] = "easy"


class MoveIn(BaseModel):
    start: Pos
    end: Pos


class GameOut(BaseModel):
    id: str
    mode: str
    level: str
    sheep: Pos
    wolves: List[Pos]
    turn: str
    winner: Optional[str]
    legal_moves: List[Tuple[Pos, Pos]]
    move_count: int