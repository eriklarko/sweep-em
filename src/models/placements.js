// @flow

import { cellsToAscii } from './gameboard.js';
import type { Gameboard, Cell } from './gameboard.js';

export class Placement extends Map<Cell, boolean> {
    source: Cell;

    constructor(copy?: Placement) {
        super(copy);
        if (copy) {
            this.source = copy.source;
        }
    }
};

///////////////////////////////
/////////// FINDING ///////////
export function findValidPlacements(cell: Cell): Array<Placement> {
    const numAdjMines = cell.getNumberOfAdjacentMines();
    const hiddenAdj   = cell.getAdjacent().filter(c => !c.isRevealed);

    if (numAdjMines === 0) {
        const placement = new Placement();
        hiddenAdj.forEach(adj => placement.set(adj, false));
        placement.source = cell;

        return [placement];
    }
    if (numAdjMines === hiddenAdj.length) {
        const placement = new Placement();
        hiddenAdj.forEach(adj => placement.set(adj, true));
        placement.source = cell;

        return [placement];
    }


    const placements = [];
    const base = baseArrayOfTruthValues(numAdjMines, Math.max(numAdjMines, hiddenAdj.length));
    const permutations = generateUniquePermutations(base);
    for (const perm of permutations) {
        const placement = new Placement();

        for (let i = 0; i < perm.length; i++) {
            const pos = perm[i];
            placement.set(hiddenAdj[i], pos);
        }
        placement.source = cell;

        placements.push(placement);
    }
    return placements;
}

function baseArrayOfTruthValues(numTrue, numTotal: number): Array<boolean> {
    const base = [];
    for (let i = 0; i < numTotal; i++) {
        base.push(i < numTrue);
    }
    return base;
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
/////////// FINDING ///////////
///////////////////////////////

///////////////////////////////
//////// CONSOLIDATING ////////
export function consolidate(board: Gameboard, ...placements: Array<Placement>): Placement {
    const groupedBySource = groupBySource(placements);

    const uniqueCells = getUniqueCells(placements);
    const possibleSolutions = generatePossibleSolutions(uniqueCells);

    const validSolutions = [];
    for (const solution of possibleSolutions) {

        if (passesAllSources(solution, groupedBySource, board)) {
            validSolutions.push(solution);
        }
    }

    switch (validSolutions.length){
        case 0:
            throw new Error("No permutation was valid, placements are unsolvable");
        case 1:
            return validSolutions[0];
        default:
            return mostInfo(validSolutions);
    } 
}

function groupBySource(placements: Array<Placement>): Map<Cell, Array<Placement>> {
    const grouped = new Map<Cell, Array<Placement>>;

    for (const placement of placements) {
        const source = placement.source;

        const group = grouped.get(source);
        if (group) {
            group.push(placement);
        } else {
            grouped.set(source, [placement]);
        }
    }

    return grouped;
}

function getUniqueCells(placements: Array<Placement>): Array<Cell> {
    
    const cells = new Set<Cell>();
    for (const placement of placements) {
        for (const cell of placement.keys()) {
            cells.add(cell);
        }
    }
    return Array.from(cells);
}

function generatePossibleSolutions(uniqueCells: Array<Cell>): Array<Placement> {
    const numCells = uniqueCells.length;

    const solutions = [];
    for (let i = 0; i < (1 << numCells); i++) {
        const placement = new Placement();
      
        for (let j = 0; j < numCells; j++) {
            const isMine = Boolean(i & (1 << j));
            placement.set(uniqueCells[j], isMine);
        }

        solutions.push(placement);
    }

    return solutions;
}

function passesAllSources(solution: Placement, placementsBySource: Map<Cell, Array<Placement>>, board): boolean {
    // the solution must pass one of every source's valid placements
    //console.log('checking solution\n' + placementToString(solution, board));
    for (const placements of placementsBySource.values()) {

        let numAgrees = 0;
        for (const placement of placements) {
            //console.log('against\n' + placementToString(placement, board));

            if (agree(placement, solution)) {
                //console.log('satisfies!');
                //console.log('satisfies\n' + placementToString(placement, board));
                numAgrees++;
            } else {
                //console.log('contradicts');
                //console.log('contradicts\n' + placementToString(placement, board));
            }
        }

        if (numAgrees === 0) {
            //console.log("INVALID");
            return false;
        }
    }

    return true;
}

function agree(p1: Placement, p2: Placement): boolean {
    return !areContradictory(p1, p2);
}

function areContradictory(p1: Placement, p2: Placement): boolean {
    for (const [c, v1] of p1) {
        if (p2.has(c)) {
            const v2 = p2.get(c);

            if (v1 !== v2) {
                return true;
            }
        }
    }
    return false;
}

function mostInfo(placements: Array<Placement>): Placement {
    let maxNumCells = 0;
    let p = placements[0];
    for (const placement of placements) {
        const numCells = placement.size;
        if (numCells > maxNumCells) {
            maxNumCells = numCells;
            p = placement;
        }
    }
    return p;
}
//////// CONSOLIDATING ////////
///////////////////////////////

///////////////////////////////
/////////// PRINTING //////////
export function placementToString(placement: Placement, board: Gameboard): string {
    return cellsToAscii(board.cells, c => {
        if (!c) {
            return "?";
        }

        if (placement.has(c)) {
            return placement.get(c) ? "Y" : "N"
        }

        return c.isRevealed
            ? c.getNumberOfAdjacentMines().toString()
            : '#';
    });
}

export function printPlacement(placement: Placement, board: Gameboard): void {
    console.log(placementToString(placement, board));
}

export function printPlacements(placements: Array<Placement>, board: Gameboard): void {
    if (placements.length === 0) {
        console.log(placements);
    } else {
        placements.forEach( p => printPlacement(p, board) );
    }
}
/////////// PRINTING //////////
///////////////////////////////

///////////////////////////////
/////////// PARSING ///////////
export function parsePlacements(placements: Array<string>, board: Gameboard): Array<Placement> {
    return placements.map(p => parsePlacement(p, board) );
}

export function parsePlacement(rawPlacement: string, board: Gameboard): Placement {
    const trimmedLines = rawPlacement.split('\n')
                            .map(   line => line.trim() )
                            .filter(line => line.length > 0);

    const placement = new Placement();

    let r = 0;
    for (const row of trimmedLines) {

        let c = 0;
        for (const col of row.split(' ')) {
            const cell = board.cell(r, c);
            if (!cell) {
                throw new Error("No cell found at row: " + r + ", col:" + c)
            }

            if (col === 'Y') {
                placement.set(cell, true);
            } else if (col === 'N') {
                placement.set(cell, false);
            } 

            c++;
        }

        r++;
    }

    return placement;
}

/////////// PARSING ///////////
///////////////////////////////
