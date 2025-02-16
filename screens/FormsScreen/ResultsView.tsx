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

// Primero, definimos las traducciones para la pregunta última dentro de ResultsView
const lastKidsQuestionTranslations = {
  'es': {
    title: 'Tener una buena alfabetización física significa:',
    options: [
      'A) Tener una buena condición física.',
      'B) Saber mucho sobre la Educación Física.',
      'C) Tener interés y ganas de hacer actividad física.',
      'D) Hacer amigos/as gracias a la actividad física.',
      'E) Ser más seguro/a cuando se hace actividad física.',
      'F) Hacer bien actividad física.',
      'G) Hacer actividad física varias veces a la semana.'
    ],
    finalQuestion: 'Sabiendo que la alfabetización física es la suma de las preguntas anteriores: 1) forma física global/condición física; 2) cantidad de actividad física realizada semanalmente; 3) lo que sabes sobre educación física; 4) motivación para realizar actividad física, incluyendo hacer nuevos amigos y sentirte mejor con tus compañeros/as gracias a la actividad física. En comparación con los/las niños/as de mi edad mi alfabetización física es:'
  },
  'en': {
    title: 'Having good physical literacy means:',
    options: [
      'A) Having good physical fitness.',
      'B) Knowing a lot about Physical Education.',
      'C) Having interest and desire to do physical activity.',
      'D) Making friends through physical activity.',
      'E) Being more confident when doing physical activity.',
      'F) Doing physical activity well.',
      'G) Doing physical activity several times a week.'
    ],
    finalQuestion: 'Knowing that physical literacy is the sum of the previous questions: 1) overall physical fitness; 2) amount of weekly physical activity; 3) what you know about physical education; 4) motivation to do physical activity, including making new friends and feeling better with your peers thanks to physical activity. Compared to children my age, my physical literacy is:'
  },
  'pt-PT': {
    title: 'Ter uma boa literacia física significa:',
    options: [
      'A) Ter uma boa condição física.',
      'B) Saber muito sobre Educação Física.',
      'C) Ter interesse e vontade de fazer atividade física.',
      'D) Fazer amigos através da atividade física.',
      'E) Ser mais seguro ao fazer atividade física.',
      'F) Fazer bem atividade física.',
      'G) Fazer atividade física várias vezes por semana.'
    ],
    finalQuestion: 'Sabendo que a literacia física é a soma das questões anteriores: 1) forma física global; 2) quantidade de atividade física semanal; 3) o que sabe sobre educação física; 4) motivação para fazer atividade física, incluindo fazer novos amigos e sentir-se melhor com os colegas graças à atividade física. Em comparação com as crianças da minha idade, a minha literacia física é:'
  },
  'pt-BR': {
    title: 'Ter um bom letramento físico significa:',
    options: [
      'A) Ter uma boa condição física.',
      'B) Saber muito sobre Educação Física.',
      'C) Ter interesse e vontade de fazer atividade física.',
      'D) Fazer amigos através da atividade física.',
      'E) Ser mais seguro ao fazer atividade física.',
      'F) Fazer bem atividade física.',
      'G) Fazer atividade física várias vezes por semana.'
    ],
    finalQuestion: 'Sabendo que o letramento físico é a soma das questões anteriores: 1) forma física global; 2) quantidade de atividade física semanal; 3) o que sabe sobre educação física; 4) motivação para fazer atividade física, incluindo fazer novos amigos e sentir-se melhor com os colegas graças à atividade física. Em comparação com as crianças da minha idade, meu letramento físico é:'
  }
};

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
  const [localAnswers, setLocalAnswers] = useState<(number | null)[]>(answers);
  const { user } = useAuth();

  useEffect(() => {
    // Log para intentar corregir los fallos.
    console.log("-----------------------------------------------------------------------------------------")
    console.log("[DEBUG] User name:", user?.name);
    console.log("[DEBUG] Loaded answers:", answers);
    console.log("[DEBUG] Questions length:", getAgeAppropriateQuestions(language).length);
    console.log("[DEBUG] User role:", isTeacherView ? "teacher" : "student");
    console.log("[DEBUG] Student age:", studentAge);
    console.log("[DEBUG] User age:", user?.age);
    console.log("-----------------------------------------------------------------------------------------")
  }, [answers, language, isTeacherView, studentAge, user?.age]);

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

        // Agregar logs para verificar los datos cargados
      } catch (error) {
        console.error("Error loading student data:", error);
      }
    }
  };

  // 1. Primero, asegurarse de que las respuestas se cargan correctamente
  useEffect(() => {
    const loadAnswers = async () => {
      try {
        // Si es vista de profesor, cargar las respuestas del estudiante
        if (isTeacherView && studentData?.uid) {
          const formResponseRef = await db()
            .ref(`/form_responses/${studentData.uid}/physical_literacy`)
            .once('value');

          const formResponseData = formResponseRef.val();
          console.log("[DEBUG] Teacher view - loaded answers:", formResponseData?.answers);

          if (formResponseData?.answers) {
            setLocalAnswers(formResponseData.answers);
          }
        } else {
          // Si no es vista de profesor, usar las respuestas proporcionadas como prop
          setLocalAnswers(answers);
        }
      } catch (error) {
        console.error("Error loading answers:", error);
      }
    };

    loadAnswers();
  }, [isTeacherView, studentData?.uid, answers]);


  // 2. Modificar getAgeAppropriateQuestions para asegurar que siempre devuelve todas las preguntas
  const getAgeAppropriateQuestions = (language: Language) => {
    const targetAge = isTeacherView ? studentAge : user?.age;
    console.log("[DEBUG] getAgeAppropriateQuestions - targetAge:", targetAge);
    console.log("[DEBUG] isTeacherView:", isTeacherView);
    console.log("[DEBUG] studentAge:", studentAge);
    console.log("[DEBUG] user?.age:", user?.age);

    let questionSet;
    if (targetAge) {
      if (targetAge >= 18 && targetAge <= 24) {
        questionSet = teenQuestions[language];
      } else if (targetAge >= 12 && targetAge <= 17) {
        questionSet = teenQuestions[language];
      } else {
        questionSet = questions[language];
      }
    } else {
      questionSet = questions[language];
    }

    console.log("[DEBUG] Selected question set length:", questionSet.length);
    return questionSet.slice();
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
              {translations[language].classCode}: {studentData.classCode}
            </Text>
          )}
        </View>
        <View style={styles.teacherBadge}>
          <Ionicons name="school" size={20} color="#fff" />
          <Text style={styles.teacherBadgeText}>
            {translations[language].teacherView}
          </Text>
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
          {isTeacherView ? translations[language].studentResponses : translations[language].myResponses}
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
          {translations[language].compareWithOthers}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getTargetAge = () => {
    return isTeacherView ? studentAge : user?.age;
  };

  const isTeenUser = React.useMemo(() => {
    const targetAge = getTargetAge();
    return targetAge ? targetAge >= 12 && targetAge <= 18 : false;
  }, [studentAge, user?.age, isTeacherView]);

  const isUniversityUser = React.useMemo(() => {
    const targetAge = getTargetAge();
    return targetAge ? targetAge >= 18 && targetAge <= 24 : false;
  }, [studentAge, user?.age, isTeacherView]);

  const renderResponses = () => {
    // Obtener preguntas y asegurarnos de que tenemos todas las respuestas
    const questions = getAgeAppropriateQuestions(language);
    // Usar localAnswers en lugar de answers directamente
    const validAnswers = isTeacherView ? localAnswers : answers;

    console.log("[DEBUG] Rendering responses:");
    console.log("[DEBUG] Questions length:", questions.length);
    console.log("[DEBUG] Valid answers:", validAnswers);
    console.log("[DEBUG] Local answers:", localAnswers);
    console.log("[DEBUG] Original answers:", answers);
    console.log("[DEBUG] User role:", isTeacherView ? "teacher" : "student");
    console.log("[DEBUG] Target age:", isTeacherView ? studentAge : user?.age);

    return (
      <View style={styles.responsesContainer}>
        {questions.map((question, index) => {
          const userAnswer = validAnswers?.[index];

          // Determinar la edad y el tipo de usuario
          const targetAge = isTeacherView ? studentAge : user?.age;
          const isUniversityStudent = targetAge ? targetAge >= 18 && targetAge <= 24 : false;
          const isTeenStudent = targetAge ? targetAge >= 12 && targetAge <= 17 : false;

          // Obtener el texto de la pregunta
          let questionText = question.text;

          // Si es la última pregunta, manejar según el grupo de edad
          if (index === questions.length - 1) {
            if (isUniversityStudent || isTeenStudent) {
              // Usar la última pregunta de teenQuestions para universitarios y adolescentes
              questionText = teenQuestions[language][teenQuestions[language].length - 1].text;
            } else {
              // Para niños, usar el formato especial con las opciones
              const lastQuestion = {
                'es': 'Una vez que sabes qué es la alfabetización física. En comparación con los/las niños/as de mi edad, mi alfabetización física es:',
                'en': 'Now that you know what physical literacy is. Compared to children my age, my physical literacy is:',
                'pt-PT': 'Depois de saber o que é literacia física. Em comparação com as crianças da minha idade, a minha literacia física é:',
                'pt-BR': 'Depois de saber o que é letramento físico. Em comparação com crianças da minha idade, meu letramento físico é:'
              };

              questionText = `${lastKidsQuestionTranslations[language].title}\n\n${lastKidsQuestionTranslations[language].options.join('\n')}\n\n${lastQuestion[language]}`;
            }
          }

          // Determinar el color y el icono basado en la puntuación
          const getScoreStyle = (score: number | null) => {
            if (score === null || score === undefined) return {
              color: '#666',
              backgroundColor: '#f5f5f5',
              icon: 'help-circle',
              label: translations[language].pendingResponse,
              borderColor: '#666'
            };
            if (score <= 3) return {
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              icon: 'alert-circle',
              label: translations[language].lowLevel,
              borderColor: '#ef4444'
            };
            if (score <= 6) return {
              color: '#fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              icon: 'warning',
              label: translations[language].mediumLevel,
              borderColor: '#fbbf24'
            };
            return {
              color: '#4ade80',
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              icon: 'checkmark-circle',
              label: translations[language].highLevel,
              borderColor: '#4ade80'
            };
          };

          const scoreStyle = getScoreStyle(userAnswer);

          return (
            <View key={index} style={styles.responseCard}>
              <View style={styles.questionContainer}>
                <View style={styles.questionNumberBadge}>
                  <Text style={styles.questionNumberText}>
                    {`${translations[language].question} ${index + 1}`}
                  </Text>
                </View>
                <Text style={styles.questionText}>{questionText}</Text>
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
                      {userAnswer !== null && userAnswer !== undefined ? userAnswer.toString() : '-'}
                    </Text>
                  </View>
                  <Text style={[styles.scoreLabel, { color: scoreStyle.color }]}>
                    {scoreStyle.label}
                  </Text>
                </View>
              </View>

              {isTeacherView && userAnswer !== null && userAnswer !== undefined && (
                <View style={[styles.teacherNote, { backgroundColor: `${scoreStyle.color}20` }]}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={scoreStyle.color}
                  />
                  <Text style={[styles.teacherNoteText, { color: scoreStyle.color }]}>
                    {userAnswer >= 8 ? translations[language].excellentGlobalUnderstanding :
                      userAnswer >= 6 ? translations[language].goodComponentsUnderstanding :
                        translations[language].needsImprovement}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderComparison = () => {
    return getAgeAppropriateQuestions(language).map((question, index) => {
      const effectiveUserId = isTeacherView && studentData
        ? studentData.uid
        : formResponse?.userId;
      if (!effectiveUserId) return null;
      if (index >= answers.length) return null;

      const userAge = isTeacherView ? studentAge : user?.age;

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
              countryRole: formResponse.countryRole || {
                country: formResponse.country || "",
                language: formResponse.language || "es",
                flag: ""
              },
              age: userAge || 0,
            }}
            formResponse={formResponse}
            questionIndex={index}
            language={language}
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
