// Components/ClassCodeManager.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CustomInput } from "../CustomInput/CustomInput";
import { CustomButton } from "../CustomButton/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import db from "@react-native-firebase/database";

interface ClassCode {
  id: string;
  code: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  createdAt: number;
  active: boolean;
}

interface Props {
  teacherId: string;
  teacherName: string;
}

export const ClassCodeManager: React.FC<Props> = ({
  teacherId,
  teacherName,
}) => {
  const [newCode, setNewCode] = useState("");
  const [description, setDescription] = useState("");
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadClassCodes = useCallback(async () => {
    if (!teacherId) return;

    try {
      const snapshot = await db()
        .ref("/classCodes")
        .orderByChild("teacherId")
        .equalTo(teacherId)
        .once("value");

      const data = snapshot.val();

      if (data) {
        const codesArray = Object.entries(data)
          .map(([id, code]) => ({
            id,
            ...(code as any),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setClassCodes(codesArray);
      } else {
        setClassCodes([]);
      }
    } catch (error) {
      console.error("Error loading class codes:", error);
      setClassCodes([]);
    } finally {
      setInitialLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadClassCodes();
  }, [loadClassCodes]);

  const handleAddClassCode = async () => {
    if (!teacherId || !teacherName) {
      Alert.alert("Error", "Información del profesor no disponible");
      return;
    }

    if (!newCode.trim()) {
      Alert.alert("Error", "Por favor ingresa un código de clase");
      return;
    }

    setLoading(true);

    try {
      const snapshot = await db()
        .ref("/classCodes")
        .orderByChild("code")
        .equalTo(newCode.trim())
        .once("value");

      if (snapshot.exists()) {
        Alert.alert("Error", "Este código de clase ya existe");
        return;
      }

      const classCodeData = {
        code: newCode.trim(),
        teacherId,
        teacherName,
        createdAt: Date.now(),
        description: description.trim(),
        active: true,
      };

      await db().ref("/classCodes").push(classCodeData);

      setNewCode("");
      setDescription("");
      Alert.alert("Éxito", "Código de clase creado correctamente");
      await loadClassCodes();
    } catch (error) {
      console.error("Error creating class code:", error);
      Alert.alert("Error", "No se pudo crear el código de clase");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    Alert.alert(
      "Eliminar Código",
      "¿Estás seguro de que quieres eliminar este código de clase?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await db().ref(`/classCodes/${codeId}`).remove();
              Alert.alert("Éxito", "Código eliminado correctamente");
              await loadClassCodes();
            } catch (error) {
              console.error("Error deleting code:", error);
              Alert.alert("Error", "No se pudo eliminar el código");
            }
          },
        },
      ]
    );
  };

  const toggleCodeStatus = async (code: ClassCode) => {
    try {
      await db().ref(`/classCodes/${code.id}`).update({
        active: !code.active,
      });
      Alert.alert(
        "Éxito",
        `Código ${!code.active ? "activado" : "desactivado"} correctamente`
      );
      await loadClassCodes();
    } catch (error) {
      console.error("Error toggling code status:", error);
      Alert.alert("Error", "No se pudo actualizar el estado del código");
    }
  };

  const renderCodeItem = ({ item }: { item: ClassCode }) => (
    <View style={styles.codeItem}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeText}>Código: {item.code}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteCode(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
      {item.description && (
        <Text style={styles.descriptionText}>{item.description}</Text>
      )}
      <View style={styles.codeFooter}>
        <Text style={styles.dateText}>
          Creado: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[
            styles.statusButton,
            item.active ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => toggleCodeStatus(item)}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.active ? "#056b05" : "#FF4444" },
            ]}
          >
            {item.active ? "Activo" : "Inactivo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.form}>
          <CustomInput
            placeholder="Nuevo código de clase"
            value={newCode}
            onChangeText={setNewCode}
            editable={!loading}
            style={styles.input}
            placeholderTextColor="#666"
            inputStyle={{
              color: "#333",
              backgroundColor: "#F5EBEB",
            }}
          />
          <CustomInput
            placeholder="Descripción (ej: Clase de 4º ESO, Grupo avanzado de atletismo, Curso 2024...)"
            // O alguna de estas alternativas:
            // placeholder="Descripción (ej: 4º ESO - Grupo A, Equipo juvenil, Clase de tarde...)"
            // placeholder="Descripción (ej: Educación Física 2ºB, Actividades deportivas, Grupo de competición...)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            style={styles.input}
            multiline
            placeholderTextColor="#666"
            inputStyle={{
              color: "#333",
              backgroundColor: "#F5EBEB",
            }}
          />
          <CustomButton
            title="Crear Código de Clase"
            onPress={handleAddClassCode}
            disabled={loading}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subtitle}>Tus Códigos de Clase</Text>
        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9E7676" />
          </View>
        ) : (
          <FlatList
            data={classCodes}
            keyExtractor={(item) => item.id}
            renderItem={renderCodeItem}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No tienes códigos de clase creados
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  formContainer: {
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#9E7676",
    borderRadius: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  codeItem: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9E7676",
  },
  deleteButton: {
    padding: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  codeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  activeButton: {
    backgroundColor: "rgba(5, 107, 5, 0.1)",
  },
  inactiveButton: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },
});
