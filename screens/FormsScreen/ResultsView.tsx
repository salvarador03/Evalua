import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Language } from "../../types/language";
import { useAuth } from "../../context/AuthContext";
import { FormResponse } from "../../types/form";
import { questions } from "./data/questions";
import { teenQuestions } from "./data/teenQuestions";
import { useRoute } from "@react-navigation/native";
import ComparisonChart from "./ComparisonChart";
import db from "@react-native-firebase/database";
import { translations } from "../../Components/LanguageSelection/translations";

interface FormStats {
  median: number;
  belowMedian: number;
  aboveMedian: number;
  totalUsers: number;
  min: number;
  max: number;
  distanceFromMedian: number;
  percentageFromMedian: number;
}

interface ResultsViewProps {
  language: Language;
  formResponse: FormResponse;
  answers: (number | null)[];
  stats: FormStats[];
}

interface RouteParams {
  studentData?: {
    name: string;
    email: string;
    uid: string;
    classCode?: string;
  };
  isTeacherView?: boolean;
  formResponse: FormResponse;
  language: Language;
  answers: (number | null)[];
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  language,
  formResponse,
  answers,
  stats,
}) => {
  const route = useRoute();
  const routeParams = route.params as RouteParams | undefined;
  const studentData = routeParams?.studentData;
  const isTeacherView = routeParams?.isTeacherView ?? false;
  const [activeSection, setActiveSection] = useState<
    "responses" | "comparison"
  >("responses");
  const [fadeAnim] = useState(new Animated.Value(1));
  const [studentClassCode, setStudentClassCode] = useState<string>("");
  const [studentAge, setStudentAge] = useState<number | undefined>();
  const { user } = useAuth();

  const loadStudentData = async () => {
    if (isTeacherView && studentData?.uid) {
      try {
        const guestRef = await db().ref(`/guests/${studentData.uid}`).once("value");
        const guestData = guestRef.val();

        if (guestData?.classCode) {
          setStudentClassCode(guestData.classCode);
        }
        if (guestData?.age) {
          setStudentAge(guestData.age);
        }
      } catch (error) {
        console.error("Error loading student data:", error);
      }
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [isTeacherView, studentData?.uid]);


  const getAgeAppropriateQuestions = (language: Language) => {
    const targetAge = isTeacherView ? studentAge : user?.age;
    return (targetAge && targetAge >= 12 && targetAge <= 18) ? teenQuestions[language] : questions[language];
  };


  // Eliminar el segundo useEffect y modificar el primero
  useEffect(() => {
    const loadStudentClassCode = async () => {
      if (isTeacherView && studentData?.uid) {
        try {
          const guestRef = await db()
            .ref(`/guests/${studentData.uid}`)
            .once("value");
          const guestData = guestRef.val();


          if (guestData?.classCode) {
            setStudentClassCode(guestData.classCode);
          }
        } catch (error) {
          console.error("Error loading student class code:", error);
        }
      }
    };

    loadStudentClassCode();
  }, [isTeacherView, studentData?.uid]);

  const getCorrectClassCode = async (): Promise<string> => {
    // Si es guest, obtener el código de Firebase
    if (formResponse.isGuest && formResponse.userId) {
      try {
        const guestRef = await db()
          .ref(`/guests/${formResponse.userId}`)
          .once("value");
        const guestData = guestRef.val();

        if (guestData?.classCode) {
          return guestData.classCode;
        }
      } catch (error) {
        console.error("Error getting guest class code:", error);
      }
    }

    // Si no se pudo obtener el código de Firebase o no es guest
    return formResponse?.classCode || "";
  };

  const switchSection = (section: "responses" | "comparison") => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveSection(section);
  };

  const renderStudentHeader = () => {
    if (!isTeacherView || !studentData) return null;

    return (
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{studentData.name}</Text>
          <Text style={styles.studentEmail}>{studentData.email}</Text>
          {studentData.classCode && (
            <Text style={styles.studentClassCode}>
              Código de clase: {studentData.classCode}
            </Text>
          )}
        </View>
        <View style={styles.teacherBadge}>
          <Ionicons name="school" size={20} color="#fff" />
          <Text style={styles.teacherBadgeText}>Vista del Profesor</Text>
        </View>
      </View>
    );
  };

  const renderNavigationButtons = () => (
    <View style={styles.navContainer}>
      <TouchableOpacity
        style={[
          styles.navButton,
          activeSection === "responses" && styles.navButtonActive,
        ]}
        onPress={() => switchSection("responses")}
      >
        <Ionicons
          name="star"
          size={32}
          color={activeSection === "responses" ? "#FFF" : "#9E7676"}
        />
        <Text
          style={[
            styles.navButtonText,
            activeSection === "responses" && styles.navButtonTextActive,
          ]}
        >
          {isTeacherView ? "Respuestas del Alumno" : "Mis Respuestas"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          activeSection === "comparison" && styles.navButtonActive,
        ]}
        onPress={() => switchSection("comparison")}
      >
        <Ionicons
          name="people"
          size={32}
          color={activeSection === "comparison" ? "#FFF" : "#9E7676"}
        />
        <Text
          style={[
            styles.navButtonText,
            activeSection === "comparison" && styles.navButtonTextActive,
          ]}
        >
          Comparar con Otros
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResponses = () => (
    <View style={styles.responsesContainer}>
      {getAgeAppropriateQuestions(language).map((question, index) => {
        const userAnswer = answers[index];
        if (userAnswer === undefined) return null;
  
        // Determinar el color y el icono basado en la puntuación
        const getScoreStyle = (score: number | null) => {
          if (score === null) return {
            color: '#666',
            backgroundColor: '#f5f5f5', 
            icon: 'help-circle',
            label: 'Pendiente de respuesta',
            borderColor: '#666'
          };
          if (score <= 3) return {
            color: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            icon: 'alert-circle', 
            label: 'Nivel bajo',
            borderColor: '#ef4444'
          };
          if (score <= 6) return {
            color: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            icon: 'warning',
            label: 'Nivel medio',
            borderColor: '#fbbf24'
          };
          return {
            color: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            icon: 'checkmark-circle',
            label: 'Nivel alto',
            borderColor: '#4ade80'
          };
        };
  
        const scoreStyle = getScoreStyle(userAnswer);
  
        let teacherNoteText = "";
        let noteColor = scoreStyle.color;
  
        if (isTeacherView && userAnswer !== null) {
          if (studentAge && studentAge >= 12 && studentAge <= 18) {
            if (userAnswer >= 8) {
              teacherNoteText = "Nivel óptimo de alfabetización física";
            } else if (userAnswer >= 6) {
              teacherNoteText = "Buen desarrollo de la alfabetización física";
            } else if (userAnswer >= 4) {
              teacherNoteText = "Desarrollo en proceso, necesita refuerzo";
            } else {
              teacherNoteText = "Requiere atención y apoyo específico";
            }
  
            if (index === 7) {
              if (userAnswer >= 8) {
                teacherNoteText = "Excelente comprensión global de la alfabetización física";
              } else if (userAnswer >= 6) {
                teacherNoteText = "Buena comprensión de los componentes";
              } else if (userAnswer >= 4) {
                teacherNoteText = "Comprensión básica, necesita reforzar";
              } else {
                teacherNoteText = "Requiere revisión de conceptos fundamentales";
              }
            }
          } else {
            if (userAnswer >= 8) {
              teacherNoteText = "Nivel excelente en este componente";
            } else if (userAnswer >= 6) {
              teacherNoteText = "Buen nivel en este componente";
            } else if (userAnswer >= 4) {
              teacherNoteText = "Nivel aceptable, puede mejorar";
            } else {
              teacherNoteText = "Necesita mejorar este componente";
            }
          }
        }
  
        return (
          <View key={index} style={styles.responseCard}>
            <View style={styles.questionContainer}>
              <View style={styles.questionNumberBadge}>
                <Text style={styles.questionNumberText}>{`P${index + 1}`}</Text>
              </View>
              <Text style={styles.questionText}>{question.text}</Text>
            </View>
  
            <View style={styles.scoreContainer}>
              <View style={[
                styles.trafficLight,
                { backgroundColor: scoreStyle.backgroundColor }
              ]}>
                <View style={[
                  styles.scoreCircle,
                  { borderColor: scoreStyle.borderColor }
                ]}>
                  <Ionicons 
                    name={scoreStyle.icon as any} 
                    size={24} 
                    color={scoreStyle.color} 
                  />
                  <Text style={[styles.scoreValue, { color: scoreStyle.color }]}>
                    {userAnswer !== null ? userAnswer.toString() : '-'}
                  </Text>
                </View>
                <Text style={[styles.scoreLabel, { color: scoreStyle.color }]}>
                  {scoreStyle.label}
                </Text>
              </View>
            </View>
  
            {isTeacherView && userAnswer !== null && (
              <View style={[styles.teacherNote, { backgroundColor: `${scoreStyle.color}20` }]}>
                <Ionicons 
                  name="information-circle" 
                  size={20} 
                  color={scoreStyle.color} 
                />
                <Text style={[styles.teacherNoteText, { color: scoreStyle.color }]}>
                  {teacherNoteText}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderComparison = () => {
    return getAgeAppropriateQuestions(language).map((question, index) => {
      const effectiveUserId = isTeacherView && studentData
        ? studentData.uid
        : formResponse?.userId;
      if (!effectiveUserId) return null;
      if (index >= answers.length) return null
      return (
        <View key={index} style={styles.comparisonSection}>
          <View style={styles.questionNumberBadge}>
            <Text style={styles.questionNumberText}>
              {`${translations[language].question} ${index + 1}`}
            </Text>
          </View>
          <ComparisonChart
            key={index}
            userScore={answers[index] ?? 0}
            userData={{
              userId: effectiveUserId || "",
              name: studentData?.name || "",
              classCode: studentData?.classCode || "",
              country: formResponse.country || "",
              age: user?.age || 0,
            }}
            formResponse={formResponse}
            questionIndex={index}
          />
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {studentData && renderStudentHeader()}
      {renderNavigationButtons()}
      <ScrollView style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {activeSection === "responses"
            ? renderResponses()
            : renderComparison()}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  studentHeader: {
    backgroundColor: "rgba(158, 118, 118, 0.9)",
    padding: 18,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  studentEmail: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  comparisonSection: {
    marginBottom: 20,
  },
  studentClassCode: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  trafficLight: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 8,
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
  questionNumberBadge: {
    backgroundColor: 'rgba(158, 118, 118, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(158, 118, 118, 0.2)',
    marginBottom: 8
  },
  questionNumberText: {
    color: '#594545',
    fontWeight: '600',
    fontSize: 14
  },
  teacherBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 12,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navButtonActive: {
    backgroundColor: "#9E7676",
  },
  navButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#9E7676",
  },
  navButtonTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  responsesContainer: {
    gap: 16,
  },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: "#594545",
  },
  answerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    padding: 16,
    borderRadius: 12,
  },
  answerValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#9E7676",
  },
  pointsText: {
    fontSize: 16,
    color: "#666",
  },
  teacherNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  teacherNoteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ResultsView;
