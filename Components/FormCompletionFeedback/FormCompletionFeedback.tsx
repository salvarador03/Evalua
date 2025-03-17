// Correcciones en ImprovedFeedbackModal.tsx para resolver el problema de detección de valoraciones
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import db from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";

// Importar traducciones
import { translations, Language } from "../LanguageSelection/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  primary: "#9E7676",
  secondary: "#DFCCCC",
  background: "#F5EBEB",
  text: "#594545",
  inactive: "#B4AAAA",
  success: "#4CAF50",
  warning: "#FFB442",
  error: "#FF4646",
  starInactive: "#DDD",
  starActive: "#FFD700",
};

// Añadir traducciones para el componente de feedback
const feedbackTranslations = {
  es: {
    feedbackTitle: "¡Tu opinión es importante!",
    editFeedbackTitle: "Modificar tu valoración",
    rateExperience: "Valora tu experiencia con la aplicación",
    overallExperience: "Experiencia general",
    usability: "Facilidad de uso",
    contentQuality: "Calidad del contenido",
    visualDesign: "Diseño visual",
    tellUsMore: "Cuéntanos más sobre tu experiencia",
    improvementSuggestions: "Sugerencias de mejora",
    submitFeedback: "Enviar valoración",
    updateFeedback: "Actualizar valoración",
    thankYou: "¡Gracias por tu valoración!",
    yourFeedbackHelps: "Tu opinión nos ayuda a mejorar la aplicación.",
    close: "Cerrar",
    errorSubmitting: "Error al enviar la valoración",
    pleaseTryAgain: "Por favor, inténtalo de nuevo más tarde.",
    feedbackRequired: "Por favor, valora tu experiencia antes de enviar.",
    resetFeedback: "Restablecer"
  },
  "es-PA": {
    feedbackTitle: "¡Tu opinión es importante!",
    editFeedbackTitle: "Modificar tu valoración",
    rateExperience: "Valora tu experiencia con la aplicación",
    overallExperience: "Experiencia general",
    usability: "Facilidad de uso",
    contentQuality: "Calidad del contenido",
    visualDesign: "Diseño visual",
    tellUsMore: "Cuéntanos más sobre tu experiencia",
    improvementSuggestions: "Sugerencias de mejora",
    submitFeedback: "Enviar valoración",
    updateFeedback: "Actualizar valoración",
    thankYou: "¡Gracias por tu valoración!",
    yourFeedbackHelps: "Tu opinión nos ayuda a mejorar la aplicación.",
    close: "Cerrar",
    errorSubmitting: "Error al enviar la valoración",
    pleaseTryAgain: "Por favor, inténtalo de nuevo más tarde.",
    feedbackRequired: "Por favor, valora tu experiencia antes de enviar.",
    resetFeedback: "Restablecer"
  },
  en: {
    feedbackTitle: "Your feedback matters!",
    editFeedbackTitle: "Update your feedback",
    rateExperience: "Rate your experience with the application",
    overallExperience: "Overall experience",
    usability: "Ease of use",
    contentQuality: "Content quality",
    visualDesign: "Visual design",
    tellUsMore: "Tell us more about your experience",
    improvementSuggestions: "Suggestions for improvement",
    submitFeedback: "Submit feedback",
    updateFeedback: "Update feedback",
    thankYou: "Thank you for your feedback!",
    yourFeedbackHelps: "Your opinion helps us improve the application.",
    close: "Close",
    errorSubmitting: "Error submitting feedback",
    pleaseTryAgain: "Please try again later.",
    feedbackRequired: "Please rate your experience before submitting.",
    resetFeedback: "Reset"
  },
  "pt-PT": {
    feedbackTitle: "A sua opinião é importante!",
    editFeedbackTitle: "Modificar a sua avaliação",
    rateExperience: "Avalie a sua experiência com a aplicação",
    overallExperience: "Experiência geral",
    usability: "Facilidade de utilização",
    contentQuality: "Qualidade do conteúdo",
    visualDesign: "Design visual",
    tellUsMore: "Conte-nos mais sobre a sua experiência",
    improvementSuggestions: "Sugestões de melhoria",
    submitFeedback: "Enviar avaliação",
    updateFeedback: "Atualizar avaliação",
    thankYou: "Obrigado pela sua avaliação!",
    yourFeedbackHelps: "A sua opinião ajuda-nos a melhorar a aplicação.",
    close: "Fechar",
    errorSubmitting: "Erro ao enviar a avaliação",
    pleaseTryAgain: "Por favor, tente novamente mais tarde.",
    feedbackRequired: "Por favor, avalie a sua experiência antes de enviar.",
    resetFeedback: "Restabelecer"
  },
  "pt-BR": {
    feedbackTitle: "Sua opinião é importante!",
    editFeedbackTitle: "Modificar sua avaliação",
    rateExperience: "Avalie sua experiência com o aplicativo",
    overallExperience: "Experiência geral",
    usability: "Facilidade de uso",
    contentQuality: "Qualidade do conteúdo",
    visualDesign: "Design visual",
    tellUsMore: "Conte-nos mais sobre sua experiência",
    improvementSuggestions: "Sugestões de melhoria",
    submitFeedback: "Enviar avaliação",
    updateFeedback: "Atualizar avaliação",
    thankYou: "Obrigado pela sua avaliação!",
    yourFeedbackHelps: "Sua opinião nos ajuda a melhorar o aplicativo.",
    close: "Fechar",
    errorSubmitting: "Erro ao enviar a avaliação",
    pleaseTryAgain: "Por favor, tente novamente mais tarde.",
    feedbackRequired: "Por favor, avalie sua experiência antes de enviar.",
    resetFeedback: "Restabelecer"
  },
};

interface ImprovedFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  language: Language;
  userId: string;
  formType: string;
  isEditing?: boolean;
  existingFeedback?: any;
}

interface FeedbackData {
  userId: string;
  formType: string;
  ratings: {
    overall: number;
    usability: number;
    content: number;
    design: number;
  };
  comments: {
    generalFeedback: string;
    improvementSuggestions: string;
  };
  language: Language;
  submittedAt: number;
  lastModified: number;
}


const ImprovedFeedbackModal: React.FC<ImprovedFeedbackModalProps> = ({
  visible,
  onClose,
  language,
  userId,
  formType,
  isEditing = false,
  existingFeedback = null
}) => {
  // Estado para las valoraciones
  const [overallRating, setOverallRating] = useState(0);
  const [usabilityRating, setUsabilityRating] = useState(0);
  const [contentRating, setContentRating] = useState(0);
  const [designRating, setDesignRating] = useState(0);

  // Estado para comentarios
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");

  // Estado para manejo de la interfaz
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Obtener traducciones
  const t = translations[language];
  const ft = feedbackTranslations[language];

  // Función consistente para generar el ID de feedback
  const generateFeedbackId = (userId: string, formType: string): string => {
    return `${userId}_${formType}`;
  };

  // Función mejorada para buscar feedback que incluye búsqueda por prefijos
  const checkExistingFeedback = async (userId: string, formType: string): Promise<FeedbackData | null> => {
    try {

      // PASO 1: Buscar con ID exacto
      const feedbackId = `${userId}_${formType}`;

      let snapshot = await db()
        .ref(`/feedback/${feedbackId}`)
        .once("value");

      if (snapshot.exists()) {
        return snapshot.val();
      }

      // PASO 2: Buscar en la antigua ubicación

      snapshot = await db()
        .ref(`/form_responses/${userId}/feedback_${formType}`)
        .once("value");

      if (snapshot.exists()) {
        return snapshot.val();
      }

      // PASO 3: Buscar por ID con prefijo (para IDs con timestamp)

      // Obtener todos los feedbacks
      const allFeedbackSnapshot = await db()
        .ref('/feedback')
        .once('value');

      if (allFeedbackSnapshot.exists()) {
        const allFeedbacks = allFeedbackSnapshot.val();

        // MEJORADO: Más opciones de búsqueda para IDs con diferentes patrones
        const possiblePatterns = [
          // Patrones exactos
          `${userId}_${formType}`,
          // Patrones con timestamp al final (lo más común)
          `${userId}_${formType}_`,
          // Patrones con timestamp en medio
          `${userId}_${formType}`,
          // Patrón invertido (por si acaso)
          `${formType}_${userId}`
        ];

        // Buscar cualquier clave que contenga el userId y formType en alguna combinación
        const matchingKeys = Object.keys(allFeedbacks).filter(key => {
          // Verificar patrones específicos primero
          if (possiblePatterns.some(pattern => key.includes(pattern))) {
            return true;
          }

          // Si no hay coincidencia con patrones, verificar si contiene ambos valores
          return key.includes(userId) && key.includes(formType);
        });

        if (matchingKeys.length > 0) {
          return allFeedbacks[matchingKeys[0]];
        }

        // PASO 4: Verificar dentro de los objetos
        for (const key in allFeedbacks) {
          const feedback = allFeedbacks[key];
          if (typeof feedback === 'object' && feedback !== null) {
            if (feedback.userId === userId && feedback.formType === formType) {
              return feedback;
            }
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Actualizar la función loadExistingFeedback en ImprovedFeedbackModal
  const loadExistingFeedback = async (): Promise<boolean> => {
    if (!userId || !formType) {
      return false;
    }

    try {

      // Usar la función mejorada de checkExistingFeedback
      const found = await checkExistingFeedback(userId, formType);

      if (found && existingFeedback) {


        // Actualizar los campos del formulario con valores predeterminados si alguno es undefined
        setOverallRating(existingFeedback.ratings?.overall ?? 0);
        setUsabilityRating(existingFeedback.ratings?.usability ?? 0);
        setContentRating(existingFeedback.ratings?.content ?? 0);
        setDesignRating(existingFeedback.ratings?.design ?? 0);
        setGeneralFeedback(existingFeedback.comments?.generalFeedback ?? "");
        setImprovementSuggestions(existingFeedback.comments?.improvementSuggestions ?? "");
        return true;
      }

      return false;
    } catch (error) {
      console.error("[loadExistingFeedback] Error detallado cargando feedback existente:", error);
      if (error instanceof Error) {
        console.error("[loadExistingFeedback] Stack de error:", error.stack);
      }
      return false;
    }
  };

  // Cargar datos cuando el componente es visible o está en modo edición
  useEffect(() => {
    if (visible) {
      const loadFeedbackData = async (): Promise<void> => {

        // Si ya tenemos los datos directamente, usarlos
        if (isEditing && existingFeedback) {
          setOverallRating(existingFeedback.ratings?.overall || 0);
          setUsabilityRating(existingFeedback.ratings?.usability || 0);
          setContentRating(existingFeedback.ratings?.content || 0);
          setDesignRating(existingFeedback.ratings?.design || 0);
          setGeneralFeedback(existingFeedback.comments?.generalFeedback || "");
          setImprovementSuggestions(existingFeedback.comments?.improvementSuggestions || "");
        }
        // Si estamos en modo edición pero no tenemos datos, cargarlos
        else if (isEditing) {
          try {
            const feedbackData = await checkExistingFeedback(userId, formType);

            if (feedbackData) {
              setOverallRating(feedbackData.ratings?.overall || 0);
              setUsabilityRating(feedbackData.ratings?.usability || 0);
              setContentRating(feedbackData.ratings?.content || 0);
              setDesignRating(feedbackData.ratings?.design || 0);
              setGeneralFeedback(feedbackData.comments?.generalFeedback || "");
              setImprovementSuggestions(feedbackData.comments?.improvementSuggestions || "");
            } else {
            }
          } catch (error) {
            console.error("[useEffect] Error cargando feedback:", error);
          }
        } else {
          // Formulario nuevo
          setOverallRating(0);
          setUsabilityRating(0);
          setContentRating(0);
          setDesignRating(0);
          setGeneralFeedback("");
          setImprovementSuggestions("");
        }
      };

      loadFeedbackData();
    }
  }, [visible, isEditing, existingFeedback, userId, formType]);

  // Reiniciar formulario cuando se cierra
  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        // Solo reiniciar si no estamos en modo edición
        if (!isEditing) {
          setOverallRating(0);
          setUsabilityRating(0);
          setContentRating(0);
          setDesignRating(0);
          setGeneralFeedback("");
          setImprovementSuggestions("");
        }
        setSubmitted(false);
      }, 300);
    }
  }, [visible, isEditing]);

  // Función para renderizar las estrellas
  const renderStars = (rating: number, setRating: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={30}
              color={star <= rating ? COLORS.starActive : COLORS.starInactive}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const resetForm = () => {
    // Si estamos editando, volver a cargar los datos originales
    if (isEditing && existingFeedback) {
      setOverallRating(existingFeedback.ratings?.overall || 0);
      setUsabilityRating(existingFeedback.ratings?.usability || 0);
      setContentRating(existingFeedback.ratings?.content || 0);
      setDesignRating(existingFeedback.ratings?.design || 0);
      setGeneralFeedback(existingFeedback.comments?.generalFeedback || "");
      setImprovementSuggestions(existingFeedback.comments?.improvementSuggestions || "");
    } else {
      // Si es nuevo, simplemente resetear
      setOverallRating(0);
      setUsabilityRating(0);
      setContentRating(0);
      setDesignRating(0);
      setGeneralFeedback("");
      setImprovementSuggestions("");
    }
  };

  // Modificación en handleSubmit para usar un ID más consistente
  const handleSubmit = async (): Promise<void> => {
    if (overallRating === 0) {
      Alert.alert(t.error || "Error", ft.feedbackRequired);
      return;
    }

    setLoading(true);

    try {
      // Generar un ID único para cada feedback usando timestamp
      const timestamp = Date.now();
      const feedbackId = `${userId}_${formType}_${timestamp}`;

      const feedbackData = {
        userId,
        formType,
        ratings: {
          overall: overallRating,
          usability: usabilityRating,
          content: contentRating,
          design: designRating,
        },
        comments: {
          generalFeedback,
          improvementSuggestions,
        },
        language,
        submittedAt: timestamp,
        lastModified: timestamp,
      };

      // Guardar como nueva entrada
      await db().ref(`/feedback/${feedbackId}`).set(feedbackData);

      setSubmitted(true);
    } catch (error) {
      console.error("[handleSubmit] Error:", error);
      Alert.alert(ft.errorSubmitting, ft.pleaseTryAgain);
    } finally {
      setLoading(false);
    }
  };


  // Renderizar pantalla de agradecimiento después de enviar
  if (submitted) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.thankYouContainer}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={COLORS.success}
              style={styles.successIcon}
            />
            <Text style={styles.thankYouTitle}>{ft.thankYou}</Text>
            <Text style={styles.thankYouText}>{ft.yourFeedbackHelps}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{ft.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>
              {isEditing ? ft.editFeedbackTitle : ft.feedbackTitle}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterScrollView} showsVerticalScrollIndicator={true}>
            <Text style={styles.subtitle}>{ft.rateExperience}</Text>

            {/* Valoración general */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{ft.overallExperience}</Text>
              {renderStars(overallRating, setOverallRating)}
            </View>

            {/* Usabilidad */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{ft.usability}</Text>
              {renderStars(usabilityRating, setUsabilityRating)}
            </View>

            {/* Calidad de contenido */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{ft.contentQuality}</Text>
              {renderStars(contentRating, setContentRating)}
            </View>

            {/* Diseño visual */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{ft.visualDesign}</Text>
              {renderStars(designRating, setDesignRating)}
            </View>

            {/* Comentarios generales */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{ft.tellUsMore}</Text>
              <TextInput
                style={styles.textInput}
                value={generalFeedback}
                onChangeText={setGeneralFeedback}
                placeholder={ft.tellUsMore}
                placeholderTextColor={COLORS.inactive}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Sugerencias de mejora */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{ft.improvementSuggestions}</Text>
              <TextInput
                style={styles.textInput}
                value={improvementSuggestions}
                onChangeText={setImprovementSuggestions}
                placeholder={ft.tellUsMore}
                placeholderTextColor={COLORS.inactive}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.filterButtonsContainer}>
            <TouchableOpacity
              style={styles.filterResetButton}
              onPress={resetForm}
              disabled={loading}
            >
              <Text style={styles.filterResetButtonText}>{ft.resetFeedback}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterApplyButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.filterApplyButtonText}>
                  {isEditing ? ft.updateFeedback : ft.submitFeedback}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Componente principal que detecta la finalización del formulario
export const FormCompletionFeedback = ({
  formType,
  language = "es" as Language,
  onFinish,
}: {
  formType: string;
  language: Language;
  onFinish: () => void;
}) => {
  const [showFeedback, setShowFeedback] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Obtener el ID del usuario
  useEffect(() => {
    const setUserIdAndCheck = async () => {
      setLoading(true);
      try {
        const currentUser = auth().currentUser;
        let userIdToUse;

        if (currentUser) {
          userIdToUse = currentUser.uid;
        } else {
          // Generar un nuevo ID de invitado cada vez
          const timestamp = Date.now();
          userIdToUse = `guest_${timestamp}`;
          await AsyncStorage.setItem("@guest_user_id", userIdToUse);
        }

        setUserId(userIdToUse);
      } catch (error) {
        console.error("[FormCompletionFeedback] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    setUserIdAndCheck();
  }, []);

  const handleClose = () => {
    setShowFeedback(false);
    onFinish();
  };

  if (loading) {
    return null;
  }

  return (
    <ImprovedFeedbackModal
      visible={showFeedback}
      onClose={handleClose}
      language={language}
      userId={userId}
      formType={formType}
      isEditing={false}
      existingFeedback={null}
    />
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterModalContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    width: '90%',
    height: '80%',
    maxWidth: 500,
    flexDirection: 'column',
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
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    paddingHorizontal: 5,
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
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  starButton: {
    padding: 8,
  },
  textInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    minHeight: 100,
    textAlignVertical: "top",
    color: COLORS.text,
    fontSize: 15,
  },
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
  // Estilos para pantalla de agradecimiento
  thankYouContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    width: "80%",
    maxWidth: 400,
  },
  successIcon: {
    marginBottom: 20,
  },
  thankYouTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
    textAlign: "center",
  },
  thankYouText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 25,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FormCompletionFeedback;
