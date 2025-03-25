import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
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
import SpiderChart from './SpiderChart';

type LocalFormStats = {
  median: number;
  mean: number;
  belowMedian: number;
  aboveMedian: number;
  totalUsers: number;
  min: number;
  max: number;
  distanceFromMedian: number;
  percentageFromMedian: number;
  classMedians: number[];
  globalMedians: number[];
  countryMedians: number[];
  ageMedians: number[];
};

interface ResultsViewProps {
  language: Language;
  formResponse: FormResponse;
  answers: (number | null)[];
  stats: LocalFormStats[];
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
  'es-PA': {
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
    finalQuestion: 'Una vez que sabes qué es la alfabetización física. En comparación con los/las niños/as de mi edad, mi alfabetización física es:'
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
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const { user } = useAuth();

  const loadStudentData = async () => {
    if (isTeacherView && studentData?.uid) {
      try {
        const guestRef = await db().ref(`/guests/${studentData.uid}`).once("value");
        const guestData = guestRef.val();
        const userRef = await db().ref(`/users/${studentData.uid}`).once("value");
        const userData = userRef.val();

        const age = guestData?.age || userData?.age;
        if (age) {
          setStudentAge(age);
          console.log('Edad del estudiante cargada:', age);
        }

        if (guestData?.classCode || userData?.classCode) {
          setStudentClassCode(guestData?.classCode || userData?.classCode);
        }
      } catch (error) {
        console.error("Error loading student data:", error);
      }
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [isTeacherView, studentData?.uid]);

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        if (isTeacherView && studentData?.uid) {
          const formResponseRef = await db()
            .ref(`/form_responses/${studentData.uid}/physical_literacy`)
            .once('value');

          const formResponseData = formResponseRef.val();

          if (formResponseData?.answers) {
            setLocalAnswers(formResponseData.answers);
          }
        } else {
          setLocalAnswers(answers);
        }
      } catch (error) {
        console.error("Error loading answers:", error);
      }
    };

    loadAnswers();
  }, [isTeacherView, studentData?.uid, answers]);

  const getAgeAppropriateQuestions = (language: Language) => {
    const targetAge = isTeacherView ? studentAge : user?.age;

    if (!targetAge) {
      console.log('No age found, defaulting to kids questions');
      return questions[language].slice();
    }

    if (targetAge >= 18 && targetAge <= 24) {
      console.log('Using university questions');
      return teenQuestions[language].slice();
    } else if (targetAge >= 12 && targetAge <= 17) {
      console.log('Using teen questions');
      return teenQuestions[language].slice();
    } else {
      console.log('Using kids questions');
      return questions[language].slice();
    }
  };

  const getCorrectClassCode = async (): Promise<string> => {
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

  const getKeywords = (text: string, questionIndex: number): string[] => {
    const defaultKeywords: { [key in Language]: string[] } = {
      'es': ['Sin', 'palabras', 'clave'],
      'es-PA': ['Sin', 'palabras', 'clave'],
      'en': ['No', 'keywords', 'available'],
      'pt-PT': ['Sem', 'palavras-chave', 'disponíveis'],
      'pt-BR': ['Sem', 'palavras-chave', 'disponíveis']
    };

    const questionKeywords: { [key: number]: { [key in Language]: string[] } } = {
      0: {
        'es': ['Condición', 'Física', 'Global'],
        'es-PA': ['Condición', 'Física', 'Global'],
        'en': ['Physical', 'Fitness', 'Overall'],
        'pt-PT': ['Condição', 'Física', 'Global'],
        'pt-BR': ['Condição', 'Física', 'Global']
      },
      1: {
        'es': ['Actividad', 'Semanal', 'Cantidad'],
        'es-PA': ['Actividad', 'Semanal', 'Cantidad'],
        'en': ['Weekly', 'Activity', 'Amount'],
        'pt-PT': ['Atividade', 'Semanal', 'Quantidade'],
        'pt-BR': ['Atividade', 'Semanal', 'Quantidade']
      },
      2: {
        'es': ['Conocimiento', 'Educación', 'Contenidos'],
        'es-PA': ['Conocimiento', 'Educación', 'Contenidos'],
        'en': ['Knowledge', 'Education', 'Content'],
        'pt-PT': ['Conhecimento', 'Educação', 'Conteúdos'],
        'pt-BR': ['Conhecimento', 'Educação', 'Conteúdos']
      },
      3: {
        'es': ['Motivación', 'Interés', 'Ganas'],
        'es-PA': ['Motivación', 'Interés', 'Ganas'],
        'en': ['Motivation', 'Interest', 'Desire'],
        'pt-PT': ['Motivação', 'Interesse', 'Vontade'],
        'pt-BR': ['Motivação', 'Interesse', 'Vontade']
      },
      4: {
        'es': ['Amigos', 'Social', 'Relaciones'],
        'es-PA': ['Amigos', 'Social', 'Relaciones'],
        'en': ['Friends', 'Social', 'Relationships'],
        'pt-PT': ['Amigos', 'Social', 'Relações'],
        'pt-BR': ['Amigos', 'Social', 'Relações']
      },
      5: {
        'es': ['Seguridad', 'Confianza', 'Actividad'],
        'es-PA': ['Seguridad', 'Confianza', 'Actividad'],
        'en': ['Confidence', 'Security', 'Activity'],
        'pt-PT': ['Confiança', 'Segurança', 'Atividade'],
        'pt-BR': ['Confiança', 'Segurança', 'Atividade']
      },
      6: {
        'es': ['Competencia', 'Habilidad', 'Destreza'],
        'es-PA': ['Competencia', 'Habilidad', 'Destreza'],
        'en': ['Competence', 'Skill', 'Ability'],
        'pt-PT': ['Competência', 'Habilidade', 'Destreza'],
        'pt-BR': ['Competência', 'Habilidade', 'Destreza']
      },
      7: {
        'es': ['Alfabetización', 'Física', 'Global'],
        'es-PA': ['Alfabetización', 'Física', 'Global'],
        'en': ['Physical', 'Literacy', 'Overall'],
        'pt-PT': ['Literacia', 'Física', 'Global'],
        'pt-BR': ['Letramento', 'Físico', 'Global']
      }
    };

    return questionKeywords[questionIndex]?.[language] || defaultKeywords[language] || ['No', 'keywords', 'available'];
  };

  const getQuestionDomain = (index: number): string => {
    const domains: { [key: number]: { [key in Language]: string } } = {
      0: {
        'es': 'Condición Física',
        'es-PA': 'Condición Física',
        'en': 'Physical Fitness',
        'pt-PT': 'Condição Física',
        'pt-BR': 'Condição Física'
      },
      1: {
        'es': 'Actividad Física',
        'es-PA': 'Actividad Física',
        'en': 'Physical Activity',
        'pt-PT': 'Atividade Física',
        'pt-BR': 'Atividade Física'
      },
      2: {
        'es': 'Conocimiento',
        'es-PA': 'Conocimiento',
        'en': 'Knowledge',
        'pt-PT': 'Conhecimento',
        'pt-BR': 'Conhecimento'
      },
      3: {
        'es': 'Motivación',
        'es-PA': 'Motivación',
        'en': 'Motivation',
        'pt-PT': 'Motivação',
        'pt-BR': 'Motivação'
      },
      4: {
        'es': 'Socialización',
        'es-PA': 'Socialización',
        'en': 'Socialization',
        'pt-PT': 'Socialização',
        'pt-BR': 'Socialização'
      },
      5: {
        'es': 'Seguridad',
        'es-PA': 'Seguridad',
        'en': 'Confidence',
        'pt-PT': 'Confiança',
        'pt-BR': 'Confiança'
      },
      6: {
        'es': 'Competencia',
        'es-PA': 'Competencia',
        'en': 'Competence',
        'pt-PT': 'Competência',
        'pt-BR': 'Competência'
      },
      7: {
        'es': 'Alfabetización Física',
        'es-PA': 'Alfabetización Física',
        'en': 'Physical Literacy',
        'pt-PT': 'Literacia Física',
        'pt-BR': 'Letramento Físico'
      }
    };

    // Asegurarse de que se use el idioma correcto y tener un valor por defecto en el idioma correspondiente
    const defaultDomains: { [key in Language]: string } = {
      'es': 'Pregunta',
      'es-PA': 'Pregunta',
      'en': 'Question',
      'pt-PT': 'Pergunta',
      'pt-BR': 'Pergunta'
    };

    const domainText = domains[index]?.[language];
    return domainText || `${defaultDomains[language]} ${index + 1}`;
  };

  const renderResponses = () => {
    const questions = getAgeAppropriateQuestions(language);
    const validAnswers = isTeacherView ? localAnswers : answers;

    return (
      <View style={styles.responsesContainer}>
        {questions.map((question, index) => {
          const userAnswer = validAnswers?.[index];

          const targetAge = isTeacherView ? studentAge : user?.age;
          const isUniversityStudent = targetAge ? targetAge >= 18 && targetAge <= 24 : false;
          const isTeenStudent = targetAge ? targetAge >= 12 && targetAge <= 17 : false;

          let questionText = question.text;

          if (index === questions.length - 1) {
            if (isUniversityStudent || isTeenStudent) {
              questionText = teenQuestions[language][teenQuestions[language].length - 1].text;
            } else {
              const lastQuestion = {
                'es': 'Una vez que sabes qué es la alfabetización física. En comparación con los/las niños/as de mi edad, mi alfabetización física es:',
                'es-PA': 'Una vez que sabes qué es la alfabetización física. En comparación con los/las niños/as de mi edad, mi alfabetización física es:',
                'en': 'Now that you know what physical literacy is. Compared to children my age, my physical literacy is:',
                'pt-PT': 'Depois de saber o que é literacia física. Em comparação com as crianças da minha idade, a minha literacia física é:',
                'pt-BR': 'Depois de saber o que é letramento físico. Em comparação com crianças da minha idade, meu letramento físico é:'
              };

              questionText = `${lastKidsQuestionTranslations[language].title}\n\n${lastKidsQuestionTranslations[language].options.join('\n')}\n\n${lastQuestion[language]}`;
            }
          }

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

  const handleQuestionExpand = (index: number) => {
    const isExpanded = expandedQuestions.includes(index);
    setExpandedQuestions(prev => 
      isExpanded 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const renderComparison = () => {
    const questions = getAgeAppropriateQuestions(language);
    
    // Añadir logs para depuración
    console.log('Stats data:', {
      stats,
      classMedians: stats?.[0]?.classMedians,
      globalMedians: stats?.[0]?.globalMedians,
      countryMedians: stats?.[0]?.countryMedians,
      ageMedians: stats?.[0]?.ageMedians,
    });
    
    console.log('User answers:', answers);
    
    // Asegurarnos de que los datos de estadísticas estén disponibles
    const classScores = stats?.[0]?.classMedians || [];
    const globalScores = stats?.[0]?.globalMedians || [];
    const countryScores = stats?.[0]?.countryMedians || [];
    const ageScores = stats?.[0]?.ageMedians || [];
    
    return (
      <View>
        {/* Gráfico Araña con idioma correcto */}
        <SpiderChart
          userScores={answers.map(score => score ?? 0)}
          classScores={classScores}
          globalScores={globalScores}
          countryScores={countryScores}
          ageScores={ageScores}
          language={language}
        />
        
        {questions.map((question, index) => {
          const effectiveUserId = isTeacherView && studentData
            ? studentData.uid
            : formResponse?.userId;
          if (!effectiveUserId) return null;

          const userAge = isTeacherView ? studentAge : user?.age;
          const isExpanded = expandedQuestions.includes(index);

          return (
            <View key={index} style={styles.comparisonSection}>
              <View style={styles.questionHeader}>
                <View style={styles.questionTitleContainer}>
                  <View style={styles.questionInfo}>
                    <View style={styles.questionNumberBadge}>
                      <Text style={styles.questionNumberText}>
                        {getQuestionDomain(index)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => handleQuestionExpand(index)}
                  >
                    <Ionicons 
                      name="document-text-outline"
                      size={20} 
                      color="#9E7676"
                    />
                    <Text style={styles.infoButtonText}>
                      {translations[language].showQuestion}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Modal
                visible={isExpanded}
                transparent={true}
                animationType="fade"
                onRequestClose={() => handleQuestionExpand(index)}
              >
                <View style={styles.modalOverlay}>
                  <TouchableOpacity 
                    style={styles.modalOverlayTouchable}
                    activeOpacity={1}
                    onPress={() => handleQuestionExpand(index)}
                  />
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        {getQuestionDomain(index)}
                      </Text>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => handleQuestionExpand(index)}
                      >
                        <Ionicons name="close" size={24} color="#9E7676" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView 
                      style={styles.modalScroll}
                      showsVerticalScrollIndicator={true}
                      bounces={false}
                    >
                      <Text style={styles.modalText}>{question.text}</Text>
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              <ComparisonChart
                key={`chart-${index}`}
                userScore={answers[index] ?? 0}
                userData={{
                  userId: effectiveUserId || "",
                  name: studentData?.name || "",
                  classCode: studentData?.classCode || "",
                  country: formResponse.country || "",
                  countryRole: formResponse.countryRole || {
                    country: formResponse.country || "",
                    language: language,
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
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {studentData && renderStudentHeader()}
      {renderNavigationButtons()}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
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
  questionHeader: {
    marginBottom: 8,
  },
  questionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
  },
  infoButtonText: {
    color: '#9E7676',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(158, 118, 118, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#594545',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalText: {
    fontSize: 16,
    color: '#594545',
    lineHeight: 24,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
  },
});

export default ResultsView;
