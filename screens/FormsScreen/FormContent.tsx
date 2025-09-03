import React, { useEffect, useCallback, useState } from 'react';
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
// Importar componente de feedback
import FormCompletionFeedback from '../../Components/FormCompletionFeedback/FormCompletionFeedback';

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
  readOnly?: boolean;
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
  readOnly = false,
}) => {
  // Estado para controlar el modal de feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  // Función para manejar la finalización del formulario
  const handleFormSubmitted = useCallback(() => {
    setFormSubmitted(true);
    setShowFeedback(true);
  }, []);

  // Después de enviar el feedback, llamar al onSubmit original
  const handleFeedbackCompleted = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  // Modificar la función confirmAnswer en el componente FormContent
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
            onPress: () => {
              // Primero marcamos como enviado, lo que mostrará el feedback
              handleFormSubmitted();
              // También llamamos directamente a onSubmit
              onSubmit();
            }
          }
        ]
      );
    } else {
      // Para preguntas individuales...
    }
  }, [answers, currentQuestion, language, currentQuestions, handleFormSubmitted]);

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
    readOnly ? true : answers[currentQuestion] !== null,
    [answers, currentQuestion, readOnly]
  );

  // Memoizar la función handleNext
  const handleNext = useCallback(() => {
    if (!canProceedToNext()) {
      if (!readOnly) {
        Alert.alert(
          translations[language].requiredAnswer,
          translations[language].pleaseSelectValue,
          [{ text: "OK", style: "default" }]
        );
      }
      return;
    }
    onQuestionChange('next');
  }, [canProceedToNext, language, onQuestionChange, readOnly]);

  const handleSubmit = useCallback(() => {
    // En modo solo lectura, no validar respuestas
    if (readOnly) {
      return;
    }
    
    // Verificar si hay alguna pregunta sin responder
    const hasUnansweredQuestions = answers.some(answer => answer === null);
    
    if (hasUnansweredQuestions) {
      Alert.alert(
        translations[language].incompleteAnswers,
        translations[language].pleaseAnswerAll,
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    confirmAnswer(() => { });
  }, [answers, language, confirmAnswer, readOnly]);

  // Memoizar la función handleAnswerChange
  const handleAnswerChange = useCallback((value: number) => {
    if (readOnly) {
      return; // No hacer nada en modo solo lectura
    }
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    onAnswerChange(newAnswers);
  }, [answers, currentQuestion, onAnswerChange, readOnly]);

  // Traducción de la última pregunta para niños
  const lastKidsQuestionTranslations = {
    'es': {
      title: 'Tener una buena alfabetización física significa:',
      options: [
        'Tener una buena condición física.',
        'Saber mucho sobre la Educación Física.',
        'Tener interés y ganas de hacer actividad física.',
        'Hacer amigos/as gracias a la actividad física.',
        'Ser más seguro/a cuando se hace actividad física.',
        'Hacer bien actividad física.',
        'Hacer actividad física varias veces a la semana.'
      ],
      finalQuestion: 'Una vez que sabes qué es la alfabetización física. En comparación con los/las niños/as de mi edad, mi alfabetización física es:'
    },
    'es-PA': {
      title: 'Tener una buena alfabetización física significa:',
      options: [
        'Tener una buena condición física.',
        'Saber mucho sobre la Educación Física.',
        'Tener interés y ganas de hacer actividad física.',
        'Hacer amigos/as gracias a la actividad física.',
        'Ser más seguro/a cuando se hace actividad física.',
        'Hacer bien actividad física.',
        'Hacer actividad física varias veces a la semana.'
      ],
      finalQuestion: 'Una vez que sabes qué es la alfabetización física. En comparación con los/las niños/as de mi edad, mi alfabetización física es:'
    },
    'en': {
      title: 'Having good physical literacy means:',
      options: [
        'Having good physical fitness.',
        'Knowing a lot about Physical Education.',
        'Having interest and desire to do physical activity.',
        'Making friends through physical activity.',
        'Being more confident when doing physical activity.',
        'Doing physical activity well.',
        'Doing physical activity several times a week.'
      ],
      finalQuestion: 'Now that you know what physical literacy is. Compared to children my age, my physical literacy is:'
    },
    'pt-PT': {
      title: 'Ter uma boa literacia física significa:',
      options: [
        'Ter uma boa condição física.',
        'Saber muito sobre Educação Física.',
        'Ter interesse e vontade de fazer atividade física.',
        'Fazer amigos através da atividade física.',
        'Ser mais seguro ao fazer atividade física.',
        'Fazer bem atividade física.',
        'Fazer atividade física várias vezes por semana.'
      ],
      finalQuestion: 'Agora que sabes o que é literacia física. Em comparação com as crianças da minha idade, a minha literacia física é:'
    },
    'pt-BR': {
      title: 'Ter um bom letramento físico significa:',
      options: [
        'Ter uma boa condição física.',
        'Saber muito sobre Educação Física.',
        'Ter interesse e vontade de fazer atividade física.',
        'Fazer amigos através da atividade física.',
        'Ser mais seguro ao fazer atividade física.',
        'Fazer bem atividade física.',
        'Fazer atividade física várias vezes por semana.'
      ],
      finalQuestion: 'Agora que você sabe o que é letramento físico. Em comparação com as crianças da minha idade, meu letramento físico é:'
    }
  };

  const getImageGridForKids = (images: typeof childQuestionImages) => (
    <View style={styles.multipleImagesContainer}>
      <View style={styles.kidsHeaderContainer}>
        <Text style={styles.kidsTitle}>
          {lastKidsQuestionTranslations[language].title}
        </Text>
      </View>

      <View style={styles.collageContainer}>
        <View style={styles.collageRow}>
          <View style={styles.collageItem}>
            <View style={styles.imageContainer}>
              <Image source={images[0]} style={styles.collageImage} resizeMode="cover" />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>A</Text>
              </View>
            </View>
            <View style={styles.collageLabel}>
              <Text style={styles.collageText}>{lastKidsQuestionTranslations[language].options[0]}</Text>
            </View>
          </View>
          <View style={styles.collageItem}>
            <View style={styles.imageContainer}>
              <Image source={images[2]} style={styles.collageImage} resizeMode="cover" />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>B</Text>
              </View>
            </View>
            <View style={styles.collageLabel}>
              <Text style={styles.collageText}>{lastKidsQuestionTranslations[language].options[1]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.collageRow}>
          <View style={styles.collageItem}>
            <View style={styles.imageContainer}>
              <Image source={images[3]} style={styles.collageImage} resizeMode="cover" />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>C</Text>
              </View>
            </View>
            <View style={styles.collageLabel}>
              <Text style={styles.collageText}>{lastKidsQuestionTranslations[language].options[2]}</Text>
            </View>
          </View>
          <View style={styles.collageItem}>
            <View style={styles.imageContainer}>
              <Image source={images[4]} style={styles.collageImage} resizeMode="cover" />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>D</Text>
              </View>
            </View>
            <View style={styles.collageLabel}>
              <Text style={styles.collageText}>{lastKidsQuestionTranslations[language].options[3]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.collageRow}>
          <View style={styles.collageItem}>
            <View style={styles.imageContainer}>
              <Image source={images[5]} style={styles.collageImage} resizeMode="cover" />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>E</Text>
              </View>
            </View>
            <View style={styles.collageLabel}>
              <Text style={styles.collageText}>{lastKidsQuestionTranslations[language].options[4]}</Text>
            </View>
          </View>
          <View style={styles.collageItem}>
            <View style={styles.imageContainer}>
              <Image source={images[6]} style={styles.collageImage} resizeMode="cover" />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>F</Text>
              </View>
            </View>
            <View style={styles.collageLabel}>
              <Text style={styles.collageText}>{lastKidsQuestionTranslations[language].options[5]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.collageRow}>
          <View style={[styles.collageItem, styles.fullWidthItem]}>
            <View style={styles.imageContainer}>
              <Image source={images[1]} style={styles.collageImage} resizeMode="cover" />
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>G</Text>
              </View>
            </View>
            <View style={styles.collageLabel}>
              <Text style={styles.collageText}>{lastKidsQuestionTranslations[language].options[6]}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.finalQuestionContainer}>
        <View style={styles.finalQuestionContent}>
          <Text style={styles.finalQuestionText}>
            {lastQuestionTranslations.finalText[language as keyof typeof lastQuestionTranslations.finalText]}
          </Text>
        </View>
      </View>
    </View>
  );

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
        readOnly={readOnly}
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
              answers[currentQuestions.length - 1] === null && styles.disabledButton,
            ]}
            disabled={answers[currentQuestions.length - 1] === null}
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

      {/* Botón de valoración y Componente de Feedback */}
      {formSubmitted && !showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>
            {language === 'es' && '¡Gracias por completar el formulario!'}
            {language === 'en' && 'Thank you for completing the form!'}
            {language === 'pt-PT' && 'Obrigado por completar o formulário!'}
            {language === 'pt-BR' && 'Obrigado por completar o formulário!'}
          </Text>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => setShowFeedback(true)}
          >
            <Ionicons name="star" size={24} color="#fff" />
            <Text style={styles.feedbackButtonText}>
              {language === 'es' && 'Valora tu experiencia'}
              {language === 'en' && 'Rate your experience'}
              {language === 'pt-PT' && 'Avalie sua experiência'}
              {language === 'pt-BR' && 'Avalie sua experiência'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  feedbackContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  collageContainer: {
    width: '100%',
    padding: 10,
    gap: 15,
  },
  collageRow: {
    flexDirection: 'row',
    gap: 15,
  },
  collageItem: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthItem: {
    flex: 2,
  },
  collageImage: {
    width: '100%',
    height: 120,
  },
  collageLabel: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  collageLetter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 5,
  },
  collageText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  finalQuestionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  kidsHeaderContainer: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  kidsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  kidsSubtitle: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  letterBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#4ade80',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  letterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalQuestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});