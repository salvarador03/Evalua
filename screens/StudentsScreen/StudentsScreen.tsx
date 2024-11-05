// src/screens/StudentsScreen/StudentsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import db from "@react-native-firebase/database";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Student {
  uid: string;
  name: string;
  email: string;
  lastLogin: number;
}

export const StudentsScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await db()
          .ref("/users")
          .orderByChild("role")
          .equalTo("student")
          .once("value");

        const studentsData = snapshot.val();
        if (studentsData) {
          const studentsArray = Object.entries(studentsData).map(
            ([uid, data]: [string, any]) => ({
              uid,
              ...data,
            })
          );
          setStudents(studentsArray);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        Alert.alert(
          "Error",
          "No se pudieron cargar los estudiantes. Por favor, verifica tu conexión e inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
        <Text style={styles.lastLogin}>
          Último acceso: {new Date(item.lastLogin).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#056b05" />
    </TouchableOpacity>
  );

  return (
    <BackgroundContainer
      source={require("../../assets/images/surfer-1836366_1280.jpg")}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Alumnos</Text>
          <View style={styles.teacherBadge}>
            <Ionicons name="school" size={20} color="#fff" />
            <Text style={styles.teacherBadgeText}>Profesor</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#056b05" />
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(5, 107, 5, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Para evitar el notch
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  teacherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  teacherBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Estilos específicos para StudentsScreen
  listContainer: {
    padding: 10,
  },
  studentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#056b05",
  },
  studentInfo: {
    flex: 1,
    marginRight: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#056b05",
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  lastLogin: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
});
