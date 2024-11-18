import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { ClassCodeManager } from '../../Components/ClassCodeManager/ClassCodeManager';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export const ClassCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = auth().currentUser;

  return (
    <BackgroundContainer source={require('../../assets/images/fondo.svg')}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Gestión de Códigos</Text>
        </View>

        <View style={styles.container}>
          <ClassCodeManager
            teacherId={user?.uid || ''}
            teacherName={user?.displayName || 'Profesor'}
          />
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
    alignItems: 'center',
    backgroundColor: 'rgba(158, 118, 118, 0.9)',
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
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  container: {
    flex: 1,
  },
});