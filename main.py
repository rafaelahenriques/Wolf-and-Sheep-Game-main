import os
import pygame
from pygame import mixer
from constants import WIDTHS, HEIGHT, WHITE, BLACK, WIDTH


# Game Initialization
pygame.init()

# Initialize sounds
pygame.mixer.init()

# Sounds
pygame.mixer.music.load("sounds/menu_song.mp3")

# Play game song
pygame.mixer.Channel(0).play(pygame.mixer.Sound('sounds/menu_song.mp3'))

# Loop game song
mixer.music.play(loops=-1)

# Center the Game Application
os.environ['SDL_VIDEO_CENTERED'] = '1'

# Game Resolution
screen = pygame.display.set_mode((WIDTHS, HEIGHT))


# Text Renderer
def text_format(message, text_font, text_size, text_color):
    new_font = pygame.font.Font(text_font, text_size)
    new_text = new_font.render(message, True, text_color)

    return new_text


# Game Fonts
font = "fonts/font_ypy.ttf"
font2 = "fonts/font_ys.ttf"

# Game Framerate
clock = pygame.time.Clock()
FPS = 30

# create the display surface object
# of specific dimension..e(X, Y).
display_surface = pygame.display.set_mode((WIDTHS, HEIGHT))

# create a surface object, image is drawn on it.
wolf_image = pygame.image.load(r'images/wolf.png')
sheep_image = pygame.image.load(r'images/sheep.png')


# Generic menu: shows the options, returns the chosen label (or None on Esc)
def menu(options):
    surface = pygame.display.set_mode((WIDTHS, HEIGHT))
    pygame.display.set_caption("Pygame - Triple Zero")
    background = pygame.image.load("images/field.png")
    background = pygame.transform.scale(background, (WIDTHS, HEIGHT))
    index = 0

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    index = (index - 1) % len(options)
                    pygame.mixer.music.load('sounds/button.mp3')
                    pygame.mixer.music.play(0)
                elif event.key == pygame.K_DOWN:
                    index = (index + 1) % len(options)
                    pygame.mixer.music.load('sounds/button.mp3')
                    pygame.mixer.music.play(0)
                elif event.key == pygame.K_RETURN:
                    pygame.mixer.music.load('sounds/button.mp3')
                    pygame.mixer.music.play(0)
                    return options[index]
                elif event.key == pygame.K_ESCAPE:
                    return None

        surface.blit(background, (0, 0))
        title = text_format("WOLF and SHEEP", font, 80, BLACK)
        subtitle = text_format("Game", font, 70, BLACK)
        surface.blit(title, (WIDTHS / 2 - title.get_width() / 2, 45))
        surface.blit(subtitle, (WIDTHS / 2 - subtitle.get_width() / 2, 130))
        surface.blit(wolf_image, (50, 170))
        surface.blit(sheep_image, (710, 200))

        for i, label in enumerate(options):
            if i == index:
                text = text_format(label, font2, 42, BLACK)
            else:
                text = text_format(label, font2, 34, WHITE)
            surface.blit(text, (WIDTHS / 2 - text.get_width() / 2, 290 + i * 70))

        pygame.display.update()
        clock.tick(FPS)

def main_menu():
    import game
    from storage.saves import list_saves, load_game, SAVE_DIR
    while True:
        choice = menu(["Player vs Computer", "Player vs Player", "Load Game", "Replay Game", "Quit"])
        if choice == "Quit":
            pygame.quit()
            quit()
        elif choice == "Player vs Player":
            game.main(game.WIN, WIDTH, "pvp")
        elif choice == "Player vs Computer":
            level = menu(["Easy", "Medium", "Hard", "Back"])
            if level in (None, "Back"):
                continue
            game.main(game.WIN, WIDTH, "pvc", level.lower())
        elif choice == "Load Game":
            files = list_saves()
            if not files:
                continue
            picked = menu(files[:6] + ["Back"])
            if picked in (None, "Back"):
                continue
            moves, mode, level = load_game(os.path.join(SAVE_DIR, picked))
            game.main(game.WIN, WIDTH, mode, level, moves)
            

# Initialize the Game
main_menu()
pygame.quit()
quit()