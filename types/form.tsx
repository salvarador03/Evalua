// types/form.ts

import { Language } from './language';

export interface FormResponse {
  userId: string;
  userName?: string;
  email?: string;
  language: Language;
  answers: number[];
  completedAt: number;
  score?: number;
  country?: string;
  countryRole: {
    country: string;
    language: string;
    flag: string;
  };
  classCode?: string;
  age?: number;
  responses?: number[];
  isGuest?: boolean; // Added this field
}

// Podemos añadir un tipo helper para mapear idiomas a países
export const languageToCountry: Record<Language, string> = {
  'es': 'España',
  'en': 'United States',
  'pt-PT': 'Portugal',
  'pt-BR': 'Brasil'
} as const;