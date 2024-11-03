// src/screens/MainScreen/MainScreen.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FormsStackNavigator } from '../../navigation/FormsStackNavigator';
import { ProfileScreen } from '../ProfileScreen/ProfileScreen';
import { MainTabParamList } from '../../navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused
            ? route.name === 'Forms'
              ? 'document-text'
              : 'person'
            : route.name === 'Forms'
            ? 'document-text-outline'
            : 'person-outline';

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
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};