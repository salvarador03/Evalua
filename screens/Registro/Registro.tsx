// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { CustomInput } from '../../Components/CustomInput/CustomInput';
import { CustomButton } from '../../Components/CustomButton/CustomButton';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';
import auth from '@react-native-firebase/auth';
import db from "@react-native-firebase/database"

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registro'>;

export const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    // Validaciones
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
  
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
  
    setLoading(true);
  
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );
  
      if (userCredential.user) {
        console.log('Usuario creado en Auth:', userCredential.user.uid); // Log para debug
  
        // Actualizar el displayName en Authentication
        await userCredential.user.updateProfile({
          displayName: name.trim()
        });
  
        // Guardar datos del usuario en Realtime Database
        const userRef = db().ref(`/users/${userCredential.user.uid}`);
        
        await userRef.set({
          name: name.trim(),
          email: email.trim(),
          createdAt: db.ServerValue.TIMESTAMP,
          lastLogin: db.ServerValue.TIMESTAMP,
          uid: userCredential.user.uid
        });
  
        // Verificar que los datos se guardaron correctamente
        const snapshot = await userRef.once('value');
        console.log('Datos guardados en DB:', snapshot.val()); // Log para debug
  
        setLoading(false); // Aseguramos que loading se desactive
        
        Alert.alert(
          '¡Éxito!',
          'Tu cuenta ha sido creada correctamente',
          [
            {
              text: 'Continuar',
              onPress: () => navigation.replace('MainTabs')
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      console.error('Error completo:', error); // Log para debug
      setLoading(false); // Aseguramos que loading se desactive en caso de error
      
      let errorMessage = 'Error al crear la cuenta';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El email no es válido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet';
          break;
        default:
          errorMessage = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <BackgroundContainer
      source={require('../../assets/images/surfer-1836366_1280.jpg')}
    >
      <View style={styles.content}>
        <Text style={typography.title}>Registro</Text>
        <View>
          <CustomInput
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <CustomInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          
          <View style={styles.buttonContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#056b05" />
                <Text style={styles.loadingText}>Creando cuenta...</Text>
              </View>
            ) : (
              <>
                <CustomButton 
                  title="Crear Cuenta" 
                  onPress={handleRegister}
                />
                <CustomButton
                  title="Volver"
                  onPress={() => navigation.replace('Login')}
                  variant="secondary"
                />
              </>
            )}
          </View>
        </View>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  buttonContainer: {
    marginTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});