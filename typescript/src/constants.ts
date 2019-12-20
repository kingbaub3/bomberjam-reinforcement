export enum GAME_STATE {
    notStarted = -1,
    started = 0,
    ended = 1
}

export enum ACTION {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right',
    stay = 'stay',
    bomb = 'bomb'
}

export const DIRECTIONS = [
    [-1, 0], // Left
    [1, 0], // Right
    [0, -1], // Up
    [0, 1], // Down
]

export enum TILE_TYPE {
    walkable = '.',
    breakable = '+',
    wall = '#',
    explosion = '*',
    explosionIncoming = '!',
}