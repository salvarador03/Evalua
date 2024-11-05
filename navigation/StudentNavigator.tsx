// StudentNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentTabParamList } from './types';
import { FormsListScreen } from '../screens/FormsScreen/FormsListScreen';
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();

export const StudentNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Forms" component={FormsListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};