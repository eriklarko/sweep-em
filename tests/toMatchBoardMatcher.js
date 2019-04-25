// @flow

import { failWithUndefined } from './common.js';
import { cellsToAscii } from '../src/models/gameboard.js';
import type { Cell } from '../src/models/gameboard.js';

expect.extend({
    // Does not give good messages for .not
    toHaveAdjacentCells(received: ?Cell, expectedBoardString: string) {
        if (!received) {
            return failWithUndefined(this, received);
        }

        expectedBoardString = indentRows(expectedBoardString, '    ');
        const adjacent = received.getAdjacent();
        const adjacentString = cellsToAscii(adjacent);

        const diff = compareBoards(expectedBoardString, adjacent);
        const passed = diff.mustNotExist.length === 0
            && diff.missing.length === 0
            && diff.mine.length === 0
            && diff.notMine.length === 0;
        
        const message = () => {
            return "Expected"
                + this.utils.EXPECTED_COLOR(
                    indentRows(expectedBoardString, '    ')
                )
                + "\ngot"
                + this.utils.RECEIVED_COLOR(
                    indentRows(adjacentString, '    ')
                )
                + "\n"
                + "\nmissing cells: " + this.utils.RECEIVED_COLOR(diff.missing.join('  '))
                + "\ncells that should not be there: " + this.utils.RECEIVED_COLOR(diff.mustNotExist.join('  '))
                + "\nexpected mines at: " + this.utils.RECEIVED_COLOR(diff.mine.join('  '))
                + "\ndid not expect mines at: " + this.utils.RECEIVED_COLOR(diff.notMine.join('  '))
            ;
        };

        return {
            pass: passed,
            message: message,
        };
    },

    // Does not give good messages for .not
    toHaveNumberOfAdjacentMines(received: ?Cell, expectedNumberOfMines: string) {
        if (!received) {
            return failWithUndefined(this, received);
        }

        const r = received;
        const actual = r.getNumberOfAdjacentMines();
        const passed = actual === expectedNumberOfMines;
        const message = () => {
            return "Expected "
                + this.utils.EXPECTED_COLOR(
                    expectedNumberOfMines
                )
                + " mines\nFound "
                + this.utils.RECEIVED_COLOR(
                    actual
                )
                + "\n"
                + this.utils.RECEIVED_COLOR(cellsToAscii(r.getAdjacent()))
            ;
        };
        return {
            pass: passed,
            message: message,
        };
    },
});

function compareBoards(expectedString, cells) {
    // parse expectedString and find the required cells
    const rows = expectedString.split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

    const requiredCells = [];
    for(const row of rows) {
        const cols = row.split('  ');

        for (const rawCell of cols) {
            const contents  = rawCell.substr(1,3) // start = 1, length = 3
            if (contents === '???') { // we don't care what this cell is
                continue;
            }

            const mine = rawCell.charAt(0) === '[';
            const mustNotExist = rawCell.charAt(0) === '!';
            const coords = contents.split(',');
            requiredCells.push({
                row: parseInt(coords[0]),
                col: parseInt(coords[1]),
                mine: mine,
                mustNotExist: mustNotExist,
            });
        }
    }


    const mustNotExist = [];
    const missingCells = [];
    const expectedMine = [];
    const expectedNotMine = [];
    for (const requiredCell of requiredCells) {
        const cell = findCell(requiredCell.row, requiredCell.col, cells);
        const requiredCellStringRepr = requiredCell.row + "," + requiredCell.col;

        if (!cell) {
            if(!requiredCell.mustNotExist) {
                missingCells.push(requiredCellStringRepr);
            }
        } else if (cell && requiredCell.mustNotExist) {
            mustNotExist.push(requiredCellStringRepr);
            
        } else if(requiredCell.mine && !cell.isMine) {
            expectedMine.push(requiredCellStringRepr);

        } else if(!requiredCell.mine && cell.isMine) {
            expectedNotMine.push(requiredCellStringRepr);
        }
    }

    return {
        mustNotExist: mustNotExist,
        missing: missingCells,
        mine: expectedMine,
        notMine: expectedNotMine,
    };
}

function findCell(row: number, col: number, cells: $ReadOnlyArray<Cell>) {
    return cells.find(c => c.row == row && c.col == col);
}

function indentRows(s, prefix) {
    return s.split('\n')
        .map(r => {
            const trimmed = r.trim();
            return prefix + trimmed;
        })
        .join('\n');
}
