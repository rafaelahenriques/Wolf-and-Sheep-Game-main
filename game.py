import sys
import pygame

from constants import GREEN, GREEN_L, DARK_G, BLACK, WHITE, WIDTH
from engine.state import new_game, legal_moves, apply_move, winner
from ai.players import choose_move
from storage.saves import save_game, rebuild

# Window (main.py uses game.WIN)
WIN = pygame.display.set_mode((WIDTH, WIDTH))
pygame.display.set_caption("Wolf and Sheep Game - Triple zero")

SQUARE = WIDTH // 8

WOLF_IMG = pygame.image.load('images/wolf_small.png')
SHEEP_IMG = pygame.image.load('images/sheep_small.png')


def draw_board(win, state, targets):
    for row in range(8):
        for col in range(8):
            colour = GREEN_L if (row + col) % 2 == 0 else DARK_G
            if (row, col) in targets:
                colour = GREEN
            pygame.draw.rect(win, colour, (col * SQUARE, row * SQUARE, SQUARE, SQUARE))

    for row, col in state.wolves:
        win.blit(WOLF_IMG, (col * SQUARE, row * SQUARE))
    row, col = state.sheep
    win.blit(SHEEP_IMG, (col * SQUARE, row * SQUARE))

    for i in range(9):
        pygame.draw.line(win, BLACK, (0, i * SQUARE), (8 * SQUARE, i * SQUARE))
        pygame.draw.line(win, BLACK, (i * SQUARE, 0), (i * SQUARE, 8 * SQUARE))


def show_winner(win, who):
    text = "Sheep win!" if who == 's' else "Wolves win!"
    font = pygame.font.Font(None, 90)
    small = pygame.font.Font(None, 36)
    label = font.render(text, True, WHITE)
    hint = small.render("R: play again    Esc: menu", True, WHITE)
    rect = label.get_rect(center=(WIDTH // 2, WIDTH // 2 - 20))
    hint_rect = hint.get_rect(center=(WIDTH // 2, WIDTH // 2 + 45))
    pygame.draw.rect(win, BLACK, rect.union(hint_rect).inflate(60, 40))
    win.blit(label, rect)
    win.blit(hint, hint_rect)


def play_sound(turn):
    pygame.mixer.music.load('sounds/sheep.mp3' if turn == 's' else 'sounds/wolf.mp3')
    pygame.mixer.music.play(0)


def main(WIN, WIDTH, mode="pvp", level="easy", moves=None):
    WIN = pygame.display.set_mode((WIDTH, WIDTH))
    pygame.display.set_caption("Wolf and Sheep Game - Rafaela Henriques")
    history = list(moves) if moves else []
    state = rebuild(history)
    selected = None      # (row, col) of the piece the player clicked
    targets = []         # squares that piece can move to

    while True:
        pygame.time.delay(50)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    state = new_game()
                    history = []
                    selected, targets = None, []
                elif event.key == pygame.K_ESCAPE:
                    return
                elif event.key == pygame.K_s:
                    save_game(history, mode, level)
                    pygame.display.set_caption("Game saved")

            if event.type == pygame.MOUSEBUTTONDOWN and winner(state) is None:
                x, y = event.pos
                clicked = (y // SQUARE, x // SQUARE)

                if clicked in targets:
                    # Second click on a highlighted square: make the move
                    move = (selected, clicked)
                    history.append(move)
                    state = apply_move(state, move)
                    selected, targets = None, []

                    if mode == "pvc" and state.turn == 'w' and winner(state) is None:
                        draw_board(WIN, state, targets)
                        pygame.display.update()
                        pygame.time.delay(400)
                        ai_move = choose_move(state, level)
                        history.append(ai_move)
                        state = apply_move(state, ai_move)
                else:
                    # Otherwise try to select a piece that can move
                    options = [m for m in legal_moves(state) if m[0] == clicked]
                    if options:
                        selected = clicked
                        targets = [end for _, end in options]
                        play_sound(state.turn)
                    else:
                        selected, targets = None, []

        draw_board(WIN, state, targets)
        who = winner(state)
        if who:
            show_winner(WIN, who)
        pygame.display.update()