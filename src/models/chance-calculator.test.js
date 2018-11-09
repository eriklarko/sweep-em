// @flow

import { Gameboard, Cell, cellsToAscii } from './gameboard.js';
import { calculateChances, findValidPlacements } from './chance-calculator.js';

describe('chances', () => {
    it('handles board 1', () => {
        const board = Gameboard.fromAscii(`
            1 x x
            1 3 x
            . 1 #
        `);

        const expectedChances = cellChances(`
            0 1 1.0
            0 0 0.5
            0 0 0.5
        `);
        const chances = calculateChances(board);
        /*const apa = Array.from(chances).map( e => {
            const cell = e[0];
            const chance = e[1];

            cell.chance = chance;
            return cell;
        });
        console.log(cellsToAscii(apa, c => {
            if(c) {
                return c.chance;
            } else {
                return '?';
            }
        }));*/

        //expect(chances).toEqual(expectedChances);
        expect(true).toBe(false);
    });

    it('handles board 2', () => {
        const board = Gameboard.fromAscii(`
            . 1 #
            . 2 x
            . 2 x
        `);

        const expectedChances = cellChances(`
            0 0 0
            0 0 1
            0 0 1
        `);
        const chances = calculateChances(board);
        /*const apa = Array.from(chances).map( e => {
            const cell = e[0];
            const chance = e[1];

            cell.chance = chance;
            return cell;
        });
        console.log(cellsToAscii(apa, c => {
            if(c) {
                return c.chance;
            } else {
                return '?';
            }
        }));*/

        //expect(chances).toEqual(expectedChances);
        expect(true).toBe(false);
    });

    function cellChances(ascii: string) {
        const rows = ascii.split('\n')
            .map(r => r.trim())
            .filter(r => r.length > 0);

        const cells = new Map();
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            const cols = row.split(' ');

            for (let c = 0; c < cols.length; c++) {
                const col = parseFloat(cols[c]);
                const cell = new Cell(r, c);
                cells.set(cell, col);
            }
        }

        return cells;
    }
});

describe('valid placements', () => {
    fit('handles board 1', () => {
        const board = Gameboard.fromAscii(`
            1 x x
            1 3 x
            . 1 #
        `);

        const cell = board.cell(2,1);
        if (!cell) {
            expect(cell).toBeDefined();
            return;
        }

        const placements = findValidPlacements(cell);
        const asciiPlacements = placements.map( p => placementToString(board, p))
        expect(asciiPlacements).toEqual([
            `1 # #
             1 3 Y
             0 1 #`
            ,
            `1 # #
             1 3 #
             0 1 Y`
            ,
        ]);
        asciiPlacements.forEach(p => console.log(p));
        expect(true).toBe(false);
    });

    function placementToString(board, placement) {
        return cellsToAscii(board.cells, c => {
            if (!c) {
                return "?";
            }

            const lol = placement.get(c);
            if (lol) {
                return lol ? "Y" : "N"
            }

            return c.isRevealed
                ? c.getNumberOfAdjacentMines().toString()
                : '#';
        });
    }
});
