import pytest
from engine.state import GameState, new_game, legal_moves
from ai.players import choose_move


@pytest.mark.parametrize("level", ["easy", "medium", "hard"])
def test_every_level_returns_a_legal_move(level):
    state = new_game()
    state = GameState(state.sheep, state.wolves, 'w')
    assert choose_move(state, level) in legal_moves(state)


@pytest.mark.parametrize("level", ["medium", "hard"])
def test_wolves_trap_sheep_when_possible(level):
    state = GameState((7, 0), ((5, 0), (0, 3), (0, 5), (0, 7)), 'w')
    assert choose_move(state, level) == ((5, 0), (6, 1))


@pytest.mark.parametrize("level", ["medium", "hard"])
def test_sheep_takes_winning_move(level):
    state = GameState((1, 2), ((4, 1), (4, 3), (4, 5), (4, 7)), 's')
    _, end = choose_move(state, level)
    assert end[0] == 0