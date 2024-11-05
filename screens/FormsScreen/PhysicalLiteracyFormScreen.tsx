import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { questions, Language } from "./data/questions";
import { LanguageSelector } from "../../Components/LanguageSelector/LanguageSelector";
import Slider from "@react-native-community/slider";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { FormsStackParamList } from "../../navigation/types";
import auth from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";
import type { FormResponse } from "../../types/form";

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

export const PhysicalLiteracyFormScreen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<PhysicalLiteracyFormScreenNavigationProp>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [language, setLanguage] = useState<Language>("es");
  const [answers, setAnswers] = useState<number[]>(Array(6).fill(5));
  const [loading, setLoading] = useState(true);
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [stats, setStats] = useState<FormStats[]>([]);

  useEffect(() => {
    checkExistingResponse();
  }, []);

  useEffect(() => {
    if (formResponse) {
      calculateStats();
    }
  }, [formResponse]);

  const checkExistingResponse = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const snapshot = await db()
          .ref(`/form_responses/${currentUser.uid}/physical_literacy`)
          .once("value");

        const response = snapshot.val();
        if (response) {
          setFormResponse(response);
          setAnswers(response.answers);
          setLanguage(response.language as Language);
        }
      }
    } catch (error) {
      console.error("Error checking form response:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modificaciones en calculateStats
  const calculateStats = async () => {
    try {
      const snapshot = await db().ref("/form_responses").once("value");
      const responses = snapshot.val();

      const stats: FormStats[] = Array(6)
        .fill(null)
        .map(() => ({
          median: 0,
          usersAbove: 0,
          usersBelow: 0,
          totalUsers: 0,
        }));

      if (responses) {
        const allAnswers: number[][] = Array(6)
          .fill(null)
          .map(() => []);

        Object.values(responses).forEach((response: any) => {
          const physicalLiteracy = response.physical_literacy;
          if (physicalLiteracy?.answers) {
            physicalLiteracy.answers.forEach(
              (answer: number, index: number) => {
                allAnswers[index].push(answer);
              }
            );
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
            const usersAbove = sorted.filter((a) => a > userAnswer).length;
            const usersBelow = sorted.filter((a) => a < userAnswer).length;

            stats[index] = {
              median,
              usersAbove,
              usersBelow,
              totalUsers: sorted.length,
            };
          }
        });
      }

      setStats(stats);
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handleSubmit = async () => {
    Alert.alert(
      "Enviar respuestas",
      "¿Estás seguro de que quieres enviar tus respuestas?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Enviar",
          onPress: async () => {
            try {
              const currentUser = auth().currentUser;
              if (!currentUser) {
                Alert.alert(
                  "Error",
                  "Debes estar autenticado para enviar el formulario"
                );
                return;
              }

              setLoading(true);

              const response: FormResponse = {
                userId: currentUser.uid,
                answers,
                completedAt: Date.now(),
                language,
              };

              await db()
                .ref(`/form_responses/${currentUser.uid}/physical_literacy`)
                .set(response);

              setFormResponse(response);
              await calculateStats();
              Alert.alert(
                "¡Éxito!",
                "Tus respuestas han sido guardadas correctamente."
              );
            } catch (error) {
              console.error("Error saving form response:", error);
              Alert.alert("Error", "No se pudieron guardar tus respuestas");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <BackgroundContainer
        source={require("../../assets/images/surfer-1836366_1280.jpg")}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#056b05" />
        </View>
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
            <View style={styles.card}>
              <Text style={styles.completedTitle}>Cuestionario Completado</Text>
              <Text style={styles.completedDate}>
                Completado el{" "}
                {new Date(formResponse.completedAt).toLocaleDateString()}
              </Text>

              {questions[language].map((question, index) => {
                const isBelow =
                  stats[index] && answers[index] < stats[index].median;
                return (
                  <View
                    key={index}
                    style={[
                      styles.resultItem,
                      isBelow && styles.belowMedianItem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.resultQuestion,
                        isBelow && styles.belowMedianText,
                      ]}
                    >
                      {question.text}
                    </Text>
                    <View style={styles.resultContent}>
                      <View style={styles.scoreContainer}>
                        <Text
                          style={[
                            styles.scoreLabel,
                            isBelow && styles.belowMedianText,
                          ]}
                        >
                          Tu puntuación
                        </Text>
                        <Text
                          style={[
                            styles.scoreValue,
                            isBelow && styles.belowMedianScore,
                          ]}
                        >
                          {answers[index]}
                        </Text>
                      </View>

                      {stats[index] && (
                        <View style={styles.statsContainer}>
                          <Text style={styles.statsTitle}>Comparativa</Text>
                          <Text style={styles.statsText}>
                            Mediana del grupo: {stats[index].median.toFixed(1)}
                          </Text>
                          <View style={styles.comparisonBar}>
                            <View
                              style={[
                                styles.comparisonIndicator,
                                answers[index] >= stats[index].median
                                  ? styles.aboveMedian
                                  : styles.belowMedian,
                              ]}
                            />
                          </View>
                          <Text style={styles.comparisonText}>
                            {answers[index] > stats[index].median
                              ? `Estás por encima del ${(
                                  (stats[index].usersBelow /
                                    (stats[index].usersAbove +
                                      stats[index].usersBelow +
                                      1)) *
                                  100
                                ).toFixed(1)}% de tus compañeros`
                              : answers[index] < stats[index].median
                              ? `Estás por debajo del ${(
                                  (stats[index].usersAbove /
                                    (stats[index].usersAbove +
                                      stats[index].usersBelow +
                                      1)) *
                                  100
                                ).toFixed(1)}% de tus compañeros`
                              : "Tu puntuación es igual a la mediana del grupo"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
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
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />

          <View style={styles.card}>
            <View style={styles.progress}>
              <Text style={styles.progressText}>
                Pregunta {currentQuestion + 1} de {questions[language].length}
              </Text>
              <View style={styles.progressBar}>
                {questions[language].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      currentQuestion === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {questions[language][currentQuestion].text}
              </Text>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{answers[currentQuestion]}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={answers[currentQuestion]}
                onValueChange={(value) => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = value;
                  setAnswers(newAnswers);
                }}
                minimumTrackTintColor="#056b05"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#056b05"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>
                  {questions[language][currentQuestion].min}
                </Text>
                <Text style={styles.sliderLabel}>
                  {questions[language][currentQuestion].max}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.navigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentQuestion === 0 && styles.disabledButton,
              ]}
              onPress={() => setCurrentQuestion((curr) => curr - 1)}
              disabled={currentQuestion === 0}
            >
              <Ionicons name="arrow-back" size={24} color="#056b05" />
              <Text style={styles.navButtonText}>Anterior</Text>
            </TouchableOpacity>

            {currentQuestion === questions[language].length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={[styles.navButtonText, styles.submitButtonText]}>
                  Enviar
                </Text>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setCurrentQuestion((curr) => curr + 1)}
              >
                <Text style={styles.navButtonText}>Siguiente</Text>
                <Ionicons name="arrow-forward" size={24} color="#056b05" />
              </TouchableOpacity>
            )}
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
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  activeDot: {
    backgroundColor: "#056b05",
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 18,
    color: "#333",
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 10,
  },
  sliderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#056b05",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    flex: 1,
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
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: "#056b05",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#056b05",
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
    backgroundColor: "rgba(5, 107, 5, 0.1)",
    borderRadius: 10,
  },
  resultContent: {
    marginTop: 15,
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
  scoreValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#056b05",
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 15,
    borderRadius: 10,
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
    backgroundColor: "#056b05",
    alignSelf: "flex-end",
  },
  belowMedian: {
    backgroundColor: "#ff4444",
  },
  neutralMedian: {
    backgroundColor: "#cccccc", // Color neutro, como un gris claro
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
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  belowMedianText: {
    color: "#ff4444",
  },
  belowMedianScore: {
    color: "#ff4444",
    fontSize: 36,
    fontWeight: "bold",
  },
});
