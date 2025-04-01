import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { feedbackTranslations } from './translations/feedbackTranslations';

const resources = {
  es: {
    translation: {
      ...feedbackTranslations
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n; 