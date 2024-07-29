document.addEventListener('DOMContentLoaded', () => {
    const GRID_SIZE = 7;
    const CELL_COUNT = GRID_SIZE * GRID_SIZE;
    const WIN_CONDITION = 128;
    let grid = [];
    let score = 0;
    let gameOver = false;

    const gridContainer = document.getElementById('grid-container');
    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('game-over');
    const gameOverTextElement = document.getElementById('game-over-text');
    const restartButton = document.getElementById('restart-btn');

    function initGame() {
        grid = Array(CELL_COUNT).fill(0);
        score = 0;
        gameOver = false;
        addRandomTile();
        addRandomTile();
        updateGrid();
    }

    function addRandomTile() {
        const emptyCells = grid.reduce((acc, cell, index) => {
            if (cell === 0) acc.push(index);
            return acc;
        }, []);
        
        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.5 ? 2 : 4;
            const type = Math.random() < 0.5 ? 'good' : 'bad';
            grid[randomIndex] = { value, type };
        }
    }

    function updateGrid() {
        gridContainer.innerHTML = '';
        for (let i = 0; i < CELL_COUNT; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            if (grid[i] !== 0) {
                cell.textContent = getEmoji(grid[i]);
                cell.classList.add(`${grid[i].type}-${grid[i].value}`);
            }
            gridContainer.appendChild(cell);
        }
        scoreElement.textContent = score;
    }

    function getEmoji(tile) {
        const goodEmojis = ['🌟', '🌈', '🦄', '🍀', '🌺', '🌞'];
        const badEmojis = ['👾', '👻', '💀', '🕷️', '🦂', '🦹'];
        const index = Math.log2(tile.value) - 1;
        return tile.type === 'good' ? goodEmojis[index] : badEmojis[index];
    }

    function moveTiles(direction) {
        if (gameOver) return;

        const oldGrid = JSON.parse(JSON.stringify(grid));
        let moved = false;

        function moveLine(line) {
            const filtered = line.filter(tile => tile !== 0);
            const newLine = [];
            for (let i = 0; i < filtered.length; i++) {
                if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value && filtered[i].type === filtered[i + 1].type) {
                    newLine.push({
                        value: filtered[i].value * 2,
                        type: filtered[i].type
                    });
                    score += filtered[i].value * 2;
                    i++;
                    moved = true;
                } else {
                    newLine.push(filtered[i]);
                }
            }
            while (newLine.length < GRID_SIZE) newLine.push(0);
            return newLine;
        }

        if (direction === 'left') {
            for (let i = 0; i < GRID_SIZE; i++) {
                const row = grid.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE);
                const newRow = moveLine(row);
                for (let j = 0; j < GRID_SIZE; j++) {
                    grid[i * GRID_SIZE + j] = newRow[j];
                }
            }
        } else if (direction === 'right') {
            for (let i = 0; i < GRID_SIZE; i++) {
                const row = grid.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE).reverse();
                const newRow = moveLine(row).reverse();
                for (let j = 0; j < GRID_SIZE; j++) {
                    grid[i * GRID_SIZE + j] = newRow[j];
                }
            }
        } else if (direction === 'up') {
            for (let j = 0; j < GRID_SIZE; j++) {
                const column = [
                    grid[j],
                    grid[j + GRID_SIZE],
                    grid[j + GRID_SIZE * 2],
                    grid[j + GRID_SIZE * 3],
                    grid[j + GRID_SIZE * 4],
                    grid[j + GRID_SIZE * 5],
                    grid[j + GRID_SIZE * 6]
                ];
                const newColumn = moveLine(column);
                for (let i = 0; i < GRID_SIZE; i++) {
                    grid[i * GRID_SIZE + j] = newColumn[i];
                }
            }
        } else if (direction === 'down') {
            for (let j = 0; j < GRID_SIZE; j++) {
                const column = [
                    grid[j],
                    grid[j + GRID_SIZE],
                    grid[j + GRID_SIZE * 2],
                    grid[j + GRID_SIZE * 3],
                    grid[j + GRID_SIZE * 4],
                    grid[j + GRID_SIZE * 5],
                    grid[j + GRID_SIZE * 6]
                ].reverse();
                const newColumn = moveLine(column).reverse();
                for (let i = 0; i < GRID_SIZE; i++) {
                    grid[i * GRID_SIZE + j] = newColumn[i];
                }
            }
        }

        if (moved || JSON.stringify(oldGrid) !== JSON.stringify(grid)) {
            addRandomTile();
            updateGrid();
            checkGameOver();
        }
    }

    function checkGameOver() {
        let hasEmptyCell = false;
        let hasWon = false;

        for (let tile of grid) {
            if (tile === 0) {
                hasEmptyCell = true;
            } else if (tile.value === WIN_CONDITION && tile.type === 'good') {
                hasWon = true;
                break;
            }
        }

        if (hasWon) {
            gameOver = true;
            gameOverTextElement.textContent = "You Win!";
            gameOverElement.classList.remove('hidden');
            return;
        }

        if (!hasEmptyCell) {
            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    const current = grid[i * GRID_SIZE + j];
                    if (
                        (j < GRID_SIZE - 1 && current.value === grid[i * GRID_SIZE + j + 1].value && current.type === grid[i * GRID_SIZE + j + 1].type) ||
                        (i < GRID_SIZE - 1 && current.value === grid[(i + 1) * GRID_SIZE + j].value && current.type === grid[(i + 1) * GRID_SIZE + j].type)
                    ) {
                        return; // Still has possible moves
                    }
                }
            }

            gameOver = true;
            gameOverTextElement.textContent = "Game Over";
            gameOverElement.classList.remove('hidden');
        }
    }

    document.getElementById('up-btn').addEventListener('click', () => moveTiles('up'));
    document.getElementById('down-btn').addEventListener('click', () => moveTiles('down'));
    document.getElementById('left-btn').addEventListener('click', () => moveTiles('left'));
    document.getElementById('right-btn').addEventListener('click', () => moveTiles('right'));
    restartButton.addEventListener('click', () => {
        gameOverElement.classList.add('hidden');
        initGame();
    });

    document.addEventListener('keydown', (e) => {
        if (!gameOver) {
            switch(e.key) {
                case 'ArrowUp': moveTiles('up'); break;
                case 'ArrowDown': moveTiles('down'); break;
                case 'ArrowLeft': moveTiles('left'); break;
                case 'ArrowRight': moveTiles('right'); break;
            }
        }
    });

    initGame();
});