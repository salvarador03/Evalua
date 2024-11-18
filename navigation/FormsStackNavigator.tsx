import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FormsListScreen } from '../screens/FormsScreen/FormsListScreen';
import { PhysicalLiteracyFormScreen } from '../screens/FormsScreen/PhysicalLiteracyFormScreen';
import { PhysicalLiteracyResultsScreen } from '../screens/FormsScreen/PhysicalLiteracyResultsScreen';
import { FormsStackParamList } from './types';

const Stack = createNativeStackNavigator<FormsStackParamList>();

export const FormsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName="FormsList"
    >
      <Stack.Screen name="FormsList" component={FormsListScreen} />
      <Stack.Screen 
        name="PhysicalLiteracyForm" 
        component={PhysicalLiteracyFormScreen}
      />
      <Stack.Screen 
        name="PhysicalLiteracyResults" 
        component={PhysicalLiteracyResultsScreen}
      />
    </Stack.Navigator>
  );
};