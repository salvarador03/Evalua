// src/screens/ProfileScreen/AdminProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type AdminProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const AdminProfileScreen: React.FC = () => {
  const navigation = useNavigation<AdminProfileScreenNavigationProp>();
  const user = auth().currentUser;

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth().signOut();
              // Actualizado para usar la nueva estructura de navegación
              navigation.navigate('WelcomeScreen');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleSettings = () => {
    Alert.alert('Configuración', 'Esta funcionalidad estará disponible próximamente');
  };

  const handleNotifications = () => {
    Alert.alert('Notificaciones', 'Esta funcionalidad estará disponible próximamente');
  };

  const handleHelp = () => {
    Alert.alert('Ayuda', 'Esta funcionalidad estará disponible próximamente');
  };

  return (
    <BackgroundContainer
      source={require('../../assets/images/surfer-1836366_1280.jpg')}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil de Profesor</Text>
          <View style={styles.teacherBadge}>
            <Ionicons name="school" size={20} color="#fff" />
            <Text style={styles.teacherBadgeText}>Profesor</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#056b05" />
            </View>
            <Text style={styles.name}>{user?.displayName || 'Profesor'}</Text>
            <Text style={styles.email}>{user?.email || 'No disponible'}</Text>
            <View style={styles.roleContainer}>
              <Ionicons name="shield-checkmark" size={20} color="#056b05" />
              <Text style={styles.roleText}>Cuenta de Administrador</Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem} onPress={handleSettings}>
              <Ionicons name="settings-outline" size={24} color="#056b05" />
              <Text style={styles.optionText}>Configuración</Text>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color="#056b05" 
                style={styles.optionArrow} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleNotifications}>
              <Ionicons name="notifications-outline" size={24} color="#056b05" />
              <Text style={styles.optionText}>Notificaciones</Text>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color="#056b05" 
                style={styles.optionArrow} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionItem, styles.lastOptionItem]} 
              onPress={handleHelp}
            >
              <Ionicons name="help-circle-outline" size={24} color="#056b05" />
              <Text style={styles.optionText}>Ayuda</Text>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color="#056b05" 
                style={styles.optionArrow} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 107, 5, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  teacherBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    backgroundColor: 'rgba(5, 107, 5, 0.1)',
    borderRadius: 50,
    padding: 10,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#056b05',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 107, 5, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  roleText: {
    color: '#056b05',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(5, 107, 5, 0.1)',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  optionArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});