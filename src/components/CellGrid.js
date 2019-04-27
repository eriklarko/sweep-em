// @flow

import React from 'react';
import { View } from 'react-native';
import type { Coord } from '../models/coord.js';

type Props = {
    rows: number,
    cols: number,
    renderCell: (Coord) => void,
}
export function CellGrid(props: Props) { 

    return <View style={styles.grid}>{generateRows()}</View>


    function generateRows() {
        const rows = [];

        for (let row=0; row < props.rows; row++) {
            const wrapper = <View key={"row"+row} style={styles.row}>
                {generateRow(row, props.cols)}
            </View>

            rows.push(wrapper);
        }
        return rows;
    }

    function generateRow(rowIndex, numCols) {
        const row = [];
        for (let col=0; col < numCols; col++) {
            const cell = props.renderCell({ row: rowIndex, col: col });
            row.push(cell);
        }
        return row;
    }
}

const styles = {
    grid: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    row: {
        flexDirection: "row",
    },   
};
