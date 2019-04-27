// @flow

import { knuthShuffle } from 'knuth-shuffle';
import { Point } from './point.js';
import { Cell } from './cell.js';
import type { Coord } from './coord.js';

export type Row = Array<Cell>;
export type Col = Array<Cell>;
type Config = {
    rows: number,
    cols: number,
    mines: number,
    startingCell: Coord,
};
export class Gameboard {

    static fromAscii(ascii: string): Gameboard {
        const rows = ascii.split('\n')
            .map(r => r.trim())
            .filter(r => r.length > 0);

        const cells: Array<Cell> = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cols = row.split(' ');

            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                const cell = new Cell(i, j);
                cells.push(cell);

                if (col === 'x') {
                    cell.isMine = true;

                } else if (col === '#') {
                    cell.isRevealed = false;

                } else if (/\d/.test(col)) {
                    // $FlowFixMe: col is a number here because of the regex above
                    cell._adjacentMines = col;
                    cell.isRevealed = true;
                    cell.isMine = false;
                } else {
                    cell.isRevealed = true;
                    cell.isMine = false;
                }
            }
        }

        return new Gameboard(cells);
    }

    static generate(cfg: Config): Gameboard {
        const rows = createEmptyCells(cfg.rows, cfg.cols);
        const noMinesCoords = generateNoMinesShape(Point.fromCoords(cfg.startingCell), cfg);

        placeMines(rows, cfg, noMinesCoords);

        return new Gameboard(flatten(rows));
    }

    cells: $ReadOnlyArray<Cell>;
    gameResult: null | 'success' | 'failure';

    constructor(cells: Array<Cell>) {
        this.cells = cells;
        this.gameResult = null;

        const rowFunc = this.row.bind(this);
        this.cells.forEach(c => c.getRow = rowFunc);
    }

    cellAt(coords: Coord): ?Cell {
        return this.cell(coords.row, coords.col);
    }

    cell(row: number, col: number): ?Cell {
        return this.cells.find(c => c.row === row && c.col === col);
    }

    row(num: number): Row {
        return this.cells.filter(c => c.row === num);
    }

    rows(): Array<Row> {
        return groupByRow(this.cells);
    }

    cols(): Array<Col> {
        return groupByCol(this.cells);
    }

    reveal(coords: Coord): Array<Cell> {
        const revealed = this._reveal(coords.row, coords.col, [])

        if (revealed.some(cell => cell.isMine)) {
            this._onGameEnd(false);

        } else if (this._unrevealedNonMinesLeft() <= 0) {
            this.cells.forEach(cell => {
                if (cell.isMine) {
                    cell.isFlagged = true;
                }
            })
            this._onGameEnd(true);
        }

        return revealed;
    }

    _reveal(row: number, col: number, revealed: Array<Cell>): Array<Cell> {
        const revealedCell = this.cell(row, col);
        if (!revealedCell) {
            return revealed;
        }

        revealed.push(revealedCell);
        revealedCell.isRevealed = true;
        if (revealedCell.isMine) {
            return revealed;
        }

        if (revealedCell.numAdjacentFlags() === revealedCell.getNumberOfAdjacentMines()) {
            for (const adj of revealedCell.getAdjacent().filter(c => !c.isRevealed)) {
                this._reveal(adj.row, adj.col, revealed);      
            }
        }
        return revealed;
    }

    _unrevealedNonMinesLeft(): number {
        return this.cells.filter(cell => {
            return !cell.isRevealed && !cell.isMine;
        }).length;
    }

    _onGameEnd(success: boolean) {
        this.gameResult = success ? 'success' : 'failure';
    }

    isFinished(): boolean {
        return this.gameResult != null;
    }

    toAscii(): string {
        return cellsToAscii(this.cells, c => {
            if (c) {
                return c.isRevealed 
                    ? c.isMine ? "x" : c.getNumberOfAdjacentMines().toString()
                    : "#"
            } else {
                return "?";
            }
        });
    }
}

function flatten(rows: Array<Row>): Array<Cell> {
    return [].concat.apply([], rows);
}

export function groupByRow(cells: $ReadOnlyArray<Cell>): Array<Row> {
    const rows: Array<Row> = [];
    for (const cell of cells) {
        if (!rows[cell.row]) {
            rows[cell.row] = [];
        }
        rows[cell.row][cell.col] = cell
    }
    return rows;
}

export function groupByCol(cells: $ReadOnlyArray<Cell>): Array<Col> {
    const cols: Array<Col> = [];
    for (const cell of cells) {
        if (!cols[cell.col]) {
            cols[cell.col] = [];
        }
        cols[cell.col][cell.row] = cell
    }
    return cols;
}

export type CellRenderer = (?Cell) => string;
export function cellsToAscii(cells: $ReadOnlyArray<Cell>, cellRenderer?: CellRenderer): string {
    const rows = groupByRow(cells);
    const mostCharsPerCoordinate = 1;
    const cr = cellRenderer || (cell => cellToAscii(mostCharsPerCoordinate, cell));
    return rows
            .map(r => rowToAscii(r, rows, cr))
            .join('\n');
}

function rowToAscii(row: Row, rows: Array<Row>, cellRenderer: CellRenderer): string {

    const asciis = [];
    for (let col = 0; col < row.length; col++) {
        const cell = row[col];
        if (!cell && isMissingFromAllRows(col, rows)) {
            continue;
        }
        asciis.push(cellRenderer(cell));
    }

    return asciis.join(' ');
}

function isMissingFromAllRows(col: number, rows: Array<Row>): boolean {
    return rows.every(r => r[col] === undefined);
}

function cellToAscii(numPadding: number, cell: ?Cell): string {
    if (!cell) {
        return '(' + '?'.padStart(numPadding*2 + 1, '?') + ')';
    }

    const coords = cell.row.toString().padStart(numPadding) + ',' + cell.col.toString().padStart(numPadding);
    if (cell.isMine) {
        return '[' + coords + ']';
    } else {
        return '(' + coords + ')';
    }
}

function createEmptyCells(rows: number, cols: number): Array<Row> {
    const rs = [];
    for(let r=0; r < rows; r++) {
        const row = [];
        for(let c=0; c < cols; c++) {
            row.push(new Cell(r, c));
        }
        rs.push(row);
    }
    return rs;
}

function placeMines(rows: Array<Row>, cfg: Config, noMinesCoords: Shape) {
    // shuffle valid cells
    knuthShuffle(
        [].concat.apply([], rows) // flatten the rows
        .filter(c => {            // remove cells where we don't want mines
            if (!noMinesCoords[c.row]) {
                return true;
            }
            return !noMinesCoords[c.row][c.col];
        })
    )
    .slice(0, cfg.mines) // Take the cfg.mines first cells in the shuffled array
    .forEach(c => c.isMine = true); // mark those cells as mines
}

type Shape = { [number]: { [number]: boolean } };

function generateNoMinesShape(around: {row: number, col: number}, cfg: Config): Shape {
    const { row, col } = around;
    const noMinesCoords = {};

    const box = {
        top:   row - 3,
        bot:   row + 3,
        left:  col - 3,
        right: col + 3,
    };

    // first generate a square
    for (let r = box.top; r <= box.bot; r++) {
        noMinesCoords[r] = {};

        for (let c = box.left; c <= box.right; c++) {
            noMinesCoords[r][c] = true;
        }
    }

    // then make it jagged
    randomIntsWithin(box.top, box.bot, 3)
        .map(r => addHorizontalPeak(r, noMinesCoords, box, cfg));

    randomIntsWithin(box.left, box.right, 3)
        .map(c => addVerticalPeak(c, noMinesCoords, box, cfg));

    return noMinesCoords;
}

function randomIntsWithin(min, max, num) {
    return knuthShuffle(range(min, max))
        .slice(0, num)
}
function range(min, max): Array<number> {
    const a = [];
    for (let i=min; i<=max; i++) {
        a.push(i);
    }
    return a;
}

function addHorizontalPeak(row: number, s: Shape, box: Box, cfg: Config) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const peakHeight = 3;
    const rowsInPeak = range(row-1, row+1)
                        .filter(r => r >= box.top && r <= box.bot);

    for (const r of rowsInPeak) {
        const height = r === row
            ? peakHeight
            : Math.ceil(peakHeight/2);

        for (let i = 1; i <= height; i++) {
            let c = direction > 0
                ? box.right + i
                : box.left  - i;

            if (c < 0) c = 0;
            if (c > cfg.cols) c = cfg.cols;

            s[r][c] = true;
        }
    }
}

export type Box = {
    top: number,
    bot: number,
    left: number,
    right: number,
};
function addVerticalPeak(col: number, s: Shape, box: Box, cfg: Config) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const peakHeight = 3;
    const colsInPeak = range(col-1, col+1)
                        .filter(c => c >= box.left && c <= box.right);

    for (const c of colsInPeak) {
        const height = c === col
            ? peakHeight
            : Math.ceil(peakHeight/2);

        for (let i = 1; i <= height; i++) {
            let r = direction > 0
                ? box.bot + i
                : box.top - i;

            if (r < 0) r = 0;
            if (r > cfg.rows) r = cfg.rows;

            s[r] = s[r] || {};
            s[r][c] = true
        }
    }
}
