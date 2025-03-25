//Components/LanguageSelection/Translations

export type Language = "es" | "en" | "pt-PT" | "pt-BR" | "es-PA";

export interface TranslationText {
  // Textos básicos de navegación e interfaz
  welcome: string;
  selectLanguage: string;
  startButton: string;
  question: string;
  of: string;
  next: string;
  previous: string;
  finish: string;
  selectLevel: string;
  required: string;
  loading: string;

  // Información de idioma y país
  languageName: string;
  countryName: string;

  // Mensajes específicos del formulario
  tellUsAboutPhysical: string;
  pleaseSelectValue: string;
  incompleteAnswers: string;
  pleaseAnswerAll: string;
  submitAnswers: string;
  confirmSubmit: string;

  // Botones y acciones
  cancel: string;
  submit: string;

  // Mensajes de estado y respuesta
  success: string;
  answersSubmitted: string;
  error: string;
  couldNotSave: string;
  pleaseAuthenticate: string;

  // Traducciones faltantes
  completedFormTitle: string;
  completedOn: string;
  yourScore: string;
  comparativeTitle: string;
  groupMedian: string;
  requiredAnswer: string;

  couldNotCalculateStats: string;
  formAlreadyCompleted: string;
  languageSelectionError: string;

  // Notification related translations
  welcomeTitle: string;
  welcomeMessage: string;
  formCompletedTitle: string;
  formCompletedMessage: string;
  noNotifications: string;
  notifications: string;
  markAsRead: string;
  notificationDeleted: string;
  loadingNotifications: string;

  // Añadir nuevas traducciones para notificaciones
  confirmation: string;
  deleteNotificationConfirm: string;
  delete: string;
  couldNotDelete: string;
  couldNotUpdate: string;
  markAllAsRead: string;

  confirmAnswer: string;
  selectedScore: string;
  confirmScoreQuestion: string;

  // Nuevas traducciones para ResultsView
  myResponses: string;
  compareWithOthers: string;
  studentResponses: string;
  class: string;
  global: string;
  country: string;
  age: string;
  students: string;
  score: string; // Changed from yourScore to avoid duplicate
  median: string;
  belowMedian: string;
  aboveMedian: string;
  atMedian: string;
  distribution: string;
  howToInterpret: string;
  howToInterpretText: string;
  scoreDistribution: string;
  comparisonByLevel: string;
  classComparison: string;
  globalComparison: string;
  countryComparison: string;
  ageComparison: string;
  lowLevel: string;
  mediumLevel: string;
  highLevel: string;
  teacherView: string;
  classCode: string;
  pending: string;
  optimalLevel: string;
  goodLevel: string;
  needsReinforcement: string;
  needsSupport: string;
  pendingResponse: string;
  excellentGlobalUnderstanding: string;
  goodComponentsUnderstanding: string;
  basicUnderstanding: string;
  needsFundamentalReview: string;
  excellentComponentLevel: string;
  goodComponentLevel: string;
  acceptableLevel: string;
  needsImprovement: string;

  selectFiltersToCompare: string;

  years: string;

  noDataAvailable: string;

  total: string;

  colorBands: string;
  superior: string;
  exceptionalPerformance: string;
  high: string;
  aboveAverage: string;
  medium: string;
  withinTypicalRange: string;
  low: string;
  potentialImprovementArea: string;
  yourPosition: string;
  isAtPercentile: string;
  thisMeans: string;
  youSurpass: string;
  ofStudents: string;
  comparison: string;
  totalStudents: string;

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
  personalizedTips: string;
  excellentWork: string;
  goodPhysicalActivity: string;
  tips: {
    physicalActivity: string;
    posture: string;
    variety: string;
    goals: string;
    hydration: string;
    rest: string;
    enjoyment: string;
    consistency: string;
  };

  showQuestion: string;
}

export interface Translations {
  [key: string]: TranslationText;
}

export const translations: Record<Language, TranslationText> = {
  es: {
    welcome: "¡Bienvenido!",
    languageSelectionError: "No se pudo guardar la selección de idioma",
    formAlreadyCompleted: "Ya has completado este formulario anteriormente.",
    selectLanguage: "Selecciona tu idioma",
    confirmAnswer: "Confirmar respuesta",
    selectedScore: "Has seleccionado",
    confirmScoreQuestion: "¿Estás seguro de esta puntuación?",
    startButton: "Comenzar",
    question: "Pregunta",
    of: "de",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Terminar",
    // Nuevas traducciones
    confirmation: "Confirmación",
    deleteNotificationConfirm:
      "¿Estás seguro de que deseas eliminar esta notificación?",
    delete: "Eliminar",
    couldNotDelete: "No se pudo eliminar la notificación",
    couldNotUpdate: "No se pudieron actualizar las notificaciones",
    markAllAsRead: "Marcar todas como leídas",
    couldNotCalculateStats:
      "No se pudieron calcular las estadísticas. Por favor, intenta de nuevo más tarde.",
    selectLevel: "Selecciona tu nivel",
    required: "Requerido",
    loading: "Cargando...",
    // New notification translations
    welcomeTitle: "¡Bienvenido a la aplicación!",
    welcomeMessage:
      "Gracias por unirte. Comienza completando el formulario de alfabetización física para evaluar tu nivel.",
    formCompletedTitle: "¡Formulario completado!",
    formCompletedMessage:
      "Has completado el formulario exitosamente. Si no ves los resultados, por favor recarga la página.",
    noNotifications: "No hay notificaciones nuevas",
    notifications: "Notificaciones",
    markAsRead: "Marcar como leído",
    notificationDeleted: "Notificación eliminada",
    loadingNotifications: "Cargando notificaciones...",
    languageName: "Español",
    countryName: "España",
    tellUsAboutPhysical: "¡Cuéntanos sobre tu actividad física!",
    pleaseSelectValue: "Por favor, selecciona un valor antes de continuar.",
    incompleteAnswers: "Respuestas incompletas",
    pleaseAnswerAll: "Por favor, responde todas las preguntas antes de enviar.",
    submitAnswers: "Enviar respuestas",
    confirmSubmit: "¿Estás seguro de que quieres enviar tus respuestas?",
    cancel: "Cancelar",
    submit: "Enviar",
    success: "¡Éxito!",
    answersSubmitted: "Tus respuestas han sido guardadas correctamente.",
    error: "Error",
    couldNotSave: "No se pudieron guardar tus respuestas",
    pleaseAuthenticate: "Debes estar autenticado para enviar el formulario",
    completedFormTitle:
      "Cuestionario Completado: Autoevaluación de la Alfabetización Física",
    completedOn: "Completado el",
    yourScore: "Tu puntuación",
    comparativeTitle: "Comparativa",
    groupMedian: "Mediana del grupo",
    requiredAnswer: "Respuesta requerida",
    myResponses: "Mis Respuestas",
    compareWithOthers: "Comparar con Otros",
    studentResponses: "Respuestas del Alumno",
    class: "Clase",
    global: "Global",
    country: "País",
    age: "Edad",
    students: "Estudiantes",
    score: "Tu puntuación",
    median: "Mediana",
    belowMedian: "Por debajo de la mediana",
    aboveMedian: "Por encima de la mediana",
    atMedian: "Estás en la mediana",
    distribution: "Distribución",
    howToInterpret: "¿Cómo interpretar esta gráfica?",
    howToInterpretText: "La gráfica muestra la distribución de puntuaciones. La línea vertical representa la mediana. Tu puntuación está marcada en comparación con otros estudiantes.",
    scoreDistribution: "Distribución de puntuaciones",
    comparisonByLevel: "Comparación por nivel",
    classComparison: "Comparación con tu clase",
    globalComparison: "Comparación global",
    countryComparison: "Comparación por país",
    ageComparison: "Comparación por edad",
    lowLevel: "Nivel bajo",
    mediumLevel: "Nivel medio",
    highLevel: "Nivel alto",
    teacherView: "Vista del Profesor",
    classCode: "Código de clase",
    pending: 'Pendiente',
    optimalLevel: 'Nivel óptimo de alfabetización física',
    goodLevel: 'Buen desarrollo de la alfabetización física',
    needsReinforcement: 'Desarrollo en proceso, necesita refuerzo',
    needsSupport: 'Requiere atención y apoyo específico',
    pendingResponse: 'Pendiente de respuesta',
    excellentGlobalUnderstanding: "Excelente comprensión global de la alfabetización física",
    goodComponentsUnderstanding: "Buena comprensión de los componentes",
    basicUnderstanding: "Comprensión básica, necesita reforzar",
    needsFundamentalReview: "Requiere revisión de conceptos fundamentales",
    excellentComponentLevel: "Nivel excelente en este componente",
    goodComponentLevel: "Buen nivel en este componente",
    acceptableLevel: "Nivel aceptable, puede mejorar",
    needsImprovement: "Necesita mejorar este componente",
    selectFiltersToCompare: "Selecciona filtros para comparar",
    years: "años",
    personalizedTips: 'Consejos Personalizados',
    excellentWork: '¡Excelente trabajo!',
    goodPhysicalActivity: 'Tus respuestas muestran un buen nivel de actividad física.',
    tips: {
      physicalActivity: "¡Intenta incorporar más actividad física en tu rutina diaria! Pequeños cambios como usar las escaleras o caminar más pueden hacer una gran diferencia.",
      posture: "Recuerda mantener una postura correcta durante tus actividades diarias. Una buena postura mejora tu rendimiento y previene lesiones.",
      variety: "Intenta variar tus actividades físicas. La diversidad en el ejercicio ayuda a desarrollar diferentes habilidades y mantiene la motivación.",
      goals: "Establece metas realistas y alcanzables. Celebra tus pequeños logros y mantén un registro de tu progreso.",
      hydration: "La hidratación es clave para un buen rendimiento físico. Asegúrate de beber agua antes, durante y después del ejercicio.",
      rest: "El descanso adecuado es tan importante como el ejercicio. Asegúrate de dormir lo suficiente y dar tiempo a tu cuerpo para recuperarse.",
      enjoyment: "Busca actividades que disfrutes. El ejercicio debe ser divertido y motivador, no una obligación.",
      consistency: "La constancia es más importante que la intensidad. Es mejor hacer ejercicio moderado regularmente que sesiones intensas ocasionales."
    },
    noDataAvailable: "No hay datos disponibles",
    total: "total",
    colorBands: "Bandas de color",
    superior: "Superior",
    exceptionalPerformance: "Rendimiento excepcional",
    high: "Alto",
    aboveAverage: "Por encima del promedio",
    medium: "Medio",
    withinTypicalRange: "Dentro del rango típico",
    low: "Bajo",
    potentialImprovementArea: "Área de mejora potencial",
    yourPosition: "Tu posición",
    isAtPercentile: "está en el percentil",
    thisMeans: "Esto significa que",
    youSurpass: "superas a",
    ofStudents: "de los estudiantes",
    comparison: "Comparación",
    totalStudents: "Total de estudiantes",
    susTitle: "Escala de Usabilidad del Sistema (SUS)",
    susDescription: "Por favor, indica tu nivel de acuerdo con las siguientes afirmaciones sobre la usabilidad de la aplicación:",
    susQuestions: [
      "Creo que me gustaría usar esta aplicación frecuentemente",
      "Encontré la aplicación innecesariamente compleja",
      "Pensé que la aplicación era fácil de usar",
      "Creo que necesitaría el apoyo de un técnico para poder usar la aplicación",
      "Encontré las funciones de la aplicación bien integradas",
      "Pensé que había demasiada inconsistencia en la aplicación",
      "Imagino que la mayoría de la gente aprendería a usar la aplicación muy rápidamente",
      "Encontré la aplicación muy engorrosa de usar",
      "Me sentí muy confiado usando la aplicación",
      "Necesité aprender muchas cosas antes de poder usar la aplicación"
    ],
    ueqTitle: "Cuestionario de Experiencia de Usuario (UEQ)",
    ueqDescription: "Por favor, evalúa la aplicación en las siguientes dimensiones:",
    ueqDimensions: {
      attractive: "Atractivo",
      perspicuity: "Perspicuidad",
      efficiency: "Eficiencia",
      dependability: "Dependabilidad",
      stimulation: "Estimulación",
      novelty: "Novelad"
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
        "Desordenado - Ordenado"
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
    },
    showQuestion: "Ver pregunta"
  },
  "es-PA": {
    welcome: "¡Bienvenido!",
    languageSelectionError: "No se pudo guardar la selección de idioma",
    formAlreadyCompleted: "Ya has completado este formulario anteriormente.",
    selectLanguage: "Selecciona tu idioma",
    confirmAnswer: "Confirmar respuesta",
    selectedScore: "Has seleccionado",
    confirmScoreQuestion: "¿Estás seguro de esta puntuación?",
    startButton: "Comenzar",
    question: "Pregunta",
    of: "de",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Terminar",
    // Nuevas traducciones
    confirmation: "Confirmación",
    deleteNotificationConfirm:
      "¿Estás seguro de que deseas eliminar esta notificación?",
    delete: "Eliminar",
    couldNotDelete: "No se pudo eliminar la notificación",
    couldNotUpdate: "No se pudieron actualizar las notificaciones",
    markAllAsRead: "Marcar todas como leídas",
    couldNotCalculateStats:
      "No se pudieron calcular las estadísticas. Por favor, intenta de nuevo más tarde.",
    selectLevel: "Selecciona tu nivel",
    required: "Requerido",
    loading: "Cargando...",
    personalizedTips: 'Personalized Tips',
    excellentWork: 'Excellent work!',
    goodPhysicalActivity: 'Your answers show a good level of physical activity.',
    tips: {
      physicalActivity: "Try to incorporate more physical activity into your daily routine! Small changes like taking the stairs or walking more can make a big difference.",
      posture: "Remember to maintain proper posture during your daily activities. Good posture improves your performance and prevents injuries.",
      variety: "Try to vary your physical activities. Diversity in exercise helps develop different skills and maintains motivation.",
      goals: "Set realistic and achievable goals. Celebrate your small achievements and keep track of your progress.",
      hydration: "Hydration is key for good physical performance. Make sure to drink water before, during, and after exercise.",
      rest: "Proper rest is as important as exercise. Make sure to get enough sleep and give your body time to recover.",
      enjoyment: "Look for activities you enjoy. Exercise should be fun and motivating, not an obligation.",
      consistency: "Consistency is more important than intensity. It's better to do moderate exercise regularly than occasional intense sessions."
    },
    // New notification translations
    welcomeTitle: "¡Bienvenido a la aplicación!",
    welcomeMessage:
      "Gracias por unirte. Comienza completando el formulario de alfabetización física para evaluar tu nivel.",
    formCompletedTitle: "¡Formulario completado!",
    formCompletedMessage:
      "Has completado el formulario exitosamente. Si no ves los resultados, por favor recarga la página.",
    noNotifications: "No hay notificaciones nuevas",
    notifications: "Notificaciones",
    markAsRead: "Marcar como leído",
    notificationDeleted: "Notificación eliminada",
    loadingNotifications: "Cargando notificaciones...",
    languageName: "Español",
    countryName: "Panamá",
    tellUsAboutPhysical: "¡Cuéntanos sobre tu actividad física!",
    pleaseSelectValue: "Por favor, selecciona un valor antes de continuar.",
    incompleteAnswers: "Respuestas incompletas",
    pleaseAnswerAll: "Por favor, responde todas las preguntas antes de enviar.",
    submitAnswers: "Enviar respuestas",
    confirmSubmit: "¿Estás seguro de que quieres enviar tus respuestas?",
    cancel: "Cancelar",
    submit: "Enviar",
    success: "¡Éxito!",
    answersSubmitted: "Tus respuestas han sido guardadas correctamente.",
    error: "Error",
    couldNotSave: "No se pudieron guardar tus respuestas",
    pleaseAuthenticate: "Debes estar autenticado para enviar el formulario",
    completedFormTitle:
      "Cuestionario Completado: Autoevaluación de la Alfabetización Física",
    completedOn: "Completado el",
    yourScore: "Tu puntuación",
    comparativeTitle: "Comparativa",
    groupMedian: "Mediana del grupo",
    requiredAnswer: "Respuesta requerida",
    myResponses: "Mis Respuestas",
    compareWithOthers: "Comparar con Otros",
    studentResponses: "Respuestas del Alumno",
    class: "Clase",
    global: "Global",
    country: "País",
    age: "Edad",
    students: "Estudiantes",
    score: "Tu puntuación",
    median: "Mediana",
    belowMedian: "Por debajo de la mediana",
    aboveMedian: "Por encima de la mediana",
    atMedian: "Estás en la mediana",
    distribution: "Distribución",
    howToInterpret: "¿Cómo interpretar esta gráfica?",
    howToInterpretText: "La gráfica muestra la distribución de puntuaciones. La línea vertical representa la mediana. Tu puntuación está marcada en comparación con otros estudiantes.",
    scoreDistribution: "Distribución de puntuaciones",
    comparisonByLevel: "Comparación por nivel",
    classComparison: "Comparación con tu clase",
    globalComparison: "Comparación global",
    countryComparison: "Comparación por país",
    ageComparison: "Comparación por edad",
    lowLevel: "Nivel bajo",
    mediumLevel: "Nivel medio",
    highLevel: "Nivel alto",
    teacherView: "Vista del Profesor",
    classCode: "Código de clase",
    pending: 'Pendiente',
    optimalLevel: 'Nivel óptimo de alfabetización física',
    goodLevel: 'Buen desarrollo de la alfabetización física',
    needsReinforcement: 'Desarrollo en proceso, necesita refuerzo',
    needsSupport: 'Requiere atención y apoyo específico',
    pendingResponse: 'Pendiente de respuesta',
    excellentGlobalUnderstanding: "Excelente comprensión global de la alfabetización física",
    goodComponentsUnderstanding: "Buena comprensión de los componentes",
    basicUnderstanding: "Comprensión básica, necesita reforzar",
    needsFundamentalReview: "Requiere revisión de conceptos fundamentales",
    excellentComponentLevel: "Nivel excelente en este componente",
    goodComponentLevel: "Buen nivel en este componente",
    acceptableLevel: "Nivel aceptable, puede mejorar",
    needsImprovement: "Necesita mejorar este componente",
    selectFiltersToCompare: "Selecciona filtros para comparar",
    years: "años",
    noDataAvailable: "No hay datos disponibles",
    total: "total",
    colorBands: "Bandas de color",
    superior: "Superior",
    exceptionalPerformance: "Rendimiento excepcional",
    high: "Alto",
    aboveAverage: "Por encima del promedio",
    medium: "Medio",
    withinTypicalRange: "Dentro del rango típico",
    low: "Bajo",
    potentialImprovementArea: "Área de mejora potencial",
    yourPosition: "Tu posición",
    isAtPercentile: "está en el percentil",
    thisMeans: "Esto significa que",
    youSurpass: "superas a",
    ofStudents: "de los estudiantes",
    comparison: "Comparación",
    totalStudents: "Total de estudiantes",
    susTitle: "Escala de Usabilidad del Sistema (SUS)",
    susDescription: "Por favor, indica tu nivel de acuerdo con las siguientes afirmaciones sobre la usabilidad de la aplicación:",
    susQuestions: [
      "Creo que me gustaría usar esta aplicación frecuentemente",
      "Encontré la aplicación innecesariamente compleja",
      "Pensé que la aplicación era fácil de usar",
      "Creo que necesitaría el apoyo de un técnico para poder usar la aplicación",
      "Encontré las funciones de la aplicación bien integradas",
      "Pensé que había demasiada inconsistencia en la aplicación",
      "Imagino que la mayoría de la gente aprendería a usar la aplicación muy rápidamente",
      "Encontré la aplicación muy engorrosa de usar",
      "Me sentí muy confiado usando la aplicación",
      "Necesité aprender muchas cosas antes de poder usar la aplicación"
    ],
    ueqTitle: "Cuestionario de Experiencia de Usuario (UEQ)",
    ueqDescription: "Por favor, evalúa la aplicación en las siguientes dimensiones:",
    ueqDimensions: {
      attractive: "Atractivo",
      perspicuity: "Perspicuidad",
      efficiency: "Eficiencia",
      dependability: "Dependabilidad",
      stimulation: "Estimulación",
      novelty: "Novelad"
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
        "Desordenado - Ordenado"
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
    },
    showQuestion: "Ver pregunta"
  },
  en: {
    welcome: "Welcome!",
    formAlreadyCompleted: "You have already completed this form.",
    confirmAnswer: "Confirm answer",
    selectedScore: "You selected",
    confirmScoreQuestion: "Are you sure about this score?",
    languageSelectionError: "Could not save language selection",
    selectLanguage: "Select your language",
    startButton: "Start",
    question: "Question",
    of: "of",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    // Nuevas traducciones
    confirmation: "Confirmation",
    deleteNotificationConfirm:
      "Are you sure you want to delete this notification?",
    delete: "Delete",
    couldNotDelete: "Could not delete notification",
    couldNotUpdate: "Could not update notifications",
    markAllAsRead: "Mark all as read",
    selectLevel: "Select your level",
    required: "Required",
    loading: "Loading...",
    languageName: "English",
    countryName: "United States",
    personalizedTips: 'Dicas Personalizadas',
    excellentWork: 'Excelente trabalho!',
    goodPhysicalActivity: 'Suas respostas mostram um bom nível de atividade física.',
    tips: {
      physicalActivity: "Tente incorporar mais atividade física na sua rotina diária! Pequenas mudanças como usar as escadas ou caminhar mais podem fazer uma grande diferença.",
      posture: "Lembre-se de manter uma postura correta durante suas atividades diárias. Uma boa postura melhora seu desempenho e previne lesões.",
      variety: "Tente variar suas atividades físicas. A diversidade no exercício ajuda a desenvolver diferentes habilidades e mantém a motivação.",
      goals: "Estabeleça metas realistas e alcançáveis. Celebre suas pequenas conquistas e mantenha um registro do seu progresso.",
      hydration: "A hidratação é fundamental para um bom desempenho físico. Certifique-se de beber água antes, durante e depois do exercício.",
      rest: "O descanso adequado é tão importante quanto o exercício. Certifique-se de dormir o suficiente e dar tempo ao seu corpo para se recuperar.",
      enjoyment: "Procure atividades que você goste. O exercício deve ser divertido e motivador, não uma obrigação.",
      consistency: "A consistência é mais importante que a intensidade. É melhor fazer exercício moderado regularmente do que sessões intensas ocasionais."
    },
    // New notification translations
    welcomeTitle: "Welcome to the app!",
    welcomeMessage:
      "Thank you for joining. Start by completing the physical literacy form to assess your level.",
    formCompletedTitle: "Form completed!",
    formCompletedMessage:
      "You have successfully completed the form. If you can't see the results, please reload the page.",
    noNotifications: "No new notifications",
    notifications: "Notifications",
    markAsRead: "Mark as read",
    notificationDeleted: "Notification deleted",
    loadingNotifications: "Loading notifications...",
    couldNotCalculateStats:
      "Could not calculate statistics. Please try again later.",
    tellUsAboutPhysical: "Tell us about your physical activity!",
    pleaseSelectValue: "Please select a value before continuing.",
    incompleteAnswers: "Incomplete Answers",
    pleaseAnswerAll: "Please answer all questions before submitting.",
    submitAnswers: "Submit Answers",
    confirmSubmit: "Are you sure you want to submit your answers?",
    cancel: "Cancel",
    submit: "Submit",
    success: "Success!",
    answersSubmitted: "Your answers have been saved successfully.",
    error: "Error",
    couldNotSave: "Could not save your answers",
    pleaseAuthenticate: "You must be authenticated to submit the form",
    completedFormTitle:
      "Completed Questionnaire: Physical Literacy Self-Assessment",
    completedOn: "Completed on",
    yourScore: "Your score",
    comparativeTitle: "Comparative",
    groupMedian: "Group median",
    requiredAnswer: "Required answer",
    myResponses: "My Responses",
    compareWithOthers: "Compare with Others",
    studentResponses: "Student Responses",
    class: "Class",
    global: "Global",
    country: "Country",
    age: "Age",
    students: "Students",
    score: "Your score",
    median: "Median",
    belowMedian: "Below median",
    aboveMedian: "Above median",
    atMedian: "You are at the median",
    distribution: "Distribution",
    howToInterpret: "How to interpret this chart?",
    howToInterpretText: "The chart shows the score distribution. The vertical line represents the median. Your score is marked in comparison to other students.",
    scoreDistribution: "Score distribution",
    comparisonByLevel: "Comparison by level",
    classComparison: "Class comparison",
    globalComparison: "Global comparison",
    countryComparison: "Country comparison",
    ageComparison: "Age comparison",
    lowLevel: "Low level",
    mediumLevel: "Medium level",
    highLevel: "High level",
    teacherView: "Teacher View",
    classCode: "Class code",
    pending: 'Pending',
    optimalLevel: 'Optimal level of physical literacy',
    goodLevel: 'Good physical literacy development',
    needsReinforcement: 'Development in progress, needs reinforcement',
    needsSupport: 'Requires attention and specific support',
    pendingResponse: 'Pending response',
    excellentGlobalUnderstanding: "Excellent global understanding of physical literacy",
    goodComponentsUnderstanding: "Good understanding of components",
    basicUnderstanding: "Basic understanding, needs reinforcement",
    needsFundamentalReview: "Requires review of fundamental concepts",
    excellentComponentLevel: "Excellent level in this component",
    goodComponentLevel: "Good level in this component",
    acceptableLevel: "Acceptable level, can improve",
    needsImprovement: "Needs improvement in this component",
    selectFiltersToCompare: "Select filters to compare",
    years: "years",
    noDataAvailable: "No data available",
    total: "total",
    colorBands: "Color bands",
    superior: "Superior",
    exceptionalPerformance: "Exceptional performance",
    high: "High",
    aboveAverage: "Above average",
    medium: "Medium",
    withinTypicalRange: "Within typical range",
    low: "Low",
    potentialImprovementArea: "Potential improvement area",
    yourPosition: "Your position",
    isAtPercentile: "is at percentile",
    thisMeans: "This means",
    youSurpass: "you surpass",
    ofStudents: "of students",
    comparison: "Comparison",
    totalStudents: "Total students",
    susTitle: "System Usability Scale (SUS)",
    susDescription: "Please indicate your level of agreement with the following statements about the application's usability:",
    susQuestions: [
      "I think that I would like to use this application frequently",
      "I found the application unnecessarily complex",
      "I thought the application was easy to use",
      "I think that I would need the support of a technical person to be able to use the application",
      "I found the various functions in the application well integrated",
      "I thought there was too much inconsistency in the application",
      "I would imagine that most people would learn to use the application very quickly",
      "I found the application very cumbersome to use",
      "I felt very confident using the application",
      "I needed to learn a lot of things before I could get going with the application"
    ],
    ueqTitle: "User Experience Questionnaire (UEQ)",
    ueqDescription: "Please evaluate the application in the following dimensions:",
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
        "Boring - Fun",
        "Good - Bad",
        "Unpleasant - Pleasant",
        "Ugly - Beautiful",
        "Dislike - Like"
      ],
      perspicuity: [
        "Not easy to learn - Easy to learn",
        "Complicated - Simple",
        "Clear - Confusing",
        "Easy to understand - Difficult to understand"
      ],
      efficiency: [
        "Fast - Slow",
        "Inefficient - Efficient",
        "Pragmatic - Imaginative",
        "Organized - Cluttered"
      ],
      dependability: [
        "Predictable - Unpredictable",
        "Objective - Subjective",
        "Secure - Not secure",
        "Too simple - Too complex"
      ],
      stimulation: [
        "Valuable - Inferior",
        "Boring - Exciting",
        "Not interesting - Interesting",
        "Motivating - Demotivating"
      ],
      novelty: [
        "Inventive - Conventional",
        "Usual - Leading edge",
        "Cautious - Bold",
        "Conservative - Innovative"
      ]
    },
    showQuestion: "Show question"
  },
  "pt-PT": {
    welcome: "Bem-vindo!",
    formAlreadyCompleted: "Você já completou este formulário anteriormente.",
    languageSelectionError: "Não foi possível guardar a seleção do idioma",
    couldNotCalculateStats: "Não foi possível calcular as estatísticas. Por favor, tente novamente mais tarde.",
    selectLanguage: "Selecione seu idioma",
    startButton: "Começar",
    confirmAnswer: "Confirmar resposta",
    selectedScore: "Selecionou",
    confirmScoreQuestion: "Tem certeza desta pontuação?",
    // Nuevas traducciones
    confirmation: "Confirmação",
    deleteNotificationConfirm:
      "Tem certeza que deseja eliminar esta notificação?",
    delete: "Eliminar",
    couldNotDelete: "Não foi possível eliminar a notificação",
    couldNotUpdate: "Não foi possível atualizar as notificações",
    markAllAsRead: "Marcar todas como lidas",
    question: "Pergunta",
    of: "de",
    // New notification translations
    welcomeTitle: "Bem-vindo à aplicação!",
    welcomeMessage:
      "Obrigado por se juntar. Comece por preencher o formulário de literacia física para avaliar o seu nível.",
    formCompletedTitle: "Formulário concluído!",
    formCompletedMessage:
      "Concluiu o formulário com sucesso. Se não conseguir ver os resultados, por favor recarregue a página.",
    noNotifications: "Não há notificações novas",
    notifications: "Notificações",
    markAsRead: "Marcar como lido",
    notificationDeleted: "Notificação eliminada",
    loadingNotifications: "A carregar notificações...",
    next: "Próximo",
    previous: "Anterior",
    finish: "Terminar",
    selectLevel: "Selecione seu nível",
    required: "Obrigatório",
    loading: "Carregando...",
    languageName: "Português",
    countryName: "Portugal",
    tellUsAboutPhysical: "Conte-nos sobre a sua atividade física!",
    pleaseSelectValue: "Por favor, selecione um valor antes de continuar.",
    incompleteAnswers: "Respostas incompletas",
    pleaseAnswerAll: "Por favor, responda todas as perguntas antes de enviar.",
    submitAnswers: "Enviar respostas",
    confirmSubmit: "Tem certeza de que deseja enviar suas respostas?",
    cancel: "Cancelar",
    submit: "Enviar",
    success: "Sucesso!",
    answersSubmitted: "Suas respostas foram guardadas com sucesso.",
    error: "Erro",
    couldNotSave: "Não foi possível guardar suas respostas",
    pleaseAuthenticate: "Deve estar autenticado para enviar o formulário",
    completedFormTitle:
      "Questionário Concluído: Autoavaliação da Literacia Física",
    completedOn: "Concluído em",
    yourScore: "Sua pontuação",
    comparativeTitle: "Comparativo",
    groupMedian: "Mediana do grupo",
    requiredAnswer: "Resposta obrigatória",
    myResponses: "Minhas Respostas",
    compareWithOthers: "Comparar com Outros",
    studentResponses: "Respostas do Aluno",
    class: "Turma",
    global: "Global",
    country: "País",
    age: "Idade",
    students: "Estudantes",
    score: "Sua pontuação",
    median: "Mediana",
    belowMedian: "Abaixo da mediana",
    aboveMedian: "Acima da mediana",
    atMedian: "Está na mediana",
    distribution: "Distribuição",
    howToInterpret: "Como interpretar este gráfico?",
    howToInterpretText: "O gráfico mostra a distribuição das pontuações. A linha vertical representa a mediana. A sua pontuação está marcada em comparação com outros estudantes.",
    scoreDistribution: "Distribuição de pontuações",
    comparisonByLevel: "Comparação por nível",
    classComparison: "Comparação com a turma",
    globalComparison: "Comparação global",
    countryComparison: "Comparação por país",
    ageComparison: "Comparação por idade",
    lowLevel: "Nível baixo",
    mediumLevel: "Nível médio",
    highLevel: "Nível alto",
    teacherView: "Vista do Professor",
    classCode: "Código da turma",
    pending: 'Pendente',
    optimalLevel: 'Nível ótimo de literacia física',
    goodLevel: 'Bom desenvolvimento da literacia física',
    needsReinforcement: 'Desenvolvimento em andamento, precisa de reforço',
    needsSupport: 'Requer atenção e suporte específico',
    pendingResponse: 'Resposta pendente',
    excellentGlobalUnderstanding: "Excelente compreensão global da literacia física",
    goodComponentsUnderstanding: "Boa compreensão dos componentes",
    basicUnderstanding: "Compreensão básica, precisa de reforço",
    needsFundamentalReview: "Requer revisão de conceitos fundamentais",
    excellentComponentLevel: "Nível excelente neste componente",
    goodComponentLevel: "Bom nível neste componente",
    acceptableLevel: "Nível aceitável, pode melhorar",
    needsImprovement: "Precisa melhorar este componente",
    selectFiltersToCompare: "Selecione filtros para comparar",
    years: "anos",
    noDataAvailable: "Não há dados disponíveis",
    total: "total",
    colorBands: "Bandas de cor",
    superior: "Superior",
    exceptionalPerformance: "Desempenho excepcional",
    high: "Alto",
    aboveAverage: "Acima da média",
    medium: "Médio",
    withinTypicalRange: "Dentro do intervalo típico",
    low: "Baixo",
    potentialImprovementArea: "Área de potencial melhoria",
    yourPosition: "Sua posição",
    isAtPercentile: "está no percentil",
    thisMeans: "Isto significa que",
    youSurpass: "você supera",
    ofStudents: "dos estudantes",
    comparison: "Comparação",
    totalStudents: "Total de estudantes",
    susTitle: "Escala de Usabilidade do Sistema (SUS)",
    susDescription: "Por favor, indique seu nível de concordância com as seguintes afirmações sobre a usabilidade da aplicação:",
    susQuestions: [
      "Acho que gostaria de usar esta aplicação frequentemente",
      "Encontrei a aplicação desnecessariamente complexa",
      "Pensei que a aplicação era fácil de usar",
      "Acho que precisaria do apoio de um técnico para poder usar a aplicação",
      "Encontrei as funções da aplicação bem integradas",
      "Pensei que havia demasiada inconsistência na aplicação",
      "Imagino que a maioria das pessoas aprenderia a usar a aplicação muito rapidamente",
      "Encontrei a aplicação muito trabalhosa de usar",
      "Senti-me muito confiante usando a aplicação",
      "Precisei aprender muitas coisas antes de poder usar a aplicação"
    ],
    ueqTitle: "Questionário de Experiência do Usuário (UEQ)",
    ueqDescription: "Por favor, avalie a aplicação nas seguintes dimensões:",
    ueqDimensions: {
      attractive: "Atractividade",
      perspicuity: "Perspicuidade",
      efficiency: "Eficiência",
      dependability: "Dependabilidade",
      stimulation: "Estimulação",
      novelty: "Novidade"
    },
    ueqPairs: {
      attractive: [
        "Aborrecido - Divertido",
        "Bom - Mau",
        "Desagradável - Agradável",
        "Feio - Bonito",
        "Não gosto - Gosto"
      ],
      perspicuity: [
        "Não é fácil de aprender - Fácil de aprender",
        "Complicado - Simples",
        "Claro - Confuso",
        "Fácil de entender - Difícil de entender"
      ],
      efficiency: [
        "Rápido - Lento",
        "Ineficiente - Eficiente",
        "Pragmático - Imaginativo",
        "Organizado - Desorganizado"
      ],
      dependability: [
        "Previsível - Imprevisível",
        "Objetivo - Subjetivo",
        "Seguro - Inseguro",
        "Fiable - Poco fiable"
      ],
      stimulation: [
        "Valioso - Inferior",
        "Aborrecido - Empolgante",
        "Não interessante - Interessante",
        "Motivador - Desmotivador"
      ],
      novelty: [
        "Inventivo - Convencional",
        "Usual - Inovador",
        "Cauteloso - Audaz",
        "Conservador - Inovador"
      ]
    },
    showQuestion: "Ver pergunta"
  },
  "pt-BR": {
    welcome: "Bem-vindo!",
    selectLanguage: "Selecione seu idioma",
    confirmAnswer: "Confirmar resposta",
    selectedScore: "Você selecionou",
    confirmScoreQuestion: "Tem certeza desta pontuação?",
    languageSelectionError: "Não foi possível salvar a seleção do idioma",
    formAlreadyCompleted: "Já completou este formulário anteriormente.",
    startButton: "Começar",
    // Nuevas traducciones
    confirmation: "Confirmação",
    deleteNotificationConfirm:
      "Tem certeza que deseja excluir esta notificação?",
    delete: "Excluir",
    couldNotDelete: "Não foi possível excluir a notificação",
    couldNotUpdate: "Não foi possível atualizar as notificações",
    markAllAsRead: "Marcar todas como lidas",
    question: "Pergunta",
    of: "de",
    next: "Próximo",
    previous: "Anterior",

    // New notification translations
    welcomeTitle: "Bem-vindo ao aplicativo!",
    welcomeMessage:
      "Obrigado por se juntar. Comece preenchendo o formulário de letramento físico para avaliar seu nível.",
    formCompletedTitle: "Formulário concluído!",
    formCompletedMessage:
      "Você completou o formulário com sucesso. Se não conseguir ver os resultados, por favor recarregue a página.",
    noNotifications: "Não há notificações novas",
    notifications: "Notificações",
    markAsRead: "Marcar como lido",
    notificationDeleted: "Notificação excluída",
    loadingNotifications: "Carregando notificações...",
    finish: "Terminar",
    selectLevel: "Selecione seu nível",
    required: "Obrigatório",
    loading: "Carregando...",
    languageName: "Português",
    countryName: "Brasil",
    tellUsAboutPhysical: "Conte-nos sobre sua atividade física!",
    pleaseSelectValue: "Por favor, selecione um valor antes de continuar.",
    incompleteAnswers: "Respostas incompletas",
    pleaseAnswerAll: "Por favor, responda todas as questões antes de enviar.",
    submitAnswers: "Enviar respostas",
    confirmSubmit: "Tem certeza que deseja enviar suas respostas?",
    cancel: "Cancelar",
    submit: "Enviar",
    couldNotCalculateStats:
      "Não foi possível calcular as estatísticas. Por favor, tente novamente mais tarde.",
    success: "Sucesso!",
    answersSubmitted: "Suas respostas foram salvas com sucesso.",
    error: "Erro",
    couldNotSave: "Não foi possível salvar suas respostas",
    pleaseAuthenticate:
      "Você precisa estar autenticado para enviar o formulário",
    completedFormTitle:
      "Questionário Concluído: Autoavaliação do Letramento Físico",
    completedOn: "Concluído em",
    yourScore: "Sua pontuação",
    comparativeTitle: "Comparativo",
    groupMedian: "Mediana do grupo",
    requiredAnswer: "Resposta obrigatória",
    myResponses: "Minhas Respostas",
    compareWithOthers: "Comparar com Outros",
    studentResponses: "Respostas do Aluno",
    class: "Turma",
    global: "Global",
    country: "País",
    age: "Idade",
    students: "Estudantes",
    score: "Sua pontuação",
    median: "Mediana",
    belowMedian: "Abaixo da mediana",
    aboveMedian: "Acima da mediana",
    atMedian: "Você está na mediana",
    distribution: "Distribuição",
    howToInterpret: "Como interpretar este gráfico?",
    howToInterpretText: "O gráfico mostra a distribuição das pontuações. A linha vertical representa a mediana. Sua pontuação está marcada em comparação com outros estudantes.",
    scoreDistribution: "Distribuição de pontuações",
    comparisonByLevel: "Comparação por nível",
    classComparison: "Comparação com a turma",
    globalComparison: "Comparação global",
    countryComparison: "Comparação por país",
    ageComparison: "Comparação por idade",
    lowLevel: "Nível baixo",
    mediumLevel: "Nível médio",
    highLevel: "Nível alto",
    teacherView: "Vista do Professor",
    classCode: "Código da turma",
    pending: 'Pendente',
    optimalLevel: 'Nível ótimo de letramento físico',
    goodLevel: 'Bom desenvolvimento do letramento físico',
    needsReinforcement: 'Desenvolvimento em andamento, precisa de reforço',
    needsSupport: 'Requer atenção e suporte específico',
    pendingResponse: 'Resposta pendente',
    excellentGlobalUnderstanding: "Excelente compreensão global do letramento físico",
    goodComponentsUnderstanding: "Boa compreensão dos componentes",
    basicUnderstanding: "Compreensão básica, precisa de reforço",
    needsFundamentalReview: "Requer revisão de conceitos fundamentais",
    excellentComponentLevel: "Nível excelente neste componente",
    goodComponentLevel: "Bom nível neste componente",
    acceptableLevel: "Nível aceitável, pode melhorar",
    needsImprovement: "Precisa melhorar este componente",
    selectFiltersToCompare: "Selecione filtros para comparar",
    years: "anos",
    noDataAvailable: "Não há dados disponíveis",
    total: "total",
    colorBands: "Bandas de cor",
    superior: "Superior",
    exceptionalPerformance: "Desempenho excepcional",
    high: "Alto",
    aboveAverage: "Acima da média",
    medium: "Médio",
    withinTypicalRange: "Dentro do intervalo típico",
    low: "Baixo",
    potentialImprovementArea: "Área de potencial melhoria",
    yourPosition: "Sua posição",
    isAtPercentile: "está no percentil",
    thisMeans: "Isto significa que",
    youSurpass: "você supera",
    ofStudents: "dos estudantes",
    comparison: "Comparação",
    totalStudents: "Total de estudantes",
    susTitle: "Escala de Usabilidade do Sistema (SUS)",
    susDescription: "Por favor, indique seu nível de concordância com as seguintes afirmações sobre a usabilidade do aplicativo:",
    susQuestions: [
      "Acho que gostaria de usar este aplicativo frequentemente",
      "Encontrei o aplicativo desnecessariamente complexo",
      "Pensei que o aplicativo era fácil de usar",
      "Acho que precisaria do apoio de um técnico para poder usar o aplicativo",
      "Encontrei as funções do aplicativo bem integradas",
      "Pensei que havia muita inconsistência no aplicativo",
      "Imagino que a maioria das pessoas aprenderia a usar o aplicativo muito rapidamente",
      "Encontrei o aplicativo muito trabalhoso de usar",
      "Senti-me muito confiante usando o aplicativo",
      "Precisei aprender muitas coisas antes de poder usar o aplicativo"
    ],
    ueqTitle: "Questionário de Experiência do Usuário (UEQ)",
    ueqDescription: "Por favor, avalie o aplicativo nas seguintes dimensões:",
    ueqDimensions: {
      attractive: "Atratividade",
      perspicuity: "Perspicuidade",
      efficiency: "Eficiência",
      dependability: "Dependabilidade",
      stimulation: "Estimulação",
      novelty: "Novidade"
    },
    ueqPairs: {
      attractive: [
        "Chato - Divertido",
        "Bom - Ruim",
        "Desagradável - Agradável",
        "Feio - Bonito",
        "Não gosto - Gosto"
      ],
      perspicuity: [
        "Não é fácil de aprender - Fácil de aprender",
        "Complicado - Simples",
        "Claro - Confuso",
        "Fácil de entender - Difícil de entender"
      ],
      efficiency: [
        "Rápido - Lento",
        "Ineficiente - Eficiente",
        "Pragmático - Imaginativo",
        "Organizado - Desorganizado"
      ],
      dependability: [
        "Previsível - Imprevisível",
        "Objetivo - Subjetivo",
        "Seguro - Inseguro",
        "Fiable - Poco fiable"
      ],
      stimulation: [
        "Valioso - Inferior",
        "Chato - Empolgante",
        "Não interessante - Interessante",
        "Motivador - Desmotivador"
      ],
      novelty: [
        "Inventivo - Convencional",
        "Usual - Inovador",
        "Cauteloso - Audaz",
        "Conservador - Inovador"
      ]
    },
    showQuestion: "Ver pergunta"
  },
};
