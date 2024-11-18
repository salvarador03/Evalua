// Components/FormScreen/ResultsView.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language } from '../../types/language';
import { FormResponse } from '../../types/form';
import { questions } from './data/questions';
import { useRoute } from '@react-navigation/native';
import ComparisonChart from './ComparisonChart';

interface FormStats {
  median: number;
  belowMedian: number;
  aboveMedian: number;
  totalUsers: number;
  min: number;
  max: number;
  distanceFromMedian: number;  // Nuevo
  percentageFromMedian: number;  // Nuevo
}

interface ResultsViewProps {
  language: Language;
  formResponse: FormResponse;
  answers: (number | null)[];
  stats: FormStats[];
}

interface RouteParams {
  studentData: {
    name: string;
    email: string;
    uid: string;
  };
  isTeacherView: boolean;
  formResponse: FormResponse;
  language: Language;
  answers: (number | null)[];
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  language,
  formResponse,
  answers,
  stats,
}) => {
  const route = useRoute();
  const { studentData, isTeacherView } = route.params as RouteParams;
  const [activeSection, setActiveSection] = useState<'responses' | 'comparison'>('responses');
  const [fadeAnim] = useState(new Animated.Value(1));

  const switchSection = (section: 'responses' | 'comparison') => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    setActiveSection(section);
  };

  const renderStudentHeader = () => {
    if (!isTeacherView || !studentData) return null;

    return (
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{studentData.name}</Text>
          <Text style={styles.studentEmail}>{studentData.email}</Text>
        </View>
        <View style={styles.teacherBadge}>
          <Ionicons name="school" size={20} color="#fff" />
          <Text style={styles.teacherBadgeText}>Vista del Profesor</Text>
        </View>
      </View>
    );
  };

  const renderNavigationButtons = () => (
    <View style={styles.navContainer}>
      <TouchableOpacity
        style={[
          styles.navButton,
          activeSection === 'responses' && styles.navButtonActive
        ]}
        onPress={() => switchSection('responses')}
      >
        <Ionicons 
          name="star" 
          size={32} 
          color={activeSection === 'responses' ? '#FFF' : '#9E7676'} 
        />
        <Text style={[
          styles.navButtonText,
          activeSection === 'responses' && styles.navButtonTextActive
        ]}>
          {isTeacherView ? 'Respuestas del Alumno' : 'Mis Respuestas'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          activeSection === 'comparison' && styles.navButtonActive
        ]}
        onPress={() => switchSection('comparison')}
      >
        <Ionicons 
          name="people" 
          size={32} 
          color={activeSection === 'comparison' ? '#FFF' : '#9E7676'} 
        />
        <Text style={[
          styles.navButtonText,
          activeSection === 'comparison' && styles.navButtonTextActive
        ]}>
          Comparar con Otros
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResponses = () => (
    <View style={styles.responsesContainer}>
      {questions[language].map((question, index) => {
        const userAnswer = answers[index];
        return (
          <View key={index} style={styles.responseCard}>
            <View style={styles.questionContainer}>
              <Ionicons name="help-circle" size={24} color="#9E7676" />
              <Text style={styles.questionText}>{question.text}</Text>
            </View>
            <View style={styles.answerContainer}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.answerValue}>
                {userAnswer !== null ? userAnswer.toString() : '-'}
              </Text>
              <Text style={styles.pointsText}>puntos</Text>
            </View>
            {isTeacherView && (
              <View style={styles.teacherNote}>
                <Ionicons name="information-circle" size={20} color="#9E7676" />
                <Text style={styles.teacherNoteText}>
                  {userAnswer !== null && userAnswer > 7 
                    ? 'Respuesta satisfactoria'
                    : userAnswer !== null && userAnswer < 4
                    ? 'Requiere atención'
                    : 'Respuesta promedio'}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderComparison = () => (
    <View style={styles.comparisonContainer}>
      {questions[language].map((question, index) => {
        const stat = stats[index];
        const userAnswer = answers[index];
        if (!stat || userAnswer === null) return null;
  
        return (
          <View key={index} style={styles.comparisonCard}>
            <View style={styles.questionContainer}>
              <Ionicons name="help-circle" size={24} color="#9E7676" />
              <Text style={styles.questionText}>{question.text}</Text>
            </View>
            
            <ComparisonChart
              userScore={userAnswer}
              userData={{
                name: studentData?.name || '',
                classCode: formResponse.classCode || 'default',  // Valor por defecto
                country: formResponse.country || 'Sin país',     // Valor por defecto
                age: formResponse.age || 0                       // Valor por defecto
              }}
              allResponses={[/* aquí necesitas pasar todas las respuestas relevantes */]}
            />
  
            {/* Resto del código permanece igual */}
          </View>
        );
      })}
    </View>
  );
  
  return (
    <View style={styles.container}>
      {renderStudentHeader()}
      {renderNavigationButtons()}
      <ScrollView style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {activeSection === 'responses' ? renderResponses() : renderComparison()}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  studentHeader: {
    backgroundColor: 'rgba(158, 118, 118, 0.9)',
    padding: 18,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  studentEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  teacherBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    width: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navButtonActive: {
    backgroundColor: '#9E7676',
  },
  navButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: '#9E7676',
    fontWeight: 'bold',
  },
  navButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  responsesContainer: {
    gap: 16,
  },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: '#594545',
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  answerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9E7676',
  },
  pointsText: {
    fontSize: 16,
    color: '#666',
  },
  teacherNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  teacherNoteText: {
    color: '#594545',
    fontSize: 14,
    flex: 1,
  },
  comparisonContainer: {
    gap: 16,
  },
  comparisonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCard: {
    marginTop: 16,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statText: {
    fontSize: 16,
    color: '#594545',
  },
  chartContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#594545',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#594545',
    fontSize: 14,
    padding: 20,
  }
});

export default ResultsView;