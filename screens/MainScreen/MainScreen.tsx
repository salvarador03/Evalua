import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { FormsStackNavigator } from '../../navigation/FormsStackNavigator';
import { ProfileScreen } from '../ProfileScreen/ProfileScreen';
import { AdminProfileScreen } from '../AdminProfileScreen/AdminProfileScreen';
import { StudentsScreen } from '../StudentsScreen/StudentsScreen';
import { StatisticsScreen } from '../StatisticsScreen/StatisticsScreen';
import auth from '@react-native-firebase/auth';
import db from '@react-native-firebase/database';

const Tab = createBottomTabNavigator();

export const MainScreen: React.FC = () => {
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth().currentUser;
      if (user) {
        const snapshot = await db()
          .ref(`/users/${user.uid}`)
          .once('value');
        const userData = snapshot.val();
        setUserRole(userData?.role);
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#056b05" />
      </View>
    );
  }

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
      
      {userRole === 'teacher' && (
        <>
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
        </>
      )}

      <Tab.Screen
        name="Profile"
        component={userRole === 'teacher' ? AdminProfileScreen : ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};