// @flow

import type { Row } from './gameboard.js';

export class Cell {
    row: number; 
    col: number;
    isMine: boolean;
    isFlagged: boolean;
    isRevealed: boolean;
    getRow: (number) => Row;
    _adjacentMines: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;

        this.isMine = false;
        this.isFlagged = false;
        this.isRevealed = false;
    }

    getAdjacent(): $ReadOnlyArray<Cell> {
        const r = this.getRow(this.row);
        const rAbove = this.getRow(this.row-1);
        const rBelow = this.getRow(this.row+1);

        return [
            ...rAbove.filter(c => this.isAtMostOneColAway(c)),
            ...r.filter(c => !this.isSame(c) && this.isAtMostOneColAway(c)),
            ...rBelow.filter(c => this.isAtMostOneColAway(c)),
        ];
    }

    isSame(other: Cell): boolean {
        return this.row === other.row && this.col === other.col;
    }

    isAtMostOneColAway(other: Cell): boolean {
        return Math.abs(other.col - this.col) <= 1;
    }

    getNumberOfAdjacentMines(): number {
        // for testing purposes only
        if (this._adjacentMines) {
            return this._adjacentMines;
        }

        let mines = 0;
        for (const adj of this.getAdjacent()) {
            if (adj.isMine) {
                mines++;
            }
        }
        return mines;
    }

    numAdjacentFlags(): number {
        let flags = 0;
        for (const adj of this.getAdjacent()) {
            if (adj.isFlagged) {
                flags++;
            }
        }
        return flags;
    }
}

