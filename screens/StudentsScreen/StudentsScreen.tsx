import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import db from "@react-native-firebase/database";
import { Ionicons } from "@expo/vector-icons";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import { Language } from "../../types/language";
import { MainTabParamList, RootStackParamList } from "../../navigation/types";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

// Tipo de navegación compuesta
type StudentScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface FormResponses {
  [key: string]: {
    answers: number[];
    completedAt: number;
    language: string;
  };
}

interface CountryRole {
  country: string;
  flag: string;
  language: string;
}

interface ClassDetails {
  active: boolean;
  code: string;
  createdAt: number;
  description: string;
  teacherId: string;
  teacherName: string;
}

interface Student {
  uid: string;
  name: string;
  email: string;
  lastLogin: number;
  formResponses?: FormResponses;
  classCode?: string;
  isGuest?: boolean;
  role?: string;
  countryRole?: CountryRole;
  age?: number;
  dateOfBirth?: string;
  classDetails?: ClassDetails;
  createdAt?: number;
}

const ITEMS_PER_PAGE = 5;

export const StudentsScreen: React.FC = () => {
  const navigation = useNavigation<StudentScreenNavigationProp>();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [teacherClassCode, setTeacherClassCode] = useState<string>("");

  interface ClassCode {
    id: string;
    code: string;
    description?: string;
    teacherId: string;
    teacherName: string;
    createdAt: number;
    active: boolean;
  }

  useEffect(() => {
    fetchTeacherClassCode();
  }, []);

  useEffect(() => {
    if (teacherClassCode) {
      fetchStudents();
    }
  }, [teacherClassCode]);

  useEffect(() => {
    const filtered = students.filter((student) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        new Date(student.lastLogin)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchLower)
      );
    });
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchQuery, students]);

  const fetchTeacherClassCode = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error("No user authenticated");
      }

      const classCodesSnapshot = await db()
        .ref("classCodes")
        .orderByChild("teacherId")
        .equalTo(currentUser.uid)
        .once("value");

      const classCodesData = classCodesSnapshot.val();

      if (!classCodesData) {
        throw new Error("No class code found for teacher");
      }

      // Convert the Firebase object to an array of ClassCode objects
      const classCodes = Object.entries(classCodesData).map(
        ([id, data]): ClassCode => ({
          id,
          ...(data as Omit<ClassCode, "id">),
        })
      );

      // Find the active class code
      const activeClassCode = classCodes.find((code) => code.active);

      if (!activeClassCode) {
        throw new Error("No active class code found for teacher");
      }

      setTeacherClassCode(activeClassCode.code);
    } catch (error) {
      console.error("Error fetching teacher class code:", error);
      Alert.alert(
        "Error",
        "No se pudo obtener el código de clase del profesor."
      );
    }
  };

  const fetchStudents = async () => {
    try {
      const [usersSnapshot, guestsSnapshot, responsesSnapshot] = await Promise.all([
        db().ref("/users").once("value"),
        db()
          .ref("/guests")
          .orderByChild("classCode")
          .equalTo(teacherClassCode)
          .once("value"),
        db().ref("/form_responses").once("value"),
      ]);
  
      const studentsData = usersSnapshot.val() || {};
      const guestsData = guestsSnapshot.val() || {};
      const responsesData = responsesSnapshot.val() || {};
  
      // Process registered students
      const registeredStudents = Object.entries(studentsData)
        .filter(
          ([_, data]: [string, any]) =>
            data.role === "student" && data.classCode === teacherClassCode
        )
        .map(([uid, data]: [string, any]) => ({
          uid,
          name: data.name,
          email: data.email,
          lastLogin: data.lastLogin,
          formResponses: responsesData[uid] || {},
          classCode: data.classCode,
          isGuest: false,
          role: data.role,
          countryRole: data.countryRole,
          age: data.age,
          dateOfBirth: data.dateOfBirth,
          createdAt: data.createdAt
        }));
  
      // Process guest students with all fields
      const guestStudents = Object.entries(guestsData).map(
        ([uid, data]: [string, any]) => ({
          uid,
          name: data.name,
          email: data.email,
          lastLogin: data.lastLogin,
          formResponses: responsesData[uid] || {},
          classCode: data.classCode,
          isGuest: true,
          role: "guest",
          countryRole: data.countryRole,
          age: data.age,
          dateOfBirth: data.dateOfBirth,
          createdAt: data.createdAt,
          classDetails: data.classDetails
        })
      );
  
      const allStudents = [...registeredStudents, ...guestStudents].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  
      setStudents(allStudents);
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

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const handleDeleteStudent = async (student: Student) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar a ${student.name}${student.isGuest ? ' (Usuario Invitado)' : ''}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const path = student.isGuest ? 'guests' : 'users';
              await Promise.all([
                db().ref(`/${path}/${student.uid}`).remove(),
                db().ref(`/form_responses/${student.uid}`).remove(),
              ]);
              setStudents(students.filter((s) => s.uid !== student.uid));
              Alert.alert("Éxito", "Usuario eliminado correctamente");
            } catch (error) {
              console.error("Error deleting student:", error);
              Alert.alert("Error", "No se pudo eliminar el usuario");
            }
          },
        },
      ]
    );
  };

  // Primero, quitamos la restricción de edición para usuarios guest
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
      age: student.age?.toString() || "",
      dateOfBirth: student.dateOfBirth || "",
      country: student.countryRole?.country || "",
      language: student.countryRole?.language || "",
      classCode: student.classCode || "",
    });
    setShowEditModal(true);
    setShowActionModal(false);
  };

  // Agregamos una interfaz para el formulario de edición
  interface EditForm {
    name: string;
    email: string;
    age: string;
    dateOfBirth: string;
    country: string;
    language: string;
    classCode: string;
  }

  // Agregamos el estado para el formulario
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    email: "",
    age: "",
    dateOfBirth: "",
    country: "",
    language: "",
    classCode: "",
  });

  // Actualizamos la función handleSaveEdit
  const handleSaveEdit = async () => {
    if (!selectedStudent) return;

    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        age: parseInt(editForm.age) || 0,
        dateOfBirth: editForm.dateOfBirth,
        classCode: editForm.classCode,
        countryRole: {
          country: editForm.country,
          language: editForm.language,
          flag: getCountryFlag(editForm.country), // Función helper que deberás implementar
        },
      };

      const path = selectedStudent.isGuest ? "guests" : "users";
      await db().ref(`${path}/${selectedStudent.uid}`).update(updateData);

      setStudents(
        students.map((student) =>
          student.uid === selectedStudent.uid
            ? { ...student, ...updateData }
            : student
        )
      );

      setShowEditModal(false);
      Alert.alert("Éxito", "Información actualizada correctamente");
    } catch (error) {
      console.error("Error updating student:", error);
      Alert.alert("Error", "No se pudo actualizar la información");
    }
  };

  // Helper function para obtener la bandera según el país
  const getCountryFlag = (country: string): string => {
    const countryFlags: { [key: string]: string } = {
      España: "spain",
      "United States": "usa",
      Brasil: "brazil",
      Portugal: "portugal",
      // Agregar más países según sea necesario
    };
    return countryFlags[country] || "unknown";
  };

  const handleViewResults = (student: Student) => {
    const hasResponses = 
      student.formResponses &&
      student.formResponses.physical_literacy &&
      student.formResponses.physical_literacy.answers;
  
    if (!hasResponses) {
      Alert.alert(
        "Sin respuestas",
        student.isGuest 
          ? "Los usuarios invitados deben completar el cuestionario para ver resultados"
          : "El estudiante debe completar el cuestionario para ver resultados"
      );
      return;
    }
  
    const physicalLiteracyResponse = student.formResponses?.physical_literacy;
  
    if (!physicalLiteracyResponse) {
      Alert.alert(
        "Sin respuestas",
        "Este estudiante no ha completado el formulario de Physical Literacy."
      );
      return;
    }
  
    const country = student.isGuest 
      ? (physicalLiteracyResponse as any).country || student.countryRole?.country || "Unknown"
      : student.countryRole?.country || "Unknown";
  
    navigation.navigate("Forms", {
      screen: "PhysicalLiteracyResults",
      params: {
        formResponse: {
          answers: physicalLiteracyResponse.answers,
          completedAt: physicalLiteracyResponse.completedAt,
          language: physicalLiteracyResponse.language as Language,
          isGuest: student.isGuest || false,
          userId: student.uid,
          country: country,
        },
        language: physicalLiteracyResponse.language as Language,
        answers: physicalLiteracyResponse.answers,
        studentData: {
          name: student.name,
          email: student.email,
          uid: student.uid
        },
        isTeacherView: true  // Aseguramos que esto se pasa siempre como true
      },
    });
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentPage === 1 ? "#ccc" : "#9E7676"}
          />
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          Página {currentPage} de {totalPages || 1}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentPage === totalPages ? "#ccc" : "#9E7676"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Modificamos el renderStudent para mostrar un estado visual cuando no hay respuestas
  const renderStudent = ({ item }: { item: Student }) => {
    const hasResponses =
      item.formResponses &&
      item.formResponses.physical_literacy &&
      item.formResponses.physical_literacy.answers;
  
    return (
      <TouchableOpacity
        style={[
          styles.studentCard,
          item.isGuest && styles.guestCard,
          !hasResponses && styles.noResponseCard,
        ]}
        onPress={() => {
          setSelectedStudent(item);
          setShowActionModal(true);
        }}
      >
        <View style={styles.studentInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.studentName}>{item.name}</Text>
            {item.isGuest && (
              <View style={styles.guestBadge}>
                <Text style={styles.guestBadgeText}>Invitado</Text>
              </View>
            )}
            {!hasResponses && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pendiente</Text>
              </View>
            )}
          </View>
          <Text style={styles.studentEmail}>{item.email}</Text>
          <Text style={styles.lastLogin}>
            Último acceso: {new Date(item.lastLogin).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => handleViewResults(item)}
            style={[styles.actionIcon, !hasResponses && styles.disabledIcon]}
            disabled={!hasResponses}
          >
            <Ionicons
              name={hasResponses ? "bar-chart" : "time-outline"}
              size={24}
              color={hasResponses ? "#9E7676" : "#ccc"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedStudent(item);
              setShowActionModal(true);
            }}
            style={styles.actionIcon}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#9E7676" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const ActionModal = () => (
    <Modal
      visible={showActionModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowActionModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowActionModal(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowActionModal(false);
              handleViewResults(selectedStudent!);
            }}
          >
            <Ionicons name="bar-chart" size={24} color="#9E7676" />
            <Text style={styles.modalButtonText}>Ver Resultados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => handleEditStudent(selectedStudent!)}
          >
            <Ionicons name="create" size={24} color="#9E7676" />
            <Text style={styles.modalButtonText}>Editar Usuario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, styles.deleteButton]}
            onPress={() => {
              setShowActionModal(false);
              handleDeleteStudent(selectedStudent!);
            }}
          >
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={[styles.modalButtonText, { color: "#fff" }]}>
              Eliminar Usuario
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Modificamos EditModal para manejar correctamente el estado del formulario
  const EditModal = () => {
    // Movemos los estados del formulario dentro del componente modal
    const [localEditForm, setLocalEditForm] = useState<EditForm>({
      name: selectedStudent?.name || "",
      email: selectedStudent?.email || "",
      age: selectedStudent?.age?.toString() || "",
      dateOfBirth: selectedStudent?.dateOfBirth || "",
      country: selectedStudent?.countryRole?.country || "",
      language: selectedStudent?.countryRole?.language || "",
      classCode: selectedStudent?.classCode || "",
    });

    // Actualizamos el estado local cuando cambia el estudiante seleccionado
    useEffect(() => {
      if (selectedStudent) {
        setLocalEditForm({
          name: selectedStudent.name,
          email: selectedStudent.email,
          age: selectedStudent.age?.toString() || "",
          dateOfBirth: selectedStudent.dateOfBirth || "",
          country: selectedStudent.countryRole?.country || "",
          language: selectedStudent.countryRole?.language || "",
          classCode: selectedStudent.classCode || "",
        });
      }
    }, [selectedStudent]);

    // Función local para manejar el guardado
    const handleLocalSave = async () => {
      if (!selectedStudent) return;

      try {
        const updateData = {
          name: localEditForm.name,
          email: localEditForm.email,
          age: parseInt(localEditForm.age) || 0,
          dateOfBirth: localEditForm.dateOfBirth,
          classCode: localEditForm.classCode,
          countryRole: {
            country: localEditForm.country,
            language: localEditForm.language,
            flag: getCountryFlag(localEditForm.country),
          },
        };

        const path = selectedStudent.isGuest ? "guests" : "users";
        await db().ref(`${path}/${selectedStudent.uid}`).update(updateData);

        setStudents(
          students.map((student) =>
            student.uid === selectedStudent.uid
              ? { ...student, ...updateData }
              : student
          )
        );

        setShowEditModal(false);
        Alert.alert("Éxito", "Información actualizada correctamente");
      } catch (error) {
        console.error("Error updating student:", error);
        Alert.alert("Error", "No se pudo actualizar la información");
      }
    };

    return (
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <ScrollView style={styles.editModalScroll}>
              <Text style={styles.editModalTitle}>
                {selectedStudent?.isGuest ? 'Editar Usuario Invitado' : 'Editar Estudiante'}
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.name}
                  onChangeText={(value) => setLocalEditForm(prev => ({ ...prev, name: value }))}
                  placeholder="Nombre del estudiante"
                  placeholderTextColor="#666"
                />
              </View>
    
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.email}
                  onChangeText={(value) => setLocalEditForm(prev => ({ ...prev, email: value }))}
                  placeholder="Email del estudiante"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
    
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Edad</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.age}
                  onChangeText={(value) => setLocalEditForm(prev => ({ ...prev, age: value }))}
                  placeholder="Edad"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
    
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.dateOfBirth}
                  onChangeText={(value) => setLocalEditForm(prev => ({ ...prev, dateOfBirth: value }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#666"
                />
              </View>
    
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>País</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.country}
                  onChangeText={(value) => setLocalEditForm(prev => ({ ...prev, country: value }))}
                  placeholder="País (España, United States, Brasil, Portugal)"
                  placeholderTextColor="#666"
                />
              </View>
    
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Idioma</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.language}
                  onChangeText={(value) => setLocalEditForm(prev => ({ ...prev, language: value }))}
                  placeholder="Código de idioma (es, en, pt-BR)"
                  placeholderTextColor="#666"
                />
              </View>
    
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Código de Clase</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.classCode}
                  onChangeText={(value) => setLocalEditForm(prev => ({ ...prev, classCode: value }))}
                  placeholder="Código de clase"
                  placeholderTextColor="#666"
                />
              </View>
    
              <View style={[styles.editButtonsContainer, { marginVertical: 20 }]}>
                <TouchableOpacity 
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.editButtonText}>Cancelar</Text>
                </TouchableOpacity>
    
                <TouchableOpacity 
                  style={[styles.editButton, styles.saveButton]}
                  onPress={handleLocalSave}
                >
                  <Text style={[styles.editButtonText, { color: '#fff' }]}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Alumnos</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.classCode}>Código: {teacherClassCode}</Text>
            <View style={styles.teacherBadge}>
              <Ionicons name="school" size={20} color="#fff" />
              <Text style={styles.teacherBadgeText}>Profesor</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9E7676"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar alumno..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#9E7676" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9E7676" />
          </View>
        ) : (
          <>
            <FlatList
              data={getPaginatedData()}
              renderItem={renderStudent}
              keyExtractor={(item) => item.uid}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No se encontraron alumnos que coincidan con la búsqueda"
                      : "No hay alumnos registrados"}
                  </Text>
                </View>
              }
            />
            {filteredStudents.length > ITEMS_PER_PAGE && renderPagination()}
          </>
        )}
        <ActionModal />
        <EditModal />
      </View>
    </BackgroundContainer>
  );
  
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  editModalScroll: {
    flexGrow: 1,
  },
  headerInfo: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  classCode: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 25,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
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
    borderLeftColor: "#9E7676",
  },
  guestCard: {
    borderLeftColor: "#FFB442",
  },
  studentInfo: {
    flex: 1,
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9E7676",
    marginBottom: 4,
  },
  guestBadge: {
    backgroundColor: "#FFB442",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  guestBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    gap: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#9E7676",
    fontWeight: "500",
  },
  noResponseContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    marginHorizontal: 10,
  },
  noResponseText: {
    fontSize: 16,
    color: "#9E7676",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  noResponseSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  noResponseCard: {
    borderLeftColor: "#ccc",
    opacity: 0.8,
  },
  pendingBadge: {
    backgroundColor: "#FFB442",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  disabledIcon: {
    opacity: 0.5,
  },
  deleteButton: {
    backgroundColor: "#FF4646",
  },
  editModalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9E7676",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#594545",
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  saveButton: {
    backgroundColor: "#9E7676",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#594545",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paginationButton: {
    padding: 10,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    marginHorizontal: 15,
    fontSize: 16,
    color: "#9E7676",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
