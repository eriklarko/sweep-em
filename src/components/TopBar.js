// @flow

import React from 'react';
import { Text, View, Button } from 'react-native';

type Props = {
    onRestart: () => void,
    cellDown: boolean,
    gameStatus: 'ongoing' | 'success' | 'failure',
    mines: number,
};
export function TopBar(props: Props) {
    return <View>
        <Text>{props.mines}</Text>
        <Button onPress={props.onRestart} title={
            props.gameStatus === 'success'
                ? "YAY"

                : props.gameStatus === 'failure'
                ? ":("

                : props.cellDown
                ? "v"
                : "restart" } />
    </View>
}

