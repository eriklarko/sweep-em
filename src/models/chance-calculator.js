// @flow

import { cellsToAscii } from './gameboard.js';
import type { Gameboard, Cell } from './gameboard.js';

export type Placement = Map<Cell, boolean>;

export function calculateChances(board: Gameboard): { [Cell]: number } {
    const chances = new Map();
    for (const cell of board.cells) {
        if (cell.isRevealed) {
            chances.set(cell, 0);
            continue;
        }

        //const allData = calcChances(cell, chances);
        //const chance = calcChance(allData);

        chances.set(cell, 2);
    }

    console.log('board\n' + board.toAscii());

    // $FlowFixMe
    const ps1 = findValidPlacements(board.cell(1, 1));
    // $FlowFixMe
    const ps2 = findValidPlacements(board.cell(2, 1));

    const ps = consolidate([ps2, ps1], board);
    ps.forEach(p => printPlacement(board, p));

    return chances;
}

function consolidate(placementsPerCell, board): Array<Placement> {
    for (let i = 0; i < placementsPerCell.length; i++) {
        const placements = placementsPerCell[i];


        for (const placement of placements) {
            printPlacement(board, placement);
            for (let j = 0; j < placementsPerCell.length; j++) {
                if (i === j) continue;

                const toFilter = placementsPerCell[j];
                console.log('to filter');
                const filtered = toFilter.filter(p => {
                    printPlacement(board, p);
                    const all = Array.from(p.keys()).every( (elem, i) => {
                        const has = placement.has(elem);
                        if (has) {
                            return placement.get(elem) === p.get(elem);
                        } else {
                            return true;
                        }

                    });
                    return all;
                });
                console.log('filtered');
                filtered.forEach(p => printPlacement(board, p));
            }
        }

        break;
    }

    return [];
}

export function findValidPlacements(cell: Cell): Array<Placement> {
    const num = cell.getNumberOfAdjacentMines();
    const hiddenAdj = cell.getAdjacent().filter(c => !c.isRevealed);

    if (num === 0) {
        const placement = new Map<Cell, boolean>();
        hiddenAdj.forEach(adj => placement.set(adj, false));

        return [placement];
    }
    if (num === hiddenAdj.length) {
        const placement = new Map<Cell, boolean>();
        hiddenAdj.forEach(adj => placement.set(adj, true));

        return [placement];
    }


    const base = [];
    for (let i = 0; i < Math.max(num, hiddenAdj.length); i++) {
        base.push(i < num);
    }

    const placements = [];
    for (const perm of generateUniquePermutations(base)) {
        const placement = new Map<Cell, boolean>();

        for (let i = 0; i < perm.length; i++) {
            const pos = perm[i];
            placement.set(hiddenAdj[i], pos);
        }
        placements.push(placement);
    }
    return placements;
}

function generateUniquePermutations(array) {
    const dupPerms = [];
    heapsPermute(array, a => dupPerms.push(a.slice()));

    const uniquePerms = [];
    for (const dupPerm of dupPerms) {
        if (countTimes(uniquePerms, dupPerm) === 0) {
            uniquePerms.push(dupPerm);
        }
    }
    return uniquePerms;
}
function countTimes(perms, toCount) {
    let c = 0;
    for (const perm of perms) {
        const isSame = perm.every( (elem,i) => elem === toCount[i]);
        if (isSame) {
            c++;
        }
    }
    return c;
}
function heapsPermute(array, output, n) {
  n = n || array.length; // set n default to array.length
  if (n === 1) {
    output(array);
  } else {
    for (var i = 1; i <= n; i += 1) {
      heapsPermute(array, output, n - 1);
      if (n % 2) {
        var j = 1;
      } else {
        var j = i;
      }
      swap(array, j - 1, n - 1); // -1 to account for javascript zero-indexing
    }
  }
}
function swap(array, pos1, pos2) {
  var temp = array[pos1];
  array[pos1] = array[pos2];
  array[pos2] = temp;
}

function calcChancesc(cell, allChances: Map<Cell, number>) {
    const print = (cell) => (cell.row === 0 && cell.col === 2);

    const chances = new Map();
    const revealedAdj = cell.getAdjacent().filter(c => c.isRevealed);

    for (const adj of revealedAdj) {
        const deterministicAdjAdjMines = adj.getAdjacent().filter(adjAdj => allChances.get(adjAdj) === 1).length
        const minesLeft = adj.getNumberOfAdjacentMines() - deterministicAdjAdjMines;
        const hiddenCellsLeft = adj.getAdjacent()
                                .filter(c => !c.isRevealed)
                                .length - deterministicAdjAdjMines;

        const chanceAdj = minesLeft / hiddenCellsLeft;
        chances.set(adj, chanceAdj);

        print(cell) && console.log(`========= ` + adj.row + ',' + adj.col + ` ===========
            ${adj.getNumberOfAdjacentMines()}
            ${minesLeft} - ${hiddenCellsLeft} => ${chanceAdj}
            `);
    }

    return Array.from(chances.values());
}

function calcChance(allData) {
    return Math.max(...allData);
}
    
function printPlacement(board, placement) {
    console.log(cellsToAscii(board.cells, c => {
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
    }));
}
