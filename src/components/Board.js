// @flow

import React from 'react';
import { Text, View, Alert } from 'react-native';
import { TopBar } from './TopBar.js';
import { CellGrid } from './CellGrid.js';
import { NotStartedCell, StartedCell } from './Cell.js';
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

    _restart() {
        this.setState({
            state: 'not-started',
        });
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

        return <View style={{ flex: 1}}>
            <View style={{
                //height: 40,
                width: "100%",
                backgroundColor: "green",
            }}>
                <TopBar
                    onRestart={ () => this._restart() }
                    />
            </View>
            { this._renderBoard() }
        </View>
    }

    _renderBoard() {
        switch(this.state.state) {
            case 'not-started':
                return <CellGrid 
                        rows={this.props.rows}
                        cols={this.props.cols}
                        renderCell={ coords => <NotStartedCell 
                            key={"cell"+coords.row+coords.col}
                            onPress={ () => this._enterLoadingState(coords) }
                        /> }
                    />

            case 'loading':
                return <Text>Loading...</Text>

            default:
                return <Started board={this.state.state} />
        }
    }
}

class Started extends React.Component<{ board: Gameboard }, {}> { 

    onCellPress(coords: Coord) {
        const { board } = this.props;
        if (!board.isFinished()) {
            board.reveal(coords);
            this.forceUpdate();
        }
    }

    render() {
        const { board } = this.props;
        if (board.isFinished()) {
            Alert.alert("finished!", "result: " + board.gameResult);
        }


        return <CellGrid 
                    rows={board.rows().length}
                    cols={board.cols().length}
                    renderCell={ coords => <StartedCell 
                        key={"cell"+coords.row+coords.col}
                        cell={board.cellAt(coords)}
                        onPress={() => this.onCellPress(coords)}
                    /> }
                />
    }
}

