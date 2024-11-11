import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";
import { Ionicons } from "@expo/vector-icons";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { CustomInput } from "../../Components/CustomInput/CustomInput";
import { CustomButton } from "../../Components/CustomButton/CustomButton";
import { UserAvatar } from "../../Components/UserAvatar/UserAvatar";
import { typography } from "../../theme/typography";
import { useAuth } from "../../context/AuthContext";

interface UserData {
  name: string;
  email: string;
  displayName?: string;
}

export const ProfileScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    displayName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const snapshot = await db()
          .ref(`/users/${currentUser.uid}`)
          .once("value");

        const data = snapshot.val();
        const userDataUpdate = {
          name: data?.name || currentUser.displayName || "Usuario",
          email: currentUser.email || "Sin email",
          displayName: currentUser.displayName || data?.name || "Usuario",
        };

        setUserData(userDataUpdate);
        setTempName(userDataUpdate.name);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!tempName.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await Promise.all([
          db()
            .ref(`/users/${currentUser.uid}`)
            .update({ name: tempName.trim() }),
          currentUser.updateProfile({
            displayName: tempName.trim(),
          })
        ]);

        setUserData((prev) => ({
          ...prev,
          name: tempName.trim(),
          displayName: tempName.trim(),
        }));
        setIsEditing(false);
        Alert.alert("Éxito", "Perfil actualizado correctamente");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    setIsLoading(true);
    try {
      const user = auth().currentUser;
      if (!user?.email) {
        throw new Error("No email found");
      }

      const credential = auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);

      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Éxito", "Contraseña actualizada correctamente");
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar la contraseña. Verifica tu contraseña actual."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Error during logout:", error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <BackgroundContainer source={require("../../assets/images/fondo_app.jpg")}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#056b05" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer source={require("../../assets/images/fondo_app.jpg")}>
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={authLoading}
      >
        {authLoading ? (
          <ActivityIndicator color="#ff4444" size="small" />
        ) : (
          <Ionicons name="log-out" size={30} color="#ff4444" />
        )}
      </TouchableOpacity>

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
            <View style={styles.header}>
              <UserAvatar name={userData.displayName || userData.name} size={80} />
              <Text style={[typography.title, styles.welcomeText]}>
                {userData.displayName || userData.name}
              </Text>
            </View>

            <View style={styles.form}>
              <CustomInput
                placeholder="Nombre"
                value={isEditing ? tempName : userData.displayName || userData.name}
                onChangeText={setTempName}
                editable={isEditing}
                placeholderTextColor="#fff"
              />
              <CustomInput
                placeholder="Email"
                value={userData.email}
                editable={false}
                onChangeText={() => {}}
                placeholderTextColor="#fff"
              />

              {isChangingPassword ? (
                <View style={styles.passwordSection}>
                  <CustomInput
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholderTextColor="#fff"
                  />
                  <CustomInput
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholderTextColor="#fff"
                  />
                  <View style={styles.buttonGroup}>
                    <CustomButton
                      title="Guardar nueva contraseña"
                      onPress={handleChangePassword}
                      disabled={isLoading}
                    />
                    <CustomButton
                      title="Cancelar"
                      onPress={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                      }}
                      variant="secondary"
                      disabled={isLoading}
                    />
                  </View>
                </View>
              ) : isEditing ? (
                <View style={styles.buttonGroup}>
                  <CustomButton
                    title="Guardar cambios"
                    onPress={handleUpdateProfile}
                    disabled={isLoading}
                  />
                  <CustomButton
                    title="Cancelar"
                    onPress={() => {
                      setIsEditing(false);
                      setTempName(userData.name);
                    }}
                    variant="secondary"
                    disabled={isLoading}
                  />
                </View>
              ) : (
                <View style={styles.buttonGroup}>
                  <CustomButton
                    title="Editar perfil"
                    onPress={() => setIsEditing(true)}
                    disabled={isLoading}
                  />
                  <CustomButton
                    title="Cambiar contraseña"
                    onPress={() => setIsChangingPassword(true)}
                    disabled={isLoading}
                  />
                </View>
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
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 60,
  },
  welcomeText: {
    fontSize: 24,
    marginTop: 20,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  form: {
    padding: 20,
    borderRadius: 20,
    minHeight: 250,
  },
  passwordSection: {
    marginTop: 10,
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  }
});