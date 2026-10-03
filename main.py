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


# Main Menu
def main_menu():
    menu = True
    selected = "start"

    while menu:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    selected = "start"
                    pygame.mixer.music.load('sounds/button.mp3')
                    pygame.mixer.music.play(0)

                elif event.key == pygame.K_DOWN:
                    selected = "quit"
                    pygame.mixer.music.load('sounds/button.mp3')
                    pygame.mixer.music.play(0)

                if event.key == pygame.K_RETURN:
                    if selected == "start":
                        print("Start")
                        pygame.mixer.music.load('sounds/button.mp3')
                        pygame.mixer.music.play(0)
                        import game
                        from game import WIN
                        game.main(WIN, WIDTH)

                    if selected == "quit":
                        pygame.mixer.music.load('sounds/button.mp3')
                        pygame.mixer.music.play(0)
                        pygame.quit()
                        quit()

        # Main Menu UI
        screen.fill(BLACK)
        background = pygame.image.load("images/field.png")
        background = pygame.transform.scale(background, (1020, 600))
        display_surface.blit(background, (0, 0))

        title = text_format("WOLF and SHEEP", font, 80, BLACK)
        subtitle = text_format("Game", font, 70, BLACK)

        # start and quit text
        if selected == "start":
            text_start = text_format("START", font2, 50, BLACK)

        else:
            text_start = text_format("Start", font2, 40, WHITE)

        if selected == "quit":
            text_quit = text_format("QUIT", font2, 38, BLACK)

        else:
            text_quit = text_format("Quit", font2, 35, WHITE)

        title_rect = title.get_rect()
        subtitle_rect = subtitle.get_rect()
        start_rect = text_start.get_rect()
        quit_rect = text_quit.get_rect()

        # Menu image spacing and center
        display_surface.blit(wolf_image, (50, 170))
        display_surface.blit(sheep_image, (710, 200))

        # Main Menu Text spacing and center
        screen.blit(title, (WIDTHS / 2 - (title_rect[2] / 2), 45))
        screen.blit(subtitle, (WIDTHS / 2 - (subtitle_rect[2] / 2), 130))
        screen.blit(text_start, (WIDTHS / 2 - (start_rect[2] / 2), 340))
        screen.blit(text_quit, (WIDTHS / 2 - (quit_rect[2] / 2), 430))
        pygame.display.update()
        clock.tick(FPS)
        pygame.display.set_caption("Pygame - Triple Zero")


# Initialize the Game
main_menu()
pygame.quit()
quit()
