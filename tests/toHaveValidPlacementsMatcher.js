// @flow

import { matcherHint } from 'jest-matcher-utils';
import { findValidPlacements, parsePlacements } from '../src/models/placements.js';
import { cellsToAscii, Cell } from '../src/models/gameboard.js';
import type { Gameboard } from '../src/models/gameboard.js';
import type { Placement } from '../src/models/placements.js';

expect.extend({
    // Does not give good messages for .not
    // $FlowFixMe
    toBePlacements(expecteds: Array<Placement>, board: Gameboard, rawActuals: Array<string>) {
        const actuals = parsePlacements(rawActuals, board);

        return toBePlacements(expecteds, actuals, board, this);
    },

    // $FlowFixMe
    toHaveValidPlacements(cell: ?Cell, board: Gameboard, placements: Array<string>) {
        if (!cell) {
            return failWithUndefined(this, cell)
        }

        const actuals = findValidPlacements(cell);
        const expecteds = parsePlacements(placements, board);

        return toBePlacements(expecteds, actuals, board, this);
    },
});

function toBePlacements(expecteds: Array<Placement>, actuals: Array<Placement>, board, jest) {
    const missing = missingFromFirst(expecteds, actuals);
    const extra   = missingFromFirst(actuals, expecteds);

    return {
        pass: missing.length === 0 && extra.length === 0,
        message: () =>
        matcherHint('.toHaveValidPlacements', 'cell', ['board', ' placements'], {
            isNot: jest.isNot,
        }) +
        '\n\n' +
        (missing.length > 0
            ? 'Did not find\n' +
            jest.utils.RECEIVED_COLOR(
                missing.map(p => placementToString(board, p)).join('\n\n')
            ) + 
            '\nin\n' +
            jest.utils.EXPECTED_COLOR(
                actuals.map(p => placementToString(board, p)).join('\n\n')
            )
            : '') +
        (extra.length > 0
            ? 'Unexpectedly found\n' +
            jest.utils.RECEIVED_COLOR(
                extra.map(p => placementToString(board, p)).join('\n\n')
            )
            : '')
    };
}

function failWithUndefined(jest, actual) {
    return {
        pass: false,
        message: () =>
            matcherHint('.toBeDefined', 'received', '', {
                isNot: jest.isNot,
            }) +
            '\n\n' +
            `Received: ${jest.printReceived(actual)}`,
    };
}

function missingFromFirst(first: Array<Map<Cell, boolean>>, second) {
    const missing = [];
    for (const f of first) {
        const found = second.find( s => placementsEqual(f, s));
        if (!found) {
            missing.push(f);
        }
    }

    return missing;
}

function placementsEqual(a, b) {
    return Array.from(a.keys())
        .every( cell => a.get(cell) === b.get(cell) );
}

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
