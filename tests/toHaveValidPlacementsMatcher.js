// @flow

import { matcherHint } from 'jest-matcher-utils';
import prettyFormat from 'pretty-format';
import { failWithUndefined } from './common.js';
import { findValidPlacements, parsePlacement, parsePlacements, placementToString } from '../src/models/placements.js';
import { cellsToAscii } from '../src/models/gameboard.js';
import { Cell } from '../src/models/cell.js';
import type { Gameboard } from '../src/models/gameboard.js';
import type { Placement } from '../src/models/placements.js';

expect.extend({
    // $FlowFixMe
    toBePlacement(actual: Placement|Array<Placement>, board: Gameboard, rawExpected: string) {
        const expecteds = [ parsePlacement(rawExpected, board) ];

        if (Array.isArray(actual)) {
            if (actual.length !== 1) {
                return {
                    pass: false,
                    message: () => `Expected array of length 1, got\n` 
                        + this.utils.RECEIVED_COLOR(prettyFormat(actual))
                }
            }

            return _toBePlacements(expecteds, actual, board, this);
        }

        return _toBePlacements(expecteds, [actual], board, this);
    },

    toBePlacements(actual: Placement|Array<Placement>, board: Gameboard, ...rawExpecteds: Array<string>) {
        const expecteds = parsePlacements(rawExpecteds, board);
        const actuals = Array.isArray(actual)
            ? actual
            : [actual];

        return _toBePlacements(expecteds, actuals, board, this);
    },

    toHaveValidPlacements(cell: ?Cell, board: Gameboard, ...placements: Array<string>) {
        if (!cell) {
            return failWithUndefined(this, cell)
        }

        const actuals = findValidPlacements(cell);
        const expecteds = parsePlacements(placements, board);

        return _toBePlacements(expecteds, actuals, board, this);
    },
});

function _toBePlacements(expecteds: Array<Placement>, actuals: Array<Placement>, board: Gameboard, jest) {
    const missing = _missing(actuals, expecteds);
    const extra   = _extra(actuals, expecteds);

    return {
        pass: missing.length === 0 && extra.length === 0,
        message: () =>
        matcherHint('.toHaveValidPlacements', 'cell', ['board', ' placements'], {
            isNot: jest.isNot,
        }) +
        '\n\n' +
        (missing.length > 0
            ? 'Did not find\n' +
            jest.utils.EXPECTED_COLOR(
                missing.map(p => placementToString(p, board)).join('\n\n')
            )
            : '') +
        (extra.length > 0
            ? '\n\nUnexpectedly found\n' +
            jest.utils.RECEIVED_COLOR(
                extra.map(p => placementToString(p, board)).join('\n\n')
            )
            : '')/* +
        "\n\nexpected\n" +
            jest.utils.EXPECTED_COLOR(
                expecteds.map(p => placementToString(p, board)).join('\n\n')
            )*/
    };
}

function _missing(actuals: Array<Placement>, expecteds: Array<Placement>) {
    const missing = [];

    for (const expected of expecteds) {

        const found = actuals.find( actual => placementsEqual(actual, expected));
        if (!found) {
            missing.push(expected);
        }
    }

    return missing;
}

function _extra(actuals: Array<Placement>, expecteds: Array<Placement>) {
    const extra = [];

    for (const actual of actuals) { 
        const found = expecteds.find( expected => placementsEqual(actual, expected));
        if (!found) {
            extra.push(actual);
        }
    }

    return extra;
}

function placementsEqual(a: Placement, b: Placement) {
    return a.size === b.size && Array.from(a.keys())
        .every( cell => a.get(cell) === b.get(cell) );
}
