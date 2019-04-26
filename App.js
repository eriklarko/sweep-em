import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

import { BoardComponent } from './src/components/Board.js';

export default class App extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={{
                    height: 40,
                    width: "100%",
                    backgroundColor: "green",
                }} />
                <BoardComponent
                    rows={ 10 }
                    cols={ 10 }
                    mines={ 20 }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 42,
    },
});
