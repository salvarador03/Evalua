// Register.tsx
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";
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
  Alert,
} from "react-native";

export default function Registro() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const nav = useNavigation<NativeStackNavigationProp<any>>();

  const createProfile = async (response: any) => {
    try {
      await db().ref(`/users/${response.user.uid}`).set({ name });
    } catch (e) {
      console.log('Error en createProfile:', e);
      throw e; // Re-lanzar el error para que sea capturado en registerAndGoToMainFlow
    }
  }
  

  const registerAndGoToMainFlow = async () => {
    if (email && password) {
      try {
        const response = await auth().createUserWithEmailAndPassword(
          email,
          password
        );

        if(response.user) {
          await createProfile(response);
          nav.replace("Main")
        }
      } catch(e) {
        Alert.alert("Oops", "Por favor revisa el formulario y inténtalo de nuevo")
      }
    }
  };

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../../assets/images/fondo_app.jpg')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.7 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Registro</Text>
          </View>
          <View style={styles.mainContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#fff"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
            <TouchableOpacity style={styles.buttonPrimary} onPress={registerAndGoToMainFlow}>
              <Text style={styles.buttonTextPrimary}>Crear Cuenta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={() => nav.replace("Login")}>
              <Text style={styles.buttonTextSecondary}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </Pressable>
  );
}

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
    marginBottom: 40,
  },
  titleText: {
    fontSize: 46,
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
    marginBottom: 15,
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
