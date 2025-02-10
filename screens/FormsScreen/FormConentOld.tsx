import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { questions } from "./data/questions";
import { teenQuestions, isTeenager } from "./data/teenQuestions";
import { translations } from "../../Components/LanguageSelection/translations";
import PhysicalLiteracySlider from "../../Components/PhysicalLiteracySlider/PhysicalLiteracySlider";
import { universityStudentQuestions, isUniversityStudent } from "./data/universityStudentQuestions";
import { useAuth } from "../../context/AuthContext";

export type Language = "es" | "en" | "pt-PT" | "pt-BR";

// Traducciones para la última pregunta
const lastQuestionTranslations = {
  introText: {
    en: "Once you know what physical literacy is. Compared to children of my age, my physical literacy is:",
    es: "Una vez que sabes qué es la alfabetización física. En comparación con los/las niños/as de mi edad, mi alfabetización física es:",
    "pt-PT": "Depois de saber o que é literacia física. Em comparação com crianças da minha idade, a minha literacia física é:",
    "pt-BR": "Depois de saber o que é letramento físico. Em comparação com crianças da minha idade, o meu letramento físico é:",
  },
  questionTitles: {
    en: ["Physical Condition", "Physical Education Knowledge", "Interest in Physical Activity", "Social Relations"],
    es: ["Condición Física", "Conocimiento de Educación Física", "Interés en la Actividad Física", "Relaciones Sociales"],
    "pt-PT": ["Condição Física", "Conhecimento de Educação Física", "Interesse pela Atividade Física", "Relações Sociais"],
    "pt-BR": ["Condição Física", "Conhecimento de Educação Física", "Interesse pela Atividade Física", "Relações Sociais"],
  },
};

// Imágenes para niños (6-12)
const childQuestionImages = [
  require("../../assets/images/preguntas/kids/primera_pregunta.webp"),
  require("../../assets/images/preguntas/kids/segunda_pregunta.webp"),
  require("../../assets/images/preguntas/kids/tercera_pregunta.webp"),
  require("../../assets/images/preguntas/kids/cuarta_pregunta.webp"),
  require("../../assets/images/preguntas/kids/quinta_pregunta.webp"),
  require("../../assets/images/preguntas/kids/sexta_pregunta.webp"),
  require("../../assets/images/preguntas/kids/septima_pregunta.webp"),
];

// Imágenes para adolescentes (12-18)
const teenQuestionImages = [
  require("../../assets/images/preguntas/teen/primera_pregunta.webp"),
  require("../../assets/images/preguntas/teen/segunda_pregunta.webp"),
  require("../../assets/images/preguntas/teen/tercera_pregunta.webp"),
  require("../../assets/images/preguntas/teen/cuarta_pregunta.webp"),
  require("../../assets/images/preguntas/teen/quinta_pregunta.webp"),
  require("../../assets/images/preguntas/teen/sexta_pregunta.webp"),
  require("../../assets/images/preguntas/teen/septima_pregunta.webp"),
  require("../../assets/images/preguntas/teen/octava_pregunta.webp"),
];

const universityStudentQuestionImages = [
  require("../../assets/images/preguntas/universitary/primera_pregunta.webp"),
  require("../../assets/images/preguntas/universitary/segunda_pregunta.webp"),
  require("../../assets/images/preguntas/universitary/tercera_pregunta.webp"),
  require("../../assets/images/preguntas/universitary/cuarta_pregunta.webp"),
  require("../../assets/images/preguntas/universitary/quinta_pregunta.webp"),
  require("../../assets/images/preguntas/universitary/sexta_pregunta.webp"),
  require("../../assets/images/preguntas/universitary/septima_pregunta.webp"),
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

export const FormContent: React.FC<FormContentProps> = ({
  language,
  currentQuestion,
  answers,
  onAnswerChange,
  onQuestionChange,
  onSubmit,
  userAge,
}) => {
  const { user } = useAuth();
  const previousAgeRef = useRef(userAge);
  
  const isTeenUser = React.useMemo(() => isTeenager(userAge), [userAge]);
  const isUniversityUser = React.useMemo(() => isUniversityStudent(userAge), [userAge]);

  const currentQuestions = React.useMemo(() => {
    if (isUniversityUser) {
      return universityStudentQuestions[language];
    } else if (isTeenUser) {
      return teenQuestions[language];
    }
    return questions[language];
  }, [isUniversityUser, isTeenUser, language]);

  const formatQuestionText = useCallback((text: string): React.ReactNode[] => {
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
  }, []);

  // Efecto para manejar cambios en la edad
  useEffect(() => {
    const shouldReset = userAge > 0 && currentQuestion > 0;
    if (shouldReset) {
      onAnswerChange(new Array(currentQuestions.length).fill(null));
      onQuestionChange('prev');
    }
  }, [userAge, isTeenUser]);

  const handleAnswerChange = useCallback((value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    onAnswerChange(newAnswers);
  }, [answers, currentQuestion, onAnswerChange]);

  const confirmAnswer = useCallback((action: () => void) => {
    const currentScore = answers[currentQuestion];
    if (currentScore === null) return;

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

  const canProceedToNext = useCallback(() =>
    answers[currentQuestion] !== null,
    [answers, currentQuestion]
  );

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
    const hasValidAnswer = answers[currentQuestion] !== null &&
      answers[currentQuestion] !== undefined &&
      !isNaN(answers[currentQuestion]);

    if (!hasValidAnswer) {
      Alert.alert(
        translations[language].requiredAnswer,
        translations[language].pleaseSelectValue,
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    confirmAnswer(onSubmit);
  }, [answers, currentQuestion, language, onSubmit, confirmAnswer]);

  const renderQuestionImages = useCallback((questionIndex: number) => {
    const getImageGrid = (imageSource: typeof teenQuestionImages | typeof universityStudentQuestionImages) => (
      <View style={styles.imageGrid}>
        <View style={styles.gridRow}>
          <View style={styles.gridImageContainer}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>A</Text>
            </View>
            <Image source={imageSource[1]} style={styles.gridImage} />
          </View>
          <View style={styles.gridImageContainer}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>B</Text>
            </View>
            <Image source={imageSource[2]} style={styles.gridImage} />
          </View>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.gridImageContainer}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>C</Text>
            </View>
            <Image source={imageSource[3]} style={styles.gridImage} />
          </View>
          <View style={styles.gridImageContainer}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>D</Text>
            </View>
            <Image source={imageSource[4]} style={styles.gridImage} />
          </View>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.gridImageContainer}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>E</Text>
            </View>
            <Image source={imageSource[5]} style={styles.gridImage} />
          </View>
          <View style={styles.gridImageContainer}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>F</Text>
            </View>
            <Image source={imageSource[0]} style={styles.gridImage} />
          </View>
        </View>
      </View>
    );

    if ((isTeenUser || isUniversityUser) && questionIndex === currentQuestions.length - 1) {
      const imageSource = isUniversityUser ? universityStudentQuestionImages : teenQuestionImages;
      return getImageGrid(imageSource);
    }

    const images = isUniversityUser
      ? universityStudentQuestionImages
      : (isTeenUser ? teenQuestionImages : childQuestionImages);

    return (
      <Image
        source={images[questionIndex]}
        style={styles.questionImage}
        resizeMode="contain"
      />
    );
  }, [isTeenUser, isUniversityUser, currentQuestions.length]);

  const renderSlider = useCallback(() => {
    return (
      <PhysicalLiteracySlider
        value={answers[currentQuestion]}
        onChange={handleAnswerChange}
        minLabel={currentQuestions[currentQuestion].min}
        maxLabel={currentQuestions[currentQuestion].max}
        language={language}
      />
    );
  }, [answers, currentQuestion, currentQuestions, handleAnswerChange, language]);

  const renderFinalQuestion = useCallback(() => {
    if (!isTeenUser && !isUniversityUser) {
      return (
        <View style={styles.multipleImagesContainer}>
          <Text style={styles.questionText}>
            CUESTIONARIO DE AUTOEVALUACIÓN DE ALFABETIZACIÓN FÍSICA - versión española (CAAFE).
          </Text>
          <Text style={styles.questionText}>
            8. Tener una buena alfabetización física significa:
          </Text>
          <Text style={styles.questionText}>
            A) Tener una buena condición física.
          </Text>
          <Text style={styles.questionText}>
            B) Saber mucho sobre la Educación Física.
          </Text>
          <Text style={styles.questionText}>
            C) Tener interés y ganas de hacer actividad física.
          </Text>
          <Text style={styles.questionText}>
            D) Hacer amigos/as gracias a la actividad física.
          </Text>
          <Text style={styles.questionText}>
            E) Ser más seguro/a cuando se hace actividad física.
          </Text>
          <Text style={styles.questionText}>
            F) Hacer bien actividad física.
          </Text>
          <Text style={styles.questionText}>
            G) Hacer actividad física varias veces a la semana.
          </Text>

          <Text style={styles.mainQuestionText}>
            {lastQuestionTranslations.introText[language]}
          </Text>

          <View style={styles.questionsSection}>
            {[0, 1, 2, 3].map((index) => (
              <View key={index} style={styles.questionBlock}>
                <Text style={styles.questionSubtext}>
                  {`${index + 1}) ${lastQuestionTranslations.questionTitles[language][index]}`}
                </Text>
                <View style={styles.imageWrapper}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <Image
                    source={childQuestionImages[index]}
                    style={styles.summaryQuestionImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }
    return (
      <View style={styles.questionContainer}>
        {renderQuestionImages(currentQuestion)}
      </View>
    );
  }, [isTeenUser, isUniversityUser, currentQuestion, renderQuestionImages, language]);

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
        {currentQuestion === 7 ? renderFinalQuestion() : renderQuestionImages(currentQuestion)}
        <Text style={styles.questionText}>
          {formatQuestionText(currentQuestions[currentQuestion].text)}
        </Text>
      </View>

      {/* Slider */}
      {renderSlider()}

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
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
              !canProceedToNext() && styles.disabledButton
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
              { backgroundColor: canProceedToNext() ? "#4ade80" : "#e5e7eb" }
            ]}
            disabled={!canProceedToNext()}
            onPress={handleNext}
          >
            <Text
              style={[
                styles.navButtonText,
                { color: canProceedToNext() ? "#fff" : "#666" }
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
};

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
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  mainQuestionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 25,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  questionsSection: {
    gap: 25,
  },
  questionBlock: {
    marginBottom: 25,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionSubtext: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryQuestionImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  numberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4ade80',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  numberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
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
  questionContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#1f2937",
    marginTop: 15,
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
  imageGrid: {
    marginBottom: 20,
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridImageContainer: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 10,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default FormContent;