// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FormsStackNavigator } from './FormsStackNavigator';
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName =
  | 'document-text'
  | 'document-text-outline'
  | 'person'
  | 'person-outline';

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;

          if (route.name === 'Forms') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};