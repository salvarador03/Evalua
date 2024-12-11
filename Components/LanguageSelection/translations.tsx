//Components/LanguageSelection/Translations

export type Language = "es" | "en" | "pt-PT" | "pt-BR";

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
    couldNotCalculateStats:
      "Não foi possível calcular as estatísticas. Por favor, tente novamente mais tarde.",
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
  },
};
