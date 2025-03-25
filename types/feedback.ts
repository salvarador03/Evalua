import { Language } from "../translations/types";

export interface FeedbackData {
  userId: string;
  formType: string;
  ratings: {
    overall: number;
    usability: number;
    content: number;
    design: number;
  };
  sus: {
    scores: number[];
    total: number;
  };
  ueq: {
    attractive: number[];
    perspicuity: number[];
    efficiency: number[];
    dependability: number[];
    stimulation: number[];
    novelty: number[];
  };
  comments: {
    generalFeedback: string;
    improvementSuggestions: string;
  };
  language: Language;
  submittedAt: number;
  lastModified: number;
}

export interface UEQScores {
  attractive: number[];
  perspicuity: number[];
  efficiency: number[];
  dependability: number[];
  stimulation: number[];
  novelty: number[];
} 