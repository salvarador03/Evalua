// Login.tsx
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

export const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const nav = useNavigation<NativeStackNavigationProp<any>>();


  const goToRegistration = () => {
    nav.replace("Registro")
  };

  const goToMainFlow = async () => {
    // Lógica de inicio de sesión
  };

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../assets/images/switzerland-8056381_1280.jpg')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.7 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Inicio sesión</Text>
          </View>
          <View style={styles.mainContent}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#fff"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#fff"
            />
            <TouchableOpacity style={styles.buttonPrimary} onPress={goToMainFlow}>
              <Text style={styles.buttonTextPrimary}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={goToRegistration}>
              <Text style={styles.buttonTextSecondary}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  titleText: {
    fontSize: 50,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  mainContent: {
    paddingHorizontal: 30,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  buttonPrimary: {
    backgroundColor: "#056b05",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  buttonTextPrimary: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonTextSecondary: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
