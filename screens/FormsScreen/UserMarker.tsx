import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserMarkerProps {
  score: number;
}

const UserMarker: React.FC<UserMarkerProps> = ({ score }) => (
  <View style={styles.container}>
    <Text style={styles.score}>{score.toFixed(1)}</Text>
    <Text style={styles.emoji}>🙋🏽‍♂️</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
    transform: [{translateY: 10}],
  },
  score: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginRight: 2,
  },
  emoji: {
    fontSize: 14,
  }
});

export default UserMarker;