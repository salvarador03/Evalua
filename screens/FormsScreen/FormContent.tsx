// screens/FormsScreen/FormContent.tsx
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Language } from "../../types/language";
import { questions } from "./data/questions";
import { teenQuestions, isTeenager } from "./data/teenQuestions";
import { translations } from "../../Components/LanguageSelection/translations";
import PhysicalLiteracySlider from "../../Components/PhysicalLiteracySlider/PhysicalLiteracySlider";

// Imágenes para niños (6-12)
const childQuestionImages = [
  require("../../assets/images/preguntas/kids/primera_pregunta.webp"),
  require("../../assets/images/preguntas/kids/segunda_pregunta.webp"),
  require("../../assets/images/preguntas/kids/tercera_pregunta.webp"),
  require("../../assets/images/preguntas/kids/cuarta_pregunta.webp"),//
  require("../../assets/images/preguntas/kids/quinta_pregunta.webp"),
  require("../../assets/images/preguntas/kids/sexta_pregunta.webp"),
];

// Imágenes para adolescentes (12-18)
const teenQuestionImages = [
  require("../../assets/images/preguntas/teen/primera_pregunta.jpg"),
  require("../../assets/images/preguntas/teen/segunda_pregunta.jpg"),
  require("../../assets/images/preguntas/teen/tercera_pregunta.jpg"),
  require("../../assets/images/preguntas/teen/cuarta_pregunta.jpg"),
  require("../../assets/images/preguntas/teen/quinta_pregunta.jpg"),
  require("../../assets/images/preguntas/teen/sexta_pregunta.jpg"),
  require("../../assets/images/preguntas/teen/septima_pregunta.jpg"),
  require("../../assets/images/preguntas/teen/octava_pregunta.jpg"),
];

interface FormContentProps {
  language: Language;
  currentQuestion: number;
  answers: (number | null)[];
  onAnswerChange: (answers: (number | null)[]) => void;
  onQuestionChange: (direction: 'next' | 'prev') => void;
  onSubmit: () => void;
  userAge: number;
}

// Función auxiliar para formatear texto
const formatQuestionText = (text: string): React.ReactNode[] => {
  const keywordsToHighlight = [
    "forma física",
    "condición física",
    "actividad física",
    "educación física",
    "alfabetización física",
    "physical fitness",
    "physical activity",
    "physical education",
    "physical literacy",
    "forma física global",
    "atividade física",
    "educação física",
    "literacia física",
    "letramento físico",
    "aptidão física",
    "comparación",
    "compared",
    "comparação",
    "conhecimento",
    "motivação",
    "relações sociais"
  ];

  const sortedKeywords = keywordsToHighlight.sort((a, b) => b.length - a.length);
  let parts: Array<{ text: string; bold: boolean }> = [{ text, bold: false }];

  sortedKeywords.forEach((keyword) => {
    parts = parts.flatMap((part) => {
      if (!part.bold) {
        const splitText = part.text.split(new RegExp(`(${keyword})`, "gi"));
        return splitText.map((text, index) => ({
          text,
          bold: index % 2 === 1,
        }));
      }
      return [part];
    });
  });

  return parts.map((part, index) =>
    part.bold ? (
      <Text key={index} style={styles.boldText}>{part.text}</Text>
    ) : (
      <Text key={index}>{part.text}</Text>
    )
  );
};

export const FormContent: React.FC<FormContentProps> = React.memo(({
  language,
  currentQuestion,
  answers,
  onAnswerChange,
  onQuestionChange,
  onSubmit,
  userAge,
}) => {
  // Memoizar el valor de isTeenUser para evitar recálculos innecesarios
  const isTeenUser = React.useMemo(() => isTeenager(userAge), [userAge]);

  // Memoizar las preguntas y las imágenes para evitar re-renders innecesarios
  const currentQuestions = React.useMemo(
    () => isTeenUser ? teenQuestions[language] : questions[language],
    [isTeenUser, language]
  );

  const questionImages = React.useMemo(
    () => isTeenUser ? teenQuestionImages : childQuestionImages,
    [isTeenUser]
  );

  // Modificar solo la función confirmAnswer en el componente FormContent

  const confirmAnswer = useCallback((action: () => void) => {
    const currentScore = answers[currentQuestion];
    if (currentScore === null) return;

    // Si es la última pregunta, mostrar resumen de todas las respuestas
    if (currentQuestion === currentQuestions.length - 1) {
      const summary = currentQuestions
        .map((question, index) =>
          `${translations[language].question} ${index + 1}: ${answers[index]?.toFixed(1)}`
        )
        .join('\n');

      Alert.alert(
        translations[language].confirmAnswer,
        `${translations[language].selectedScore}:\n\n${summary}\n\n${translations[language].confirmScoreQuestion}`,
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Sí',
            onPress: action
          }
        ]
      );
    } else {
      // Para preguntas individuales, mostrar solo la respuesta actual
      Alert.alert(
        translations[language].confirmAnswer,
        `${translations[language].question} ${currentQuestion + 1}: ${currentScore.toFixed(1)}\n\n${translations[language].confirmScoreQuestion}`,
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Sí',
            onPress: action
          }
        ]
      );
    }
  }, [answers, currentQuestion, language, currentQuestions]);

  // Memoizar la función de formateo de texto
  const formatText = useCallback((text: string) => {
    return formatQuestionText(text);
  }, []);

  // Efecto para manejar cambios en la edad - CORREGIDO
  useEffect(() => {
    // Evitar resetear si no hay cambio real en la edad o tipo de usuario
    const shouldReset = userAge > 0 && currentQuestion > 0;

    if (shouldReset) {
      // Reiniciar respuestas
      onAnswerChange(new Array(6).fill(null));
      // Volver a la primera pregunta
      onQuestionChange('prev');
    }
  }, [userAge, isTeenUser]);

  // Monitorear cambios en el tipo de cuestionario
  useEffect(() => {
  }, [isTeenUser]);

  // Memoizar la función canProceedToNext
  const canProceedToNext = useCallback(() =>
    answers[currentQuestion] !== null,
    [answers, currentQuestion]
  );

  // Memoizar la función handleNext
  const handleNext = useCallback(() => {
    if (!canProceedToNext()) {
      Alert.alert(
        translations[language].requiredAnswer,
        translations[language].pleaseSelectValue,
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    onQuestionChange('next');
  }, [canProceedToNext, language, onQuestionChange]);

  const handleSubmit = useCallback(() => {
    if (!canProceedToNext()) {
      Alert.alert(
        translations[language].requiredAnswer,
        translations[language].pleaseSelectValue,
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    confirmAnswer(onSubmit);
  }, [canProceedToNext, language, onSubmit, confirmAnswer]);

  // Memoizar la función handleAnswerChange
  const handleAnswerChange = useCallback((value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    onAnswerChange(newAnswers);
  }, [answers, currentQuestion, onAnswerChange]);

  const renderQuestionImages = (questionIndex: number) => {
    if (questionIndex === 7) { // Para la pregunta 8 (índice 7)
      return (
        <View style={styles.multipleImagesContainer}>
          <View style={styles.imageRow}>
            {/* Primera fila de imágenes */}
            <View style={styles.imageContainer}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>A</Text>
              </View>
              <Image
                source={teenQuestionImages[0]}
                style={styles.smallQuestionImage}
              />
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>B</Text>
              </View>
              <Image
                source={teenQuestionImages[2]}
                style={styles.smallQuestionImage}
              />
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>C</Text>
              </View>
              <Image
                source={teenQuestionImages[3]}
                style={styles.smallQuestionImage}
              />
            </View>
          </View>
          <View style={styles.imageRow}>
            {/* Segunda fila de imágenes */}
            <View style={styles.imageContainer}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>D</Text>
              </View>
              <Image
                source={teenQuestionImages[4]}
                style={styles.smallQuestionImage}
              />
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>E</Text>
              </View>
              <Image
                source={teenQuestionImages[5]}
                style={styles.smallQuestionImage}
              />
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>F</Text>
              </View>
              <Image
                source={teenQuestionImages[6]}
                style={styles.smallQuestionImage}
              />
            </View>
          </View>
        </View>
      );
    }
  
    // Para el resto de preguntas, mantener la imagen única
    return (
      <Image
        source={teenQuestionImages[questionIndex]}
        style={styles.questionImage}
      />
    );
  };

  // Renderizar el formulario
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Ionicons
          name={currentQuestion === 5 ? "trophy" : "body"}
          size={32}
          color="#4ade80"
        />
        <Text style={styles.headerText}>
          Cuestionario de Autoevaluación de la Alfabetización Física
        </Text>

      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {translations[language].question} {currentQuestion + 1}{" "}
          {translations[language].of} {currentQuestions.length}
        </Text>
        <View style={styles.progressBar}>
          {currentQuestions.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                currentQuestion === index && styles.activeDot,
                {
                  backgroundColor:
                    index <= currentQuestion ? "#4ade80" : "#e5e7eb",
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        {renderQuestionImages(currentQuestion)}
        <Text style={styles.questionText}>
          {formatText(currentQuestions[currentQuestion].text)}
        </Text>
      </View>

      {/* Slider */}
      <PhysicalLiteracySlider
        value={answers[currentQuestion]}
        onChange={handleAnswerChange}
        minLabel={currentQuestions[currentQuestion].min}
        maxLabel={currentQuestions[currentQuestion].max}
        language={language}
      />

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestion === 0 && styles.disabledButton,
          ]}
          onPress={() => onQuestionChange('prev')}
          disabled={currentQuestion === 0}
        >
          <Ionicons name="arrow-back" size={24} color="#4ade80" />
          <Text style={[styles.navButtonText, { color: "#4ade80" }]}>
            {translations[language].previous}
          </Text>
        </TouchableOpacity>

        {currentQuestion === currentQuestions.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.submitButton,
              !canProceedToNext() && styles.disabledButton,
            ]}
            disabled={!canProceedToNext()}
            onPress={handleSubmit}
          >
            <Text style={[styles.navButtonText, styles.submitButtonText]}>
              {translations[language].finish}
            </Text>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.navButton,
              {
                backgroundColor: canProceedToNext() ? "#4ade80" : "#e5e7eb",
              },
            ]}
            disabled={!canProceedToNext()}
            onPress={handleNext}
          >
            <Text
              style={[
                styles.navButtonText,
                { color: canProceedToNext() ? "#fff" : "#666" },
              ]}
            >
              {translations[language].next}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={24}
              color={canProceedToNext() ? "#fff" : "#666"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4ade80",
  },
  multipleImagesContainer: {
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10, // Añadir padding horizontal
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Cambiar a space-between
    marginBottom: 10,
  },
  letterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  letterBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#4ade80',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  smallQuestionImage: {
    width: '100%',
    height: 200, // Aumentar la altura
    borderRadius: 8,
    resizeMode: 'cover',
  },
  progress: {
    marginBottom: 20,
  },
  progressText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  activeDot: {
    backgroundColor: "#4ade80",
  },
  imageContainer: {
    position: 'relative',
    width: '30%', // Mantener el ancho
  },
  questionContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 12,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    alignItems: 'center', // Centra el contenido
  },
  questionImage: {
    width: '95%', // Usa casi todo el ancho disponible
    minHeight: 250, // Altura mínima garantizada
    maxHeight: 400, // Altura máxima para pantallas grandes
    height: undefined, // Permite que la altura se ajuste
    resizeMode: "cover", // Cambiamos a cover para llenar mejor el espacio
    borderRadius: 12,
    marginBottom: 15,
    alignSelf: 'center',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#1f2937",
  },
  boldText: {
    fontWeight: "bold",
    color: "#1f2937",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButton: {
    backgroundColor: "#4ade80",
  },
  submitButtonText: {
    color: "#fff",
  },
});

export default FormContent;