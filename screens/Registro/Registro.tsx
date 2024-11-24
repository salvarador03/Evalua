import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { CustomInput } from "../../Components/CustomInput/CustomInput";
import { CustomButton } from "../../Components/CustomButton/CustomButton";
import { ClassCodeManager } from "../../Components/ClassCodeManager/ClassCodeManager";
import { typography } from "../../theme/typography";
import { RootStackParamList } from "../../navigation/types";
import auth from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";
import { TEACHER_SECRET_CODE } from "../../utils/roles";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { User, StudentUser, TeacherUser } from "../../types/user";
import { DateButton } from "../../Components/DateButton/DateButton";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PasswordInput } from "../../Components/PasswordInput/PasswordInput";
import { createLoginNotification } from "../../utils/notifications";

const windowHeight = Dimensions.get("window").height;

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Registro"
>;

export const RegisterScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [classCode, setClassCode] = useState("");
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showClassCodeManager, setShowClassCodeManager] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { setUser } = useAuth();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const validateStudentFields = async () => {
    if (!classCode.trim()) {
      Alert.alert("Error", "El código de clase es obligatorio");
      return false;
    }

    try {
      const classSnapshot = await db()
        .ref("/classCodes")
        .orderByChild("code")
        .equalTo(classCode.trim())
        .once("value");

      const classData = classSnapshot.val();

      if (!classData) {
        Alert.alert(
          "Código no válido",
          "El código de clase ingresado no existe. Por favor, verifica e intenta nuevamente.",
          [
            {
              text: "OK",
              onPress: () => setClassCode(""), // Limpiamos el campo
            },
          ]
        );
        return false;
      }

      if (!dateOfBirth) {
        Alert.alert("Error", "La fecha de nacimiento es obligatoria");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating class code:", error);
      Alert.alert(
        "Error",
        "No se pudo verificar el código de clase. Por favor, intenta nuevamente."
      );
      return false;
    }
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const isTeacher = showSecretCode && secretCode === TEACHER_SECRET_CODE;

    // Validar campos específicos de estudiante
    if (!isTeacher && !(await validateStudentFields())) {
      return;
    }

    setLoading(true);

    try {
      // 1. Crear usuario en Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      if (userCredential.user) {
        // 2. Actualizar perfil
        await userCredential.user.updateProfile({
          displayName: name.trim(),
        });

        // 3. Preparar datos de usuario
        const userData: TeacherUser | StudentUser = isTeacher
          ? {
              uid: userCredential.user.uid,
              name: name.trim(),
              email: email.trim(),
              role: "teacher",
              createdAt: Date.now(),
              lastLogin: Date.now(),
              countryRole: {
                country: "España",
                language: "es",
                flag: "spain",
              },
            }
          : {
              uid: userCredential.user.uid,
              name: name.trim(),
              email: email.trim(),
              role: "student",
              dateOfBirth: dateOfBirth.toISOString().split("T")[0],
              age: calculateAge(dateOfBirth),
              classCode: classCode.trim(),
              createdAt: Date.now(),
              lastLogin: Date.now(),
            };

        // 4. Guardar en la base de datos
        try {
          await db().ref(`/users/${userCredential.user.uid}`).set(userData);

          // Después de guardar el usuario en la base de datos:
          await createLoginNotification(
            userCredential.user.uid,
            "welcome",
            name.trim()
          );

          if (isTeacher) {
            setRegisteredUser({
              id: userCredential.user.uid,
              name: name.trim(),
            });
            setShowClassCodeManager(true);
          } else {
            await AsyncStorage.setItem("userData", JSON.stringify(userData));
            setUser(userData);
          }
        } catch (dbError) {
          console.error("Error guardando en base de datos:", dbError);

          // Si falla el guardado en la base de datos, eliminar el usuario de Authentication
          await userCredential.user.delete();

          throw new Error(
            "Error al guardar los datos del usuario: " +
              (dbError instanceof Error ? dbError.message : "Error desconocido")
          );
        }
      }
    } catch (error: any) {
      console.error("Error completo:", error);

      let errorMessage = "Error al crear la cuenta";

      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Este email ya está registrado";
            break;
          case "auth/invalid-email":
            errorMessage = "El email no es válido";
            break;
          case "auth/weak-password":
            errorMessage = "La contraseña es muy débil";
            break;
          case "auth/network-request-failed":
            errorMessage = "Error de conexión. Verifica tu internet";
            break;
          default:
            errorMessage = `Error: ${error.message || "Error desconocido"}`;
        }
      } else {
        errorMessage =
          error.message ||
          "Error al crear la cuenta. Por favor, intenta nuevamente.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClassCodeManagerClose = async () => {
    try {
      if (registeredUser) {
        const userSnapshot = await db()
          .ref(`/users/${registeredUser.id}`)
          .once("value");

        const userData = userSnapshot.val();
        if (userData) {
          await AsyncStorage.setItem("userData", JSON.stringify(userData));
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setShowClassCodeManager(false);
    }
  };

  return (
    <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContent}>
              <Text style={styles.title}>Registro</Text>
              <View style={styles.form}>
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

                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />

                {/* Mostrar campos solo para estudiantes */}
                {!showSecretCode && (
                  <>
                    <DateButton
                      date={dateOfBirth}
                      onPress={() => setShowDatePicker(true)}
                      disabled={loading}
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
                      editable={!loading}
                    />
                  </>
                )}

                <CustomButton
                  title={
                    showSecretCode
                      ? "Registrarse como alumno"
                      : "¿Eres profesor?"
                  }
                  onPress={() => {
                    setShowSecretCode(!showSecretCode);
                    setSecretCode("");
                    setClassCode("");
                  }}
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
                      <ActivityIndicator size="large" color="#9E7676" />
                      <Text style={styles.loadingText}>Creando cuenta...</Text>
                    </View>
                  ) : (
                    <>
                      <CustomButton
                        title="Crear Cuenta"
                        onPress={handleRegister}
                      />
                      <View style={styles.buttonSpacing} />
                      <CustomButton
                        title="Volver"
                        onPress={() => navigation.navigate("Login")}
                        variant="secondary"
                      />
                    </>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {showClassCodeManager && registeredUser && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClassCodeManagerClose}
          >
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Configura tus códigos de clase
                </Text>
                <CustomButton
                  title="Finalizar"
                  onPress={handleClassCodeManagerClose}
                  variant="secondary"
                />
              </View>
              <View style={styles.modalContent}>
                <ClassCodeManager
                  teacherId={registeredUser.id}
                  teacherName={registeredUser.name}
                />
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    minHeight: windowHeight,
  },
  innerContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  form: {
    width: "100%",
    gap: 15,
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
  },
  buttonSpacing: {
    height: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    ...typography.title,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 30,
    textAlign: "center",
  },
});
