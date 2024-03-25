const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;
const MAX_REMOVED_ROWS = 3;
const PIECES = [
    [
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1, 1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [1, 1, 1],
        [1, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 0, 1]
    ],

]
const CURRENT_PIECE = {
    x: 0,
    y: 0,
    shape: []
}
let MATRIX = createMatrix();
let DROP_INTERVAL = 1000;
let LEVEL = 0;
let REMOVED_ROWS = 0;
let animationId = null;
let gameOver = false;

// Soporte para móviles
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const canva = document.getElementById("tetris");
const context = canva.getContext("2d");
const levelSpan = document.getElementById("level");
const startButton = document.getElementById("start-button");

canva.width = BLOCK_SIZE * BOARD_WIDTH;
canva.height = BLOCK_SIZE * BOARD_HEIGHT;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

// 1. The gameloop
let lastTime = 0;
let dropInterval = 0;

function update(time = 0) {

    if (gameOver) {
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    dropInterval += deltaTime;

    if (dropInterval > DROP_INTERVAL) {
        moveDown();
        dropInterval = 0;
    }

    draw();
    animationId = window.requestAnimationFrame(update);
}

// 2. Create the matrix
function createMatrix() {
    const matrix = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        matrix.push(new Array(BOARD_WIDTH).fill(0));
    }
    return matrix;
}

// 3. Draw the matrix
function draw() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canva.width, canva.height);

    MATRIX.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = "#ffff00";
                context.fillRect(x, y, 1, 1);
            }
        });
    });

    CURRENT_PIECE.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = "#00ff00";
                context.fillRect(x + CURRENT_PIECE.x, y + CURRENT_PIECE.y, 1, 1);
            }
        });
    });
}

// 4. Check collision
function checkCollision() {
    return CURRENT_PIECE.shape.find((row, y) => {
        return row.find((value, x) => {
            return (
                value !== 0 &&
                MATRIX[y + CURRENT_PIECE.y]?.[x + CURRENT_PIECE.x] !== 0
            );
        });

    });
}

// 5. Merge the matrix
function merge() {
    CURRENT_PIECE.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                MATRIX[y + CURRENT_PIECE.y][x + CURRENT_PIECE.x] = 1;
            }
        });
    });
}

// 6. Reset piece
function resetPiece() {
    CURRENT_PIECE.shape = PIECES[Math.floor(Math.random() * PIECES.length)];
    CURRENT_PIECE.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(CURRENT_PIECE.shape[0].length / 2);
    CURRENT_PIECE.y = 0;
}

// 7. Remove completed rows
function removeCompletedRows() {
    for (let y = 0; y < MATRIX.length; y++) {
        if (MATRIX[y].every((value) => value !== 0)) {
            MATRIX.splice(y, 1);
            MATRIX.unshift(new Array(BOARD_WIDTH).fill(0));
            REMOVED_ROWS++;
            if (REMOVED_ROWS === MAX_REMOVED_ROWS) {
                increaseLevel();
                REMOVED_ROWS = 0;
            }
        }
    }
}

// 8. Move the piece down
function moveDown() {
    CURRENT_PIECE.y++;
    if (checkCollision()) {
        CURRENT_PIECE.y--;
        merge();
        resetPiece();
        removeCompletedRows();
        checkGameOver();
    }
}

// 9. Rotate the piece
function rotate() {
    const rotatedPiece = CURRENT_PIECE.shape[0].map((val, index) =>
        CURRENT_PIECE.shape.map(row => row[index])
    ).reverse();

    const previousShape = CURRENT_PIECE.shape;
    CURRENT_PIECE.shape = rotatedPiece;
    if (checkCollision()) {
        CURRENT_PIECE.shape = previousShape;
    }
}

// 10. Increase the speed
function increaseSpeed() {
    if (LEVEL < 10) {
        DROP_INTERVAL -= 20;
    } else if (LEVEL < 20) {
        DROP_INTERVAL -= 40;
    } else {
        DROP_INTERVAL -= 60;
    }
}

// 11. Increase the score
function increaseLevel() {
    LEVEL += 1;
    levelSpan.innerHTML = LEVEL;
    increaseSpeed();
}

// 12. Game over
function checkGameOver() {
    if (MATRIX[0].some((value) => value !== 0)) {
        alert("Game Over");
        window.cancelAnimationFrame(animationId);
        gameOver = true;
        startButton.hidden = false;
    }
}

// 13. Draw ramdom pieces on the board
function drawRandomPieces() {
    for (let i = 0; i < 6; i++) {
        const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
        let randomX, randomY;

        do {
            randomX = Math.floor(Math.random() * (BOARD_WIDTH - randomPiece[0].length - 2)) + 1;
            randomY = Math.floor(Math.random() * (BOARD_HEIGHT - randomPiece.length - 2)) + 1;
        } while (isPositionOccupied(randomPiece, randomX, randomY));

        randomPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    MATRIX[y + randomY][x + randomX] = value;
                }
            });
        });
    }
}

function isPositionOccupied(piece, posX, posY) {
    for (let y = -1; y < piece.length + 1; y++) {
        for (let x = -1; x < piece[0].length + 1; x++) {
            if (MATRIX[y + posY]?.[x + posX] !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Events
document.addEventListener("keydown", (event) => {
    if (event.key === 'ArrowLeft') {
        CURRENT_PIECE.x--;
        if (checkCollision()) {
            CURRENT_PIECE.x++;
        }
    } else if (event.key === 'ArrowRight') {
        CURRENT_PIECE.x++;
        if (checkCollision()) {
            CURRENT_PIECE.x--;
        }
    } else if (event.key === 'ArrowDown') {
        moveDown();
    } else if (event.key === 'ArrowUp') {
        rotate();
    }
});

// Soporte para móviles


document.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, false);

document.addEventListener('touchmove', function (e) {
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
}, false);

document.addEventListener('touchend', function (e) {
    let xDiff = touchEndX - touchStartX;
    let yDiff = touchEndY - touchStartY;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { // Si se movió más horizontalmente
        if (xDiff > 0) { // Si se movió a la derecha
            CURRENT_PIECE.x++;
            if (checkCollision()) {
                CURRENT_PIECE.x--;
            }
        } else { // Si se movió a la izquierda
            CURRENT_PIECE.x--;
            if (checkCollision()) {
                CURRENT_PIECE.x++;
            }
        }
    } else { // Si se movió más verticalmente o hizo tap
        if (yDiff < 0) { // Si hizo swipe hacia arriba o hizo tap
            rotate();
        } else { // Si hizo swipe hacia abajo
            moveDown();
        }
    }

    // Reiniciar valores
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
}, false);

startButton.addEventListener("click", () => {
    MATRIX = createMatrix();
    DROP_INTERVAL = 1000;
    LEVEL = 0;
    REMOVED_ROWS = 0;
    gameOver = false;
    levelSpan.innerHTML = LEVEL;
    startButton.hidden = true;
    resetPiece();
    update();
});
drawRandomPieces();
draw();