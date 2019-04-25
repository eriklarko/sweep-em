// @flow

import { Gameboard, cellsToAscii, groupByRow } from './gameboard.js';

describe('ascii-to-gameboard', () => {
    
    it('works', () => {
        const ascii = `
        . . . .
        . . . .
        . . . x
        `;

        const gb = Gameboard.fromAscii(ascii);
        expect(gb.cells).toHaveLength(3*4);
        expect(gb.cells.filter(c => c.isMine)).toHaveLength(1);

        const mine = gb.cells.find(c => c.isMine);
        expect(mine).toBeDefined();
        if (mine) { // flow doesn't see that expect.toBeDefined makes sure it is defined when these get executed
            expect(mine.row).toBe(2);
            expect(mine.col).toBe(3);
        }
    });
});

describe('getAdjacent', () => {
    const defaultBoard = Gameboard.fromAscii(`
        x . .
        . x x 
        . x .
    `);

    it('works away from corners', () => {
        const cell = defaultBoard.cell(1, 1);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                [0,0] (0,1) (0,2)
                (1,0) !1,1! (1,2)
                (2,0) [2,1] (2,2)
            `);
        }
    });

    it('works in the top left corner', () => {
        const cell = defaultBoard.cell(0, 0);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                !0,0! (0,1)
                (1,0) [1,1]
            `);
        }
    });

    it('works in the top right corner', () => {
        const cell = defaultBoard.cell(0, 2);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                (0,1) !0,2!
                [1,1] [1,2]
            `);
        }
    });

    it('works in the bottom left corner', () => {
        const cell = defaultBoard.cell(2, 0);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                (1,0) [1,1]
                !2,0! [2,1]
            `);
        }
    });

    it('works in the bottom right corner', () => {
        const cell = defaultBoard.cell(2, 2);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                [1,1] (1,2)
                [2,1] !2,2!
            `);
        }
    });

    it('works in the top row', () => {
        const cell = defaultBoard.cell(0, 1);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                [0,0] !0,1! (0,2)
                (1,0) [1,1] (1,2)
            `);
        }
    });

    it('works in the bottom row', () => {
        const cell = defaultBoard.cell(2, 1);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                (1,0) [1,1] (1,2)
                (2,0) !2,1! (2,2)
            `);
        }
    });

    it('works on the left side', () => {
        const cell = defaultBoard.cell(1, 0);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                [0,0] (0,1)
                !1,0! [1,1]
                (2,0) [2,1]
            `);
        }
    });

    it('works on the right side', () => {
        const cell = defaultBoard.cell(1, 2);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveAdjacentCells(`
                (0,1) (0,2)
                [1,1] !1,2!
                [2,1] (2,2)
            `);
        }
    });

    it('handles bug 1', () => {
        const board = Gameboard.fromAscii(`
            . x x
            . . x
            . . .
        `);

        const cell = board.cell(2, 1);
        expect(cell).toHaveAdjacentCells(`
            (1,0) (1,1) [1,2]
            (2,0) !2,1! (2,2)
        `);

        expect(cell).toHaveNumberOfAdjacentMines(1);
    });
});

describe('count adjacent mines', () => {
    const defaultBoard = Gameboard.fromAscii(`
        . . . . . . 
        . . x . . . 
        . x . . . . 
        . . . . . . 
    `);

    // lol names
    it('zero', () => { 
        const cell = defaultBoard.cell(2, 4);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveNumberOfAdjacentMines(0);
        }
    });

    it('not zero', () => { 
        const cell = defaultBoard.cell(1, 1);
        expect(cell).toBeDefined();
        if (cell) {
            expect(cell).toHaveNumberOfAdjacentMines(2);
        }
    });
});

describe('generate new', () => {
    const startingCell = { row: 8, col: 15 };
    const config = { 
        rows: 16,
        cols: 30,
        mines: 99,
        startingCell,
    };
    it('has correct num rows and cols', () => {
        const gb = Gameboard.generate(config);
        expect(gb.rows()).toHaveLength(config.rows);
        expect(gb.cols()).toHaveLength(config.cols);
    });

    it('has correct number of mines', () => {
        const gb = Gameboard.generate(config);
        expect(gb.cells.filter(c => c.isMine)).toHaveLength(config.mines);
    });

    it('has an at least 4x4 non-rectangular hole around the starting cell', () => {
        const config = {  
            rows: 16,
            cols: 30,
            // Make every possible square a mine to eliminate randomness
            mines: 16 * 30,
            startingCell,
        };
        const gb = Gameboard.generate(config);
        const revealedCells = gb.reveal(startingCell)
        //console.log(gb.toAscii());
        //console.log(cellsToAscii(revealedCells));
        expect(revealedCells.length).toBeGreaterThanOrEqual(4*4);

        // TODO: What I really want to test is that the starting area has at least x safely revealable cells. But that's hard :(
        expect(isRectangular(revealedCells)).toBe(false);
    });

    function isRectangular(cells) {
        const cellsPerRow = groupByRow(cells)
                                .map( row => row.length )
        const cellsInFirstRow = cellsPerRow.shift();
        return cellsPerRow.every(cs => cs === cellsInFirstRow);
    }
});
