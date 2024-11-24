import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { Ionicons } from "@expo/vector-icons";
import { ClassCodeManager } from "../../Components/ClassCodeManager/ClassCodeManager";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import { ClassCode } from "../../types/classcode";
import db from "@react-native-firebase/database";

export const ClassCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = auth().currentUser;
  const [codes, setCodes] = useState<ClassCode[]>([]);

  // Eliminar la restricción de código activo único
  const toggleCodeStatus = async (codeId: string) => {
    try {
      const codeRef = db().ref(`/classCodes/${codeId}`);
      const snapshot = await codeRef.once("value");
      const currentCode = snapshot.val();

      if (currentCode) {
        await codeRef.update({
          active: !currentCode.active,
        });

        // Actualizar estado local
        setCodes((prevCodes) =>
          prevCodes.map((code) =>
            code.id === codeId ? { ...code, active: !code.active } : code
          )
        );
      }
    } catch (error) {
      console.error("Error toggling code status:", error);
      Alert.alert("Error", "No se pudo actualizar el estado del código");
    }
  };

  // Agregar función de eliminación
  const deleteCode = async (codeId: string) => {
    try {
      await db().ref(`/classCodes/${codeId}`).remove();
      setCodes((prevCodes) => prevCodes.filter((code) => code.id !== codeId));
    } catch (error) {
      console.error("Error deleting code:", error);
      Alert.alert("Error", "No se pudo eliminar el código");
    }
  };

  // Renderizar cada código con más opciones
  const renderCode = (code: ClassCode) => (
    <View style={styles.codeContainer}>
      <View style={styles.codeInfo}>
        <Text style={styles.codeText}>{code.code}</Text>
        <Text style={styles.codeDescription}>{code.description}</Text>
      </View>
      <View style={styles.codeActions}>
        <TouchableOpacity
          style={[styles.actionButton, code.active && styles.activeButton]}
          onPress={() => toggleCodeStatus(code.id)}
        >
          <Text style={styles.actionButtonText}>
            {code.active ? "Activo" : "Inactivo"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              "Eliminar código",
              "¿Estás seguro? Esta acción no se puede deshacer.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Eliminar",
                  style: "destructive",
                  onPress: () => deleteCode(code.id),
                },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Gestión de Códigos</Text>
        </View>

        <View style={styles.container}>
          <ClassCodeManager
            teacherId={user?.uid || ""}
            teacherName={user?.displayName || "Profesor"}
          />
        </View>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(158, 118, 118, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  container: {
    flex: 1,
  },
  codeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  codeInfo: {
    flex: 1,
    marginRight: 10,
  },
  codeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#594545",
    marginBottom: 4,
  },
  codeDescription: {
    fontSize: 14,
    color: "#666",
  },
  codeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
  },
  actionButtonText: {
    color: "#9E7676",
    fontSize: 14,
    fontWeight: "500",
  },
  activeButton: {
    backgroundColor: "#9E7676",
  },
  deleteButton: {
    backgroundColor: "#FF4646",
  },
});
