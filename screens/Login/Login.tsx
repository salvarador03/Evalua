import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
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
import db from "@react-native-firebase/database";
import auth from '@react-native-firebase/auth';

interface ClassCode {
  id: string;
  code: string;
  description?: string;
  institution?: string;
  country?: string;
  active: boolean;
}

// Definición de la interfaz para los datos sin procesar
interface ClassCodeData {
  code: string;
  description?: string;
  institution?: string;
  country?: string;
  active: boolean;
}

// Corrección en la definición del tipo de navegación
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export const LoginScreen: React.FC = () => {
  const [guestName, setGuestName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [dobValidationStatus, setDobValidationStatus] = useState<"empty" | "valid" | "invalid">("empty");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Estados para el selector de clase
  const [showClassModal, setShowClassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [loadingClassCodes, setLoadingClassCodes] = useState(false);

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInAsGuest, signIn, loading } = useAuth();

  // Cargar códigos de clase disponibles
  useEffect(() => {
    const fetchClassCodes = async () => {
      setLoadingClassCodes(true);
      try {
        const snapshot = await db().ref('/classCodes').once('value');
        const data = snapshot.val();

        if (data) {
          const codesArray = Object.entries(data).map(([id, codeData]: [string, any]) => {
            const typedCodeData = codeData as ClassCodeData;
            return {
              id,
              code: typedCodeData.code,
              description: typedCodeData.description,
              institution: typedCodeData.institution,
              country: typedCodeData.country,
              active: typedCodeData.active
            } as ClassCode;
          }).filter((code: ClassCode) => code.active);

          setClassCodes(codesArray);
        } else {
          setClassCodes([]);
        }
      } catch (error: any) {
        console.error("Error al cargar códigos de clase:", error);
      } finally {
        setLoadingClassCodes(false);
      }
    };

    if (!isLoginMode) {
      fetchClassCodes();
    }
  }, [isLoginMode]);

  useEffect(() => {
    const isValid = validateAge(dateOfBirth);
    setDobValidationStatus(isValid ? "valid" : "invalid");
  }, [dateOfBirth]);

  // Filtrar códigos basados en la búsqueda
  const filteredClassCodes = classCodes.filter(classCode => {
    const query = searchQuery.toLowerCase();
    return (
      classCode.code.toLowerCase().includes(query) ||
      (classCode.description && classCode.description.toLowerCase().includes(query)) ||
      (classCode.institution && classCode.institution.toLowerCase().includes(query)) ||
      (classCode.country && classCode.country.toLowerCase().includes(query))
    );
  });

  // Renderizar un código de clase
  const renderClassCodeItem = ({ item }: { item: ClassCode }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.classCodeItem}
      onPress={() => {
        setClassCode(item.code);
        setShowClassModal(false);
      }}
      disabled={isLoading}
    >
      <View style={styles.classCodeItemContent}>
        <View style={styles.classCodeItemHeader}>
          <Text style={styles.classCodeItemCode}>{item.code}</Text>
          <View style={styles.classCodeItemActiveStatus}>
            <Text style={styles.classCodeItemActiveText}>Activo</Text>
          </View>
        </View>

        <Text style={styles.classCodeItemDescription}>
          {item.description || 'Sin descripción'}
        </Text>

        <View style={styles.classCodeItemDetails}>
          {item.country && (
            <View style={styles.classCodeItemDetail}>
              <Text style={styles.classCodeItemDetailText}>
                {item.country}
              </Text>
            </View>
          )}
          {item.institution && (
            <View style={styles.classCodeItemDetail}>
              <Text style={styles.classCodeItemDetailText}>
                {item.institution}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const validateAge = (birthDate: Date): boolean => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 6 && age <= 24;
  };

  const handleDateChange = (selectedDate: Date) => {
    setDateOfBirth(selectedDate);
  };

  const handleGuestAccess = async () => {
    if (isSubmitting) {
      return;
    }

    if (!guestName.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nombre");
      return;
    }

    if (!classCode.trim()) {
      Alert.alert("Error", "Por favor selecciona una institución o clase");
      return;
    }

    if (!validateAge(dateOfBirth)) {
      Alert.alert(
        "Edad no válida",
        "Debes tener entre 6 y 24 años para poder realizar los cuestionarios."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const classSnapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(classCode.trim())
        .once('value');

      const classData = classSnapshot.val();

      if (!classData) {
        Alert.alert(
          "Código no válido",
          "El código de clase seleccionado no existe o no está activo. Por favor, selecciona otra institución o clase.",
          [{ text: "OK", onPress: () => setClassCode("") }]
        );
        return;
      }

      await signInAsGuest(guestName.trim(), classCode.trim(), dateOfBirth);

    } catch (error: any) {
      console.error("[LoginScreen] Error in guest access:", error);

      if (error.message === "Código de clase no válido") {
        Alert.alert(
          "Código no válido",
          "El código de clase seleccionado no es válido. Por favor, selecciona otra institución o clase.",
          [{ text: "OK", onPress: () => setClassCode("") }]
        );
      } else {
        Alert.alert(
          "Error",
          "Ha ocurrido un error al intentar acceder. Por favor, intenta nuevamente."
        );
      }
    } finally {
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

  // Función para refrescar los códigos de clase
  const refreshClassCodes = async () => {
    setLoadingClassCodes(true);
    try {
      const snapshot = await db().ref('/classCodes').once('value');
      const data = snapshot.val();

      if (data) {
        const codesArray = Object.entries(data).map(([id, codeData]: [string, any]) => {
          const typedCodeData = codeData as ClassCodeData;
          return {
            id,
            code: typedCodeData.code,
            description: typedCodeData.description,
            institution: typedCodeData.institution,
            country: typedCodeData.country,
            active: typedCodeData.active
          } as ClassCode;
        }).filter((code: ClassCode) => code.active);

        setClassCodes(codesArray);
      } else {
        setClassCodes([]);
      }
    } catch (error: any) {
      console.error("Error al cargar códigos de clase:", error);
    } finally {
      setLoadingClassCodes(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu email para recuperar la contraseña");
      return;
    }

    setIsResettingPassword(true);
    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert(
        "Correo enviado",
        "Se ha enviado un enlace de recuperación a tu correo electrónico"
      );
    } catch (error: any) {
      console.error("Error al enviar email de recuperación:", error);
      Alert.alert(
        "Error",
        "No se pudo enviar el correo de recuperación. Verifica que el email sea correcto."
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  const isLoading = loading || isSubmitting || isResettingPassword || loadingClassCodes;

  return (
    <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
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
              {isLoginMode ? "Área de Profesores" : "Acceso Invitado"}
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
                    onDateChange={handleDateChange}
                    disabled={isLoading}
                    isValidAge={validateAge(dateOfBirth)}
                    label="Fecha de nacimiento"
                    highlightStatus={dobValidationStatus}
                  />

                  {/* Selector de clase */}
                  <TouchableOpacity
                    style={[
                      styles.classSelectorButton,
                      isLoading && styles.disabledInput
                    ]}
                    onPress={() => setShowClassModal(true)}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.classSelectorText,
                      !classCode && styles.classSelectorPlaceholder
                    ]}>
                      {classCode
                        ? classCodes.find(c => c.code === classCode)?.description || classCode
                        : "Seleccionar institución o clase"}
                    </Text>
                    <View style={styles.classSelectorIcon}>
                      <Text style={styles.classSelectorIconText}>▼</Text>
                    </View>
                  </TouchableOpacity>

                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#9E7676" />
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

                  <TouchableOpacity
                    onPress={handlePasswordReset}
                    disabled={isLoading}
                    style={styles.forgotPasswordContainer}
                  >
                    <Text style={styles.forgotPasswordText}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>

                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#9E7676" />
                      <Text style={styles.loadingText}>
                        {isResettingPassword
                          ? "Enviando correo..."
                          : "Iniciando sesión..."}
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
                        title="Registrarse como Profesor"
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
                      : "Área de Profesores"
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

      {/* Modal para selección de clase */}
      <Modal
        visible={showClassModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClassModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowClassModal(false)}
        >
          <View style={styles.classModalContainer}>
            <View style={styles.classModalHeader}>
              <Text style={styles.classModalTitle}>Seleccionar Institución/Clase</Text>
              <View style={styles.headerActions}>
                {/* Botón de refresco */}
                <TouchableOpacity
                  onPress={refreshClassCodes}
                  disabled={loadingClassCodes}
                  style={styles.refreshButton}
                >
                  <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>

                {/* Botón de cerrar (existente) */}
                <TouchableOpacity onPress={() => setShowClassModal(false)}>
                  <Text style={styles.classModalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buscador (existente) */}
            <View style={styles.classSearchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.classSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar institución o clase..."
                placeholderTextColor="#666"
              />
              {searchQuery !== "" && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.classSearchClear}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingClassCodes ? (
              <ActivityIndicator size="large" color="#9E7676" style={styles.loadingIndicator} />
            ) : (
              <>
                {classCodes.length === 0 ? (
                  <Text style={styles.noClassCodesText}>
                    No hay clases disponibles
                  </Text>
                ) : (
                  <FlatList
                    data={filteredClassCodes}
                    renderItem={renderClassCodeItem}
                    keyExtractor={(item) => item.id}
                    style={styles.classCodeList}
                    ListEmptyComponent={
                      <Text style={styles.noClassCodesText}>
                        No se encontraron resultados para "{searchQuery}"
                      </Text>
                    }
                  />
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: -5,
    marginBottom: 10,
    padding: 5,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
  // Estilos para el selector de clase
  classSelectorButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  classSelectorText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  classSelectorPlaceholder: {
    opacity: 0.7,
  },
  classSelectorIcon: {
    marginLeft: 10,
  },
  classSelectorIconText: {
    color: "#fff",
    fontSize: 14,
  },
  disabledInput: {
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  refreshIcon: {
    fontSize: 18,
    color: "#594545",
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  classModalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  classModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  classModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#594545",
  },
  classModalCloseButton: {
    fontSize: 20,
    color: "#666",
    padding: 5,
  },
  classSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  classSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  classSearchClear: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#666",
  },
  classCodeList: {
    maxHeight: 300,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  noClassCodesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    padding: 20,
    fontStyle: "italic",
  },
  // Estilos para los items de código de clase
  classCodeItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  classCodeItemContent: {
    padding: 15,
  },
  classCodeItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  classCodeItemCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#594545",
  },
  classCodeItemActiveStatus: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  classCodeItemActiveText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  classCodeItemDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  classCodeItemDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  classCodeItemDetail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  classCodeItemDetailText: {
    fontSize: 12,
    color: "#9E7676",
  },
});