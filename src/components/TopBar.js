// @flow

import React from 'react';
import { Text, View, Button } from 'react-native';

type Props = {
    onRestart: () => void,
    onFlagged: () => void,
    onGameEnd: (success: boolean) => void,
    onPressIn: () => void,
    onPressOut: () => void,
};
export class TopBar extends React.Component<Props, {}> {

    render() {
        return <View>
            <Text>lol</Text>
            <Button onPress={this.props.onRestart} title={"r"} />
        </View>
    }
}

