// Components/FormScreen/ComparisonData.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  ScrollView,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ComparisonData {
  userId: string;
  userName: string;
  score: number;
  classCode: string;
  country: string;
  age: number;
  completedAt: number;
}

interface MedianStats {
  median: number;
  belowMedian: number;
  aboveMedian: number;
  totalStudents: number;
  distanceFromMedian: number;
  percentageFromMedian: number;
}

interface ChartProps {
  userScore: number;
  userData: {
    name: string;
    classCode: string;
    country: string;
    age: number;
  };
  allResponses: ComparisonData[];
}

interface MedianBarChartProps {
  data: number[];
  median: number;
  userScore: number;
}

const ComparisonChart: React.FC<ChartProps> = ({
  userScore,
  userData,
  allResponses
}) => {
  const [activeView, setActiveView] = useState<'class' | 'global' | 'country'>('class');

  const calculateMedianStats = (data: ComparisonData[]): MedianStats => {
    const scores = data.map(r => r.score).sort((a, b) => a - b);
    const median = scores.length % 2 === 0 
      ? (scores[scores.length/2 - 1] + scores[scores.length/2]) / 2
      : scores[Math.floor(scores.length/2)];

    return {
      median,
      belowMedian: scores.filter(s => s < median).length,
      aboveMedian: scores.filter(s => s > median).length,
      totalStudents: scores.length,
      distanceFromMedian: userScore - median,
      percentageFromMedian: ((userScore - median) / median) * 100
    };
  };

  const renderMedianComparison = (stats: MedianStats, context: string) => {
    const isAboveMedian = stats.distanceFromMedian > 0;
    const atMedian = Math.abs(stats.distanceFromMedian) < 0.1;

    return (
      <View style={styles.medianComparisonCard}>
        <View style={styles.medianIndicator}>
          <View style={styles.medianLine}>
            <View style={styles.medianMarker} />
            <View 
              style={[
                styles.userScoreMarker,
                { 
                  left: `${50 + (stats.percentageFromMedian/2)}%`,
                  backgroundColor: atMedian ? '#FFB442' 
                    : isAboveMedian ? '#4ADE80' : '#FF6B6B'
                }
              ]} 
            />
          </View>
          <Text style={styles.medianLabel}>Mediana: {stats.median.toFixed(1)}</Text>
          <Text style={[
            styles.userScoreLabel,
            { color: atMedian ? '#FFB442' : isAboveMedian ? '#4ADE80' : '#FF6B6B' }
          ]}>
            Tu puntuación: {userScore.toFixed(1)}
          </Text>
        </View>

        <View style={styles.medianStats}>
          <View style={styles.statItem}>
            <Ionicons 
              name={atMedian ? "remove-circle" : isAboveMedian ? "arrow-up-circle" : "arrow-down-circle"} 
              size={24} 
              color={atMedian ? '#FFB442' : isAboveMedian ? '#4ADE80' : '#FF6B6B'}
            />
            <Text style={styles.statLabel}>
              {atMedian 
                ? "Estás en la mediana"
                : `${Math.abs(stats.percentageFromMedian).toFixed(1)}% ${isAboveMedian ? 'por encima' : 'por debajo'}`
              }
            </Text>
          </View>

          <View style={styles.distributionStats}>
            <Text style={styles.distributionLabel}>
              {`${stats.belowMedian} estudiantes por debajo • ${stats.aboveMedian} estudiantes por encima`}
            </Text>
          </View>
        </View>

        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>¿Qué significa esto?</Text>
          <Text style={styles.explanationText}>
            {atMedian 
              ? `Tu puntuación está justo en la mediana de ${context}. Esto significa que hay tantos estudiantes por encima como por debajo de tu puntuación.`
              : isAboveMedian
              ? `Tu puntuación está por encima de la mediana de ${context}. Específicamente, ${stats.aboveMedian} estudiantes tienen puntuaciones más bajas que tú.`
              : `Tu puntuación está por debajo de la mediana de ${context}. Hay ${stats.aboveMedian} estudiantes con puntuaciones más altas, ¡pero puedes mejorar!`
            }
          </Text>
        </View>
      </View>
    );
  };

  const renderClassView = () => {
    const classStats = calculateMedianStats(
      allResponses.filter(r => r.classCode === userData.classCode)
    );

    return (
      <View style={styles.viewContainer}>
        <View style={styles.headerCard}>
          <Ionicons name="school" size={32} color="#9E7676" />
          <Text style={styles.headerTitle}>Comparación con mi Clase</Text>
          <Text style={styles.headerSubtitle}>Código: {userData.classCode}</Text>
        </View>

        {renderMedianComparison(classStats, 'tu clase')}

        <MedianBarChart 
          data={
            allResponses
              .filter(r => r.classCode === userData.classCode)
              .map(r => r.score)
          }
          median={classStats.median}
          userScore={userScore}
        />
      </View>
    );
  };

  const renderGlobalView = () => {
    const globalStats = calculateMedianStats(allResponses);

    return (
      <View style={styles.viewContainer}>
        <View style={styles.headerCard}>
          <Ionicons name="globe" size={32} color="#9E7676" />
          <Text style={styles.headerTitle}>Comparación Global</Text>
        </View>

        {renderMedianComparison(globalStats, 'todos los estudiantes')}

        <MedianBarChart 
          data={allResponses.map(r => r.score)}
          median={globalStats.median}
          userScore={userScore}
        />
      </View>
    );
  };

  const renderCountryView = () => {
    const countries = ['España', 'Portugal', 'Brasil', 'Estados Unidos'];
    
    return (
      <View style={styles.viewContainer}>
        <View style={styles.headerCard}>
          <Ionicons name="flag" size={32} color="#9E7676" />
          <Text style={styles.headerTitle}>Comparación por Países</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {countries.map(country => {
            const countryStats = calculateMedianStats(
              allResponses.filter(r => r.country === country)
            );

            return (
              <View key={country} style={styles.countryCard}>
                <Text style={styles.countryName}>{country}</Text>
                {renderMedianComparison(countryStats, country)}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeView === 'class' && styles.activeTab]}
          onPress={() => setActiveView('class')}
        >
          <Ionicons 
            name="people" 
            size={24} 
            color={activeView === 'class' ? '#fff' : '#9E7676'} 
          />
          <Text style={[styles.tabText, activeView === 'class' && styles.activeTabText]}>
            Mi Clase
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeView === 'global' && styles.activeTab]}
          onPress={() => setActiveView('global')}
        >
          <Ionicons 
            name="globe" 
            size={24} 
            color={activeView === 'global' ? '#fff' : '#9E7676'} 
          />
          <Text style={[styles.tabText, activeView === 'global' && styles.activeTabText]}>
            Global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeView === 'country' && styles.activeTab]}
          onPress={() => setActiveView('country')}
        >
          <Ionicons 
            name="flag" 
            size={24} 
            color={activeView === 'country' ? '#fff' : '#9E7676'} 
          />
          <Text style={[styles.tabText, activeView === 'country' && styles.activeTabText]}>
            Por País
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeView === 'class' && renderClassView()}
        {activeView === 'global' && renderGlobalView()}
        {activeView === 'country' && renderCountryView()}
      </ScrollView>
    </View>
  );
};

const MedianBarChart: React.FC<MedianBarChartProps> = ({ data, median, userScore }) => {
  const getBuckets = () => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const bucketSize = range / 20;
    const buckets = Array(20).fill(0);
    
    data.forEach((value: number) => {
      const bucketIndex = Math.min(
        Math.floor((value - min) / bucketSize),
        19
      );
      buckets[bucketIndex]++;
    });
    
    const maxCount = Math.max(...buckets);
    return buckets.map(count => (count / maxCount) * 100);
  };

  const buckets = getBuckets();
  const medianPosition = ((median - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * 100;
  const userPosition = ((userScore - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * 100;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitleText}>Distribución de Puntuaciones</Text>
      
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
        
        <View style={[styles.medianLine, { left: `${medianPosition}%` }]} />
        <View style={[styles.scoreIndicatorLine, { left: `${userPosition}%` }]} />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.medianIndicatorDot]} />
          <Text style={styles.legendText}>Mediana</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.scoreIndicatorDot]} />
          <Text style={styles.legendText}>Tu puntuación</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  chartTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#594545',
    marginBottom: 16,
  },
  scoreIndicatorLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#4ADE80',
  },
  medianIndicatorDot: {
    backgroundColor: '#9E7676',
  },
  scoreIndicatorDot: {
    backgroundColor: '#4ADE80',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#9E7676',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E7676',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  viewContainer: {
    marginBottom: 20,
  },
  headerCard: {
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#594545',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9E7676',
    marginTop: 4,
  },
  medianComparisonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medianIndicator: {
    marginVertical: 20,
  },
  medianLine: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginVertical: 20,
    position: 'relative',
  },
  medianMarker: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -2 }],
    width: 4,
    height: 16,
    backgroundColor: '#9E7676',
    borderRadius: 2,
    top: -6,
  },
  userScoreMarker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ADE80',
    top: -4,
    transform: [{ translateX: -6 }],
  },
  medianLabel: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -30 }],
    bottom: -40,
    fontSize: 12,
    color: '#9E7676',
    fontWeight: '500',
  },
  userScoreLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '600',
    bottom: -40,
  },
  medianStats: {
    marginTop: 40,
    padding: 12,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderRadius: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#594545',
    fontWeight: '500',
  },
  distributionStats: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(158, 118, 118, 0.2)',
  },
  distributionLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  explanationCard: {
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
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  chartContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryCard: {
    width: Dimensions.get('window').width - 64,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#594545',
    marginBottom: 16,
  },
  // Estilos para la gráfica de barras
  barChart: {
    marginTop: 20,
    marginBottom: 10,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 20,
  },
  bar: {
    width: 8,
    marginHorizontal: 2,
    backgroundColor: 'rgba(158, 118, 118, 0.3)',
    borderRadius: 4,
  },
  medianBar: {
    backgroundColor: '#9E7676',
  },
  userBar: {
    backgroundColor: '#4ADE80',
  },
  // Estilos para la leyenda de la gráfica
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
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
  // Estilos para métricas adicionales
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(158, 118, 118, 0.2)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#594545',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // Estilos para indicadores de progreso
  progressIndicator: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#594545',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  // Estilos para mensajes motivacionales
  motivationalMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 8,
  },
  motivationalText: {
    fontSize: 13,
    color: '#594545',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Estilos para botones de acción
  actionButton: {
    marginTop: 16,
    backgroundColor: '#9E7676',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para tooltips y ayudas
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 4,
    maxWidth: 200,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
  },
  helpButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
});

export default ComparisonChart;