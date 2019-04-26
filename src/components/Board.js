// @flow

import React from 'react';
import { Text, View } from 'react-native';
import { CellGrid } from './CellGrid.js';
import { Gameboard } from '../models/gameboard.js';
import { Cell } from '../models/cell.js';
import type { Coord } from '../models/coord.js';

type Props = {
    rows: number,
    cols: number,
    mines: number,
}
type State = {
    state: 'not-started' | 'loading' | Gameboard
}

export class BoardComponent extends React.Component<Props, State> {

    constructor() {
        super();

        this.state = {
            state: 'not-started',
        };
    }

    _enterLoadingState(startingCell: Coord) {
        this.setState({
            state: 'loading',
        }, () => this._generateBoard(startingCell));
    }

    _generateBoard(startingCell: Coord) {
        const board = Gameboard.generate({
            rows: this.props.rows,
            cols: this.props.cols,
            mines: this.props.mines,
            startingCell: startingCell,
        });
        board.reveal(startingCell);

        this.setState({
            state: board,
        });
    }

    render() {
        switch(this.state.state) {
            case 'not-started':
                return <CellGrid 
                        rows={this.props.rows}
                        cols={this.props.cols}
                        onCellPress={ this._enterLoadingState.bind(this) }
                />

            case 'loading':
                return <Text>Loading...</Text>

            default:
                return <Started board={this.state.state} />
        }
    }
}

function Started(props: { board: Gameboard }) { 
    const { board } = props;

    return <CellGrid 
                rows={board.rows().length}
                cols={board.cols().length}
                onCellPress={board.reveal.bind(board)}
            />
}

