// app/src/FormsScreen/PhysicalLiteracyFormScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native";
const primeira_pregunta = require("../../assets/images/preguntas/primera_pregunta.jpg");
const pregunta_dos = require("../../assets/images/preguntas/pregunta_dos.jpg");
const quinta_pregunta = require("../../assets/images/preguntas/quinta_pregunta.jpg");
const sesta_pregunta = require("../../assets/images/preguntas/sexta_pregunta.jpg");
const tercera_pregunta = require("../../assets/images/preguntas/tercera_pregunta.jpg");
const cuarta_pregunta = require("../../assets/images/preguntas/cuarta_pregunta.jpg");
import { Ionicons } from "@expo/vector-icons";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { questions } from "./data/questions";
import { Language } from "../../types/language";
import PhysicalLiteracySlider from "../../Components/PhysicalLiteracySlider/PhysicalLiteracySlider";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { FormsStackParamList } from "../../navigation/types";
import auth from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";
import type { FormResponse } from "../../types/form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "../../Components/LanguageSelection/translations";
import { LanguageSelectionScreen } from "../../Components/LanguageSelection/LanguageSelection";

const questionImages = [
  primeira_pregunta,
  pregunta_dos,
  tercera_pregunta,
  cuarta_pregunta,
  quinta_pregunta,
  sesta_pregunta,
];

type PhysicalLiteracyFormScreenNavigationProp = NativeStackNavigationProp<
  FormsStackParamList,
  "PhysicalLiteracyForm"
>;

interface FormStats {
  median: number;
  usersAbove: number;
  usersBelow: number;
  totalUsers: number;
}

const formatQuestionText = (text: string) => {
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
    "comparación",
    "compared",
    "comparação",
  ];

  // Ordenamos las palabras clave de más largas a más cortas para evitar reemplazos parciales
  const sortedKeywords = keywordsToHighlight.sort(
    (a, b) => b.length - a.length
  );

  let parts: Array<{ text: string; bold: boolean }> = [{ text, bold: false }];

  sortedKeywords.forEach((keyword) => {
    parts = parts.flatMap((part) => {
      if (!part.bold) {
        const splitText = part.text.split(new RegExp(`(${keyword})`, "gi"));
        return splitText.map((text, index) => ({
          text,
          bold: index % 2 === 1, // Las coincidencias estarán en índices impares
        }));
      }
      return [part];
    });
  });

  return parts.map((part, index) =>
    part.bold ? (
      <Text key={index} style={styles.boldText}>
        {part.text}
      </Text>
    ) : (
      <Text key={index}>{part.text}</Text>
    )
  );
};

export const PhysicalLiteracyFormScreen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<PhysicalLiteracyFormScreenNavigationProp>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hasSelectedLanguage, setHasSelectedLanguage] =
    useState<boolean>(false);
  const [language, setLanguage] = useState<Language>("es");
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(6).fill(null)
  );
  const [loading, setLoading] = useState(true);
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [stats, setStats] = useState<FormStats[]>([]);

  useEffect(() => {
    if (formResponse) {
      calculateStats();
    }
  }, [formResponse]);

  const handleLanguageSelect = async (selectedLanguage: Language) => {
    try {
      console.log("Seleccionando idioma:", selectedLanguage);
      await AsyncStorage.setItem("@app_language", selectedLanguage);
      setLanguage(selectedLanguage);
      setHasSelectedLanguage(true); // Establecemos como true después de la selección
    } catch (error) {
      console.error("Error saving language:", error);
      Alert.alert("Error", "No se pudo guardar la selección de idioma");
    }
  };

  const canProceedToNext = () => {
    return answers[currentQuestion] !== null;
  };

  // Modificamos el useEffect de inicialización
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const currentUser = auth().currentUser;

        // Primero verificamos si hay una respuesta previa del formulario
        if (currentUser) {
          const snapshot = await db()
            .ref(`/form_responses/${currentUser.uid}/physical_literacy`)
            .once("value");

          const response = snapshot.val();
          if (response) {
            setFormResponse(response);
            setAnswers(response.answers);
            setLanguage(response.language as Language);
            setHasSelectedLanguage(true);
            setLoading(false);
            return;
          }
        }

        // Si no hay respuesta previa, verificamos si hay un idioma guardado
        const savedLanguage = await AsyncStorage.getItem("@app_language");
        if (
          savedLanguage &&
          (savedLanguage === "es" ||
            savedLanguage === "en" ||
            savedLanguage === "pt-BR" ||
            savedLanguage === "pt-PT")
        ) {
          setLanguage(savedLanguage as Language);
          // Importante: NO establecemos hasSelectedLanguage como true aquí
          setHasSelectedLanguage(false);
        } else {
          setLanguage("es"); // Idioma por defecto
          setHasSelectedLanguage(false);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        setHasSelectedLanguage(false);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Modificaciones en calculateStats
  const calculateStats = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error("Usuario no autenticado");
      }

      const userRoleSnapshot = await db()
        .ref(`/users/${currentUser.uid}/role`)
        .once("value");
      const userRole = userRoleSnapshot.val();

      const formResponsesRef = db().ref("/form_responses");
      const snapshot = await formResponsesRef.once("value");
      const allResponses = snapshot.val() || {};

      const stats: FormStats[] = Array(6)
        .fill(null)
        .map(() => ({
          median: 0,
          usersAbove: 0,
          usersBelow: 0,
          totalUsers: 0,
        }));

      const allAnswers: number[][] = Array(6)
        .fill(null)
        .map(() => []);

      Object.entries(allResponses).forEach(([uid, userData]: [string, any]) => {
        const physicalLiteracy = userData?.physical_literacy;
        if (physicalLiteracy?.answers) {
          physicalLiteracy.answers.forEach((answer: number, index: number) => {
            if (answer !== null && answer !== undefined) {
              allAnswers[index].push(answer);
            }
          });
        }
      });

      allAnswers.forEach((answersForQuestion, index) => {
        if (answersForQuestion.length > 0) {
          const sorted = [...answersForQuestion].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);

          const median =
            sorted.length % 2 === 0
              ? (sorted[mid - 1] + sorted[mid]) / 2
              : sorted[mid];

          const userAnswer = answers[index];

          const usersAbove = sorted.filter((a) => a > userAnswer!).length;
          const usersBelow = sorted.filter((a) => a < userAnswer!).length;

          stats[index] = {
            median,
            usersAbove,
            usersBelow,
            totalUsers: sorted.length,
          };
        }
      });

      setStats(stats);
    } catch (error) {
      console.error("Error calculating stats:", error);
      Alert.alert(
        "Error",
        "No se pudieron calcular las estadísticas. Por favor, intenta de nuevo más tarde."
      );
    }
  };

  const handleSubmit = async () => {
    if (answers.some((answer) => answer === null)) {
      Alert.alert(
        translations[language].incompleteAnswers,
        translations[language].pleaseAnswerAll,
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    Alert.alert(
      translations[language].submitAnswers,
      translations[language].confirmSubmit,
      [
        {
          text: translations[language].cancel,
          style: "cancel",
        },
        {
          text: translations[language].submit,
          onPress: async () => {
            try {
              const currentUser = auth().currentUser;
              if (!currentUser) {
                Alert.alert(
                  translations[language].error,
                  translations[language].pleaseAuthenticate
                );
                return;
              }

              setLoading(true);

              const response: FormResponse = {
                userId: currentUser.uid,
                answers: answers as number[],
                completedAt: Date.now(),
                language,
              };

              await db()
                .ref(`/form_responses/${currentUser.uid}/physical_literacy`)
                .set(response);

              setFormResponse(response);
              await calculateStats();
              Alert.alert(
                translations[language].success,
                translations[language].answersSubmitted
              );
            } catch (error) {
              console.error("Error saving form response:", error);
              Alert.alert(
                translations[language].error,
                translations[language].couldNotSave
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderQuestion = () => (
    <View style={styles.questionContainer}>
      <Image
        source={questionImages[currentQuestion]}
        style={styles.questionImage}
      />
      <Text style={styles.questionText}>
        {formatQuestionText(questions[language][currentQuestion].text)}
      </Text>
    </View>
  );

  const renderResults = () => {
    if (!formResponse) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.completedTitle}>
          {translations[language].completedFormTitle}
        </Text>
        <Text style={styles.completedDate}>
          {translations[language].completedOn}{" "}
          {new Date(formResponse.completedAt).toLocaleDateString()}
        </Text>

        {questions[language].map((question, index) => {
          const stat = stats[index];
          if (!stat) return null;

          const userAnswer = answers[index];
          let comparisonStatus: "above" | "below" | "equal" = "equal";
          let comparisonText = "";

          if (userAnswer! > stat.median) {
            comparisonStatus = "above";
            comparisonText = `Estás por encima de tus compañeros`;
          } else if (userAnswer! < stat.median) {
            comparisonStatus = "below";
            comparisonText = `Estás por debajo de tus compañeros`;
          } else {
            comparisonText = "Tu puntuación es igual a la mediana del grupo";
          }

          return (
            <View
              key={index}
              style={[
                styles.resultItem,
                comparisonStatus === "below" && styles.belowMedianItem,
              ]}
            >
              <Text style={styles.resultQuestion}>{question.text}</Text>
              <View style={styles.resultContent}>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>
                    {translations[language].yourScore}
                  </Text>
                  <Text
                    style={[
                      styles.scoreValue,
                      comparisonStatus === "below" && styles.belowMedianScore,
                    ]}
                  >
                    {userAnswer}
                  </Text>
                </View>

                <View style={styles.statsContainer}>
                  <Text style={styles.statsTitle}>
                    {translations[language].comparativeTitle}
                  </Text>
                  <Text style={styles.statsText}>
                    {translations[language].groupMedian}:{" "}
                    {stat.median.toFixed(1)}
                  </Text>
                  <View style={styles.comparisonBar}>
                    <View
                      style={[
                        styles.comparisonIndicator,
                        styles[`${comparisonStatus}Median`],
                      ]}
                    />
                  </View>
                  <Text style={styles.comparisonText}>{comparisonText}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <BackgroundContainer
        source={require("../../assets/images/surfer-1836366_1280.jpg")}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ade80" />
        </View>
      </BackgroundContainer>
    );
  }

  if (!hasSelectedLanguage && !formResponse) {
    console.log("Mostrando selección de idioma"); // Debug log
    return (
      <BackgroundContainer
        source={require("../../assets/images/surfer-1836366_1280.jpg")}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.languageSelectionContainer}>
            <LanguageSelectionScreen onLanguageSelect={handleLanguageSelect} />
          </View>
        </SafeAreaView>
      </BackgroundContainer>
    );
  }

  if (formResponse) {
    return (
      <BackgroundContainer
        source={require("../../assets/images/surfer-1836366_1280.jpg")}
      >
        <View style={styles.overlay}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {renderResults()}
          </ScrollView>
        </View>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer
      source={require("../../assets/images/surfer-1836366_1280.jpg")}
    >
      <View style={styles.overlay}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.card}>
            {/* Encabezado */}
            <View style={styles.headerContainer}>
              <Ionicons
                name={currentQuestion === 5 ? "trophy" : "body"}
                size={32}
                color="#4ade80"
              />
              <Text style={styles.headerText}>
                {translations[language].tellUsAboutPhysical}
              </Text>
            </View>

            {/* Barra de progreso */}
            <View style={styles.progress}>
              <Text style={styles.progressText}>
                {translations[language].question} {currentQuestion + 1}{" "}
                {translations[language].of} {questions[language].length}
              </Text>
              <View style={styles.progressBar}>
                {questions[language].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      currentQuestion === index && styles.activeDot,
                      {
                        backgroundColor:
                          index < currentQuestion
                            ? "#4ade80"
                            : index === currentQuestion
                            ? "#4ade80"
                            : "#e5e7eb",
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Pregunta */}
            {renderQuestion()}

            {/* Contenedor del slider y valoración */}
            <PhysicalLiteracySlider
              value={answers[currentQuestion]}
              onChange={(value) => {
                const newAnswers = [...answers];
                newAnswers[currentQuestion] = value;
                setAnswers(newAnswers);
              }}
              minLabel={questions[language][currentQuestion].min}
              maxLabel={questions[language][currentQuestion].max}
              language={language}
            />

            {/* Navegación */}
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentQuestion === 0 && styles.disabledButton,
                ]}
                onPress={() => setCurrentQuestion((curr) => curr - 1)}
                disabled={currentQuestion === 0}
              >
                <Ionicons name="arrow-back" size={24} color="#4ade80" />
                <Text style={[styles.navButtonText, { color: "#4ade80" }]}>
                  {translations[language].previous}
                </Text>
              </TouchableOpacity>

              {currentQuestion === questions[language].length - 1 ? (
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
                      backgroundColor: canProceedToNext()
                        ? "#4ade80"
                        : "#e5e7eb",
                    },
                  ]}
                  disabled={!canProceedToNext()}
                  onPress={() => {
                    if (!canProceedToNext()) {
                      Alert.alert(
                        translations[language].requiredAnswer,
                        translations[language].pleaseSelectValue,
                        [{ text: "OK", style: "default" }]
                      );
                      return;
                    }
                    setCurrentQuestion((curr) => curr + 1);
                  }}
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
        </ScrollView>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  // Nuevos estilos para el texto de las preguntas
  questionContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#1f2937",
  },
  highlightedText: {
    backgroundColor: "#e9f5ff",
    color: "#1e40af",
    fontWeight: "600",
    borderRadius: 4,
    overflow: "hidden",
    padding: 2,
  },
  normalText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#1f2937",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4ade80",
  },
  extremeLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
    paddingHorizontal: 10,
  },
  extremeLabel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "45%",
  },
  extremeLabelText: {
    fontSize: 12,
    color: "#666",
    flexShrink: 1,
  },
  valueIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    gap: 8,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    minHeight: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
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
  questionImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 15,
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
  sliderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderValue: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scaleMessage: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    flex: 1,
  },
  analogScaleContainer: {
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  scaleMainBar: {
    position: "relative",
    height: 60,
  },
  scaleMarkersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    position: "absolute",
    width: "100%",
    height: "100%",
    paddingBottom: 25,
  },
  markerContainer: {
    alignItems: "center",
    width: 20,
  },
  marker: {
    width: 2,
    marginBottom: 5,
  },
  markerNormal: {
    height: 10,
  },
  markerLarge: {
    height: 20,
  },
  redZone: {
    backgroundColor: "#ef4444",
  },
  yellowZone: {
    backgroundColor: "#fbbf24",
  },
  greenZone: {
    backgroundColor: "#4ade80",
  },
  redText: {
    color: "#ef4444",
  },
  yellowText: {
    color: "#fbbf24",
  },
  greenText: {
    color: "#4ade80",
  },
  markerNumber: {
    fontSize: 12,
    marginTop: 4,
    color: "#666",
  },
  activeMarkerNumber: {
    fontWeight: "bold",
    fontSize: 14,
  },
  slider: {
    position: "absolute",
    width: "100%",
    height: 40,
    zIndex: 1,
  },
  activeLabelText: {
    color: "#4ade80",
    fontWeight: "bold",
  },
  motivationalText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
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
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#4ade80",
  },
  submitButtonText: {
    color: "#fff",
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  completedDate: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  resultItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 10,
  },
  resultContent: {
    marginTop: 15,
  },
  extremeLabelTextRight: {
    textAlign: "right",
  },
  extremeLabelRight: {
    justifyContent: "flex-end", // Alinea los elementos al final
    textAlign: "right",
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  gradientTrack: {
    height: "100%",
    width: "100%",
    borderRadius: 3,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4ade80",
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 15,
    borderRadius: 10,
  },
  boldText: {
    fontWeight: "bold",
    color: "#1f2937",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  statsText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  comparisonBar: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginVertical: 10,
  },
  comparisonIndicator: {
    height: "100%",
    width: "50%",
    borderRadius: 3,
  },
  aboveMedian: {
    backgroundColor: "#4ade80",
    alignSelf: "flex-end",
  },
  safeArea: {
    flex: 1,
    width: "100%",
  },
  belowMedian: {
    backgroundColor: "#fb923c",
  },
  neutralMedian: {
    backgroundColor: "#cccccc",
  },
  comparisonText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  resultQuestion: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "justify",
    lineHeight: 22,
  },
  belowMedianItem: {
    backgroundColor: "rgba(251, 146, 60, 0.1)",
  },
  belowMedianText: {
    color: "#fb923c",
  },
  equalMedian: {
    backgroundColor: "#cccccc",
  },
  belowMedianScore: {
    color: "#fb923c",
    fontSize: 36,
    fontWeight: "bold",
  },
  thermometerContainer: {
    position: "relative",
    height: 40,
    marginVertical: 20,
    width: "100%",
  },
  thermometerTrack: {
    position: "absolute",
    top: 15,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 5,
    overflow: "hidden",
  },
  thermometerSegments: {
    flexDirection: "row",
    height: "100%",
  },
  thermometerSegment: {
    flex: 1,
    height: "100%",
    backgroundColor: "#e5e7eb",
    marginHorizontal: 1,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scaleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  scaleNumber: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  activeScaleNumber: {
    color: "#056b05",
    fontWeight: "bold",
    fontSize: 14,
  },
  sliderBackground: {
    position: "absolute",
    top: 18,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
  },
  thumbStyle: {
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4b5563",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  languageSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    margin: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  flagsContainer: {
    width: "100%",
    gap: 16,
  },
  flagButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 20,
  },
  flagImage: {
    width: 48,
    height: 32,
    borderRadius: 4,
    marginRight: 16,
  },
  flagTextContainer: {
    flex: 1,
  },
  countryText: {
    fontSize: 14,
    color: "#6b7280",
  },
  // Estilo para el efecto hover/press
  flagButtonPressed: {
    backgroundColor: "#f3f4f6",
  },
});
