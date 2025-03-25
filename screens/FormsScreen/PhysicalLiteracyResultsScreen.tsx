import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormsStackParamList } from '../../navigation/types';
import { ResultsView } from './ResultsView';
import { View, ActivityIndicator, Text } from 'react-native';
import db from '@react-native-firebase/database';

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

  useEffect(() => {
    const loadStats = async () => {
      if (!answers) return; // Early return if answers not available
      
      try {
        const snapshot = await db().ref("/form_responses").once("value");

        const allResponses: any[] = [];
        const promises: Promise<void>[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const response = childSnapshot.child("physical_literacy").val();
          if (response && response.answers) {
            // Crear una promesa para cada consulta de usuario
            const promise = (async () => {
              const userId = response.userId;
              const userPath = response.isGuest ? 'guests' : 'users';
              const userSnapshot = await db().ref(`/${userPath}/${userId}`).once('value');
              const userData = userSnapshot.val();
              
              allResponses.push({
                ...response,
                age: userData?.age || 0
              });
            })();
            promises.push(promise);
          }
          return undefined;
        });

        // Esperar a que todas las consultas de usuario se completen
        await Promise.all(promises);

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
              classMedians: Array(8).fill(0),
              globalMedians: Array(8).fill(0),
              countryMedians: Array(8).fill(0),
              ageMedians: Array(8).fill(0)
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

          // Calcular medianas por clase
          const classGroups = allResponses.reduce((acc, response) => {
            const classCode = response.classCode || 'unknown';
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

          const classMedians = Array(8).fill(0);
          const userClassCode = formResponse.classCode || 'unknown';
          if (classGroups[userClassCode]) {
            classGroups[userClassCode].forEach((values: number[], idx: number) => {
              if (values.length > 0) {
                values.sort((a: number, b: number) => a - b);
                const mid = Math.floor(values.length / 2);
                classMedians[idx] = values.length % 2 === 0
                  ? (values[mid - 1] + values[mid]) / 2
                  : values[mid];
              }
            });
          }

          // Calcular medianas por país
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

          const countryMedians = Array(8).fill(0);
          const userCountry = formResponse.countryRole?.country || 'unknown';
          if (countryGroups[userCountry]) {
            countryGroups[userCountry].forEach((values: number[], idx: number) => {
              if (values.length > 0) {
                values.sort((a: number, b: number) => a - b);
                const mid = Math.floor(values.length / 2);
                countryMedians[idx] = values.length % 2 === 0
                  ? (values[mid - 1] + values[mid]) / 2
                  : values[mid];
              }
            });
          }

          // Calcular medianas por edad
          const ageGroups = allResponses.reduce((acc, response) => {
            // Obtener la edad del response
            const age = response.age || 0;
            console.log('Processing response for age:', age, 'with answers:', response.answers); // Debug log
            
            if (!acc[age]) {
              // Inicializar con arrays vacíos para cada pregunta
              acc[age] = Array(8).fill(null).map(() => []);
            }
            // Agregar cada respuesta al array correspondiente de su pregunta
            response.answers.forEach((value: number | null, idx: number) => {
              if (value !== null && !isNaN(value)) {
                acc[age][idx].push(value);
              }
            });
            return acc;
          }, {} as Record<number, number[][]>);

          const ageMedians = Array(8).fill(0);
          // Obtener la edad del usuario actual
          const userAge = formResponse.age || 0;
          console.log('User age:', userAge);
          console.log('Age groups available:', Object.keys(ageGroups));
          console.log('Age group data for user age:', ageGroups[userAge]); // Debug log
          
          if (ageGroups[userAge]) {
            // Procesar cada pregunta para el grupo de edad del usuario
            ageGroups[userAge].forEach((values: number[], idx: number) => {
              if (values && values.length > 0) {
                // Ordenar los valores para calcular la mediana
                const sortedValues = [...values].sort((a, b) => a - b);
                const mid = Math.floor(sortedValues.length / 2);
                ageMedians[idx] = sortedValues.length % 2 === 0
                  ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
                  : sortedValues[mid];
                console.log(`Question ${idx} - Values:`, values, 'Median:', ageMedians[idx]); // Debug log
              } else {
                console.log(`No values for question ${idx} in age group ${userAge}`); // Debug log
                // Si no hay valores, usar la mediana global para esta pregunta
                const globalValues = allResponses
                  .map(r => r.answers[idx])
                  .filter((v): v is number => v !== null && !isNaN(v));
                if (globalValues.length > 0) {
                  const sortedGlobal = [...globalValues].sort((a, b) => a - b);
                  const midGlobal = Math.floor(sortedGlobal.length / 2);
                  ageMedians[idx] = sortedGlobal.length % 2 === 0
                    ? (sortedGlobal[midGlobal - 1] + sortedGlobal[midGlobal]) / 2
                    : sortedGlobal[midGlobal];
                }
              }
            });
            console.log('Final age medians:', ageMedians); // Debug log
          } else {
            console.log('No data found for user age:', userAge); // Debug log
            // Si no hay datos para la edad del usuario, usar medianas globales
            allResponses.forEach(response => {
              response.answers.forEach((value: number | null, idx: number) => {
                if (value !== null && !isNaN(value)) {
                  const values = allResponses
                    .map(r => r.answers[idx])
                    .filter((v): v is number => v !== null && !isNaN(v));
                  if (values.length > 0) {
                    const sorted = [...values].sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    ageMedians[idx] = sorted.length % 2 === 0
                      ? (sorted[mid - 1] + sorted[mid]) / 2
                      : sorted[mid];
                  }
                }
              });
            });
            console.log('Using global medians for age:', ageMedians); // Debug log
          }

          // Calcular medianas globales (por cada pregunta)
          const globalGroups = Array(8).fill(null).map(() => [] as number[]);
          allResponses.forEach(response => {
            response.answers.forEach((value: number | null, idx: number) => {
              if (value !== null && !isNaN(value)) {
                globalGroups[idx].push(value);
              }
            });
          });

          const globalMedians = Array(8).fill(0);
          globalGroups.forEach((values, idx) => {
            if (values.length > 0) {
              values.sort((a: number, b: number) => a - b);
              const mid = Math.floor(values.length / 2);
              globalMedians[idx] = values.length % 2 === 0
                ? (values[mid - 1] + values[mid]) / 2
                : values[mid];
            }
          });

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