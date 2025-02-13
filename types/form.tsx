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
  country: string;
  countryRole: {
    country: string;
    language: Language;
    flag: string;
  };
  classCode?: string;
  age?: number;
  responses?: number[];
  isGuest?: boolean;
}

// Mapeo de código de país a información
export interface CountryInfo {
  country: string;
  flag: string;
  language: Language;
}

export const countryCodeMap: Record<string, CountryInfo> = {
  // Códigos base
  'es': { country: 'España', flag: 'spain', language: 'es' },
  'en': { country: 'United States', flag: 'usa', language: 'en' },
  'pt-PT': { country: 'Portugal', flag: 'portugal', language: 'pt-PT' },
  'pt-BR': { country: 'Brasil', flag: 'brazil', language: 'pt-BR' },
  
  // Códigos específicos de país
  'es_ES': { country: 'España', flag: 'spain', language: 'es' },
  'es_AR': { country: 'Argentina', flag: 'argentina', language: 'es' },
  'es_CO': { country: 'Colombia', flag: 'colombia', language: 'es' },
  'es_MX': { country: 'México', flag: 'mexico', language: 'es' },
  'es_CL': { country: 'Chile', flag: 'chile', language: 'es' },
  'es_PE': { country: 'Perú', flag: 'peru', language: 'es' },
  'es_EC': { country: 'Ecuador', flag: 'ecuador', language: 'es' },
  'es_PA': { country: 'Panamá', flag: 'panama', language: 'es' },
  'es_CU': { country: 'Cuba', flag: 'cuba', language: 'es' },
  'en_US': { country: 'United States', flag: 'usa', language: 'en' },
  'pt_PT': { country: 'Portugal', flag: 'portugal', language: 'pt-PT' },
  'pt_BR': { country: 'Brasil', flag: 'brazil', language: 'pt-BR' }
};