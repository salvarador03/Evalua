// src/screens/AdminMainScreen/AdminMainScreen.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FormsStackNavigator } from '../../navigation/FormsStackNavigator';
import { AdminProfileScreen } from '../AdminProfileScreen/AdminProfileScreen';
import { StudentsScreen } from '../StudentsScreen/StudentsScreen';
import { StatisticsScreen } from '../StatisticsScreen/StatisticsScreen';
import { TeacherTabParamList } from '../../navigation/types';

const Tab = createBottomTabNavigator<TeacherTabParamList>();

export const AdminMainScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Forms') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Students') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#056b05',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Forms"
        component={FormsStackNavigator}
        options={{ title: 'Formularios' }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsScreen}
        options={{ title: 'Alumnos' }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: 'Estadísticas' }}
      />
      <Tab.Screen
        name="Profile"
        component={AdminProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};