import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormsStackParamList } from '../../navigation/types';
import { ResultsView } from './ResultsView';
import { FormStats } from '../../types/formstats';
import { View, ActivityIndicator, Text } from 'react-native';
import db from '@react-native-firebase/database';

type Props = NativeStackScreenProps<FormsStackParamList, 'PhysicalLiteracyResults'>;

export const PhysicalLiteracyResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  // Add null checks for route params
  const formResponse = route.params?.formResponse;
  const language = route.params?.language;
  const answers = route.params?.answers;

  // Validate required params
  useEffect(() => {
    if (!formResponse || !language || !answers) {
      console.error('Missing required navigation params:', { formResponse, language, answers });
      navigation.goBack();
      return;
    }
  }, [formResponse, language, answers, navigation]);

  const [stats, setStats] = useState<FormStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!answers) return; // Early return if answers not available
      
      try {
        const snapshot = await db().ref("/form_responses").once("value");

        const allResponses: any[] = [];
        snapshot.forEach((childSnapshot) => {
          const response = childSnapshot.child("physical_literacy").val();
          if (response && response.answers) {
            allResponses.push(response);
          }
          return undefined;
        });

        const calculatedStats = answers.map((userAnswer, questionIndex) => {
          const values = allResponses
            .map((response) => response.answers[questionIndex])
            .filter((value): value is number => value !== null && !isNaN(value));

          if (values.length === 0) {
            return {
              median: 0,
              belowMedian: 0,
              aboveMedian: 0,
              totalUsers: 0,
              min: 0,
              max: 0,
              distanceFromMedian: 0,
              percentageFromMedian: 0
            };
          }

          values.sort((a, b) => a - b);
          const totalUsers = values.length;
          const min = values[0];
          const max = values[totalUsers - 1];
          const medianIndex = Math.floor(totalUsers / 2);
          const median = totalUsers % 2 === 0
            ? (values[medianIndex - 1] + values[medianIndex]) / 2
            : values[medianIndex];

          const distanceFromMedian = userAnswer !== null ? userAnswer - median : 0;
          const percentageFromMedian = median !== 0 
            ? ((userAnswer !== null ? userAnswer : 0) / median * 100) - 100 
            : 0;

          return {
            median,
            belowMedian: values.filter(v => v < median).length,
            aboveMedian: values.filter(v => v > median).length,
            totalUsers,
            min,
            max,
            distanceFromMedian,
            percentageFromMedian
          };
        });

        setStats(calculatedStats);
      } catch (error) {
        console.error('[ResultsScreen] Error loading stats:', error);
        setError(error instanceof Error ? error.message : 'Error loading stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [answers]); // Only depend on answers

  if (!formResponse || !language || !answers) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: Datos no disponibles</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
          Error al cargar las estadísticas: {error}
        </Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          Por favor, intenta de nuevo más tarde.
        </Text>
      </View>
    );
  }

  return (
    <ResultsView
      language={language}
      formResponse={formResponse}
      answers={answers}
      stats={stats}
    />
  );
};