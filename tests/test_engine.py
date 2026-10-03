import pytest
from engine.state import GameState, new_game, legal_moves, apply_move, winner


def test_sheep_moves_first():
    assert new_game().turn == 's'


def test_sheep_start_has_one_move():
    assert legal_moves(new_game()) == [((7, 0), (6, 1))]


def test_apply_move_switches_turn_and_keeps_original():
    start = new_game()
    after = apply_move(start, ((7, 0), (6, 1)))
    assert after.sheep == (6, 1)
    assert after.turn == 'w'
    assert start.sheep == (7, 0)          # original untouched


def test_illegal_move_raises():
    with pytest.raises(ValueError):
        apply_move(new_game(), ((7, 0), (5, 2)))


def test_wolves_have_seven_opening_moves():
    state = apply_move(new_game(), ((7, 0), (6, 1)))
    assert len(legal_moves(state)) == 7


def test_wolves_cannot_move_up():
    state = GameState((7, 0), ((4, 4),), 'w')
    destinations = [end for _, end in legal_moves(state)]
    assert all(row == 5 for row, _ in destinations)


def test_sheep_wins_on_top_row():
    state = GameState((0, 2), ((3, 3), (3, 5), (3, 7), (4, 0)), 'w')
    assert winner(state) == 's'


def test_wolves_win_when_sheep_is_trapped():
    state = GameState((7, 0), ((6, 1), (0, 3), (0, 5), (0, 7)), 's')
    assert winner(state) == 'w'


def test_sheep_wins_when_wolves_are_stuck():
    state = GameState((3, 3), ((7, 1), (7, 3), (7, 5), (7, 7)), 'w')
    assert winner(state) == 's'


def test_no_winner_at_start():
    assert winner(new_game()) is None