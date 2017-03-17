let lost = false;


class Cell {

    constructor(x, y, board) {
        this.x = x;
        this.y = y;
        this.board = board;
        this.bomb = false;
        this.nearby_bombs = 0;
        this.flagged = false;
        this.opened = false;
        this.cell = document.createElement("div");
        this.cell.classList.toggle("cell", true);
        this.cell.classList.toggle("cell_closed", true);
        this.cell.setAttribute("x", x);
        this.cell.setAttribute("y", y);
    }

    getCellElement() {
        return this.cell;
    }

    hasBomb() {
        return this.bomb;
    }

    setBomb() {
        this.bomb = true;
    }

    setNearbyBombs() {
        this.nearby_bombs = getNearbyBombs(this.board, this.x, this.y);
    }

    hasNoNearbyBombs() {
        return this.nearby_bombs == 0;
    }

    getNearbyBombs() {
        return this.nearby_bombs;
    }

    isOpened() {
        return this.opened;
    }

    open() {
        this.opened = true;
        if (allNonBombsOpened(this.board)) {
            lost = true;
            document.getElementById("status").textContent = "Game won!";
            displayLost(this.board)
        }
    }

    isFlagged() {
        return this.flagged;
    }

    toggleFlagged() {
        this.flagged = !this.flagged;
    }

}


function generateBoard() {
    lost = false;
    let board = document.getElementById("board");
    while (board.hasChildNodes()) {
        board.removeChild(board.firstChild);
    }

    document.getElementById("status").textContent = "Running";

    let width = parseInt(document.getElementById("columns").value);
    let height = parseInt(document.getElementById("rows").value);

    let board_array = new Array(width);

    for (let x = 0; x < width; x++) {
        board_array[x] = new Array(height);
        let rowEl = document.createElement("div");
        rowEl.setAttribute("class", "row");
        board.appendChild(rowEl);
        for (let y = 0; y < height; y++) {
            board_array[x][y] = new Cell(x, y, board_array);
            setupCell(board_array[x][y]);
            rowEl.appendChild(board_array[x][y].getCellElement());
        }
    }

    let bombs = parseInt(document.getElementById("bombs").value);
    bombs = Math.min(width * height, bombs);
    document.getElementById("remaining_bombs").textContent = (String)(bombs);

    while (bombs > 0) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);

        if (!board_array[x][y].hasBomb()) {
            bombs--;
            board_array[x][y].setBomb();
        }
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (board_array[x][y].hasBomb()) {
                board_array[x][y].getCellElement().textContent = "B";
            } else {
                board_array[x][y].setNearbyBombs();
                if (board_array[x][y].hasNoNearbyBombs()) {
                    board_array[x][y].getCellElement().textContent = " ";
                } else {
                    board_array[x][y].getCellElement().textContent = board_array[x][y].getNearbyBombs();
                }
            }
        }
    }

    document.body.onkeydown = function (e) {
        let cellElList = document.getElementsByClassName("hovered");
        if (cellElList.length != 1) return;
        let cellEl = cellElList[0];

        let keycode;
        if (window.event) {
            keycode = window.event.keyCode;
        } else {
            keycode = e.keyCode;
        }

        let cell = board_array[cellEl.getAttribute("x")][cellEl.getAttribute("y")];

        if (cell.isOpened() || lost) return;


        if (keycode == 70) {
            if (cell.isFlagged()) {
                document.getElementById("remaining_bombs").textContent = (String)(parseInt(document.getElementById("remaining_bombs").textContent) + 1);
            } else {
                if (parseInt(document.getElementById("remaining_bombs").textContent) == 0) return;
                document.getElementById("remaining_bombs").textContent = (String)(parseInt(document.getElementById("remaining_bombs").textContent) - 1);
            }
            cell.toggleFlagged();
            cell.getCellElement().classList.toggle('cell_flagged', cell.isFlagged());
        }

        else if (keycode == 68) {
            if (cell.isFlagged()) return;
            if (cell.hasBomb()) {
                displayLost(board_array);
                lost = true;
                document.getElementById("status").textContent = "Game lost!"
            } else {
                if (cell.hasNoNearbyBombs()) {
                    cascadeZero(board_array, parseInt(cellEl.getAttribute("x")), parseInt(cellEl.getAttribute("y")))
                }
                cell.getCellElement().classList.toggle('cell_open', true);
                cell.getCellElement().classList.toggle('cell_closed', false);
                cell.open();
            }
        }
    };
}

function allNonBombsOpened(board) {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[0].length; y++) {
            let cell = board[x][y];
            if (!cell.hasBomb() && !cell.isOpened()) return false;
        }
    }
    return true;
}

function displayLost(board) {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[0].length; y++) {
            let cell = board[x][y]
            if (cell.hasBomb() && !cell.isFlagged()) {
                cell.getCellElement().classList.toggle('cell_bomb', true);
            } else if (cell.isFlagged() && !cell.hasBomb()) {
                cell.getCellElement().classList.toggle("cell_flagged_false", true);
            }
        }
    }
}

function cascadeZero(board, x, y) {
    if (isInBoard(board, x, y) && !board[x][y].isOpened() && !board[x][y].isFlagged()) {
        board[x][y].getCellElement().classList.toggle('cell_open', true);
        board[x][y].getCellElement().classList.toggle('cell_closed', false);
        board[x][y].open();
        if (board[x][y].hasNoNearbyBombs()) {
            cascadeZero(board, x + 2, y + 1);
            cascadeZero(board, x + 2, y - 1);
            cascadeZero(board, x - 2, y + 1);
            cascadeZero(board, x - 2, y - 1);
            cascadeZero(board, x + 1, y + 2);
            cascadeZero(board, x - 1, y + 2);
            cascadeZero(board, x + 1, y - 2);
            cascadeZero(board, x - 1, y - 2);
        }
    }
}

function isInBoard(board, x, y) {
    return x >= 0 && x < board.length && y >= 0 && y < board[0].length;
}

function setupCell(cell) {
    cell.getCellElement().onmouseover = function (e) {
        cell.getCellElement().classList.toggle('hovered', true);
    };

    cell.getCellElement().onmouseout = function (e) {
        cell.getCellElement().classList.toggle('hovered', false);
    };
}

function getNearbyBombs(board, x, y) {
    return hasBomb(board, x + 2, y + 1) + hasBomb(board, x + 2, y - 1) + hasBomb(board, x - 2, y + 1) + hasBomb(board, x - 2, y - 1)
        + hasBomb(board, x + 1, y + 2) + hasBomb(board, x - 1, y + 2) + hasBomb(board, x + 1, y - 2) + hasBomb(board, x - 1, y - 2);
}

function hasBomb(board, x, y) {
    return isInBoard(board, x, y) && board[x][y].hasBomb();
}

window.onload = function () {
    generateBoard();
};