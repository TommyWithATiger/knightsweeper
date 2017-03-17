let lost = false;

function makeCell() {
    return {
        'bomb': false,
        'nearby_bombs': 0,
        'opened': false,
        'flagged': false
    }
}


function generateBoard() {
    lost = false;
    let board = document.getElementById("board");
    while (board.hasChildNodes()) {
        board.removeChild(board.firstChild);
    }

    let width = parseInt(document.getElementById("columns").value);
    let height = parseInt(document.getElementById("rows").value);

    let board_array = new Array(width);

    for (let x = 0; x < width; x++) {
        board_array[x] = new Array(height);
        let rowEl = document.createElement("div");
        rowEl.setAttribute("class", "row");
        board.appendChild(rowEl);
        for (let y = 0; y < height; y++) {
            board_array[x][y] = makeCell();
            let cellEl = document.createElement("div");
            cellEl.classList.toggle("cell", true);
            cellEl.classList.toggle("cell_closed", true);
            cellEl.setAttribute("x", x);
            cellEl.setAttribute("y", y);
            board_array[x][y]['cell'] = cellEl;
            setupCell(board_array[x][y]);
            rowEl.appendChild(cellEl);
        }
    }

    let bombs = parseInt(document.getElementById("bombs").value);
    bombs = Math.min(width * height, bombs);
    document.getElementById("remaining_bombs").textContent = (String)(bombs);

    while (bombs > 0) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);

        if (!board_array[x][y]['bomb']) {
            bombs--;
            board_array[x][y]['bomb'] = true;
        }
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (board_array[x][y]['bomb']) {
                board_array[x][y]['cell'].textContent = "B";
            } else {
                board_array[x][y]['nearby_bombs'] = getNearbyBombs(board_array, x, y);
                if (board_array[x][y]['nearby_bombs'] != 0) {
                    board_array[x][y]['cell'].textContent = board_array[x][y]['nearby_bombs']
                } else {
                    board_array[x][y]['cell'].textContent = " ";
                }
            }
        }
    }

    document.body.onkeydown = function (e) {
        console.log("hei");
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

        if (cell['opened'] || lost) return;


        if (keycode == 70) {
            if (cell['flagged']) {
                document.getElementById("remaining_bombs").textContent = (String)(parseInt(document.getElementById("remaining_bombs").textContent) + 1);
            } else {
                if (parseInt(document.getElementById("remaining_bombs").textContent) == 0) return;
                document.getElementById("remaining_bombs").textContent = (String)(parseInt(document.getElementById("remaining_bombs").textContent) - 1);
            }
            cell['flagged'] = !cell['flagged'];
            cell['cell'].classList.toggle('cell_flagged', cell['flagged']);
        }

        else if (keycode == 68) {
            if (cell['flagged']) return;
            if (cell['bomb']) {
                cell['cell'].classList.toggle('cell_bomb', true);
                lost = true;
            } else {
                if (cell['nearby_bombs'] == 0) {
                    cascadeZero(board_array, parseInt(cellEl.getAttribute("x")), parseInt(cellEl.getAttribute("y")))
                }
                cell['cell'].classList.toggle('cell_open', true);
                cell['cell'].classList.toggle('cell_closed', false);
                cell['opened'] = true;
            }
        }
    };
}

function cascadeZero(board, x, y) {
    if (isInBoard(board, x, y) && !board[x][y]['opened']) {
        board[x][y]['cell'].classList.toggle('cell_open', true);
        board[x][y]['cell'].classList.toggle('cell_closed', false);
        board[x][y]['opened'] = true;
        if (board[x][y]['nearby_bombs'] == 0) {
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
    cell['cell'].onmouseover = function (e) {
        cell['cell'].classList.toggle('hovered', true);
    };

    cell['cell'].onmouseout = function (e) {
        cell['cell'].classList.toggle('hovered', false);
    };
}

function getNearbyBombs(board, x, y) {
    return hasBomb(board, x + 2, y + 1) + hasBomb(board, x + 2, y - 1) + hasBomb(board, x - 2, y + 1) + hasBomb(board, x - 2, y - 1)
        + hasBomb(board, x + 1, y + 2) + hasBomb(board, x - 1, y + 2) + hasBomb(board, x + 1, y - 2) + hasBomb(board, x - 1, y - 2);
}

function hasBomb(board, x, y) {
    return isInBoard(board, x, y) && board[x][y].bomb;
}

window.onload = function () {
    generateBoard();
};