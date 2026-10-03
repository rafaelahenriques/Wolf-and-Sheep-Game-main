import random
from collections import deque
from engine.state import legal_moves, apply_move, winner, on_board

WIN_SCORE = 1000
DEPTHS = {"medium": 1, "hard": 6}

def sheep_distance(state):
    """Fewest sheep moves to reach row 0 if the wolves stayed still (None if cut off)."""
    wolves = set(state.wolves)
    seen = {state.sheep}
    queue = deque([(state.sheep, 0)])
    while queue:
        (row, col), dist = queue.popleft()
        if row == 0:
            return dist
        for d_row in (-1, 1):
            for d_col in (-1, 1):
                nxt = (row + d_row, col + d_col)
                if on_board(nxt) and nxt not in wolves and nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, dist + 1))
    return None

def evaluate(state):
    """Score from the sheep's point of view (higher = better for sheep)."""
    sheep_row = state.sheep[0]
    blockers = sum(1 for row, _ in state.wolves if row < sheep_row)
    dist = sheep_distance(state)
    if dist is None:
        return -500                     # sheep is completely walled in
    return -10 * dist - 3 * blockers


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