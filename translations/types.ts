export type Language = "es" | "en" | "es-PA" | "pt-PT" | "pt-BR";

export interface TranslationText {
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
} 