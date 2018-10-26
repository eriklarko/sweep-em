// @flow

import type { Coord } from './coord.js';

export class Point {
    row: number;
    col: number;

    static fromCoords(coord: Coord): Point {
        return new Point(coord.row, coord.col);
    }

    static clone(toClone: Point) {
        return new Point(toClone.row, toClone.col);
    } 

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    clone() {
        return Point.clone(this);
    }

    addPoint(other: Point) {
        return this.add(other.row, other.col)
    }

    add(row: number, col: number, max?: Point) {
        this.row = Math.max(0, this.row + row);
        this.col = Math.max(0, this.col + col);

        if (max) {
            this.row = Math.min(max.row, this.row);
            this.col = Math.min(max.col, this.col);
        }

        return this;
    }

    jiggle(constraints: { maxRow: number, maxCol: number }) {
        this.row += this._randomWithDirection(constraints.maxRow);
        this.col += this._randomWithDirection(constraints.maxCol);

        return this;
    }

    _randomWithDirection(max: number, min: number = 0): number {
        const direction = Math.random() < 0.5 ? 1 : -1;
        return Math.floor(Math.random() * Math.floor(max - min) * direction) + min;
    }

    distanceTo(other: Point): number {
        return Math.sqrt(
            Math.pow(this.row - other.row, 2) + 
            Math.pow(this.col - other.col, 2)
        );
    }
}

