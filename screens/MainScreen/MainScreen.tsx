// screens/MainScreen.tsx
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { FormsStackNavigator } from '../../navigation/FormsStackNavigator';
import { ProfileScreen } from '../ProfileScreen/ProfileScreen';
import { AdminProfileScreen } from '../AdminProfileScreen/AdminProfileScreen';
import { StudentsScreen } from '../StudentsScreen/StudentsScreen';
import { StatisticsScreen } from '../StatisticsScreen/StatisticsScreen';
import { useAuth } from '../../context/AuthContext';

const Tab = createBottomTabNavigator();

// Definimos los colores del sistema
const COLORS = {
  primary: '#9E7676', // Color principal (el marrón que usas)
  secondary: '#DFCCCC', // Color secundario (un tono más claro del marrón)
  background: '#F5EBEB', // Color de fondo
  text: '#594545', // Color de texto
  inactive: '#B4AAAA', // Color para elementos inactivos
};

export const MainScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[MainScreen] User data:', user);
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isGuest = user?.role === 'guest';
  const isTeacher = user?.role === 'teacher';

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.secondary,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Forms"
        component={FormsStackNavigator}
        options={{ title: 'Formularios' }}
      />
      
      {isTeacher && (
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

      {!isGuest && (
        <Tab.Screen
          name="Profile"
          component={isTeacher ? AdminProfileScreen : ProfileScreen}
          options={{ title: 'Perfil' }}
        />
      )}
    </Tab.Navigator>
  );
};