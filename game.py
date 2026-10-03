import sys
from typing import List
from constants import GREEN, GREEN_L, DARK_G, BLACK, WIDTHS, HEIGHT, WIDTH
import pygame

# Making board
board: List[List[str]] = [['  ' for i in range(8)] for i in range(8)]

# Game Resolution
screen = pygame.display.set_mode((WIDTHS, HEIGHT))
display_surface = pygame.display.set_mode((WIDTHS, HEIGHT))
WIN = pygame.display.set_mode((WIDTH, WIDTH))

# Isto cria a janela em que vamos jogar
pygame.display.set_caption("Wolf and Sheep Game - Triple zero")


# Esta classe cria as peças do jogo e a distinção entre Wolf and sheep - feita através das teams
class Piece:
    def __init__(self, team, type, image, enemy=False):
        self.team = team
        self.type = type
        self.enemy = enemy
        self.image = image


# Criar as peças e atribuir imagens

wlf = Piece('w', 'lf', 'images/wolf_small.png')

shp = Piece('s', 'hp', 'images/sheep_small.png')

# Coordenada Wolves
coordinates_order = {(1, 0): pygame.image.load(wlf.image), (3, 0): pygame.image.load(wlf.image),
                     (5, 0): pygame.image.load(wlf.image), (7, 0): pygame.image.load(wlf.image),

                     # Espaços vazios coordenadas

                     (0, 0): None, (2, 0): None, (4, 0): None, (6, 0): None,
                     (0, 1): None, (1, 1): None, (2, 1): None, (3, 1): None,
                     (4, 1): None, (5, 1): None, (6, 1): None, (7, 1): None,
                     (0, 2): None, (1, 2): None, (2, 2): None, (3, 2): None,
                     (4, 2): None, (5, 2): None, (6, 2): None, (7, 2): None,
                     (0, 3): None, (1, 3): None, (2, 3): None, (3, 3): None,
                     (4, 3): None, (5, 3): None, (6, 3): None, (7, 3): None,
                     (0, 4): None, (1, 4): None, (2, 4): None, (3, 4): None,
                     (4, 4): None, (5, 4): None, (6, 4): None, (7, 4): None,
                     (0, 5): None, (1, 5): None, (2, 5): None, (3, 5): None,
                     (4, 5): None, (5, 5): None, (6, 5): None, (7, 5): None,

                     (0, 6): None, (1, 6): None, (2, 6): None, (3, 6): None,
                     (4, 6): None, (5, 6): None, (6, 6): None, (7, 6): None,
                     (1, 7): None, (4, 7): None, (2, 7): None, (3, 7): None,
                     (7, 7): None, (5, 7): None, (6, 7): None,

                     # Coordenada Sheep

                     (0, 7): pygame.image.load(shp.image)}


# Colocar as peças no board
def create_board(board):
    board[0] = [Piece('e', 'pt', 'empty.png'), Piece('w', 'lf', 'wolf.png'), Piece('w', 'lf', 'empty.png'),
                Piece('w', 'lf', 'wolf.png'), Piece('e', 'pt', 'empty.png'), Piece('w', 'lf', 'wolf.png'),
                Piece('e', 'pt', 'empty.png'), Piece('w', 'lf', 'wolf.png')]

    board[7] = [Piece('s', 'hp', 'sheep.png'), Piece('e', 'pt', 'empty.png'), Piece('e', 'pt', 'empty.png'),
                Piece('e', 'pt', 'empty.png'), Piece('e', 'pt', 'empty.png'), Piece('e', 'pt', 'empty.png'),
                Piece('e', 'pt', 'empty.png'), Piece('e', 'pt', 'empty.png')]

    return board


# Devolve o input se o input estiver dentro dos limites do board

def on_board(position):
    if -1 < position[0] < 8 and -1 < position[1] < 8:
        return True


def deselect():
    for row in range(len(board)):
        for column in range(len(board[0])):
            if board[row][column] == 'x ':
                board[row][column] = '  '
            else:
                try:
                    board[row][column].enemy = False
                except:
                    pass
    return board


def highlight(board):
    highlighted = []
    for i in range(len(board)):
        for j in range(len(board[0])):
            if board[i][j] == 'x ':
                highlighted.append((i, j))
    return highlighted


def check_team(moves, index):
    row, col = index
    if moves % 2 == 0:
        if board[row][col].team != 's':
            pass
        else:
            return True
    else:
        if board[row][col].team != 'w':
            pass
        else:
            return True


def select_moves(piece, index, moves):
    if check_team(moves, index):
        if piece.type == 'lf':
            if piece.team == 'w':
                pygame.mixer.music.load('sounds/wolf.mp3')
                pygame.mixer.music.play(0)
                return highlight(wolf_moves(index))

        if piece.type == 'hp':
            pygame.mixer.music.load('sounds/sheep.mp3')
            pygame.mixer.music.play(0)
            return highlight(sheep_moves(index))


def wolf_moves(index):
    diagonals = [[[index[0] + i, index[1] + i] for i in range(1, 2)],
                 [[index[0] + i, index[1] - i] for i in range(1, 2)],
                 [[index[0] - i, index[1] + i] for i in range(1, 1)],
                 [[index[0] - i, index[1] - i] for i in range(1, 1)]]

    for direction in diagonals:
        for positions in direction:
            if on_board(positions):
                if board[positions[0]][positions[1]] == '  ':
                    board[positions[0]][positions[1]] = 'x '

    return board


def sheep_moves(index):
    diagonals = [[[index[0] + i, index[1] + i] for i in range(1, 2)],
                 [[index[0] + i, index[1] - i] for i in range(1, 2)],
                 [[index[0] - i, index[1] + i] for i in range(1, 2)],
                 [[index[0] - i, index[1] - i] for i in range(1, 2)]]

    for direction in diagonals:
        for positions in direction:
            if on_board(positions):
                if board[positions[0]][positions[1]] == '  ':
                    board[positions[0]][positions[1]] = 'x '

    return board


class Spaces:
    def __init__(self, row, col, width):
        self.row = row
        self.col = col
        self.x = int(row * width)
        self.y = int(col * width)
        self.colour = GREEN_L
        self.occupied = None

    def draw(self, WIN):
        pygame.draw.rect(WIN, self.colour, (self.x, self.y, WIDTH / 8, WIDTH / 8))

    def setup(self, WIN):
        if coordinates_order[(self.row, self.col)]:
            if coordinates_order[(self.row, self.col)] is None:
                pass
            else:
                WIN.blit(coordinates_order[(self.row, self.col)], (self.x, self.y))


def make_grid(rows, width):
    grid = []
    gap = WIDTH // rows
    print(gap)
    for i in range(rows):
        grid.append([])
        for j in range(rows):
            node = Spaces(j, i, gap)
            grid[i].append(node)
            if (i + j) % 2 == 1:
                grid[i][j].colour = DARK_G
    return grid


def draw_grid(win, rows, width):
    gap = width // 8
    for i in range(rows):
        pygame.draw.line(win, BLACK, (0, i * gap), (width, i * gap))
        for j in range(rows):
            pygame.draw.line(win, BLACK, (j * gap, 0), (j * gap, width))


def update_display(win, grid, rows, width):
    for row in grid:
        for spot in row:
            spot.draw(win)
            spot.setup(win)
    draw_grid(win, rows, width)
    pygame.display.update()


def Find_Space(pos, WIDTH):
    interval = WIDTH / 8
    y, x = pos
    rows = y // interval
    columns = x // interval
    return int(rows), int(columns)


def display_potential_moves(positions, grid):
    for i in positions:
        x, y = i
        grid[x][y].colour = DARK_G


def Do_Move(OriginalPos, FinalPosition, WIN):
    coordinates_order[FinalPosition] = coordinates_order[OriginalPos]
    coordinates_order[OriginalPos] = None


def remove_highlight(grid):
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if (i + j) % 2 == 0:
                grid[i][j].colour = GREEN_L
            else:
                grid[i][j].colour = DARK_G
    return grid


create_board(board)


def main(WIN, WIDTH):
    moves = 0
    selected = False
    piece_to_move = []
    grid = make_grid(8, WIDTH)
    while True:
        pygame.time.delay(50)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            # Fecha o programa se a janela for fechada

            if event.type == pygame.MOUSEBUTTONDOWN:
                pos = pygame.mouse.get_pos()
                y, x = Find_Space(pos, WIDTH)
                if not selected:
                    try:
                        possible = select_moves((board[x][y]), (x, y), moves)
                        for positions in possible:
                            row, col = positions
                            grid[row][col].colour = GREEN
                        piece_to_move = x, y
                        selected = True
                    except:
                        piece_to_move = []

                else:
                    try:
                        if board[x][y].enemy:
                            row, col = piece_to_move
                            board[x][y] = board[row][col]
                            board[row][col] = '  '
                            deselect()
                            remove_highlight(grid)
                            Do_Move((col, row), (y, x), WIN)
                            moves += 1

                        else:
                            deselect()
                            remove_highlight(grid)
                            print("Deselected")
                    except:
                        if board[x][y] == 'x ':
                            [row, col] = piece_to_move
                            board[x][y] = board[row][col]
                            board[row][col] = '  '
                            deselect()
                            remove_highlight(grid)
                            Do_Move((col, row), (y, x), WIN)
                            moves += 1

                        else:
                            deselect()
                            remove_highlight(grid)
                            print("Invalid move")
                    selected = False

            update_display(WIN, grid, 8, WIDTH)


main(WIN, WIDTH)
