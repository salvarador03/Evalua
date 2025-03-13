import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import db from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";

// Definimos los colores para mantener consistencia
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

// Definimos una interfaz para nuestro código de clase
interface ClassCode {
  id: string;
  code: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: number;
  active: boolean;
  // Nuevos campos
  country: string;
  state: string;
  city: string;
  institution: string;
  className: string;
}

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
  { id: 'es_NI', name: 'Nicaragua', flag: 'nicaragua' }, // Añadido
  { id: 'es_PY', name: 'Paraguay', flag: 'paraguay' }   // Añadido
];

export const ClassCodeManager: React.FC<{
  teacherId: string;
  teacherName: string;
}> = ({ teacherId, teacherName }) => {
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [codeDescription, setCodeDescription] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Nuevos estados para los campos adicionales
  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string; flag: string } | null>(null);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [institution, setInstitution] = useState("");
  const [className, setClassName] = useState("");

  // Función para obtener la fuente de la imagen de la bandera
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
      "nicaragua": require("../../assets/flags/nicaragua.webp"), // Añadido
      "paraguay": require("../../assets/flags/paraguay.webp")   // Añadido
    };

    return flagSources[flagName] || flagSources["spain"]; // Por defecto devuelve España
  };

  useEffect(() => {
    fetchClassCodes();
  }, []);

  const fetchClassCodes = async () => {
    try {
      setLoading(true);
      const snapshot = await db()
        .ref("/classCodes")
        .orderByChild("teacherId")
        .equalTo(teacherId)
        .once("value");

      const data = snapshot.val();
      const codeList: ClassCode[] = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          codeList.push({
            id: key,
            ...data[key],
            // Asegurarse de que todos los campos existen
            country: data[key].country || "",
            state: data[key].state || "",
            city: data[key].city || "",
            institution: data[key].institution || "",
            className: data[key].className || "",
          });
        });
      }

      // Ordenar por fecha de creación (más reciente primero)
      codeList.sort((a, b) => b.createdAt - a.createdAt);
      setClassCodes(codeList);
    } catch (error) {
      console.error("Error fetching class codes:", error);
      Alert.alert("Error", "No se pudieron cargar los códigos de clase");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitimos caracteres confusos como I, O, 0, 1
    let result = "";
    const length = 6;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return result;
  };

  const createClassCode = async () => {
    if (!selectedCountry) {
      Alert.alert("Error", "Por favor selecciona un país");
      return;
    }

    if (!institution.trim()) {
      Alert.alert("Error", "Por favor ingresa el nombre de la institución");
      return;
    }

    try {
      const newCode = generateRandomCode();

      // Construir la descripción en formato estructurado
      let formattedDescription = `${selectedCountry.name}`;
      if (state.trim()) formattedDescription += `, ${state}`;
      if (city.trim()) formattedDescription += `, ${city}`;
      formattedDescription += ` - ${institution}`;
      if (className.trim()) formattedDescription += ` (${className})`;

      const classCodeData = {
        code: newCode,
        description: formattedDescription,
        teacherId,
        teacherName,
        createdAt: Date.now(),
        active: true,
        // Nuevos campos
        country: selectedCountry.name,
        state: state.trim(),
        city: city.trim(),
        institution: institution.trim(),
        className: className.trim(),
      };

      const newClassCodeRef = await db().ref("/classCodes").push(classCodeData);

      setClassCodes([
        {
          id: newClassCodeRef.key!,
          ...classCodeData,
        },
        ...classCodes,
      ]);

      // Limpiar el formulario
      setSelectedCountry(null);
      setState("");
      setCity("");
      setInstitution("");
      setClassName("");
      setCodeDescription("");

      setShowModal(false);
      Alert.alert(
        "Código creado",
        `Se ha generado el código ${newCode} para tu clase.`
      );
    } catch (error) {
      console.error("Error creating class code:", error);
      Alert.alert("Error", "No se pudo crear el código de clase");
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      await db().ref(`/classCodes/${codeId}`).update({
        active: !currentStatus,
      });

      setClassCodes(
        classCodes.map((code) =>
          code.id === codeId ? { ...code, active: !code.active } : code
        )
      );
    } catch (error) {
      console.error("Error toggling code status:", error);
      Alert.alert("Error", "No se pudo actualizar el estado del código");
    }
  };

  const deleteCode = async (codeId: string) => {
    try {
      await db().ref(`/classCodes/${codeId}`).remove();
      setClassCodes(classCodes.filter((code) => code.id !== codeId));
    } catch (error) {
      console.error("Error deleting code:", error);
      Alert.alert("Error", "No se pudo eliminar el código");
    }
  };

  const renderClassCode = ({ item }: { item: ClassCode }) => (
    <View style={styles.codeContainer}>
      <View style={styles.codeInfo}>
        <Text style={styles.codeText}>{item.code}</Text>
        <Text style={styles.codeDescription}>{item.description}</Text>

        {/* Información adicional */}
        <View style={styles.detailsContainer}>
          {item.country && (
            <View style={styles.detailItem}>
              <Ionicons name="globe-outline" size={14} color={COLORS.inactive} />
              <Text style={styles.detailText}>{item.country}</Text>
            </View>
          )}
          {item.institution && (
            <View style={styles.detailItem}>
              <Ionicons name="school-outline" size={14} color={COLORS.inactive} />
              <Text style={styles.detailText}>{item.institution}</Text>
            </View>
          )}
          {item.className && (
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={14} color={COLORS.inactive} />
              <Text style={styles.detailText}>{item.className}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.codeActions}>
        <TouchableOpacity
          style={[styles.actionButton, item.active && styles.activeButton]}
          onPress={() => toggleCodeStatus(item.id, item.active)}
        >
          <Text style={[styles.actionButtonText, item.active && styles.activeButtonText]}>
            {item.active ? "Activo" : "Inactivo"}
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
                  onPress: () => deleteCode(item.id),
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

  // Modal para seleccionar país
  const CountryPickerModal = () => (
    <Modal
      visible={showCountryPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCountryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.countryPickerContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar País</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.countryList}
          contentContainerStyle={{ paddingBottom: 20 }}>
            {countries.map((country) => (
              <TouchableOpacity
                key={country.id}
                style={styles.countryItem}
                onPress={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                }}
              >
                <Image
                  source={getCountryFlagSource(country.flag)}
                  style={styles.countryFlag}
                />
                <Text style={styles.countryName}>{country.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Crear Nuevo Código</Text>
      </TouchableOpacity>

      {classCodes.length > 0 ? (
        <FlatList
          data={classCodes}
          renderItem={renderClassCode}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="code-slash-outline" size={48} color={COLORS.inactive} />
          <Text style={styles.emptyText}>
            No tienes códigos de clase. Crea uno con el botón de arriba.
          </Text>
        </View>
      )}

      {/* Modal para crear un nuevo código */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Código de Clase</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Selector de país */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>País*</Text>
                <TouchableOpacity
                  style={styles.countrySelector}
                  onPress={() => setShowCountryPicker(true)}
                >
                  {selectedCountry ? (
                    <View style={styles.selectedCountry}>
                      <Image
                        source={getCountryFlagSource(selectedCountry.flag)}
                        style={styles.selectedCountryFlag}
                      />
                      <Text style={styles.selectedCountryName}>{selectedCountry.name}</Text>
                    </View>
                  ) : (
                    <Text style={styles.placeholder}>Selecciona un país</Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color={COLORS.inactive} />
                </TouchableOpacity>
              </View>

              {/* Estado/Provincia */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado/Provincia</Text>
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder="Ej: Cataluña, California, Antioquia..."
                  placeholderTextColor={COLORS.inactive}
                />
              </View>

              {/* Ciudad */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Ej: Barcelona, Los Angeles, Medellín..."
                  placeholderTextColor={COLORS.inactive}
                />
              </View>

              {/* Institución */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Institución*</Text>
                <TextInput
                  style={styles.input}
                  value={institution}
                  onChangeText={setInstitution}
                  placeholder="Ej: Colegio San Juan, Universidad Nacional..."
                  placeholderTextColor={COLORS.inactive}
                />
              </View>

              {/* Clase */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Clase (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={className}
                  onChangeText={setClassName}
                  placeholder="Ej: 2ºB, Grupo A, Educación Física..."
                  placeholderTextColor={COLORS.inactive}
                />
              </View>

              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Vista Previa de la Descripción:</Text>
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>
                    {selectedCountry ? selectedCountry.name : "País"}
                    {state ? `, ${state}` : ""}
                    {city ? `, ${city}` : ""}
                    {institution ? ` - ${institution}` : " - Institución"}
                    {className ? ` (${className})` : ""}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={createClassCode}
              >
                <Text style={styles.createButtonText}>Crear Código</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de selección de país */}
      <CountryPickerModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.inactive,
    textAlign: "center",
  },
  codeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  codeDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.inactive,
    marginLeft: 4,
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
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  activeButtonText: {
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedCountry: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCountryFlag: {
    width: 24,
    height: 16,
    marginRight: 10,
    borderRadius: 2,
  },
  selectedCountryName: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.inactive,
  },
  previewContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.text,
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  // Country Picker Modal
  countryPickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "85%", // Aumentado de 80% a 85% para dar más espacio
    paddingBottom: 16, // Añadir padding inferior para evitar corte
  },
  countryList: {
    padding: 16,
    paddingBottom: 24, // Añadir padding adicional al final de la lista
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  countryFlag: {
    width: 30,
    height: 20,
    marginRight: 12,
    borderRadius: 2,
  },
  countryName: {
    fontSize: 16,
    color: COLORS.text,
  },
});