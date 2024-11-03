// src/screens/Forms/components/LanguageSelector.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../screens/FormsScreen/data/questions';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const languages: Array<{ code: Language; label: string }> = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'br', label: 'BR' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  return (
    <View style={styles.languageContainer}>
      {languages.map(({ code, label }) => (
        <TouchableOpacity
          key={code}
          style={[
            styles.languageButton,
            currentLanguage === code && styles.selectedLanguage
          ]}
          onPress={() => onLanguageChange(code)}
        >
          <Ionicons
            name="flag"
            size={18}
            color={currentLanguage === code ? '#fff' : '#056b05'}
          />
          <Text
            style={[
              styles.languageText,
              currentLanguage === code && styles.selectedLanguageText
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 5,
  },
  selectedLanguage: {
    backgroundColor: '#056b05',
  },
  languageText: {
    color: '#056b05',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#fff',
  },
});