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
  },
  "pt-PT": {
    welcome: "Bem-vindo!",
    formAlreadyCompleted: "Você já completou este formulário anteriormente.",
    languageSelectionError: "Não foi possível guardar a seleção do idioma",
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
    couldNotCalculateStats: "Não foi possível calcular as estatísticas. Por favor, tente novamente mais tarde.",
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
  },
};
