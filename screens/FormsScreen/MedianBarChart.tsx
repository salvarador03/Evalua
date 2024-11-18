// Components/FormScreen/MedianBarChart.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
} from 'react-native';

interface MedianBarChartProps {
    data: number[];
    median: number;
    userScore: number;
  }
  
  const MedianBarChart: React.FC<MedianBarChartProps> = ({ data, median, userScore }) => {
    const getBuckets = () => {
      // Crear 20 segmentos para la distribución
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min;
      const bucketSize = range / 20;
      
      // Inicializar buckets
      const buckets = Array(20).fill(0);
      
      // Distribuir los datos en buckets
      data.forEach(value => {
        const bucketIndex = Math.min(
          Math.floor((value - min) / bucketSize),
          19
        );
        buckets[bucketIndex]++;
      });
      
      // Normalizar alturas (0-100)
      const maxCount = Math.max(...buckets);
      return buckets.map(count => (count / maxCount) * 100);
    };
  
    const getMedianPosition = () => {
      const min = Math.min(...data);
      const max = Math.max(...data);
      return ((median - min) / (max - min)) * 100;
    };
  
    const getUserScorePosition = () => {
      const min = Math.min(...data);
      const max = Math.max(...data);
      return ((userScore - min) / (max - min)) * 100;
    };
  
    const buckets = getBuckets();
    const medianPos = getMedianPosition();
    const userScorePos = getUserScorePosition();
  
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Distribución de Puntuaciones</Text>
        
        <View style={styles.barContainer}>
          {buckets.map((height, index) => (
            <View
              key={index}
              style={[
                styles.bar,
                { height: `${Math.max(height, 5)}%` }
              ]}
            />
          ))}
          
          {/* Línea de la mediana */}
          <View
            style={[
              styles.medianLine,
              {
                left: `${medianPos}%`,
              }
            ]}
          >
            <View style={styles.medianMarker} />
            <Text style={styles.medianLabel}>Mediana</Text>
          </View>
  
          {/* Marcador de puntuación del usuario */}
          <View
            style={[
              styles.userScoreMarker,
              {
                left: `${userScorePos}%`,
              }
            ]}
          >
            <View style={styles.userScorePoint} />
            <Text style={styles.userScoreLabel}>Tú</Text>
          </View>
        </View>
  
        {/* Leyenda */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9E7676' }]} />
            <Text style={styles.legendText}>Mediana</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.legendText}>Tu puntuación</Text>
          </View>
        </View>
  
        {/* Estadísticas adicionales */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total estudiantes</Text>
            <Text style={styles.statValue}>{data.length}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Puntuación media</Text>
            <Text style={styles.statValue}>
              {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)}
            </Text>
          </View>
        </View>
  
        {/* Explicación para estudiantes */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>¿Cómo leer esta gráfica?</Text>
          <Text style={styles.explanationText}>
            Las barras muestran cuántos estudiantes obtuvieron cada puntuación.
            Las barras más altas significan que más estudiantes obtuvieron esa puntuación.
            La línea vertical muestra la mediana (punto medio) y el punto verde muestra tu puntuación.
          </Text>
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    chartContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#594545',
      marginBottom: 16,
      textAlign: 'center',
    },
    barContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 200,
      marginVertical: 20,
      paddingBottom: 20,
      position: 'relative',
    },
    bar: {
      flex: 1,
      backgroundColor: 'rgba(158, 118, 118, 0.2)',
      marginHorizontal: 1,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    medianLine: {
      position: 'absolute',
      height: '100%',
      width: 2,
      backgroundColor: '#9E7676',
      bottom: 0,
    },
    medianMarker: {
      position: 'absolute',
      top: -8,
      left: -4,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#9E7676',
    },
    medianLabel: {
      position: 'absolute',
      top: -24,
      left: -20,
      width: 40,
      textAlign: 'center',
      fontSize: 10,
      color: '#9E7676',
    },
    userScoreMarker: {
      position: 'absolute',
      bottom: 0,
      height: '100%',
    },
    userScorePoint: {
      position: 'absolute',
      top: '50%',
      left: -6,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4ADE80',
      borderWidth: 2,
      borderColor: '#fff',
    },
    userScoreLabel: {
      position: 'absolute',
      top: '50%',
      left: -10,
      width: 20,
      textAlign: 'center',
      fontSize: 10,
      color: '#4ADE80',
      marginTop: 14,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(158, 118, 118, 0.1)',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
      color: '#666',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(158, 118, 118, 0.1)',
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#594545',
    },
    statDivider: {
      width: 1,
      backgroundColor: 'rgba(158, 118, 118, 0.1)',
    },
    explanationBox: {
      marginTop: 16,
      padding: 12,
      backgroundColor: 'rgba(158, 118, 118, 0.1)',
      borderRadius: 8,
    },
    explanationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#594545',
      marginBottom: 8,
    },
    explanationText: {
      fontSize: 12,
      color: '#666',
      lineHeight: 18,
    },
  });
  
  export default MedianBarChart;