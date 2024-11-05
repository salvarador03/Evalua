// TeacherNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TeacherTabParamList } from './types';
import { StudentsScreen } from '../screens/StudentsScreen/StudentsScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen/StatisticsScreen';
import { AdminProfileScreen } from '../screens/AdminProfileScreen/AdminProfileScreen';

const Tab = createBottomTabNavigator<TeacherTabParamList>();

export const TeacherNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
};