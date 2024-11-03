// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { CustomInput } from '../../Components/CustomInput/CustomInput';
import { CustomButton } from '../../Components/CustomButton/CustomButton';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await auth().signInWithEmailAndPassword(email, password);
        if (response.user) {
          navigation.replace('MainTabs');
        }
      } catch (error) {
        Alert.alert('Error', 'Revisa tus credenciales e intenta nuevamente');
      }
    }
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
          />
          <CustomInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <CustomButton title="Iniciar Sesión" onPress={handleLogin} />
          <CustomButton
            title="Registrarse"
            onPress={() => navigation.replace('Registro')}
            variant="secondary"
          />
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
});
