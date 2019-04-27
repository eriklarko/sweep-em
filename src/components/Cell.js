// @flow

import React from 'react';
import { View, TouchableWithoutFeedback, Text } from 'react-native';
import type { Coord } from '../models/coord.js';
import type { Cell } from '../models/cell.js';

type Props = {
    onPress: () => void,
    onPressIn: () => void,
    onPressOut: () => void,
}
type State = {
    state: 'pressed' | 'released'
}
export class NotStartedCell extends React.Component<Props, State> {

    constructor() {
        super();
        this.state = {
            state: 'released',
        }
    }

    _pressIn() {
        if (this.state.state === "released") {
            this.setState({state: "pressed"});
        }
        this.props.onPressIn();
    }

    _pressOut() {
        if (this.state.state === "pressed") {
            this.setState({state: "released"});
        }
        this.props.onPressOut();
    }

    render() {

        return <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPressIn={() => this._pressIn() }
            onPressOut={() => this._pressOut() }
            onPress={this.props.onPress} >

                <View style={this._getStyle()} />
            </TouchableWithoutFeedback>

    }

    _getStyle() {
        return styles[this.state.state];
    }
}

type StartedProps = Props & {
    cell: Cell,
}
export function StartedCell(props: StartedProps) {

    const { cell } = props;
    if (cell.isRevealed) {
        return <View style={styles.revealedWrapper}>
            { renderRevealedCell() }
        </View>

    } else if (cell.isFlagged) {
        return <View style={styles.released}>
            <Text>F</Text>
        </View>
   
    } else {
        return <NotStartedCell 
            onPress={ props.onPress }
            onPressIn={ props.onPressIn }
            onPressOut={ props.onPressOut }
        />
    }

    function renderRevealedCell() {
        if (cell.isMine) {
            return <Text>*</Text>
        } else {
            const adjMines = cell.getNumberOfAdjacentMines();
            return <Text style={styles.revealed(adjMines)}>
              {adjMines === 0 ? null : adjMines}
            </Text>
        }
    }
}
const adjacentColors = [
    null,       // 0
    "blue",     // 1
    "green",    // 2
    "red",      // 3
    "darkblue", // 4
    "brown",    // 5
    "Cyan",     // 6
    "Black",    // 7
    "Grey",     // 8
];

const lightBorder = "white";
const darkBorder = "grey";
const commonStyle = {
    flex: 1,
    aspectRatio:1, 
    margin: 0.1,

    borderWidth: 1,
};
const styles = {
    revealedWrapper: Object.assign({}, commonStyle, {
            backgroundColor: "grey",
    }),
    revealed: (adjMines: number) => {
        return {
            color: adjacentColors[adjMines],
            textAlign: "center",
            fontWeight: "bold",
        };
    }, 
    pressed: Object.assign({}, commonStyle, {
        backgroundColor: "darkgrey",

        borderTopColor: darkBorder,
        borderLeftColor: darkBorder,

        borderBottomColor: darkBorder,
        borderRightColor: darkBorder,
    }),
    released: Object.assign({}, commonStyle, {
        backgroundColor: "lightgrey",

        borderTopColor: lightBorder,
        borderLeftColor: lightBorder,

        borderBottomColor: darkBorder,
        borderRightColor: darkBorder,
    }),
}
