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
  Image,
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
import { MainTabParamList, RootStackParamList, StudentData } from "../../navigation/types";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

const COLORS = {
  primary: "#9E7676",
  secondary: "#DFCCCC",
  background: "#F5EBEB",
  text: "#594545",
  inactive: "#B4AAAA",
  success: "#4CAF50",
  warning: "#FFB442",
  error: "#FF4646",
};

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
  const [availableClassCodes, setAvailableClassCodes] = useState<ClassCode[]>(
    []
  );
  const [showCodePicker, setShowCodePicker] = useState(false);
  const currentCode = availableClassCodes.find(
    (c) => c.code === selectedClassCode
  );
  const [selectedClassCode, setSelectedClassCode] = useState<string>("");

  // Filtros
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    classCode: string | null;
    country: string | null;
    ageRange: string | null;
    specificAge: number | null;
  }>({
    classCode: null,
    country: null,
    ageRange: null,
    specificAge: null,
  });

  // Datos para los filtros de edad
  const ageRanges = [
    { id: 'children', label: 'Niños (6-12)', min: 6, max: 12 },
    { id: 'teens', label: 'Adolescentes (12-18)', min: 12, max: 18 },
    { id: 'youngAdults', label: 'Universitarios (18-24)', min: 18, max: 24 },
  ];

  // Lista de países disponibles
  const countries = [
    { id: 'es_ES', name: 'España', flag: 'spain' },
    { id: 'en_US', name: 'United States', flag: 'usa' },
    { id: 'es_MX', name: 'México', flag: 'mexico' },
    { id: 'es_CO', name: 'Colombia', flag: 'colombia' },
    { id: 'es_PE', name: 'Perú', flag: 'peru' },
    { id: 'es_EC', name: 'Ecuador', flag: 'ecuador' },
    { id: 'es_CL', name: 'Chile', flag: 'chile' },
    { id: 'es_AR', name: 'Argentina', flag: 'argentina' },
    { id: 'es_PA', name: 'Panamá', flag: 'panama' },
    { id: 'es_CU', name: 'Cuba', flag: 'cuba' },
    { id: 'pt_PT', name: 'Portugal', flag: 'portugal' },
    { id: 'pt_BR', name: 'Brasil', flag: 'brazil' },
  ];

  // Función para aplicar los filtros
  const applyFilters = (studentsList: Student[]) => {
    return studentsList.filter(student => {
      // Filtro por código de clase
      if (activeFilters.classCode && student.classCode !== activeFilters.classCode) {
        return false;
      }

      // Filtro por país
      if (activeFilters.country && student.countryRole?.country !== activeFilters.country) {
        return false;
      }

      // Filtro por edad específica
      if (activeFilters.specificAge !== null && student.age !== activeFilters.specificAge) {
        return false;
      }

      // Filtro por rango de edad
      if (activeFilters.ageRange) {
        const range = ageRanges.find(r => r.id === activeFilters.ageRange);
        if (range && student.age) {
          // Para el caso del límite (12 y 18), incluimos en ambos rangos
          if (range.id === 'children' && (student.age < range.min || student.age > range.max)) {
            return false;
          } else if (range.id === 'teens' && (student.age < range.min || student.age > range.max)) {
            return false;
          } else if (range.id === 'youngAdults' && (student.age < range.min || student.age > range.max)) {
            return false;
          }
        }
      }

      return true;
    });
  };

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

  // Modifica el useEffect para los filtros
  useEffect(() => {
    const filtered = students.filter((student) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        new Date(student.lastLogin)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchLower)
      );

      // Si no pasa el filtro de búsqueda, retorna falso inmediatamente
      if (!matchesSearch) return false;

      // Aplica los filtros adicionales
      return applyFilters([student]).length > 0;
    });

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchQuery, students, activeFilters]);

  // Añade esta función para obtener el indicador de filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.classCode) count++;
    if (activeFilters.country) count++;
    if (activeFilters.ageRange) count++;
    if (activeFilters.specificAge !== null) count++;
    return count;
  };

  // Función para restablecer los filtros
  const resetFilters = () => {
    setActiveFilters({
      classCode: null,
      country: null,
      ageRange: null,
      specificAge: null,
    });
  };

  // Modifica estas funciones y efectos
  const loadClassCodes = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const classCodesSnapshot = await db()
        .ref("classCodes")
        .orderByChild("teacherId")
        .equalTo(currentUser.uid)
        .once("value");

      const classCodesData = classCodesSnapshot.val();
      if (!classCodesData) {
        setAvailableClassCodes([]);
        return;
      }

      const codes = Object.entries(classCodesData).map(
        ([id, data]: [string, any]) => ({
          id,
          ...data,
        })
      );

      setAvailableClassCodes(codes);

      // Solo establecer el código seleccionado si no hay ninguno
      if (!selectedClassCode && codes.length > 0) {
        setSelectedClassCode(codes[0].code);
      }
    } catch (error) {
      console.error("Error loading class codes:", error);
      Alert.alert("Error", "No se pudieron cargar los códigos de clase");
    }
  };

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
      setLoading(true);
      const [usersSnapshot, guestsSnapshot, responsesSnapshot] =
        await Promise.all([
          db().ref("/users").once("value"),
          // Quitar el filtro por selectedClassCode aquí
          db().ref("/guests").once("value"),
          db().ref("/form_responses").once("value"),
        ]);

      const studentsData = usersSnapshot.val() || {};
      const guestsData = guestsSnapshot.val() || {};
      const responsesData = responsesSnapshot.val() || {};

      // Eliminar el filtro por rol y clase aquí
      const registeredStudents = Object.entries(studentsData)
        .filter(
          ([_, data]: [string, any]) =>
            data.role === "student" // Quitamos el filtro por classCode
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
          createdAt: data.createdAt,
        }));

      // También modificar para no filtrar los invitados
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
          classDetails: data.classDetails,
        })
      );

      const allStudents = [...registeredStudents, ...guestStudents].sort(
        (a, b) => a.name.localeCompare(b.name)
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
  // Agregar efecto para cargar códigos
  useEffect(() => {
    loadClassCodes();
  }, []);

  // Modificar este useEffect
  useEffect(() => {
    if (teacherClassCode) {
      fetchStudents();
    }
  }, [teacherClassCode]);

  // Y este otro
  useEffect(() => {
    // Eliminar la condición, siempre queremos cargar estudiantes
    fetchStudents();
  }, [selectedClassCode]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await loadClassCodes();
      if (selectedClassCode) {
        await fetchStudents();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert(
        "Error",
        "No se pudieron actualizar los datos. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };


  // Modal de filtros
  const FilterModal = () => {
    const [tempFilters, setTempFilters] = useState({ ...activeFilters });
    const [specificAgeInput, setSpecificAgeInput] = useState(
      tempFilters.specificAge !== null ? tempFilters.specificAge.toString() : ""
    );

    const applyTempFilters = () => {
      setActiveFilters(tempFilters);
      setFilterModalVisible(false);
    };

    const handleSpecificAgeChange = (text: string) => {
      setSpecificAgeInput(text);
      if (text.trim() === "") {
        setTempFilters(prev => ({ ...prev, specificAge: null }));
      } else {
        const age = parseInt(text);
        if (!isNaN(age) && age > 0) {
          setTempFilters(prev => ({ ...prev, specificAge: age }));
        }
      }
    };

    return (
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View
          style={styles.modalOverlay}
        >
          <View style={styles.filterModalContainer}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterScrollView}>
              {/* Filtro por código de clase */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Código de clase</Text>
                <View style={styles.filterOptions}>
                  {availableClassCodes.map(classCode => (
                    <TouchableOpacity
                      key={classCode.id}
                      style={[
                        styles.filterChip,
                        tempFilters.classCode === classCode.code && styles.filterChipActive
                      ]}
                      onPress={() => setTempFilters(prev => ({
                        ...prev,
                        classCode: prev.classCode === classCode.code ? null : classCode.code
                      }))}
                    >
                      <Text style={[
                        styles.filterChipText,
                        tempFilters.classCode === classCode.code && styles.filterChipTextActive
                      ]}>
                        {classCode.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro por país */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>País</Text>
                <View style={styles.countryFilterGrid}>
                  {countries.map(country => (
                    <TouchableOpacity
                      key={country.id}
                      style={[
                        styles.countryFilterItem,
                        tempFilters.country === country.name && styles.countryFilterItemActive
                      ]}
                      onPress={() => setTempFilters(prev => ({
                        ...prev,
                        country: prev.country === country.name ? null : country.name
                      }))}
                    >
                      <Image
                        source={getCountryFlagSource(country.flag)}
                        style={styles.countryFilterFlag}
                      />
                      <Text style={[
                        styles.countryFilterText,
                        tempFilters.country === country.name && styles.countryFilterTextActive
                      ]}>
                        {country.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro por rango de edad */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Rango de edad</Text>
                <View style={styles.filterOptions}>
                  {ageRanges.map(range => (
                    <TouchableOpacity
                      key={range.id}
                      style={[
                        styles.filterChip,
                        tempFilters.ageRange === range.id && styles.filterChipActive
                      ]}
                      onPress={() => {
                        if (tempFilters.ageRange === range.id) {
                          setTempFilters(prev => ({ ...prev, ageRange: null }));
                        } else {
                          setTempFilters(prev => ({
                            ...prev,
                            ageRange: range.id,
                            specificAge: null // Desactivar edad específica si se selecciona un rango
                          }));
                          setSpecificAgeInput("");
                        }
                      }}
                    >
                      <Text style={[
                        styles.filterChipText,
                        tempFilters.ageRange === range.id && styles.filterChipTextActive
                      ]}>
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro por edad específica */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Edad específica</Text>
                <TextInput
                  style={styles.ageInput}
                  value={specificAgeInput}
                  onChangeText={handleSpecificAgeChange}
                  placeholder="Ingresa una edad"
                  placeholderTextColor={COLORS.inactive}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.filterNote}>
                  Nota: Al seleccionar una edad específica, se desactivará el filtro por rango de edad
                </Text>
              </View>
            </ScrollView>

            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity
                style={styles.filterResetButton}
                onPress={() => {
                  setTempFilters({
                    classCode: null,
                    country: null,
                    ageRange: null,
                    specificAge: null,
                  });
                  setSpecificAgeInput("");
                }}
              >
                <Text style={styles.filterResetButtonText}>Restablecer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterApplyButton}
                onPress={applyTempFilters}
              >
                <Text style={styles.filterApplyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Función auxiliar para obtener la fuente de la imagen de la bandera
  const getCountryFlagSource = (flagName: string) => {
    const flagSources: { [key: string]: any } = {
      "spain": require("../../assets/flags/spain.webp"),
      "usa": require("../../assets/flags/usa.webp"),
      "mexico": require("../../assets/flags/mexico.webp"),
      "colombia": require("../../assets/flags/colombia.webp"),
      "peru": require("../../assets/flags/peru.webp"),
      "ecuador": require("../../assets/flags/ecuador.webp"),
      "chile": require("../../assets/flags/chile.webp"),
      "argentina": require("../../assets/flags/argentina.webp"),
      "panama": require("../../assets/flags/panama.webp"),
      "cuba": require("../../assets/flags/cuba.webp"),
      "portugal": require("../../assets/flags/portugal.webp"),
      "brazil": require("../../assets/flags/brazil.webp"),
    };

    return flagSources[flagName] || flagSources["spain"]; // Por defecto devuelve España
  };

  // Añade este efecto para actualizar al volver de la pantalla de gestión
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadClassCodes();
    });

    return unsubscribe;
  }, [navigation]);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const handleDeleteStudent = async (student: Student) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar a ${student.name}${student.isGuest ? " (Usuario Invitado)" : ""
      }?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const path = student.isGuest ? "guests" : "users";
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
      México: "mexico",
      Colombia: "colombia",
      Perú: "peru",
      Ecuador: "ecuador",
      Chile: "chile",
      Argentina: "argentina",
      Panamá: "panama",
      Cuba: "cuba",
      // Agregar más países según sea necesario
    };
    return countryFlags[country] || "unknown";
  };

  // Función helper para obtener la bandera basada en el país
  const getCountryFlagFromCountry = (country: string): string => {
    const countryToFlag: { [key: string]: string } = {
      "España": "spain",
      "United States": "usa",
      "Portugal": "portugal",
      "Brasil": "brazil",
      "México": "mexico",
      "Colombia": "colombia",
      "Perú": "peru",
      "Ecuador": "ecuador",
      "Chile": "chile",
      "Argentina": "argentina",
      "Panamá": "panama",
      "Cuba": "cuba",
      "Unknown": "unknown"
    };

    return countryToFlag[country] || "unknown";
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

    // Determinar si el estudiante es adolescente o niño
    const isTeenStudent = student.age ? student.age >= 12 && student.age <= 18 : false;

    // Obtener el número correcto de respuestas basado en la edad
    const expectedAnswers = isTeenStudent ? 8 : 6;

    // Asegurarse de que solo se pasen las respuestas necesarias
    const trimmedAnswers = physicalLiteracyResponse.answers.slice(0, expectedAnswers);

    const country = student.isGuest
      ? (physicalLiteracyResponse as any).country ||
      student.countryRole?.country ||
      "Unknown"
      : student.countryRole?.country || "Unknown";

    // Crear el countryRole basado en la información disponible
    const countryRole = {
      country: country,
      language: physicalLiteracyResponse.language as Language,
      flag: student.countryRole?.flag || getCountryFlagFromCountry(country)
    };

    const studentData: StudentData = {
      name: student.name,
      email: student.email,
      uid: student.uid,
      age: student.age // Ahora es opcional, así que es válido incluso si es undefined
    };

    navigation.navigate("Forms", {
      screen: "PhysicalLiteracyResults",
      params: {
        formResponse: {
          answers: trimmedAnswers,
          completedAt: physicalLiteracyResponse.completedAt,
          language: physicalLiteracyResponse.language as Language,
          isGuest: student.isGuest || false,
          userId: student.uid,
          country: country,
          countryRole: countryRole // Añadimos el countryRole aquí
        },
        language: physicalLiteracyResponse.language as Language,
        answers: trimmedAnswers,
        studentData,
        isTeacherView: true,
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
                {selectedStudent?.isGuest
                  ? "Editar Usuario Invitado"
                  : "Editar Estudiante"}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.name}
                  onChangeText={(value) =>
                    setLocalEditForm((prev) => ({ ...prev, name: value }))
                  }
                  placeholder="Nombre del estudiante"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.email}
                  onChangeText={(value) =>
                    setLocalEditForm((prev) => ({ ...prev, email: value }))
                  }
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
                  onChangeText={(value) =>
                    setLocalEditForm((prev) => ({ ...prev, age: value }))
                  }
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
                  onChangeText={(value) =>
                    setLocalEditForm((prev) => ({
                      ...prev,
                      dateOfBirth: value,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>País</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.country}
                  onChangeText={(value) =>
                    setLocalEditForm((prev) => ({ ...prev, country: value }))
                  }
                  placeholder="País (España, United States, Brasil, Portugal)"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Idioma</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.language}
                  onChangeText={(value) =>
                    setLocalEditForm((prev) => ({ ...prev, language: value }))
                  }
                  placeholder="Código de idioma (es, en, pt-BR)"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Código de Clase</Text>
                <TextInput
                  style={styles.editInput}
                  value={localEditForm.classCode}
                  onChangeText={(value) =>
                    setLocalEditForm((prev) => ({ ...prev, classCode: value }))
                  }
                  placeholder="Código de clase"
                  placeholderTextColor="#666"
                />
              </View>

              <View
                style={[styles.editButtonsContainer, { marginVertical: 20 }]}
              >
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
                  <Text style={[styles.editButtonText, { color: "#fff" }]}>
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Alumnos</Text>
        </View>

        {/* Contenedor para encapsular los botones de filtro y gestionar */}
        <View style={styles.classCodeSelectorContainer}>
          <View style={styles.classCodeSelectorHeader}>
            {/* Movemos el botón de filtro aquí */}
            <TouchableOpacity
              style={styles.filterButtonInHeader}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={20} color={COLORS.primary} />
              <Text style={styles.filterButtonText}>Filtros</Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={loading}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={loading ? COLORS.inactive : COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerManageButton}
                onPress={() => navigation.navigate("ClassCodes")}
              >
                <Text style={styles.manageButtonText}>Gestión clases</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.classInfoContainer}>
            <View style={styles.classStatusContainer}>
              <Text style={styles.classDescription}>
                {getActiveFiltersCount() > 0
                  ? "Alumnos filtrados"
                  : "Todos los alumnos"}
              </Text>
            </View>
            <View style={styles.studentCountContainer}>
              <Text style={styles.studentCount}>
                {filteredStudents.length}
              </Text>
              <Text style={styles.studentCountLabel}>alumnos</Text>
            </View>
          </View>
        </View>

        {/* La barra de búsqueda */}
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

        {/* Quitamos el renderFilterButton() aquí, ya que ahora está en la cabecera */}
        <FilterModal />

        {/* El resto del código permanece igual */}
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
            />
            {filteredStudents.length > ITEMS_PER_PAGE && renderPagination()}
          </>
        )}
        <ActionModal />
        <EditModal />
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  // Selector de clase
  classCodeSelectorContainer: {
    backgroundColor: "white",
    marginHorizontal: 6,
    marginBottom: 14,
    borderRadius: 14,
    padding: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  classCodeSelectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  selectorDropdown: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownContainer: {
    flex: 1,
    marginLeft: 8,
  },
  selectorLabel: {
    fontSize: 12,
    color: COLORS.inactive,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  selectedCodeText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  headerManageButton: {
    marginLeft: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 20,
  },
  classInfoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  rotating: {
    opacity: 0.7,
    transform: [{ rotate: "45deg" }],
  },
  classStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.inactive,
  },
  classDescription: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
    marginLeft: 8,
  },
  studentCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  studentCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  studentCountLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 6,
    opacity: 0.8,
  },
  // Modal de código
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  manageButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  codePickerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "90%",
    maxHeight: "80%",
  },
  filterButtonInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 1,
    marginRight: 12,
    marginTop: 20,
  },
  codePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  codeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  codeOptionContent: {
    flex: 1,
    marginRight: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    marginTop: 20,
    marginLeft: 19,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  codeMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  codeText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    marginRight: 8,
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeIndicatorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  codeDescription: {
    fontSize: 14,
    color: COLORS.inactive,
  },
  // Búsqueda
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  // Lista y elementos
  listContainer: {
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.inactive,
    textAlign: "center",
  },
  // Paginación
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 6,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    marginHorizontal: 16,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  // Tarjeta de estudiante
  studentCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  guestCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  noResponseCard: {
    opacity: 0.8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.inactive,
  },
  studentInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 2,
  },
  lastLogin: {
    fontSize: 13,
    color: COLORS.inactive,
    marginTop: 4,
  },
  guestBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  guestBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  pendingBadge: {
    backgroundColor: COLORS.inactive,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  pendingBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    padding: 8,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  // Modal de acciones
  modalContent: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    width: "80%",
    maxWidth: 400,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  // Modal de edición
  editModalContent: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "90%",
  },
  editModalScroll: {
    flexGrow: 0,
  },
  editModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 6,
  },
  editInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f8f8f8",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  
  // Estilos para el botón de filtros
  filterButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    marginLeft: 10,
  },
  filterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resetFiltersText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  
  // Estilos para el modal de filtros
  filterModalContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 500,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterScrollView: {
    maxHeight: 450,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 14,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterChip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: 'white',
  },
  
  // Estilos para el filtro de países
  countryFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  countryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 6,
    width: '45%',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  countryFilterItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  countryFilterFlag: {
    width: 24,
    height: 16,
    marginRight: 8,
    borderRadius: 2,
  },
  countryFilterText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
  },
  countryFilterTextActive: {
    color: 'white',
  },
  
  // Estilos para el filtro de edad específica
  ageInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  filterNote: {
    fontSize: 13,
    color: COLORS.inactive,
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Estilos para los botones del modal
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filterResetButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterResetButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  filterApplyButton: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  filterApplyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

