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
// Modificar las importaciones para incluir universityStudentQuestions
import { universityStudentQuestions, isUniversityStudent } from "./data/universityStudentQuestions";
import { translations } from "../../Components/LanguageSelection/translations";
import PhysicalLiteracySlider from "../../Components/PhysicalLiteracySlider/PhysicalLiteracySlider";

// Imágenes para niños (6-12)
const childQuestionImages = [
  require("../../assets/images/preguntas/kids/primera_pregunta.webp"),
  require("../../assets/images/preguntas/kids/segunda_pregunta.webp"),
  require("../../assets/images/preguntas/kids/tercera_pregunta.webp"),
  require("../../assets/images/preguntas/kids/cuarta_pregunta.webp"),
  require("../../assets/images/preguntas/kids/quinta_pregunta.webp"),
  require("../../assets/images/preguntas/kids/sexta_pregunta.webp"),
  require("../../assets/images/preguntas/kids/septima_pregunta.webp"), // Nueva imagen añadida
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

// Imágenes para universitarios (18-24)
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

// Traducciones para la última pregunta
const lastQuestionTranslations = {
  introText: {
    'es': 'Sabiendo que la alfabetización física es la suma de las preguntas anteriores:',
    'en': 'Knowing that physical literacy is the sum of the previous questions:',
    'pt-PT': 'Sabendo que a literacia física é a soma das questões anteriores:',
    'pt-BR': 'Sabendo que o letramento físico é a soma das questões anteriores:'
  },
  finalText: {
    'es': 'En comparación con los/las niños/as de mi edad mi alfabetización física es:',
    'en': 'Compared to children my age, my physical literacy is:',
    'pt-PT': 'Em comparação com as crianças da minha idade, a minha literacia física é:',
    'pt-BR': 'Em comparação com as crianças da minha idade, meu letramento físico é:'
  },
  questionTitles: {
    'es': [
      'Forma física global/condición física',
      'Cantidad de actividad física realizada semanalmente',
      'Lo que sabes sobre educación física',
      'Motivación para realizar actividad física, incluyendo hacer nuevos amigos y sentirte mejor con tus compañeros/as gracias a la actividad física'
    ],
    'en': [
      'Overall physical fitness',
      'Amount of weekly physical activity',
      'What you know about physical education',
      'Motivation to do physical activity, including making new friends and feeling better with your peers thanks to physical activity'
    ],
    'pt-PT': [
      'Forma física global',
      'Quantidade de atividade física semanal',
      'O que sabe sobre educação física',
      'Motivação para fazer atividade física, incluindo fazer novos amigos e sentir-se melhor com os colegas graças à atividade física'
    ],
    'pt-BR': [
      'Forma física global',
      'Quantidade de atividade física semanal',
      'O que sabe sobre educação física',
      'Motivação para fazer atividade física, incluindo fazer novos amigos e sentir-se melhor com os colegas graças à atividade física'
    ]
  }
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
  // Memoizar los valores de tipo de usuario para evitar recálculos innecesarios
  const isTeenUser = React.useMemo(() => isTeenager(userAge), [userAge]);
  const isUniversityUser = React.useMemo(() => isUniversityStudent(userAge), [userAge]);

  // Memoizar las preguntas según la edad del usuario
  const currentQuestions = React.useMemo(() => {
    if (isUniversityUser) {
      return universityStudentQuestions[language];
    } else if (isTeenUser) {
      return teenQuestions[language];
    }
    return questions[language];
  }, [isUniversityUser, isTeenUser, language]);

  // Memoizar las imágenes según la edad del usuario
  const questionImages = React.useMemo(() => {
    if (isUniversityUser) {
      return universityStudentQuestionImages;
    } else if (isTeenUser) {
      return teenQuestionImages;
    }
    return childQuestionImages;
  }, [isUniversityUser, isTeenUser]);

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

  // Traducción de la última pregunta para niños

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
      finalQuestion: 'Now that you know what physical literacy is. Compared to children my age, my physical literacy is:'
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
      finalQuestion: 'Agora que sabes o que é literacia física. Em comparação com as crianças da minha idade, a minha literacia física é:'
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
      finalQuestion: 'Agora que você sabe o que é letramento físico. Em comparação com as crianças da minha idade, meu letramento físico é:'
    }
  };

  const renderQuestionImages = (questionIndex: number) => {
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
    const getImageGridForKids = (images: typeof childQuestionImages) => (
      <View style={styles.multipleImagesContainer}>
        <Text style={styles.mainQuestionText}>
          {lastKidsQuestionTranslations[language].title}
        </Text>

        <View style={styles.questionsSection}>
          {lastKidsQuestionTranslations[language].options.map((option, index) => (
            <View key={index} style={styles.questionBlock}>
              <Text style={styles.questionSubtext}>
                {option}
              </Text>
              <View style={styles.imageWrapper}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{String.fromCharCode(65 + index)}</Text>
                </View>
                <Image source={images[index]} style={styles.summaryQuestionImage} resizeMode="contain" />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.finalQuestionText}>
          {lastKidsQuestionTranslations[language].finalQuestion}
        </Text>
      </View>
    );

    const isUniversityUser = isUniversityStudent(userAge);

    // Si es la última pregunta y es un niño, mostrar el grid especial
    if (questionIndex === currentQuestions.length - 1 && !isTeenUser && !isUniversityUser) {
      return getImageGridForKids(childQuestionImages);
    }

    if ((isTeenUser || isUniversityUser) && questionIndex === currentQuestions.length - 1) {
      const imageSource = isUniversityUser ? universityStudentQuestionImages : teenQuestionImages;
      return getImageGrid(imageSource);
    }

    // Para preguntas normales y niños, mantener la visualización original
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
  };

  // En el componente principal, para el slider usamos los labels de la pregunta original
  const renderSlider = () => {
    return (
      <PhysicalLiteracySlider
        value={answers[currentQuestion]}
        onChange={handleAnswerChange}
        minLabel={currentQuestions[currentQuestion].min}
        maxLabel={currentQuestions[currentQuestion].max}
        language={language}
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
          {language === 'es' && 'Cuestionario de Autoevaluación \n de la Alfabetización Física'}
          {language === 'en' && 'Self-Assessment Questionnaire \n of Physical Literacy'}
          {language === 'pt-PT' && 'Questionário de Autoavaliação \n da Literacia Física'}
          {language === 'pt-BR' && 'Questionário de Autoavaliação \n do Letramento Físico'}
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
      {renderSlider()}

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
  finalQuestionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 30,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
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
    top: 10,
    left: 10,
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
    width: '48%', // Permite un pequeño espacio entre imágenes
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 12,
  },
});

export default FormContent;