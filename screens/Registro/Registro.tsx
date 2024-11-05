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
import db from "@react-native-firebase/database";
import { TEACHER_SECRET_CODE } from '../../utils/roles';
import type { User } from '../../types/user';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registro'>;

export const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const isTeacher = showSecretCode && secretCode === TEACHER_SECRET_CODE;

    setLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: name.trim()
        });

        const userData: User = {
          name: name.trim(),
          email: email.trim(),
          role: isTeacher ? 'teacher' : 'student',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          uid: userCredential.user.uid
        };

        await db()
          .ref(`/users/${userCredential.user.uid}`)
          .set(userData);

        setLoading(false);
        
        Alert.alert(
          '¡Éxito!',
          'Tu cuenta ha sido creada correctamente',
          [
            {
              text: 'Continuar',
              onPress: () => {
                // Navegar a MainTabs después del registro exitoso
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      setLoading(false);
      
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
          
          <CustomButton
            title={showSecretCode ? "Registrarse como alumno" : "¿Eres profesor?"}
            onPress={() => setShowSecretCode(!showSecretCode)}
            variant="secondary"
          />

          {showSecretCode && (
            <CustomInput
              placeholder="Código de profesor"
              value={secretCode}
              onChangeText={setSecretCode}
              editable={!loading}
              secureTextEntry
            />
          )}
          
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
                  onPress={() => navigation.navigate('Login')}
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