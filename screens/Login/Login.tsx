import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { CustomInput } from '../../Components/CustomInput/CustomInput';
import { CustomButton } from '../../Components/CustomButton/CustomButton';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';
import auth from '@react-native-firebase/auth';
import db from '@react-native-firebase/database';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await auth().signInWithEmailAndPassword(email, password);

      if (response.user) {
        // Actualizar último login
        const userRef = db().ref(`/users/${response.user.uid}`);
        await userRef.update({
          lastLogin: db.ServerValue.TIMESTAMP
        });

        // Obtener rol del usuario y guardar en el estado global si es necesario
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        // Navegar a MainTabs sin importar el rol
        navigation.dispatch(
          StackActions.replace('MainTabs')
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Revisa tus credenciales e intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Registro');
  };

  return (
    <BackgroundContainer
      source={require('../../assets/images/surfer-1836366_1280.jpg')}
    >
      <View style={styles.content}>
        <Text style={typography.title}>Inicio sesión</Text>
        <View style={styles.form}>
          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <CustomInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#056b05" />
              <Text style={styles.loadingText}>Iniciando sesión...</Text>
            </View>
          ) : (
            <>
              <CustomButton title="Iniciar Sesión" onPress={handleLogin} />
              <CustomButton
                title="Registrarse"
                onPress={handleRegister}
                variant="secondary"
              />
            </>
          )}
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
  form: {
    marginTop: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginVertical: 10,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});