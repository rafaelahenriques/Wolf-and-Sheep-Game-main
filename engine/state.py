from dataclasses import dataclass
from typing import List, Optional, Tuple

SIZE = 8
Pos = Tuple[int, int]        # (row, col)
Move = Tuple[Pos, Pos]       # (from, to)


@dataclass(frozen=True)
class GameState:
    sheep: Pos
    wolves: Tuple[Pos, ...]
    turn: str                # 's' = sheep to move, 'w' = wolves to move


def new_game() -> GameState:
    return GameState(
        sheep=(7, 0),
        wolves=((0, 1), (0, 3), (0, 5), (0, 7)),
        turn='s',
    )


def on_board(pos: Pos) -> bool:
    return 0 <= pos[0] < SIZE and 0 <= pos[1] < SIZE


def legal_moves(state: GameState) -> List[Move]:
    if state.turn == 's':
        pieces = [state.sheep]
        deltas = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
    else:
        pieces = list(state.wolves)
        deltas = [(1, -1), (1, 1)]          # wolves only move down

    occupied = set(state.wolves) | {state.sheep}
    moves = []
    for row, col in pieces:
        for d_row, d_col in deltas:
            dest = (row + d_row, col + d_col)
            if on_board(dest) and dest not in occupied:
                moves.append(((row, col), dest))
    return moves


def apply_move(state: GameState, move: Move) -> GameState:
    if move not in legal_moves(state):
        raise ValueError(f"Illegal move: {move}")
    start, end = move
    if state.turn == 's':
        return GameState(end, state.wolves, 'w')
    wolves = tuple(end if w == start else w for w in state.wolves)
    return GameState(state.sheep, wolves, 's')


def winner(state: GameState) -> Optional[str]:
    if state.sheep[0] == 0:
        return 's'
    if not legal_moves(state):
        # the player who can't move loses
        return 'w' if state.turn == 's' else 's'
    return None