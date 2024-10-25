const canvas = document.getElementById('game-board');
const context = canvas.getContext('2d');
const holdCanvas = document.getElementById('hold-area');
const holdContext = holdCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = ['#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

let board = createBoard();
let currentPiece = getRandomPiece();
let holdPiece = null;
let score = 0;
let gameOver = false;

document.addEventListener('keydown', handleKeyPress);

function createBoard() {
    const board = [];
    for (let row = 0; row < ROWS; row++) {
        board.push(new Array(COLS).fill(0));
    }
    return board;
}

function getRandomPiece() {
    const pieces = 'IJLOSTZ';
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return new Piece(piece);
}

function Piece(type) {
    this.type = type;
    this.color = COLORS[pieces.indexOf(type)];
    this.shape = SHAPES[type];
    this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
    this.y = 0;
}

const SHAPES = {
    I: [
        [1, 1, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ]
};

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                context.fillStyle = COLORS[board[row][col] - 1];
                context.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece(piece, context) {
    context.fillStyle = piece.color;
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                context.fillRect((piece.x + col) * BLOCK_SIZE, (piece.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function handleKeyPress(event) {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft':
            movePiece(-1);
            break;
        case 'ArrowRight':
            movePiece(1);
            break;
        case 'ArrowDown':
            dropPiece();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            hardDropPiece();
            break;
        case 'c':
            holdCurrentPiece();
            break;
    }
}

function movePiece(direction) {
    currentPiece.x += direction;
    if (isCollision()) {
        currentPiece.x -= direction;
    }
}

function dropPiece() {
    currentPiece.y++;
    if (isCollision()) {
        currentPiece.y--;
        placePiece();
        currentPiece = getRandomPiece();
        if (isCollision()) {
            gameOver = true;
            alert('Game Over');
        }
    }
}

function hardDropPiece() {
    while (!isCollision()) {
        currentPiece.y++;
    }
    currentPiece.y--;
    placePiece();
    currentPiece = getRandomPiece();
    if (isCollision()) {
        gameOver = true;
        alert('Game Over');
    }
}

function rotatePiece() {
    const shape = currentPiece.shape;
    const newShape = [];
    for (let row = 0; row < shape[0].length; row++) {
        newShape[row] = [];
        for (let col = 0; col < shape.length; col++) {
            newShape[row][col] = shape[shape.length - 1 - col][row];
        }
    }
    currentPiece.shape = newShape;
    if (isCollision()) {
        currentPiece.shape = shape;
    }
}

function holdCurrentPiece() {
    if (!holdPiece) {
        holdPiece = currentPiece;
        currentPiece = getRandomPiece();
    } else {
        const temp = currentPiece;
        currentPiece = holdPiece;
        holdPiece = temp;
    }
    holdPiece.x = 0;
    holdPiece.y = 0;
    drawHoldPiece();
}

function drawHoldPiece() {
    holdContext.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    drawPiece(holdPiece, holdContext);
}

function placePiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                board[currentPiece.y + row][currentPiece.x + col] = COLORS.indexOf(currentPiece.color) + 1;
            }
        }
    }
    clearLines();
}

function clearLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(new Array(COLS).fill(0));
            score += 10;
            scoreDisplay.textContent = score;
        }
    }
}

function isCollision() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] &&
                (board[currentPiece.y + row] && board[currentPiece.y + row][currentPiece.x + col]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function update() {
    if (!gameOver) {
        drawBoard();
        drawPiece(currentPiece, context);
        requestAnimationFrame(update);
    }
}

update();
