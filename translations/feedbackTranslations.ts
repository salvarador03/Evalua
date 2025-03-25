import type { Language } from "./types";

export const feedbackTranslations: Record<Language, {
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
  ueqPairs: {
    attractive: string[];
    perspicuity: string[];
    efficiency: string[];
    dependability: string[];
    stimulation: string[];
    novelty: string[];
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
    susDescription: "Por favor, responde las siguientes preguntas sobre la usabilidad del sistema",
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
    ueqTitle: "Cuestionario de Experiencia de Usuario (UEQ)",
    ueqDescription: "Por favor, evalúa las siguientes características del sistema",
    ueqDimensions: {
      attractive: "Atractivo",
      perspicuity: "Perspicuidad",
      efficiency: "Eficiencia",
      dependability: "Confiabilidad",
      stimulation: "Estimulación",
      novelty: "Novedad"
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
        "Valioso - Inferior",
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
    susDescription: "Please answer the following questions about system usability",
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
    ueqTitle: "User Experience Questionnaire (UEQ)",
    ueqDescription: "Please evaluate the following characteristics of the system",
    ueqDimensions: {
      attractive: "Attractiveness",
      perspicuity: "Perspicuity",
      efficiency: "Efficiency",
      dependability: "Dependability",
      stimulation: "Stimulation",
      novelty: "Novelty"
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
        "Valuable - Inferior",
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
    }
  },
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
    susDescription: "Por favor, responde las siguientes preguntas sobre la usabilidad del sistema",
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
    ueqTitle: "Cuestionario de Experiencia de Usuario (UEQ)",
    ueqDescription: "Por favor, evalúa las siguientes características del sistema",
    ueqDimensions: {
      attractive: "Atractivo",
      perspicuity: "Perspicuidad",
      efficiency: "Eficiencia",
      dependability: "Confiabilidad",
      stimulation: "Estimulación",
      novelty: "Novedad"
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
        "Valioso - Inferior",
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
    susDescription: "Por favor, responda às seguintes perguntas sobre a usabilidade do sistema",
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
    ueqTitle: "Questionário de Experiência do Utilizador (UEQ)",
    ueqDescription: "Por favor, avalie as seguintes características do sistema",
    ueqDimensions: {
      attractive: "Atractividade",
      perspicuity: "Perspicuidade",
      efficiency: "Eficiência",
      dependability: "Confiabilidade",
      stimulation: "Estimulação",
      novelty: "Novidade"
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
        "Valioso - Inferior",
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
    susDescription: "Por favor, responda às seguintes perguntas sobre a usabilidade do sistema",
    susQuestions: [
      "Acho que gostaria de usar este sistema frequentemente",
      "Encontrei o sistema desnecessariamente complexo",
      "Pensei que o sistema era fácil de usar",
      "Acho que precisaria do apoio de um técnico para usar este sistema",
      "Encontrei as várias funções do sistema bem integradas",
      "Pensei que havia muita inconsistência neste sistema",
      "Imagino que a maioria das pessoas aprenderia a usar este sistema muito rapidamente",
      "Encontrei o sistema muito incômodo de usar",
      "Senti-me muito confiante usando o sistema",
      "Precisei aprender muitas coisas antes de poder começar com este sistema"
    ],
    ueqTitle: "Questionário de Experiência do Usuário (UEQ)",
    ueqDescription: "Por favor, avalie as seguintes características do sistema",
    ueqDimensions: {
      attractive: "Atratividade",
      perspicuity: "Perspicuidade",
      efficiency: "Eficiência",
      dependability: "Confiabilidade",
      stimulation: "Estimulação",
      novelty: "Novidade"
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
        "Valioso - Inferior",
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
    }
  }
}; 