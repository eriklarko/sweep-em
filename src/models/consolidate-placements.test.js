// @flow

import { parsePlacement, findValidPlacements, consolidate } from './placements.js';
import { Gameboard } from './gameboard.js';
import type { Cell }  from './cell.js';

describe("consolidate placements", () => {
    it("merges non-contradictory data", () => {
        const board = Gameboard.fromAscii(`
            # 1 #
            . . .
            # 1 #
        `);

        const p1 = parsePlacement(`
            Y 1 N
            . . .
            # 1 #
        `, board);
        const p2 = parsePlacement(`
            # 1 #
            . . .
            N 1 Y
        `, board);

        p1.source = cellOrFail(board, 0, 1);
        p2.source = cellOrFail(board, 2, 1);

        expect(consolidate(board, p1, p2)).toBePlacement(board, `
            Y 1 N
            . . .
            N 1 Y
        `);

    });

    it("handles board 1", () => {
        const board = Gameboard.fromAscii(`
            . 1 #
            . 1 #
            . 1 #
        `);

        const p1 = findValidPlacements(cellOrFail(board, 0, 1));
        const p2 = findValidPlacements(cellOrFail(board, 1, 1));
        const p3 = findValidPlacements(cellOrFail(board, 2, 1));

        const c = consolidate(board, ...p1, ...p2, ...p3);
        expect(c).toBePlacement(board, `
            . 1 N
            . 1 Y
            . 1 N
        `);
    });

    it("handles board 2", () => {
        const board = Gameboard.fromAscii(`
            . 1 #
            . 2 #
            . 1 #
        `);

        const p1 = findValidPlacements(cellOrFail(board, 0, 1));
        const p2 = findValidPlacements(cellOrFail(board, 1, 1));
        const p3 = findValidPlacements(cellOrFail(board, 2, 1));

        const c = consolidate(board, ...p1, ...p2, ...p3);
        expect(c).toBePlacement(board, `
            . 1 Y
            . 2 N
            . 1 Y
        `);
    });
});

function cellOrFail(board: Gameboard, row: number, col: number): Cell {
    const cell = board.cell(row, col);
    if (!cell) {
        throw new Error("Cell (" + row + ", " + col + ") doesn't exist in the provided board");
    }

    return cell;
}
