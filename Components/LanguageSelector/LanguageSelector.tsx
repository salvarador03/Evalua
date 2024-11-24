/*// components/LanguageSelector/LanguageSelector.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import type { Language } from '../../screens/FormsScreen/data/questions';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const FLAGS = {
  es: require('../../assets/flags/spain.webp'),    // bandera española
  en: require('../../assets/flags/usa.webp'),      // bandera americana en lugar de UK
  pt: require('../../assets/flags/portugal.webp'), // bandera portuguesa
  br: require('../../assets/flags/brazil.webp'),   // bandera brasileña
};

const LANGUAGE_NAMES = {
  es: 'Español',
  en: 'English (US)', // Cambiado para reflejar inglés americano
  pt: 'Português',
  br: 'Português (BR)',
};

const FLAG_ALTS = {
  es: '🇪🇸',
  en: '🇺🇸',
  pt: '🇵🇹',
  br: '🇧🇷',
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <View style={styles.container}>
      {Object.entries(FLAGS).map(([lang, flag]) => (
        <TouchableOpacity
          key={lang}
          style={[
            styles.languageButton,
            currentLanguage === lang && styles.selectedLanguage,
          ]}
          onPress={() => onLanguageChange(lang as Language)}
        >
          <Image 
            source={flag} 
            style={styles.flag} 
            accessibilityLabel={FLAG_ALTS[lang as keyof typeof FLAG_ALTS]}
          />
          <Text style={[
            styles.languageText,
            currentLanguage === lang && styles.selectedText
          ]}>
            {LANGUAGE_NAMES[lang as Language]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#4ade80',
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: 4, // Menos redondo para las banderas rectangulares
  },
  languageText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
*/