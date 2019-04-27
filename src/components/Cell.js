// @flow

import React from 'react';
import { View, TouchableWithoutFeedback, Text } from 'react-native';
import type { Coord } from '../models/coord.js';
import type { Cell } from '../models/cell.js';

type Props = {
    onPress: () => void,
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

    render() {

        return <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPressIn={this.state.state === "released" 
                ? () => this.setState({state: "pressed"})
                : null
            }
            onPressOut={this.state.state === "pressed" 
                ? () => this.setState({state: "released"})
                : null
            }
            onPress={this.props.onPress} >

                <View style={this._getStyle()} />
            </TouchableWithoutFeedback>

    }

    _getStyle() {
        return styles[this.state.state];
    }
}
export class StartedCell extends React.Component<{cell: Cell, onPress: ()=>void},{}> {

    render() {
        const { cell } = this.props;
        if (cell.isRevealed) {
            return <View style={styles.revealedWrapper}>
                { this._renderRevealedCell() }
            </View>

        } else {
            return <NotStartedCell onPress={ () => {
                this.props.onPress()
                //this.forceUpdate();
            }} />
        }
    }

    _renderRevealedCell() {
        const { cell } = this.props;

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
const adjacentColors = {
    1: "blue",
    2: "green",
    3: "red",
    4: "darkblue",
    5: "brown",
    6: "Cyan",
    7: "Black",
    8: "Grey",
};

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
