// @flow

import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import type { Coord } from '../models/coord.js';
import type { Cell } from '../models/cell.js';

type Props = {
    onPress: () => void,
}
type State = {
    state: 'revealed' | 'pressed' | 'released'
}
export class CellComponent extends React.Component<Props, State> {

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

const lightBorder = "white";
const darkBorder = "grey";
const commonStyle = {
    flex: 1,
    aspectRatio:1, 
    margin: 0.1,

    borderWidth: 1,
};
const styles = {
    revealed: Object.assign({}, commonStyle, {
        backgroundColor: "red",
    }),
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
