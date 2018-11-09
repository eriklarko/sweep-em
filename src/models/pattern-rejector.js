// @flow

import type { Gameboard, Box } from './gameboard.js';

export interface Pattern {
    name(): string;
    search(Gameboard): Array<PatternInBoard>;
};

export type PatternInBoard = {
    pattern: Pattern,
    board: Gameboard,
    location: Box,
};

class ThreeOneEdge {
    name() {
        return "three-one edge";
    }

    search(board: Gameboard): Array<PatternInBoard> {
        return [];
    }
}

const patterns: Array<Pattern> = [
    new ThreeOneEdge(),
];
export function findIllegalPatterns(gameboard: Gameboard): Array<PatternInBoard> {
    return [].concat.apply([], 
        patterns.map(p => p.search(gameboard)),
    );
}
