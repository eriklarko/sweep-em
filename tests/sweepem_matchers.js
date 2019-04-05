// @flow
import type { Gameboard } from '../src/models/gameboard.js';

type SweepEmJestMatchers = {
    toHaveNumberOfAdjacentMines(number): void;
    toBePlacements(Gameboard, Array<string>): void;
}
