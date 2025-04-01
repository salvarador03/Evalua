import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormsStackParamList } from '../../navigation/types';
import { ResultsView } from './ResultsView';
import { View, ActivityIndicator, Text } from 'react-native';
import db from '@react-native-firebase/database';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type Props = NativeStackScreenProps<FormsStackParamList, 'PhysicalLiteracyResults'>;

interface LocalFormStats {
  median: number;
  mean: number;
  belowMedian: number;
  aboveMedian: number;
  totalUsers: number;
  min: number;
  max: number;
  distanceFromMedian: number;
  percentageFromMedian: number;
  classMedians: number[];
  globalMedians: number[];
  countryMedians: number[];
  ageMedians: number[];
}

const calculateMedians = (group: Record<string, number[][]>, key: string) => {
  const medians = Array(8).fill(0);
  console.log('Calculando medianas para key:', key);
  console.log('Grupo disponible:', Object.keys(group));
  
  if (group[key]) {
    console.log('Datos encontrados para key:', key, group[key]);
    group[key].forEach((values, idx) => {
      if (values && values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        medians[idx] = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
        console.log(`Mediana calculada para índice ${idx}:`, medians[idx], 'de', values.length, 'valores');
      } else {
        console.log(`No hay valores para índice ${idx}`);
      }
    });
  } else {
    console.log('No se encontraron datos para key:', key);
  }
  return medians;
};

const calculateGlobalMedians = (globalGroups: number[][]) => {
  const medians = Array(8).fill(0);
  globalGroups.forEach((values, idx) => {
    if (values && values.length > 0) {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      medians[idx] = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }
  });
  return medians;
};

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

  const [stats, setStats] = useState<LocalFormStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!answers) return;
    
    try {
      setLoading(true);
      const snapshot = await db().ref("/form_responses").once("value");
      console.log('Total de respuestas encontradas:', snapshot.numChildren());

      const allResponses: any[] = [];
      const promises: Promise<void>[] = [];
      
      // Obtener el classCode del usuario actual
      const userPath = formResponse.isGuest ? 'guests' : 'users';
      const userSnapshot = await db().ref(`/${userPath}/${formResponse.userId}`).once('value');
      const userData = userSnapshot.val();
      const userClassCode = userData?.classCode;
      
      console.log('Datos del usuario actual:', {
        userId: formResponse.userId,
        userPath,
        classCode: userClassCode,
        isGuest: formResponse.isGuest
      });
      
      snapshot.forEach((childSnapshot) => {
        const response = childSnapshot.child("physical_literacy").val();
        if (response && response.answers) {
          console.log('Respuesta encontrada:', {
            userId: response.userId,
            classCode: response.classCode,
            isGuest: response.isGuest,
            answersLength: response.answers.length
          });
          
          const promise = (async () => {
            const userId = response.userId;
            const userPath = response.isGuest ? 'guests' : 'users';
            const userSnapshot = await db().ref(`/${userPath}/${userId}`).once('value');
            const userData = userSnapshot.val();
            
            allResponses.push({
              ...response,
              age: userData?.age || 0,
              classCode: userData?.classCode || response.classCode || 'unknown'
            });
          })();
          promises.push(promise);
        }
        return undefined;
      });

      await Promise.all(promises);
      console.log('Total de respuestas procesadas:', allResponses.length);
      console.log('Distribución de classCodes:', 
        allResponses.reduce((acc, r) => {
          const code = (r.classCode || 'unknown').trim().toUpperCase();
          acc[code] = (acc[code] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      );

      // Calcular grupos fuera del map
      const classGroups = allResponses.reduce((acc, response) => {
        const classCode = (response.classCode || 'unknown').trim().toUpperCase();
        if (!acc[classCode]) {
          acc[classCode] = Array(8).fill(null).map(() => []);
        }
        response.answers.forEach((value: number | null, idx: number) => {
          if (value !== null && !isNaN(value)) {
            acc[classCode][idx].push(value);
          }
        });
        return acc;
      }, {} as Record<string, number[][]>);

      console.log('Grupos de clase encontrados:', {
        totalGroups: Object.keys(classGroups).length,
        groups: Object.keys(classGroups),
        userGroup: userClassCode,
        userGroupData: classGroups[userClassCode]
      });

      const countryGroups = allResponses.reduce((acc, response) => {
        const country = response.countryRole?.country || 'unknown';
        if (!acc[country]) {
          acc[country] = Array(8).fill(null).map(() => []);
        }
        response.answers.forEach((value: number | null, idx: number) => {
          if (value !== null && !isNaN(value)) {
            acc[country][idx].push(value);
          }
        });
        return acc;
      }, {} as Record<string, number[][]>);

      const ageGroups = allResponses.reduce((acc, response) => {
        const age = response.age || 0;
        if (!acc[age]) {
          acc[age] = Array(8).fill(null).map(() => []);
        }
        response.answers.forEach((value: number | null, idx: number) => {
          if (value !== null && !isNaN(value)) {
            acc[age][idx].push(value);
          }
        });
        return acc;
      }, {} as Record<number, number[][]>);

      const globalGroups = Array(8).fill(null).map(() => [] as number[]);
      allResponses.forEach(response => {
        response.answers.forEach((value: number | null, idx: number) => {
          if (value !== null && !isNaN(value)) {
            globalGroups[idx].push(value);
          }
        });
      });

      // Calcular medianas una sola vez
      const userCountry = formResponse.countryRole?.country || 'unknown';
      const userAge = userData?.age || 0;

      console.log('User data for medians:', {
        classCode: userClassCode,
        country: userCountry,
        age: userAge
      });

      const classMedians = calculateMedians(classGroups, userClassCode);
      const countryMedians = calculateMedians(countryGroups, userCountry);
      const ageMedians = calculateMedians(ageGroups, userAge.toString());
      const globalMedians = calculateGlobalMedians(globalGroups);

      // Log para verificación
      console.log('Medianas calculadas:', {
        classMedians,
        countryMedians,
        ageMedians,
        globalMedians
      });

      const calculatedStats = answers.map((userAnswer, questionIndex) => {
        const values = allResponses
          .map((response) => response.answers[questionIndex])
          .filter((value): value is number => value !== null && !isNaN(value));

        if (values.length === 0) {
          return {
            median: 0,
            mean: 0,
            belowMedian: 0,
            aboveMedian: 0,
            totalUsers: 0,
            min: 0,
            max: 0,
            distanceFromMedian: 0,
            percentageFromMedian: 0,
            classMedians,
            globalMedians,
            countryMedians,
            ageMedians
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
        const mean = values.reduce((a, b) => a + b, 0) / totalUsers;

        const distanceFromMedian = userAnswer !== null ? userAnswer - median : 0;
        const percentageFromMedian = median !== 0 
          ? ((userAnswer !== null ? userAnswer : 0) / median * 100) - 100 
          : 0;

        return {
          median,
          mean,
          belowMedian: values.filter(v => v < median).length,
          aboveMedian: values.filter(v => v > median).length,
          totalUsers,
          min,
          max,
          distanceFromMedian,
          percentageFromMedian,
          classMedians,
          globalMedians,
          countryMedians,
          ageMedians
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

  // Usar useFocusEffect para recargar datos cuando se monta el componente
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

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