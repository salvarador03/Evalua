import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import { translations } from '../../Components/LanguageSelection/translations';
import { Ionicons } from "@expo/vector-icons";
import { Language } from '../../types/language';

interface SpiderChartProps {
  userScores: number[];
  classScores?: number[];
  globalScores?: number[];
  countryScores?: number[];
  ageScores?: number[];
  language: Language;
  domainLabels: string[];
}

interface ComparisonFilter {
  id: 'class' | 'global' | 'country' | 'age';
  active: boolean;
  color: string;
  fillColor: string;
  scores?: number[];
  icon: string;
}

const SpiderChart: React.FC<SpiderChartProps> = ({
  userScores,
  classScores,
  globalScores,
  countryScores,
  ageScores,
  language,
  domainLabels,
}) => {
  // Validación de datos
  useEffect(() => {
    console.log('Datos recibidos en SpiderChart:', {
      userScores: {
        length: userScores.length,
        values: userScores
      },
      classScores: {
        length: classScores?.length,
        values: classScores
      },
      globalScores: {
        length: globalScores?.length,
        values: globalScores
      },
      countryScores: {
        length: countryScores?.length,
        values: countryScores
      },
      ageScores: {
        length: ageScores?.length,
        values: ageScores
      }
    });

    // Verificar que todos los arrays tengan la longitud correcta
    const expectedLength = 8;
    const arrays = [
      { name: 'userScores', data: userScores },
      { name: 'classScores', data: classScores },
      { name: 'globalScores', data: globalScores },
      { name: 'countryScores', data: countryScores },
      { name: 'ageScores', data: ageScores },
    ];

    arrays.forEach(({ name, data }) => {
      if (data && data.length !== expectedLength) {
        console.warn(`⚠️ ${name} tiene longitud ${data.length}, se esperaba ${expectedLength}`);
      }
      if (data && data.some(score => score === 0)) {
        console.warn(`⚠️ ${name} contiene valores en cero:`, data);
      }
    });
  }, [userScores, classScores, globalScores, countryScores, ageScores]);

  const [filters, setFilters] = useState<ComparisonFilter[]>([
    {
      id: 'class',
      active: false,
      color: '#9E7676',
      fillColor: 'rgba(158, 118, 118, 0.15)',
      scores: classScores,
      icon: 'school'
    },
    {
      id: 'global',
      active: false,
      color: '#A855F7',
      fillColor: 'rgba(168, 85, 247, 0.15)',
      scores: globalScores,
      icon: 'globe'
    },
    {
      id: 'country',
      active: false,
      color: '#3B82F6',
      fillColor: 'rgba(59, 130, 246, 0.15)',
      scores: countryScores,
      icon: 'flag'
    },
    {
      id: 'age',
      active: false,
      color: '#F59E0B',
      fillColor: 'rgba(245, 158, 11, 0.15)',
      scores: ageScores,
      icon: 'calendar'
    }
  ]);

  // Actualizar los filtros cuando cambien las props
  useEffect(() => {
    setFilters(prev => {
      const newFilters = prev.map(filter => ({
        ...filter,
        scores: 
          filter.id === 'class' ? classScores :
          filter.id === 'global' ? globalScores :
          filter.id === 'country' ? countryScores :
          filter.id === 'age' ? ageScores :
          undefined
      }));
      return newFilters;
    });
  }, [classScores, globalScores, countryScores, ageScores]);

  const width = Dimensions.get('window').width - 96;
  const height = width;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 80;

  const getKeywords = (index: number): string[] => {
    const questionKeywords: { [key: number]: string[] } = {
      0: ['Condición', 'Física'],
      1: ['Actividad', 'Semanal'],
      2: ['Conocimiento', 'Educación'],
      3: ['Motivación', 'Interés'],
      4: ['Social', 'Relaciones'],
      5: ['Seguridad', 'Confianza'],
      6: ['Competencia', 'Habilidad'],
      7: ['Alfabetización', 'Física']
    };
    return questionKeywords[index] || ['', ''];
  };

  const getPoints = (scores: number[]) => {
    if (!scores || scores.length !== 8) {
      console.warn('Scores inválidos para getPoints:', scores);
      return '';
    }
    return scores.map((score, index) => {
      const angle = (Math.PI * 2 * index) / scores.length;
      const normalizedScore = score / 10;
      const x = centerX + radius * normalizedScore * Math.cos(angle - Math.PI / 2);
      const y = centerY + radius * normalizedScore * Math.sin(angle - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ');
  };

  const getAxisPoints = (index: number) => {
    const angle = (Math.PI * 2 * index) / userScores.length;
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  const toggleFilter = (filterId: ComparisonFilter['id']) => {
    setFilters(prev => prev.map(filter => {
      if (filter.id === filterId) {
        const newActive = !filter.active;
        if (newActive && (!filter.scores || filter.scores.length !== 8)) {
          console.warn(`⚠️ Activando filtro ${filterId} con datos incompletos:`, {
            scores: filter.scores,
            length: filter.scores?.length
          });
        }
        return { ...filter, active: newActive };
      }
      return { ...filter, active: false };
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translations[language].comparisonByLevel}</Text>
      
      {/* Filtros */}
      <View style={styles.filters}>
        {filters.map(filter => {
          const hasScores = filter.scores && filter.scores.length === 8;
          const hasIncompleteData = filter.scores && filter.scores.length !== 8;
          
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                hasScores && styles.filterButtonEnabled,
                filter.active && { 
                  backgroundColor: filter.color,
                  borderColor: filter.color,
                }
              ]}
              onPress={() => {
                if (hasScores) {
                  toggleFilter(filter.id);
                } else {
                  console.log('Button disabled - no scores available');
                }
              }}
              disabled={!hasScores}
              activeOpacity={hasScores ? 0.7 : 1}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={filter.active ? '#FFF' : hasScores ? '#594545' : '#999'}
              />
              <Text style={[
                styles.filterText,
                filter.active && styles.filterTextActive,
                !hasScores && styles.filterTextDisabled
              ]}>
                {translations[language][filter.id]}
              </Text>
              {hasIncompleteData && (
                <View style={styles.warningBadge}>
                  <Ionicons name="warning" size={12} color="#FF6B6B" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Mensaje cuando no hay datos de comparación */}
      {!filters.some(f => f.scores && f.scores.length === 8) && (
        <View style={styles.noDataMessage}>
          <Ionicons name="information-circle-outline" size={24} color="#9E7676" />
          <Text style={styles.noDataText}>
            {translations[language].noComparisonData}
          </Text>
        </View>
      )}

      <Svg width={width} height={height}>
        {/* Líneas de referencia */}
        {[2, 4, 6, 8, 10].map((level) => (
          <Polygon
            key={`reference-${level}`}
            points={Array.from({ length: userScores.length }).map((_, index) => {
              const angle = (Math.PI * 2 * index) / userScores.length;
              const x = centerX + radius * (level / 10) * Math.cos(angle - Math.PI / 2);
              const y = centerY + radius * (level / 10) * Math.sin(angle - Math.PI / 2);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(158, 118, 118, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Ejes con etiquetas de dominio */}
        {userScores.map((_, index) => {
          const { x, y } = getAxisPoints(index);
          return (
            <React.Fragment key={`axis-${index}`}>
              <Line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="rgba(158, 118, 118, 0.2)"
                strokeWidth="1"
              />
              <SvgText
                x={x}
                y={y}
                fill="#594545"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
                dx={x > centerX ? 35 : x < centerX ? -35 : 0}
                dy={y > centerY ? 35 : y < centerY ? -35 : 0}
              >
                {domainLabels[index]}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Polígonos de comparación */}
        {filters.map(filter => {
          if (filter.active && filter.scores && filter.scores.length === 8) {
            return (
              <Polygon
                key={`comparison-${filter.id}`}
                points={getPoints(filter.scores)}
                fill={filter.fillColor}
                stroke={filter.color}
                strokeWidth="2"
              />
            );
          }
          return null;
        })}

        {/* Polígono del usuario */}
        <Polygon
          points={getPoints(userScores)}
          fill="rgba(74, 222, 128, 0.2)"
          stroke="rgba(74, 222, 128, 0.8)"
          strokeWidth="2"
        />
        {userScores.map((score, index) => {
          const angle = (Math.PI * 2 * index) / userScores.length;
          const normalizedScore = score / 10;
          const x = centerX + radius * normalizedScore * Math.cos(angle - Math.PI / 2);
          const y = centerY + radius * normalizedScore * Math.sin(angle - Math.PI / 2);
          return (
            <Circle
              key={`user-point-${index}`}
              cx={x}
              cy={y}
              r="4"
              fill="rgba(74, 222, 128, 1)"
            />
          );
        })}
      </Svg>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.userLegendItem}>
          <Text style={styles.userLegendText}>{translations[language].yourScore}</Text>
        </View>
        {filters.map(filter => {
          if (filter.active && filter.scores && filter.scores.length === 8) {
            return (
              <View key={`legend-${filter.id}`} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: filter.color }]} />
                <Text style={styles.legendText}>{translations[language][filter.id]}</Text>
              </View>
            );
          }
          return null;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 0,
    alignItems: 'center',
    width: '100%'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#594545',
    marginBottom: 12,
    textAlign: 'center',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    width: '100%'
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
    minWidth: 100,
    justifyContent: 'center',
  },
  filterButtonEnabled: {
    backgroundColor: '#fff',
    borderColor: '#E4D0D0',
  },
  filterText: {
    fontSize: 13,
    color: '#594545',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterTextDisabled: {
    color: '#999',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
    padding: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    padding: 6,
    borderRadius: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 13,
    color: '#594545',
    fontWeight: '500',
  },
  userLegendItem: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userLegendText: {
    fontSize: 13,
    color: '#4ADE80',
    fontWeight: '600',
  },
  warningBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 2,
  },
  noDataMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#9E7676',
    borderRadius: 6,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 13,
    color: '#9E7676',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default SpiderChart; 