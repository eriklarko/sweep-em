// @flow

import { findValidPlacements, parsePlacements, consolidate } from './placements.js';
import { Gameboard, Cell, cellsToAscii } from './gameboard.js';

it("returns placements for cells at the edges", () => {
    const board = Gameboard.fromAscii(`
        . # #
        . . #
        . 1 #
    `);

    const cell = board.cell(2,1);
    expect(cell).toHaveValidPlacements(board,
        `. # #
         . . Y
         . 1 N`
        ,
        `. # #
         . . N
         . 1 Y`
        ,
    )
});

it("handles case 1", () => {
    const board = Gameboard.fromAscii(`
        . # #
        1 . #
        . . #
    `);

    const cell = board.cell(1,0);
    expect(cell).toHaveValidPlacements(board,
        `. Y #
         1 . #
         . . #`
    )
});

it("handles case 2", () => {
    const board = Gameboard.fromAscii(`
        . # #
        . 3 #
        . . #
    `);

    const cell = board.cell(1,1);
    expect(cell).toHaveValidPlacements(board,
        `. Y Y
         . 3 Y
         . . N`
        ,
        `. Y Y
         . 3 N
         . . Y`
        ,
        `. Y N
         . 3 Y
         . . Y`
        ,
        `. N Y
         . 3 Y
         . . Y`
        ,
    )
});

it("handles case 3", () => {
    const board = Gameboard.fromAscii(`
        # # #
        # 2 #
        # # #
    `);

    const cell = board.cell(1,1);
    expect(cell).toHaveValidPlacements(board,
        `Y Y N
         N 2 N
         N N N`
        ,
        `Y N Y
         N 2 N
         N N N`
        ,
        `Y N N
         N 2 Y
         N N N`
        ,
        `Y N N
         N 2 N
         N N Y`
        ,
        `Y N N
         N 2 N
         N Y N`
        ,
        `Y N N
         N 2 N
         Y N N`
        ,
        `Y N N
         Y 2 N
         N N N`
        ,


        `N Y Y
         N 2 N
         N N N`
        ,
        `N Y N
         N 2 Y
         N N N`
        ,
        `N Y N
         N 2 N
         N N Y`
        ,
        `N Y N
         N 2 N
         N Y N`
        ,
        `N Y N
         N 2 N
         Y N N`
        ,
        `N Y N
         Y 2 N
         N N N`
        ,


        `N N Y
         N 2 Y
         N N N`
        ,
        `N N Y
         N 2 N
         N N Y`
        ,
        `N N Y
         N 2 N
         N Y N`
        ,
        `N N Y
         N 2 N
         Y N N`
        ,
        `N N Y
         Y 2 N
         N N N`
        ,

        `N N N
         N 2 Y
         N N Y`
        ,
        `N N N
         N 2 Y
         N Y N`
        ,
        `N N N
         N 2 Y
         Y N N`
        ,
        `N N N
         Y 2 Y
         N N N`
        ,

        `N N N
         N 2 N
         N Y Y`
        ,
        `N N N
         N 2 N
         Y N Y`
        ,
        `N N N
         Y 2 N
         N N Y`
        ,

        `N N N
         N 2 N
         Y Y N`
        ,
        `N N N
         Y 2 N
         N Y N`
        ,


        `N N N
         Y 2 N
         Y N N`
        ,
    )
});

it("handles case 4", () => {
        const board = Gameboard.fromAscii(`
            . 1 #
            . 1 #
            . 1 #
        `);

    const cell = board.cell(0,1);
    expect(cell).toHaveValidPlacements(board, 
        `. 1 Y
         . 1 N
         . 1 #`
        ,
        `. 1 N
         . 1 Y
         . 1 #`,
    )
})
