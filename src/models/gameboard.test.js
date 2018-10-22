// @flow

import { Gameboard } from './gameboard.js';

describe('ascii-to-gameboard', () => {
    
    it('works', () => {
        const ascii = `
        . . . .
        . . . .
        . . . #
        `;

        const gb = Gameboard.fromAscii(ascii);
        expect(gb.cells).toHaveLength(3*4);
        expect(gb.cells.filter(c => c.isMine)).toHaveLength(1);

        const mine = gb.cells.find(c => c.isMine);
        expect(mine).toBeDefined();
        expect(mine.row).toBe(2);
        expect(mine.col).toBe(3);
    });
});

describe('getAdjacent', () => {
    it('works away from corners', () => {
        const gb = Gameboard.fromAscii(`
        # . .
        . . # 
        . # .
        `);

        const cell = gb.cell(1,1);
        const adjacent = cell.getAdjacent();
        expect(adjacent).toHaveLength(8);
        expect(adjacent).toEqual(expect.arrayContaining(
            expect.objectContaining({ row: 0, col: 0 }),
        ));
    });
});
