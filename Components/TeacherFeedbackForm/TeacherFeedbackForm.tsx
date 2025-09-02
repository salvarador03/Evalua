import React, { useState } from "react";
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
    Image,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import db from "@react-native-firebase/database";
import type { Language } from "../../translations/types";
// @ts-ignore: No se encuentra el archivo de tipos, ignorar para evitar error de compilación
import type { FeedbackData } from "./types";

type UeqDimensions = 'attractive' | 'perspicuity' | 'efficiency' | 'dependability' | 'stimulation' | 'novelty';


// --- Contenido de traducción local con descripciones y referencias (MODIFICADO) ---
const feedbackTranslations: Record<Language, {
    feedbackTitle: string;
    editFeedbackTitle: string;
    rateExperience: string;
    overallExperience: string;
    usability: string;
    contentQuality: string;
    visualDesign: string;
    tellUsMore: string;
    improvementSuggestions: string;
    submitFeedback: string;
    updateFeedback: string;
    thankYou: string;
    yourFeedbackHelps: string;
    close: string;
    errorSubmitting: string;
    pleaseTryAgain: string;
    feedbackRequired: string;
    resetFeedback: string;
    susTitle: string;
    susDescription: string;
    susQuestions: string[];
    susReference: {
        text: string;
        url: string;
    };
    ueqTitle: string;
    ueqDescription: string;
    ueqDimensions: {
        attractive: string;
        perspicuity: string;
        efficiency: string;
        dependability: string;
        stimulation: string;
        novelty: string;
    };
    ueqDimensionReferences: {
        attractive: string;
        perspicuity: string;
        efficiency: string;
        dependability: string;
        stimulation: string;
        novelty: string;
    };
    ueqPairs: {
        attractive: string[];
        perspicuity: string[];
        efficiency: string[];
        dependability: string[];
        stimulation: string[];
        novelty: string[];
    };
    ueqPairDescriptions: {
        attractive: string[];
        perspicuity: string[];
        efficiency: string[];
        dependability: string[];
        stimulation: string[];
        novelty: string[];
    };
    personalizedTips: string;
    tips: {
        title: string;
        completed: string;
        needsSupport: string;
        needsReinforcement: string;
        goodLevel: string;
        like: string;
        complete: string;
        favorites: string;
        showQuestion: string;
        low: string;
        medium: string;
        high: string;
        highScore: string;
        mediumScore: string;
        lowScore: string;
        allCompleted: string;
        starCount: string;
    };
}> = {
    es: {
        feedbackTitle: "Tu Opinión",
        editFeedbackTitle: "Editar Opinión",
        rateExperience: "Califica tu experiencia",
        overallExperience: "Experiencia general",
        usability: "Usabilidad",
        contentQuality: "Calidad del contenido",
        visualDesign: "Diseño visual",
        tellUsMore: "Cuéntanos más",
        improvementSuggestions: "Sugerencias de mejora",
        submitFeedback: "Enviar opinión",
        updateFeedback: "Actualizar opinión",
        thankYou: "¡Gracias!",
        yourFeedbackHelps: "Tu opinión nos ayuda a mejorar",
        close: "Cerrar",
        errorSubmitting: "Error al enviar",
        pleaseTryAgain: "Por favor, inténtalo de nuevo",
        feedbackRequired: "Por favor, califica tu experiencia general",
        resetFeedback: "Reiniciar",
        susTitle: "Cuestionario de Usabilidad del Sistema (SUS)",
        susDescription: "Por favor, responde a estas afirmaciones sobre la usabilidad general del sistema. Elige una puntuación del 1 (Totalmente en desacuerdo) al 5 (Totalmente de acuerdo).",
        susQuestions: [
            "Creo que me gustaría usar este sistema frecuentemente",
            "Encontré el sistema innecesariamente complejo",
            "Pensé que el sistema era fácil de usar",
            "Creo que necesitaría el soporte de un técnico para poder usar este sistema",
            "Encontré las diversas funciones del sistema bien integradas",
            "Pensé que había demasiada inconsistencia en este sistema",
            "Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente",
            "Encontré el sistema muy engorroso de usar",
            "Me sentí muy confiado usando el sistema",
            "Necesité aprender muchas cosas antes de poder empezar con este sistema"
        ],
        susReference: {
            text: "Referencia: Brooke, J. (1996). SUS – A quick and dirty usability scale.",
            url: "http://hell.meiert.org/core/pdf/sus.pdf"
        },
        ueqTitle: "Cuestionario de Experiencia de Usuario (UEQ)",
        ueqDescription: "Por favor, evalúa la aplicación en función de los siguientes pares de adjetivos, moviendo el marcador entre ellos. Cuanto más cerca esté de un adjetivo, más de acuerdo estarás con él.",
        ueqDimensions: {
            attractive: "Atractivo",
            perspicuity: "Perspicuidad",
            efficiency: "Eficiencia",
            dependability: "Confiabilidad",
            stimulation: "Estimulación",
            novelty: "Novedad"
        },
        ueqDimensionReferences: {
            attractive: "Mahlke & Lindgaard (2007)",
            perspicuity: "Laugwitz, Held & Schrepp (2008)",
            efficiency: "Norman (2013)",
            dependability: "Schuler & Namioka (1993)",
            stimulation: "Hassenzahl (2008)",
            novelty: "Norman (2004)",
        },
        ueqPairs: {
            attractive: [
                "Aburrido - Atractivo",
                "Poco atractivo - Atractivo",
                "Agradable - Desagradable",
                "Bueno - Malo",
                "Repulsivo - Atractivo"
            ],
            perspicuity: [
                "No es fácil de aprender - Fácil de aprender",
                "Complejo - Simple",
                "Complicado - Fácil",
                "Confuso - Claro"
            ],
            efficiency: [
                "Lento - Rápido",
                "Ineficiente - Eficiente",
                "Poco práctico - Práctico",
                "Organizado - Desorganizado"
            ],
            dependability: [
                "Poco predecible - Predecible",
                "Obstruye - Apoya",
                "Seguro - Inseguro",
                "Fiable - Poco fiable"
            ],
            stimulation: [
                "Inferior - Valioso",
                "Aburrido - Divertido",
                "No inspirador - Inspirador",
                "Monótono - Estimulante"
            ],
            novelty: [
                "Cauteloso - Innovador",
                "Convencional - Inventivo",
                "Tradicional - Moderno",
                "Estable - Avanzado"
            ]
        },
        ueqPairDescriptions: {
            attractive: [
                "¿Cómo describirías la apariencia y sensación de la aplicación?",
                "¿Qué tan bien diseñada visualmente te parece la aplicación?",
                "¿Qué tan placentera es tu interacción con la aplicación?",
                "¿Qué tan alta es tu impresión general sobre la calidad del diseño?",
                "¿Te sientes atraído o repelido por la estética de la aplicación?"
            ],
            perspicuity: [
                "¿Qué tan fácil te ha resultado aprender a usar la aplicación?",
                "¿Consideras que la estructura y las funciones son complejas o simples?",
                "¿El uso de la aplicación es complicado o fácil de entender?",
                "¿Te resulta confuso o claro el diseño de la interfaz?"
            ],
            efficiency: [
                "¿Te parece que la aplicación funciona a una velocidad adecuada?",
                "¿Las tareas se pueden realizar de manera eficiente o ineficiente?",
                "¿Encuentras la aplicación práctica para tus necesidades?",
                "¿La organización del contenido y las funciones es clara?"
            ],
            dependability: [
                "¿El comportamiento de la aplicación es predecible o impredecible?",
                "¿Sientes que la aplicación te ayuda o te obstruye?",
                "¿Te sientes seguro al usar la aplicación?",
                "¿Qué tan fiable consideras el funcionamiento de la aplicación?"
            ],
            stimulation: [
                "¿Qué valor le das a las funciones y contenido de la aplicación?",
                "¿Consideras que la experiencia de uso es aburrida o divertida?",
                "¿La aplicación te inspira a explorar más o no?",
                "¿La interacción con la aplicación es monótona o estimulante?"
            ],
            novelty: [
                "¿Cómo describirías el nivel de innovación de la aplicación?",
                "¿Sientes que la aplicación es inventiva o sigue patrones convencionales?",
                "¿La aplicación se siente moderna o tradicional?",
                "¿Consideras que su diseño es avanzado o estable?"
            ]
        },
        personalizedTips: "Consejos Personalizados",
        tips: {
            title: "Consejos Generales",
            completed: "consejos completados",
            needsSupport: "Necesita apoyo",
            needsReinforcement: "Necesita refuerzo",
            goodLevel: "Buen nivel",
            like: "Me gusta",
            complete: "Completar",
            favorites: "favoritos",
            showQuestion: "Ver pregunta",
            low: "Bajo",
            medium: "Medio",
            high: "Alto",
            highScore: "Tu puntaje es alto. Mantén tu actividad física para mantener tu salud.",
            mediumScore: "Tu puntaje es medio. Mantén tu actividad física para mejorar tu salud.",
            lowScore: "Tu puntaje es bajo. Considera aumentar tu actividad física regularmente.",
            allCompleted: "¡Has completado todos los consejos! 🎉",
            starCount: "Estrellas ganadas:"
        }
    },
    en: {
        feedbackTitle: "Your Feedback",
        editFeedbackTitle: "Edit Feedback",
        rateExperience: "Rate your experience",
        overallExperience: "Overall experience",
        usability: "Usability",
        contentQuality: "Content quality",
        visualDesign: "Visual design",
        tellUsMore: "Tell us more",
        improvementSuggestions: "Improvement suggestions",
        submitFeedback: "Submit feedback",
        updateFeedback: "Update feedback",
        thankYou: "Thank you!",
        yourFeedbackHelps: "Your feedback helps us improve",
        close: "Close",
        errorSubmitting: "Error submitting",
        pleaseTryAgain: "Please try again",
        feedbackRequired: "Please rate your overall experience",
        resetFeedback: "Reset",
        susTitle: "System Usability Scale (SUS)",
        susDescription: "Please respond to these statements about the system's overall usability. Choose a score from 1 (Strongly Disagree) to 5 (Strongly Agree).",
        susQuestions: [
            "I think that I would like to use this system frequently",
            "I found the system unnecessarily complex",
            "I thought the system was easy to use",
            "I think that I would need the support of a technical person to be able to use this system",
            "I found the various functions in this system were well integrated",
            "I thought there was too much inconsistency in this system",
            "I would imagine that most people would learn to use this system very quickly",
            "I found the system very cumbersome to use",
            "I felt very confident using the system",
            "I needed to learn a lot of things before I could get going with this system"
        ],
        susReference: {
            text: "Reference: Brooke, J. (1996). SUS – A quick and dirty usability scale.",
            url: "http://hell.meiert.org/core/pdf/sus.pdf"
        },
        ueqTitle: "User Experience Questionnaire (UEQ)",
        ueqDescription: "Please evaluate the application based on the following pairs of adjectives, moving the slider between them. The closer you are to an adjective, the more you agree with it.",
        ueqDimensions: {
            attractive: "Attractiveness",
            perspicuity: "Perspicuity",
            efficiency: "Efficiency",
            dependability: "Dependability",
            stimulation: "Stimulation",
            novelty: "Novelty"
        },
        ueqDimensionReferences: {
            attractive: "Mahlke & Lindgaard (2007)",
            perspicuity: "Laugwitz, Held & Schrepp (2008)",
            efficiency: "Norman (2013)",
            dependability: "Schuler & Namioka (1993)",
            stimulation: "Hassenzahl (2008)",
            novelty: "Norman (2004)",
        },
        ueqPairs: {
            attractive: [
                "Boring - Attractive",
                "Unattractive - Attractive",
                "Pleasant - Unpleasant",
                "Good - Bad",
                "Repulsive - Attractive"
            ],
            perspicuity: [
                "Not easy to learn - Easy to learn",
                "Complex - Simple",
                "Complicated - Easy",
                "Confusing - Clear"
            ],
            efficiency: [
                "Slow - Fast",
                "Inefficient - Efficient",
                "Impractical - Practical",
                "Desordenado - Ordenado"
            ],
            dependability: [
                "Unpredictable - Predictable",
                "Obstructive - Supportive",
                "Secure - Not secure",
                "Confident - Fearful"
            ],
            stimulation: [
                "Inferior - Valuable",
                "Boring - Exciting",
                "Not interesting - Interesting",
                "Motivating - Demotivating"
            ],
            novelty: [
                "Cautious - Creative",
                "Conventional - Inventive",
                "Usual - Leading edge",
                "Conservative - Innovative"
            ]
        },
        ueqPairDescriptions: {
            attractive: [
                "How would you describe the look and feel of the application?",
                "How well-designed visually do you find the application?",
                "How pleasant is your interaction with the application?",
                "How high is your overall impression of the quality of the design?",
                "Are you drawn to or repelled by the application's aesthetics?"
            ],
            perspicuity: [
                "How easy did you find it to learn how to use the application?",
                "Do you consider the structure and functions complex or simple?",
                "Is the use of the application complicated or easy to understand?",
                "Do you find the interface design confusing or clear?"
            ],
            efficiency: [
                "Do you feel the application works at an adequate speed?",
                "Can tasks be performed efficiently or inefficiently?",
                "Do you find the application practical for your needs?",
                "Is the organization of content and functions clear?"
            ],
            dependability: [
                "Is the application's behavior predictable or unpredictable?",
                "Do you feel the application is obstructive or supportive?",
                "Do you feel secure using the application?",
                "How reliable do you consider the application's operation?"
            ],
            stimulation: [
                "What value do you place on the application's features and content?",
                "Do you find the user experience boring or fun?",
                "Does the application inspire you to explore more or not?",
                "Is the interaction with the application monotonous or stimulating?"
            ],
            novelty: [
                "How would you describe the application's level of innovation?",
                "Do you feel the application is inventive or follows conventional patterns?",
                "Does the application feel modern or traditional?",
                "Do you consider its design advanced or stable?"
            ]
        },
        personalizedTips: "Personalized Tips",
        tips: {
            title: "General Tips",
            completed: "tips completed",
            needsSupport: "Needs support",
            needsReinforcement: "Needs reinforcement",
            goodLevel: "Good level",
            like: "Like",
            complete: "Complete",
            favorites: "favorites",
            showQuestion: "Show question",
            low: "Low",
            medium: "Medium",
            high: "High",
            highScore: "Your score is high. Keep up your physical activity to maintain your health.",
            mediumScore: "Your score is medium. Keep up your physical activity to improve your health.",
            lowScore: "Your score is low. Consider increasing your physical activity regularly.",
            allCompleted: "You've completed all tips! 🎉",
            starCount: "Stars earned:"
        }
    },
    // ... (rest of the languages: es-PA, pt-PT, pt-BR)
    "es-PA": {
        feedbackTitle: "Tu Opinión",
        editFeedbackTitle: "Editar Opinión",
        rateExperience: "Califica tu experiencia",
        overallExperience: "Experiencia general",
        usability: "Usabilidad",
        contentQuality: "Calidad del contenido",
        visualDesign: "Diseño visual",
        tellUsMore: "Cuéntanos más",
        improvementSuggestions: "Sugerencias de mejora",
        submitFeedback: "Enviar opinión",
        updateFeedback: "Actualizar opinión",
        thankYou: "¡Gracias!",
        yourFeedbackHelps: "Tu opinión nos ayuda a mejorar",
        close: "Cerrar",
        errorSubmitting: "Error al enviar",
        pleaseTryAgain: "Por favor, inténtalo de nuevo",
        feedbackRequired: "Por favor, califica tu experiencia general",
        resetFeedback: "Reiniciar",
        susTitle: "Cuestionario de Usabilidad del Sistema (SUS)",
        susDescription: "Por favor, responde a estas afirmaciones sobre la usabilidad general del sistema. Elige una puntuación del 1 (Totalmente en desacuerdo) al 5 (Totalmente de acuerdo).",
        susQuestions: [
            "Creo que me gustaría usar este sistema frecuentemente",
            "Encontré el sistema innecesariamente complejo",
            "Pensé que el sistema era fácil de usar",
            "Creo que necesitaría el soporte de un técnico para poder usar este sistema",
            "Encontré las diversas funciones del sistema bien integradas",
            "Pensé que había demasiada inconsistencia en este sistema",
            "Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente",
            "Encontré el sistema muy engorroso de usar",
            "Me sentí muy confiado usando el sistema",
            "Necesité aprender muchas cosas antes de poder empezar con este sistema"
        ],
        susReference: {
            text: "Referencia: Brooke, J. (1996). SUS – A quick and dirty usability scale.",
            url: "http://hell.meiert.org/core/pdf/sus.pdf"
        },
        ueqTitle: "Cuestionario de Experiencia de Usuario (UEQ)",
        ueqDescription: "Por favor, evalúa la aplicación en función de los siguientes pares de adjetivos, moviendo el marcador entre ellos. Cuanto más cerca esté de un adjetivo, más de acuerdo estarás con él.",
        ueqDimensions: {
            attractive: "Atractivo",
            perspicuity: "Perspicuidad",
            efficiency: "Eficiencia",
            dependability: "Confiabilidad",
            stimulation: "Estimulación",
            novelty: "Novedad"
        },
        ueqDimensionReferences: {
            attractive: "Mahlke & Lindgaard (2007)",
            perspicuity: "Laugwitz, Held & Schrepp (2008)",
            efficiency: "Norman (2013)",
            dependability: "Schuler & Namioka (1993)",
            stimulation: "Hassenzahl (2008)",
            novelty: "Norman (2004)",
        },
        ueqPairs: {
            attractive: [
                "Aburrido - Atractivo",
                "Poco atractivo - Atractivo",
                "Agradable - Desagradable",
                "Bueno - Malo",
                "Repulsivo - Atractivo"
            ],
            perspicuity: [
                "No es fácil de aprender - Fácil de aprender",
                "Complejo - Simple",
                "Complicado - Fácil",
                "Confuso - Claro"
            ],
            efficiency: [
                "Lento - Rápido",
                "Ineficiente - Eficiente",
                "Poco práctico - Práctico",
                "Organizado - Desorganizado"
            ],
            dependability: [
                "Poco predecible - Predecible",
                "Obstruye - Apoya",
                "Seguro - Inseguro",
                "Fiable - Poco fiable"
            ],
            stimulation: [
                "Inferior - Valioso",
                "Aburrido - Divertido",
                "No inspirador - Inspirador",
                "Monótono - Estimulante"
            ],
            novelty: [
                "Cauteloso - Innovador",
                "Convencional - Inventivo",
                "Tradicional - Moderno",
                "Estable - Avanzado"
            ]
        },
        ueqPairDescriptions: {
            attractive: [
                "¿Cómo describirías la apariencia y sensación de la aplicación?",
                "¿Qué tan bien diseñada visualmente te parece la aplicación?",
                "¿Qué tan placentera es tu interacción con la aplicación?",
                "¿Qué tan alta es tu impresión general sobre la calidad del diseño?",
                "¿Te sientes atraído o repelido por la estética de la aplicación?"
            ],
            perspicuity: [
                "¿Qué tan fácil te ha resultado aprender a usar la aplicación?",
                "¿Consideras que la estructura y las funciones son complejas o simples?",
                "¿El uso de la aplicación es complicado o fácil de entender?",
                "¿Te resulta confuso o claro el diseño de la interfaz?"
            ],
            efficiency: [
                "¿Te parece que la aplicación funciona a una velocidad adecuada?",
                "¿Las tareas se pueden realizar de manera eficiente o ineficiente?",
                "¿Encuentras la aplicación práctica para tus necesidades?",
                "¿La organización del contenido y las funciones es clara?"
            ],
            dependability: [
                "¿El comportamiento de la aplicación es predecible o impredecible?",
                "¿Sientes que la aplicación te ayuda o te obstruye?",
                "¿Te sientes seguro al usar la aplicación?",
                "¿Qué tan fiable consideras el funcionamiento de la aplicación?"
            ],
            stimulation: [
                "¿Qué valor le das a las funciones y contenido de la aplicación?",
                "¿Consideras que la experiencia de uso es aburrida o divertida?",
                "¿La aplicación te inspira a explorar más o no?",
                "¿La interacción con la aplicación es monótona o estimulante?"
            ],
            novelty: [
                "¿Cómo describirías el nivel de innovación de la aplicación?",
                "¿Sientes que la aplicación es inventiva o sigue patrones convencionales?",
                "¿La aplicación se siente moderna o tradicional?",
                "¿Consideras que su diseño es avanzado o estable?"
            ]
        },
        personalizedTips: "Consejos Personalizados",
        tips: {
            title: "Consejos Generales",
            completed: "consejos completados",
            needsSupport: "Necesita apoyo",
            needsReinforcement: "Necesita refuerzo",
            goodLevel: "Buen nivel",
            like: "Me gusta",
            complete: "Completar",
            favorites: "favoritos",
            showQuestion: "Ver pregunta",
            low: "Bajo",
            medium: "Medio",
            high: "Alto",
            highScore: "Tu puntaje es alto. Mantén tu actividad física para mantener tu salud.",
            mediumScore: "Tu puntaje es medio. Mantén tu actividad física para mejorar tu salud.",
            lowScore: "Tu puntaje es bajo. Considera aumentar tu actividad física regularmente.",
            allCompleted: "¡Has completado todos los consejos! 🎉",
            starCount: "Estrellas ganadas:"
        }
    },
    "pt-PT": {
        feedbackTitle: "A sua opinião",
        editFeedbackTitle: "Editar opinião",
        rateExperience: "Avalie sua experiência",
        overallExperience: "Experiência geral",
        usability: "Usabilidade",
        contentQuality: "Qualidade do conteúdo",
        visualDesign: "Design visual",
        tellUsMore: "Conte-nos mais",
        improvementSuggestions: "Sugestões de melhoria",
        submitFeedback: "Enviar opinião",
        updateFeedback: "Atualizar opinião",
        thankYou: "Obrigado!",
        yourFeedbackHelps: "Sua opinião nos ajuda a melhorar",
        close: "Fechar",
        errorSubmitting: "Erro ao enviar",
        pleaseTryAgain: "Por favor, tente novamente",
        feedbackRequired: "Por favor, avalie sua experiência geral",
        resetFeedback: "Reiniciar",
        susTitle: "Escala de Usabilidade do Sistema (SUS)",
        susDescription: "Por favor, responda a estas afirmações sobre a usabilidade geral do sistema. Escolha uma pontuação de 1 (Discordo totalmente) a 5 (Concordo totalmente).",
        susQuestions: [
            "Acho que gostaria de usar este sistema frequentemente",
            "Encontrei o sistema desnecessariamente complexo",
            "Pensei que o sistema era fácil de usar",
            "Acho que precisaria do apoio de um técnico para usar este sistema",
            "Encontrei as várias funções do sistema bem integradas",
            "Pensei que havia demasiada inconsistência neste sistema",
            "Imagino que a maioria das pessoas aprenderia a usar este sistema muito rapidamente",
            "Encontrei o sistema muito incómodo de usar",
            "Senti-me muito confiante usando o sistema",
            "Precisei aprender muitas coisas antes de poder começar com este sistema"
        ],
        susReference: {
            text: "Referência: Brooke, J. (1996). SUS – A quick and dirty usability scale.",
            url: "http://hell.meiert.org/core/pdf/sus.pdf"
        },
        ueqTitle: "Questionário de Experiência do Utilizador (UEQ)",
        ueqDescription: "Por favor, avalie a aplicação com base nos seguintes pares de adjetivos, movendo o marcador entre eles. Quanto mais perto de um adjetivo, mais concorda com ele.",
        ueqDimensions: {
            attractive: "Atractividade",
            perspicuity: "Perspicuidade",
            efficiency: "Eficiência",
            dependability: "Confiabilidade",
            stimulation: "Estimulação",
            novelty: "Novidade"
        },
        ueqDimensionReferences: {
            attractive: "Mahlke & Lindgaard (2007)",
            perspicuity: "Laugwitz, Held & Schrepp (2008)",
            efficiency: "Norman (2013)",
            dependability: "Schuler & Namioka (1993)",
            stimulation: "Hassenzahl (2008)",
            novelty: "Norman (2004)",
        },
        ueqPairs: {
            attractive: [
                "Aborrecido - Atractivo",
                "Pouco atractivo - Atractivo",
                "Agradável - Desagradável",
                "Bom - Mau",
                "Repulsivo - Atractivo"
            ],
            perspicuity: [
                "Não é fácil de aprender - Fácil de aprender",
                "Complexo - Simples",
                "Complicado - Fácil",
                "Confuso - Claro"
            ],
            efficiency: [
                "Lento - Rápido",
                "Ineficiente - Eficiente",
                "Imprático - Prático",
                "Desordenado - Ordenado"
            ],
            dependability: [
                "Imprevisível - Previsível",
                "Obstrutivo - Apoiante",
                "Seguro - Inseguro",
                "Confiante - Temeroso"
            ],
            stimulation: [
                "Inferior - Valioso",
                "Aborrecido - Divertido",
                "Não inspirador - Inspirador",
                "Não atractivo - Atractivo"
            ],
            novelty: [
                "Cauteloso - Inovador",
                "Convencional - Inventivo",
                "Usual - Líder",
                "Estável - Avançado"
            ]
        },
        ueqPairDescriptions: {
            attractive: [
                "Como descreveria a aparência e a sensação da aplicação?",
                "Quão bem projetada visualmente a aplicação parece ser?",
                "Quão agradável é a sua interação com a aplicação?",
                "Quão alta é sua impressão geral sobre a qualidade do design?",
                "Sente-se atraído ou repelido pela estética da aplicação?"
            ],
            perspicuity: [
                "Quão fácil foi para si aprender a usar a aplicação?",
                "Considera a estrutura e as funções complexas ou simples?",
                "O uso da aplicação é complicado ou fácil de entender?",
                "Acha o design da interface confuso ou claro?"
            ],
            efficiency: [
                "Acha que a aplicação funciona a uma velocidade adequada?",
                "As tarefas podem ser realizadas de forma eficiente ou ineficiente?",
                "Acha a aplicação prática para as suas necessidades?",
                "A organização do conteúdo e das funções é clara?"
            ],
            dependability: [
                "O comportamento da aplicação é previsível ou imprevisível?",
                "Sente que a aplicação o apoia ou o obstrui?",
                "Sente-se seguro ao usar a aplicação?",
                "Quão fiável considera o funcionamento da aplicação?"
            ],
            stimulation: [
                "Que valor dá às funções e ao conteúdo da aplicação?",
                "Acha a experiência de utilizador aborrecida ou divertida?",
                "A aplicação inspira-o a explorar mais ou não?",
                "A interação com a aplicação é monótona ou estimulante?"
            ],
            novelty: [
                "Como descreveria o nível de inovação da aplicação?",
                "Sente que a aplicação é inventiva ou segue padrões convencionais?",
                "A aplicação parece moderna ou tradicional?",
                "Considera o seu design avançado ou estável?"
            ]
        },
        personalizedTips: "Dicas Personalizadas",
        tips: {
            title: "Dicas Gerais",
            completed: "dicas completadas",
            needsSupport: "Precisa de apoio",
            needsReinforcement: "Precisa de reforço",
            goodLevel: "Bom nível",
            like: "Gosto",
            complete: "Completar",
            favorites: "favoritos",
            showQuestion: "Ver pergunta",
            low: "Baixo",
            medium: "Médio",
            high: "Alto",
            highScore: "Sua pontuação é alta. Mantenha sua atividade física para manter sua saúde.",
            mediumScore: "Sua pontuação é média. Mantenha sua atividade física para melhorar sua saúde.",
            lowScore: "Sua pontuação é baixa. Considere aumentar sua atividade física regularmente.",
            allCompleted: "Você completou todas as dicas! 🎉",
            starCount: "Estrelas ganhas:"
        }
    },
    "pt-BR": {
        feedbackTitle: "Sua opinião",
        editFeedbackTitle: "Editar opinião",
        rateExperience: "Avalie sua experiência",
        overallExperience: "Experiência geral",
        usability: "Usabilidade",
        contentQuality: "Qualidade do conteúdo",
        visualDesign: "Design visual",
        tellUsMore: "Conte-nos mais",
        improvementSuggestions: "Sugestões de melhoria",
        submitFeedback: "Enviar opinião",
        updateFeedback: "Atualizar opinião",
        thankYou: "Obrigado!",
        yourFeedbackHelps: "Sua opinião nos ajuda a melhorar",
        close: "Fechar",
        errorSubmitting: "Erro ao enviar",
        pleaseTryAgain: "Por favor, tente novamente",
        feedbackRequired: "Por favor, avalie sua experiência geral",
        resetFeedback: "Reiniciar",
        susTitle: "Escala de Usabilidade do Sistema (SUS)",
        susDescription: "Por favor, responda a estas afirmações sobre a usabilidade geral do sistema. Escolha uma pontuação de 1 (Discordo totalmente) a 5 (Concordo totalmente).",
        susQuestions: [
            "Acho que gostaria de usar este sistema frequentemente",
            "Encontrei o sistema desnecessariamente complexo",
            "Pensei que o sistema era fácil de usar",
            "Acho que precisaria do apoio de um técnico para usar este sistema",
            "Encontrei as várias funções do sistema bem integradas",
            "Pensei que havia muita inconsistencia neste sistema",
            "Imagino que a maioria das pessoas aprenderia a usar este sistema muito rapidamente",
            "Encontrei o sistema muito incômodo de usar",
            "Senti-me muito confiante usando o sistema",
            "Precisei aprender muitas coisas antes de poder começar com este sistema"
        ],
        susReference: {
            text: "Referência: Brooke, J. (1996). SUS – A quick and dirty usability scale.",
            url: "http://hell.meiert.org/core/pdf/sus.pdf"
        },
        ueqTitle: "Questionário de Experiência do Usuário (UEQ)",
        ueqDescription: "Por favor, avalie a aplicação com base nos seguintes pares de adjetivos, movendo o marcador entre eles. Quanto mais perto de um adjetivo, mais concorda com ele.",
        ueqDimensions: {
            attractive: "Atratividade",
            perspicuity: "Perspicuidade",
            efficiency: "Eficiência",
            dependability: "Confiabilidade",
            stimulation: "Estimulação",
            novelty: "Novidade"
        },
        ueqDimensionReferences: {
            attractive: "Mahlke & Lindgaard (2007)",
            perspicuity: "Laugwitz, Held & Schrepp (2008)",
            efficiency: "Norman (2013)",
            dependability: "Schuler & Namioka (1993)",
            stimulation: "Hassenzahl (2008)",
            novelty: "Norman (2004)",
        },
        ueqPairs: {
            attractive: [
                "Chato - Atraente",
                "Pouco atraente - Atraente",
                "Agradável - Desagradável",
                "Bom - Ruim",
                "Repulsivo - Atraente"
            ],
            perspicuity: [
                "Não é fácil de aprender - Fácil de aprender",
                "Complexo - Simples",
                "Complicado - Fácil",
                "Confuso - Claro"
            ],
            efficiency: [
                "Lento - Rápido",
                "Ineficiente - Eficiente",
                "Imprático - Prático",
                "Desordenado - Ordenado"
            ],
            dependability: [
                "Imprevisível - Previsível",
                "Obstrutivo - Apoiador",
                "Seguro - Inseguro",
                "Confiante - Temeroso"
            ],
            stimulation: [
                "Inferior - Valioso",
                "Chato - Divertido",
                "Não inspirador - Inspirador",
                "Monótono - Estimulante"
            ],
            novelty: [
                "Cauteloso - Inovador",
                "Convencional - Inventivo",
                "Usual - Líder",
                "Estável - Avançado"
            ]
        },
        ueqPairDescriptions: {
            attractive: [
                "Como descreveria a aparência e a sensação da aplicação?",
                "Quão bem projetada visualmente a aplicação parece ser?",
                "Quão agradável é a sua interação com a aplicação?",
                "Quão alta é sua impressão geral sobre a qualidade do design?",
                "Sente-se atraído ou repelido pela estética da aplicação?"
            ],
            perspicuity: [
                "Quão fácil foi para si aprender a usar a aplicação?",
                "Considera a estrutura e as funções complexas ou simples?",
                "O uso da aplicação é complicado ou fácil de entender?",
                "Acha o design da interface confuso ou claro?"
            ],
            efficiency: [
                "Acha que a aplicação funciona a uma velocidade adequada?",
                "As tarefas podem ser realizadas de forma eficiente ou ineficiente?",
                "Acha a aplicação prática para as suas necessidades?",
                "A organização do conteúdo e das funções é clara?"
            ],
            dependability: [
                "O comportamento da aplicação é previsível ou imprevisível?",
                "Sente que a aplicação o apoia ou o obstrui?",
                "Sente-se seguro ao usar a aplicação?",
                "Quão fiável considera o funcionamento da aplicação?"
            ],
            stimulation: [
                "Que valor dá às funções e ao conteúdo da aplicação?",
                "Acha a experiência de utilizador aborrecida ou divertida?",
                "A aplicação inspira-o a explorar mais ou não?",
                "A interação com a aplicação é monótona ou estimulante?"
            ],
            novelty: [
                "Como descreveria o nível de inovação da aplicação?",
                "Sente que a aplicação é inventiva ou segue padrões convencionales?",
                "A aplicação parece moderna ou tradicional?",
                "Considera o seu design avançado ou estável?"
            ]
        },
        personalizedTips: "Dicas Personalizadas",
        tips: {
            title: "Dicas Gerais",
            completed: "dicas completadas",
            needsSupport: "Precisa de apoio",
            needsReinforcement: "Precisa de reforço",
            goodLevel: "Bom nível",
            like: "Gosto",
            complete: "Completar",
            favorites: "favoritos",
            showQuestion: "Ver pergunta",
            low: "Baixo",
            medium: "Medio",
            high: "Alto",
            highScore: "Sua pontuação é alta. Mantenha sua atividade física para manter sua saúde.",
            mediumScore: "Sua pontuação é média. Mantenha sua atividade física para melhorar sua saúde.",
            lowScore: "Sua pontuação é baixa. Considere aumentar sua atividade física regularmente.",
            allCompleted: "Você completou todas as dicas! 🎉",
            starCount: "Estrelas ganhas:"
        }
    }
};

const ueqFullReferences = {
    es: {
        attractive: "Mahlke, S., & Lindgaard, G. (2007). Emotional and Aesthetic Aspects of User Experience. En Actas de la Conferencia HCI 2007: The Bigger Picture.",
        perspicuity: "Laugwitz, B., Held, T., & Schrepp, M. (2008). Construction and Evaluation of a User Experience Questionnaire. En Lecture Notes in Computer Science, Vol. 4882, pp. 63-76.",
        efficiency: "Norman, D. (2013). The Design of Everyday Things. (Edición revisada). Basic Books.",
        dependability: "Schuler, D. & Namioka, A. (1993). Participatory Design: Principles and Practices. Lawrence Erlbaum Associates.",
        stimulation: "Hassenzahl, M. (2008). User Experience and Emotions. En The Human-Computer Interaction Handbook. CRC Press.",
        novelty: "Norman, D. A. (2004). Emotional Design: Why We Love (or Hate) Everyday Things. Basic Books.",
    },
    en: {
        attractive: "Mahlke, S., & Lindgaard, G. (2007). Emotional and Aesthetic Aspects of User Experience. In Proceedings of the 21st British HCI Group Annual Conference on HCI 2007: The Bigger Picture.",
        perspicuity: "Laugwitz, B., Held, T., & Schrepp, M. (2008). Construction and Evaluation of a User Experience Questionnaire. In Lecture Notes in Computer Science, Vol. 4882, pp. 63-76.",
        efficiency: "Norman, D. (2013). The Design of Everyday Things. (Revised Edition). Basic Books.",
        dependability: "Schuler, D. & Namioka, A. (1993). Participatory Design: Principles and Practices. Lawrence Erlbaum Associates.",
        stimulation: "Hassenzahl, M. (2008). User Experience and Emotions. In The Human-Computer Interaction Handbook. CRC Press.",
        novelty: "Norman, D. A. (2004). Emotional Design: Why We Love (or Hate) Everyday Things. Basic Books.",
    },
    "es-PA": {
        attractive: "Mahlke, S., & Lindgaard, G. (2007). Emotional and Aesthetic Aspects of User Experience. En Actas de la Conferencia HCI 2007: The Bigger Picture.",
        perspicuity: "Laugwitz, B., Held, T., & Schrepp, M. (2008). Construction and Evaluation of a User Experience Questionnaire. En Lecture Notes in Computer Science, Vol. 4882, pp. 63-76.",
        efficiency: "Norman, D. (2013). The Design of Everyday Things. (Edición revisada). Basic Books.",
        dependability: "Schuler, D. & Namioka, A. (1993). Participatory Design: Principles and Practices. Lawrence Erlbaum Associates.",
        stimulation: "Hassenzahl, M. (2008). User Experience and Emotions. En The Human-Computer Interaction Handbook. CRC Press.",
        novelty: "Norman, D. A. (2004). Emotional Design: Why We Love (or Hate) Everyday Things. Basic Books.",
    },
    "pt-PT": {
        attractive: "Mahlke, S., & Lindgaard, G. (2007). Emotional and Aesthetic Aspects of User Experience. Em Atas da 21ª Conferência Anual do Grupo HCI Britânico sobre HCI 2007.",
        perspicuity: "Laugwitz, B., Held, T., & Schrepp, M. (2008). Construction and Evaluation of a User Experience Questionnaire. Em Lecture Notes in Computer Science, Vol. 4882, pp. 63-76.",
        efficiency: "Norman, D. (2013). O Design das Coisas do Dia a Dia. (Edição revista). Basic Books.",
        dependability: "Schuler, D. & Namioka, A. (1993). Participatory Design: Principles and Practices. Lawrence Erlbaum Associates.",
        stimulation: "Hassenzahl, M. (2008). User Experience and Emotions. Em The Human-Computer Interaction Handbook. CRC Press.",
        novelty: "Norman, D. A. (2004). Emotional Design: Why We Love (or Hate) Everyday Things. Basic Books.",
    },
    "pt-BR": {
        attractive: "Mahlke, S., & Lindgaard, G. (2007). Emotional and Aesthetic Aspects of User Experience. Em Anais da 21ª Conferência Anual do Grupo HCI Britânico sobre HCI 2007.",
        perspicuity: "Laugwitz, B., Held, T., & Schrepp, M. (2008). Construction and Evaluation of a User Experience Questionnaire. Em Lecture Notes in Computer Science, Vol. 4882, pp. 63-76.",
        efficiency: "Norman, D. (2013). O Design do Dia a Dia. (Edição revisada). Basic Books.",
        dependability: "Schuler, D. & Namioka, A. (1993). Participatory Design: Principles and Practices. Lawrence Erlbaum Associates.",
        stimulation: "Hassenzahl, M. (2008). User Experience and Emotions. Em The Human-Computer Interaction Handbook. CRC Press.",
        novelty: "Norman, D. A. (2004). Emotional Design: Why We Love (or Hate) Everyday Things. Basic Books.",
    }
};

interface TeacherFeedbackFormProps {
    visible: boolean;
    onClose: () => void;
    language: Language;
    userId: string;
    formType: string;
}

const TeacherFeedbackForm: React.FC<TeacherFeedbackFormProps> = ({
    visible,
    onClose,
    language: initialLanguage,
    userId,
    formType,
}) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [language, setLanguage] = useState<Language>(initialLanguage);
    const [susScores, setSusScores] = useState<number[]>(Array(10).fill(0));
    const [ueqScores, setUeqScores] = useState({
        attractive: Array(5).fill(0),
        perspicuity: Array(4).fill(0),
        efficiency: Array(4).fill(0),
        dependability: Array(4).fill(0),
        stimulation: Array(4).fill(0),
        novelty: Array(4).fill(0),
    });
    const [generalFeedback, setGeneralFeedback] = useState("");
    const [improvementSuggestions, setImprovementSuggestions] = useState("");

    const t = feedbackTranslations[language as keyof typeof feedbackTranslations] || feedbackTranslations.es;

    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage);
    };

    const handleSusChange = (index: number, value: number) => {
        const newScores = [...susScores];
        newScores[index] = value;
        setSusScores(newScores);
    };

    const handleUeqChange = (dimension: keyof typeof ueqScores, index: number, value: number) => {
        const newScores = { ...ueqScores };
        newScores[dimension][index] = value;
        setUeqScores(newScores);
    };

    const calculateSusScore = (): number => {
        let total = 0;
        susScores.forEach((score, index) => {
            if (index % 2 !== 0) {
                total += score - 1;
            } else {
                total += 5 - score;
            }
        });
        return total * 2.5;
    };

    const handleSubmit = async () => {
        if (susScores.some(score => score === 0)) {
            Alert.alert(t.errorSubmitting, t.feedbackRequired);
            return;
        }

        setLoading(true);

        try {
            const timestamp = Date.now();
            const feedbackId = `${userId}_${formType}_${timestamp}`;

            const feedbackData: FeedbackData = {
                userId,
                formType,
                ratings: {
                    overall: calculateSusScore(),
                    usability: 0,
                    content: 0,
                    design: 0,
                },
                sus: {
                    scores: susScores,
                    total: calculateSusScore(),
                },
                ueq: ueqScores,
                comments: {
                    generalFeedback,
                    improvementSuggestions,
                },
                language,
                submittedAt: timestamp,
                lastModified: timestamp,
            };

            await db().ref(`/feedback/${feedbackId}`).set(feedbackData);
            setSubmitted(true);
        } catch (error) {
            console.error("[handleSubmit] Error:", error);
            Alert.alert(t.errorSubmitting, t.pleaseTryAgain);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSusScores(Array(10).fill(0));
        setUeqScores({
            attractive: Array(5).fill(0),
            perspicuity: Array(4).fill(0),
            efficiency: Array(4).fill(0),
            dependability: Array(4).fill(0),
            stimulation: Array(4).fill(0),
            novelty: Array(4).fill(0),
        });
        setGeneralFeedback("");
        setImprovementSuggestions("");
    };

    const renderSusQuestion = (question: string, index: number) => (
        <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{question}</Text>
            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <TouchableOpacity
                        key={value}
                        style={[
                            styles.ratingButton,
                            susScores[index] === value && styles.ratingButtonActive,
                        ]}
                        onPress={() => handleSusChange(index, value)}
                    >
                        <Text
                            style={[
                                styles.ratingButtonText,
                                susScores[index] === value && styles.ratingButtonTextActive,
                            ]}
                        >
                            {value}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderUeqPair = (dimension: keyof typeof ueqScores, pair: string, index: number, description: string) => (
        <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{description}</Text>
            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <TouchableOpacity
                        key={value}
                        style={[
                            styles.ratingButton,
                            ueqScores[dimension][index] === value && styles.ratingButtonActive,
                        ]}
                        onPress={() => handleUeqChange(dimension, index, value)}
                    >
                        <Text
                            style={[
                                styles.ratingButtonText,
                                ueqScores[dimension][index] === value && styles.ratingButtonTextActive,
                            ]}
                        >
                            {value}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.pairText}>{pair}</Text>
        </View>
    );

    const getFlagSource = (lang: Language) => {
        switch (lang) {
            case "es":
                return require("../../assets/flags/spain.webp");
            case "en":
                return require("../../assets/flags/usa.webp");
            case "pt-PT":
                return require("../../assets/flags/portugal.webp");
            case "pt-BR":
                return require("../../assets/flags/brazil.webp");
            default:
                return require("../../assets/flags/spain.webp");
        }
    };

    const handleSusReferencePress = () => {
        if (t.susReference && t.susReference.url) {
            Linking.openURL(t.susReference.url).catch(err => console.error("Failed to open URL:", err));
        }
    };


    const handleUeqReferencePress = (dimension: UeqDimensions) => {
        const fullReference = ueqFullReferences[language as keyof typeof ueqFullReferences]?.[dimension];
        if (fullReference) {
            Alert.alert("Referencia UEQ", fullReference);
        } else {
            Alert.alert("Referencia no encontrada", "No se encontró información detallada para esta dimensión.");
        }
    };

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
                            color="#4CAF50"
                            style={styles.successIcon}
                        />
                        <Text style={styles.thankYouTitle}>{t.thankYou}</Text>
                        <Text style={styles.thankYouText}>{t.yourFeedbackHelps}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>{t.close}</Text>
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.headerContent}>
                            <Text style={styles.modalTitle}>{t.feedbackTitle}</Text>
                            <View style={styles.languageSelector}>
                                <TouchableOpacity
                                    style={[styles.flagButton, language === "es" && styles.flagButtonActive]}
                                    onPress={() => handleLanguageChange("es")}
                                >
                                    <Image
                                        source={getFlagSource("es")}
                                        style={styles.flagImage}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.flagButton, language === "en" && styles.flagButtonActive]}
                                    onPress={() => handleLanguageChange("en")}
                                >
                                    <Image
                                        source={getFlagSource("en")}
                                        style={styles.flagImage}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.flagButton, language === "pt-PT" && styles.flagButtonActive]}
                                    onPress={() => handleLanguageChange("pt-PT")}
                                >
                                    <Image
                                        source={getFlagSource("pt-PT")}
                                        style={styles.flagImage}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.flagButton, language === "pt-BR" && styles.flagButtonActive]}
                                    onPress={() => handleLanguageChange("pt-BR")}
                                >
                                    <Image
                                        source={getFlagSource("pt-BR")}
                                        style={styles.flagImage}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#594545" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView}>
                        {/* SUS Section */}
                        <View style={styles.section}>
                            <View style={styles.titleWithReference}>
                                <Text style={styles.sectionTitle}>{t.susTitle}</Text>
                                <TouchableOpacity onPress={handleSusReferencePress}>
                                    <Text style={styles.referenceText}>
                                        <Ionicons name="information-circle-outline" size={16} color="#666" />
                                        {` ${t.susReference.text}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.sectionDescription}>{t.susDescription}</Text>
                            {t.susQuestions.map((question, index) => renderSusQuestion(question, index))}
                        </View>

                        {/* UEQ Section */}
                        <View style={styles.section}>
                            <View style={styles.titleWithReference}>
                                <Text style={styles.sectionTitle}>{t.ueqTitle}</Text>
                            </View>
                            <Text style={styles.sectionDescription}>{t.ueqDescription}</Text>

                            {Object.entries(t.ueqPairs).map(([dimension, pairs], dimensionIndex) => (
                                <View key={dimension} style={styles.dimensionSection}>
                                    <View style={styles.titleWithReference}>
                                        <Text style={styles.dimensionTitle}>
                                            {t.ueqDimensions[dimension as UeqDimensions]}
                                        </Text>
                                        <TouchableOpacity onPress={() => handleUeqReferencePress(dimension as UeqDimensions)}>
                                            <Text style={styles.dimensionInfoText}>
                                                <Ionicons name="information-circle-outline" size={16} color="#666" />
                                                {` ${t.ueqDimensionReferences[dimension as UeqDimensions]}`}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {pairs.map((pair, index) =>
                                        renderUeqPair(
                                            dimension as keyof typeof ueqScores,
                                            pair,
                                            index,
                                            t.ueqPairDescriptions[dimension as keyof typeof t.ueqPairDescriptions][index]
                                        )
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* General Feedback Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t.tellUsMore}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={generalFeedback}
                                onChangeText={setGeneralFeedback}
                                placeholder={t.tellUsMore}
                                placeholderTextColor="#B4AAAA"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {/* Improvement Suggestions Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t.improvementSuggestions}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={improvementSuggestions}
                                onChangeText={setImprovementSuggestions}
                                placeholder={t.improvementSuggestions}
                                placeholderTextColor="#B4AAAA"
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={resetForm}
                            disabled={loading}
                        >
                            <Text style={styles.resetButtonText}>{t.resetFeedback}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>{t.submitFeedback}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 14,
        padding: 20,
        width: "90%",
        height: "90%",
        maxWidth: 500,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#594545",
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#594545",
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
    },
    dimensionSection: {
        marginBottom: 20,
    },
    dimensionTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#594545",
        marginBottom: 12,
    },
    titleWithReference: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    referenceText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 8,
        flexShrink: 1,
    },
    questionContainer: {
        marginBottom: 16,
    },
    questionText: {
        fontSize: 14,
        color: "#594545",
        marginBottom: 8,
    },
    pairText: {
        fontSize: 12,
        color: "#594545",
        marginTop: 4,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ratingButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#9E7676",
    },
    ratingButtonText: {
        fontSize: 16,
        color: "#9E7676",
        fontWeight: "500",
    },
    ratingButtonTextActive: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    ratingButtonActive: {
        backgroundColor: "#9E7676",
        borderColor: "#9E7676",
    },
    textInput: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#eee",
        minHeight: 100,
        textAlignVertical: "top",
        color: "#594545",
        fontSize: 15,
    },
    buttonContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    resetButton: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#9E7676",
    },
    resetButtonText: {
        color: "#9E7676",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        flex: 1,
        backgroundColor: "#9E7676",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
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
        color: "#594545",
        marginBottom: 10,
        textAlign: "center",
    },
    thankYouText: {
        fontSize: 16,
        color: "#594545",
        textAlign: "center",
        marginBottom: 25,
    },
    closeButton: {
        backgroundColor: "#9E7676",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
    },
    closeButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    languageSelector: {
        flexDirection: 'row',
        marginLeft: 10,
        gap: 8,
    },
    flagButton: {
        width: 32,
        height: 24,
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#B4AAAA',
        backgroundColor: '#f5f5f5',
    },
    flagButtonActive: {
        borderWidth: 2,
        borderColor: '#9E7676',
        backgroundColor: '#fff',
        shadowColor: '#9E7676',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    flagImage: {
        width: '100%',
        height: '100%',
    },
    dimensionInfoText: {
        fontSize: 12,
        color: "#666",
        fontStyle: 'italic',
        marginLeft: 8,
    }
});

export default TeacherFeedbackForm;