import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { CustomInput } from "../../Components/CustomInput/CustomInput";
import { CustomButton } from "../../Components/CustomButton/CustomButton";
import { typography } from "../../theme/typography";
import { RootStackParamList } from "../../navigation/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateButton } from "../../Components/DateButton/DateButton";
import { useAuth } from "../../context/AuthContext";
import { PasswordInput } from "../../Components/PasswordInput/PasswordInput";
import db from "@react-native-firebase/database"; // Añadida esta importación

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export const LoginScreen: React.FC = () => {
  const [guestName, setGuestName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInAsGuest, signIn, loading } = useAuth();

  // Modificar solo la función handleGuestAccess en LoginScreen
  const handleGuestAccess = async () => {
    console.log("[LoginScreen] Starting guest access", {
      guestName,
      classCode,
    });
    if (isSubmitting) {
      console.log("[LoginScreen] Already submitting, returning");
      return;
    }
  
    // Validaciones del frontend
    if (!guestName.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nombre");
      return;
    }
  
    if (!classCode.trim()) {
      Alert.alert("Error", "Por favor ingresa el código de clase");
      return;
    }
  
    setIsSubmitting(true);
    console.log("[LoginScreen] Calling signInAsGuest");
  
    try {
      // Primero verificamos el código de clase
      const classSnapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(classCode.trim())
        .once('value');
  
      const classData = classSnapshot.val();
      
      if (!classData) {
        Alert.alert(
          "Código no válido",
          "El código de clase ingresado no existe. Por favor, verifica e intenta nuevamente.",
          [
            { 
              text: "OK",
              onPress: () => setClassCode("")  // Limpiamos el campo
            }
          ]
        );
        return;
      }
  
      // Si el código es válido, procedemos con el registro
      await signInAsGuest(guestName.trim(), classCode.trim(), dateOfBirth);
      console.log("[LoginScreen] Guest access successful");
      
    } catch (error: any) {
      console.error("[LoginScreen] Error in guest access:", error);
      
      // Manejo específico de errores
      if (error.message === "Código de clase no válido") {
        Alert.alert(
          "Código no válido",
          "El código de clase ingresado no es válido. Por favor, verifica e intenta nuevamente.",
          [
            { 
              text: "OK",
              onPress: () => setClassCode("")  // Limpiamos el campo
            }
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "Ha ocurrido un error al intentar acceder. Por favor, intenta nuevamente."
        );
      }
    } finally {
      console.log("[LoginScreen] Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (isSubmitting) return;

    if (!email.trim() || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error: any) {
      console.error("Error en login:", error);
      Alert.alert(
        "Error",
        "Credenciales incorrectas. Por favor verifica e intenta nuevamente"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={[typography.title, styles.title]}>
              {isLoginMode ? "Inicio sesión" : "Acceso Invitado"}
            </Text>

            <View style={styles.form}>
              {!isLoginMode ? (
                <>
                  <CustomInput
                    placeholder="Nombre"
                    value={guestName}
                    onChangeText={setGuestName}
                    editable={!isLoading}
                  />

                  <DateButton
                    date={dateOfBirth}
                    onPress={() => setShowDatePicker(true)}
                    disabled={isLoading}
                  />

                  {showDatePicker && (
                    <DateTimePicker
                      value={dateOfBirth}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  )}

                  <CustomInput
                    placeholder="Código de clase"
                    value={classCode}
                    onChangeText={setClassCode}
                    editable={!isLoading}
                  />

                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#056b05" />
                      <Text style={styles.loadingText}>Accediendo...</Text>
                    </View>
                  ) : (
                    <CustomButton
                      title="Acceder como invitado"
                      onPress={handleGuestAccess}
                      disabled={isLoading}
                    />
                  )}
                </>
              ) : (
                <>
                  <CustomInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                  />

                  <PasswordInput
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />

                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#056b05" />
                      <Text style={styles.loadingText}>
                        Iniciando sesión...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <CustomButton
                        title="Iniciar Sesión"
                        onPress={handleLogin}
                        disabled={isLoading}
                      />
                      <CustomButton
                        title="Registrarse"
                        onPress={() => navigation.navigate("Registro")}
                        variant="secondary"
                        disabled={isLoading}
                      />
                    </>
                  )}
                </>
              )}

              {!isLoading && (
                <CustomButton
                  title={
                    isLoginMode
                      ? "Volver al acceso invitado"
                      : "¿Ya tienes cuenta?"
                  }
                  onPress={() => {
                    setIsLoginMode(!isLoginMode);
                    setEmail("");
                    setPassword("");
                    setGuestName("");
                    setClassCode("");
                    setDateOfBirth(new Date());
                  }}
                  variant="secondary"
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  form: {
    marginTop: 40,
    gap: 15,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    marginVertical: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  title: {
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
