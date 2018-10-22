// @flow

export type Row = Array<Cell>;
export type Col = Array<Cell>;
export class Cell {
    row: number; 
    col: number;
    isMine: boolean;
    gameboard: Gameboard;

    constructor(row: number, col: number, isMine: boolean) {
        this.row = row;
        this.col = col;
        this.isMine = isMine;
    }

    getAdjacent(): $ReadOnlyArray<Cell> {
        const r = this.gameboard.row(this.row);
        const rAbove = this.gameboard.row(this.row-1);
        const rBelow = this.gameboard.row(this.row+1);

        
        return [
            ...rAbove,
            ...r.filter(c => c.row !== this.row && c.col !== this.col),
            ...rBelow,
        ];
    }

    getNumberOfAdjacentMines(): number {
        return this.getAdjacent().reduce(
            (sum, cell) => sum + cell.isMine ? 1 : 0,
            0
        );
    }
}

export class Gameboard {

    static fromAscii(ascii: string): Gameboard {
        const rows = ascii.split('\n')
            .map(r => r.trim())
            .filter(r => r.length > 0);

        const cells = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cols = row.split(' ');

            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                cells.push(new Cell(i, j, col === '#'));
            }
        }

        return new Gameboard(cells);
    }

    cells: $ReadOnlyArray<Cell>;
    constructor(cells: Array<Row>) {
        this.cells = cells;
        this.cells.forEach(c => c.gameboard = this);
    }

    cell(row: number, col: number): ?Cell {
        return this.cells.find(c => c.row === row && c.col === col);
    }

    rows(): $ReadOnlyArray<Row> {
        return [];
    }

    row(num: number): $ReadOnlyArray<Cell> {
        return this.cells.filter(c => c.row === num);
    }

    cols(): $ReadOnlyArray<Col> {
        return [];
    }
}
