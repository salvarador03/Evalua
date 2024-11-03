// src/screens/Forms/PhysicalLiteracyFormScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { questions, Language } from './data/questions';
import { LanguageSelector } from '../../Components/LanguageSelector/LanguageSelector'
import Slider from '@react-native-community/slider';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FormsStackParamList } from '../../navigation/types';

type PhysicalLiteracyFormScreenNavigationProp = NativeStackNavigationProp<
  FormsStackParamList,
  'PhysicalLiteracyForm'
>;

export const PhysicalLiteracyFormScreen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<PhysicalLiteracyFormScreenNavigationProp>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [language, setLanguage] = useState<Language>('es');
  const [answers, setAnswers] = useState<number[]>(Array(6).fill(5));

  const handleSubmit = () => {
    Alert.alert(
      'Enviar respuestas',
      '¿Estás seguro de que quieres enviar tus respuestas?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Enviar',
          onPress: () => {
            // Aquí iría la lógica para enviar las respuestas
            Alert.alert('¡Éxito!', 'Tus respuestas han sido enviadas correctamente.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <BackgroundContainer
      source={require('../../assets/images/surfer-1836366_1280.jpg')}
    >
      <View style={styles.overlay}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />

          <View style={styles.card}>
            <View style={styles.progress}>
              <Text style={styles.progressText}>
                Pregunta {currentQuestion + 1} de {questions[language].length}
              </Text>
              <View style={styles.progressBar}>
                {questions[language].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      currentQuestion === index && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.questionText}>
              {questions[language][currentQuestion].text}
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{answers[currentQuestion]}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={answers[currentQuestion]}
                onValueChange={(value) => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = value;
                  setAnswers(newAnswers);
                }}
                minimumTrackTintColor="#056b05"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#056b05"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>
                  {questions[language][currentQuestion].min}
                </Text>
                <Text style={styles.sliderLabel}>
                  {questions[language][currentQuestion].max}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
              onPress={() => setCurrentQuestion(curr => curr - 1)}
              disabled={currentQuestion === 0}
            >
              <Ionicons name="arrow-back" size={24} color="#056b05" />
              <Text style={styles.navButtonText}>Anterior</Text>
            </TouchableOpacity>

            {currentQuestion === questions[language].length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={[styles.navButtonText, styles.submitButtonText]}>
                  Enviar
                </Text>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setCurrentQuestion(curr => curr + 1)}
              >
                <Text style={styles.navButtonText}>Siguiente</Text>
                <Ionicons name="arrow-forward" size={24} color="#056b05" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progress: {
    marginBottom: 20,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#056b05',
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#056b05',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#056b05',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#056b05',
  },
  submitButtonText: {
    color: '#fff',
  },
});