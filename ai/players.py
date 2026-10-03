import random
from engine.state import legal_moves, apply_move, winner

WIN_SCORE = 1000
DEPTHS = {"medium": 1, "hard": 4}


def evaluate(state):
    """Score a position from the sheep's point of view (higher = better for sheep)."""
    sheep_row = state.sheep[0]
    # Wolves above the sheep can still block it; wolves it has passed can't.
    blockers = sum(1 for row, _ in state.wolves if row < sheep_row)
    return 10 * (7 - sheep_row) - 4 * blockers


def minimax(state, depth, alpha, beta):
    who = winner(state)
    if who == 's':
        return WIN_SCORE + depth        # prefer faster wins
    if who == 'w':
        return -WIN_SCORE - depth
    if depth == 0:
        return evaluate(state)

    if state.turn == 's':
        best = float('-inf')
        for move in legal_moves(state):
            best = max(best, minimax(apply_move(state, move), depth - 1, alpha, beta))
            alpha = max(alpha, best)
            if alpha >= beta:
                break
        return best

    best = float('inf')
    for move in legal_moves(state):
        best = min(best, minimax(apply_move(state, move), depth - 1, alpha, beta))
        beta = min(beta, best)
        if alpha >= beta:
            break
    return best


def choose_move(state, level="easy"):
    moves = legal_moves(state)
    if level == "easy":
        return random.choice(moves)

    depth = DEPTHS[level]
    scored = [(minimax(apply_move(state, m), depth - 1, float('-inf'), float('inf')), m)
              for m in moves]
    pick = max if state.turn == 's' else min
    best_score = pick(score for score, _ in scored)
    return random.choice([m for score, m in scored if score == best_score])