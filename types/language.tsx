// types/language.ts
export type Language = "es" | "en" | "pt-PT" | "pt-BR" | "es-PA";

export type CountryCode = 
  | "es"    // Códigos base
  | "en"
  | "pt-PT"
  | "pt-BR"
  | "es_ES" | "es_AR" | "es_CO" | "es_MX" | "es_CL" 
  | "es_PE" | "es_EC" | "es_PA" | "es_CU" 
  | "en_US" 
  | "pt_PT" 
  | "pt_BR"
  | "es_NI"
  | "es_PY";

export const countryCodeToName: Record<CountryCode, string> = {
  'es': 'España',    // Códigos base
  'en': 'United States',
  'pt-PT': 'Portugal',
  'pt-BR': 'Brasil',
  'es_ES': 'España',
  'es_AR': 'Argentina',
  'es_CO': 'Colombia',
  'es_MX': 'México',
  'es_CL': 'Chile',
  'es_PE': 'Perú',
  'es_EC': 'Ecuador',
  'es_PA': 'Panamá',
  'es_CU': 'Cuba',
  'en_US': 'United States',
  'pt_PT': 'Portugal',
  'pt_BR': 'Brasil',
  'es_NI': 'Nicaragua',
  'es_PY': 'Paraguay'
};

export const countryToLanguage: Record<CountryCode, Language> = {
  'es': 'es',    // Códigos base
  'en': 'en',
  'pt-PT': 'pt-PT',
  'pt-BR': 'pt-BR',
  'es_ES': 'es',
  'es_AR': 'es',
  'es_CO': 'es',
  'es_MX': 'es',
  'es_CL': 'es',
  'es_PE': 'es',
  'es_EC': 'es',
  'es_PA': 'es',
  'es_CU': 'es',
  'en_US': 'en',
  'pt_PT': 'pt-PT',
  'pt_BR': 'pt-BR',
  'es_NI': 'es',
  'es_PY': 'es'
};