// Components/FormScreen/MedianBarChart.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ComparisonData } from "../../types/formstats";
import { BarChart } from "react-native-gifted-charts";
import UserMarker from "./UserMarker";

interface MedianBarChartProps {
  data: number[];
  median: number;
  userScore: number;
  viewType: "class" | "global" | "country";
  classCode?: string;
  countryName?: string;
  allResponses: ComparisonData[];
}

const MedianBarChart: React.FC<MedianBarChartProps> = ({
  data,
  median,
  userScore,
  viewType,
  classCode,
  countryName,
  allResponses,
}) => {
  const calculatePercentiles = (scores: number[]) => {
    const sortedScores = [...scores].sort((a, b) => a - b);
    const len = sortedScores.length;

    return {
      p95: sortedScores[Math.floor(len * 0.95)],
      p85: sortedScores[Math.floor(len * 0.85)],
      p50: median,
      p15: sortedScores[Math.floor(len * 0.15)],
      p5: sortedScores[Math.floor(len * 0.05)],
    };
  };

  const getFilteredData = () => {
    switch (viewType) {
      case "class":
        return allResponses
          .filter((r) => r.classCode === classCode)
          .map((r) => r.score);
      case "country":
        return allResponses
          .filter((r) => r.country.toLowerCase() === countryName?.toLowerCase())
          .map((r) => r.score);
      case "global":
      default:
        return allResponses.map((r) => r.score);
    }
  };

  const getUserPercentile = () => {
    const sortedScores = [...filteredData].sort((a, b) => a - b);
    const position = sortedScores.filter((score) => score <= userScore).length;
    return (position / sortedScores.length) * 100;
  };

  const filteredData = getFilteredData();
  const percentiles = calculatePercentiles(filteredData);
  const userPercentile = getUserPercentile();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distribución de puntuaciones</Text>

      <View style={styles.graphContainer}>
        {/* Bandas coloreadas con valores numéricos */}
        <View
          style={[
            styles.percentileBand,
            {
              top: 0,
              height: "15%",
              backgroundColor: "rgba(255, 107, 107, 0.1)",
            },
          ]}
        />
        <View
          style={[
            styles.percentileBand,
            {
              top: "15%",
              height: "35%",
              backgroundColor: "rgba(255, 180, 66, 0.1)",
            },
          ]}
        />
        <View
          style={[
            styles.percentileBand,
            {
              top: "50%",
              height: "35%",
              backgroundColor: "rgba(74, 222, 128, 0.1)",
            },
          ]}
        />
        <View
          style={[
            styles.percentileBand,
            {
              top: "85%",
              height: "15%",
              backgroundColor: "rgba(158, 118, 118, 0.1)",
            },
          ]}
        />
        { /*Modificación en el renderizado del texto de los percentiles:*/}
        {[
          { label: "P95", position: 5, value: percentiles.p95 },
          { label: "P85", position: 15, value: percentiles.p85 },
          { label: "P50", position: 50, value: percentiles.p50 },
          { label: "P15", position: 85, value: percentiles.p15 },
        ].map((item, index) => (
          <View
            key={index}
            style={[styles.percentileLine, { top: `${item.position}%` }]}
          >
            <View style={styles.percentileLabelContainer}>
              <Text style={styles.percentileLabel}>{item.label}</Text>

            </View>
          </View>
        ))}
        {/* Marcador del usuario */}
        <View
          style={[
            styles.userMarker,
            {
              top: `${Math.max(0, Math.min(100 - userPercentile, 100))}%`,
              right: 10,
            },
          ]}
        >
          <UserMarker score={userScore} />
        </View>
      </View>

      <View style={styles.explanationContainer}>
        <Text style={styles.explanationTitle}>
          ¿Cómo interpretar esta gráfica?
        </Text>

        <View style={styles.explanationSection}>
          <Text style={styles.explanationSubtitle}>Bandas de Color:</Text>
          <View style={styles.explanationItem}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: "rgba(255, 107, 107, 0.4)" },
              ]}
            />
            <Text style={styles.explanationText}>
              Superior (P85+): Rendimiento excepcional
            </Text>
          </View>
          <View style={styles.explanationItem}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: "rgba(255, 180, 66, 0.4)" },
              ]}
            />
            <Text style={styles.explanationText}>
              Alto (P50-P85): Por encima del promedio
            </Text>
          </View>
          <View style={styles.explanationItem}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: "rgba(74, 222, 128, 0.4)" },
              ]}
            />
            <Text style={styles.explanationText}>
              Medio (P15-P50): Dentro del rango típico
            </Text>
          </View>
          <View style={styles.explanationItem}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: "rgba(158, 118, 118, 0.4)" },
              ]}
            />
            <Text style={styles.explanationText}>
              Bajo (-P15): Área de mejora potencial
            </Text>
          </View>
        </View>

        <View style={styles.explanationSection}>
          <Text style={styles.explanationSubtitle}>Tu Posición:</Text>
          <Text style={styles.explanationText}>
            • Tu puntuación ({userScore.toFixed(1)}) está en el percentil{" "}
            {userPercentile.toFixed(1)}
          </Text>
          <Text style={styles.explanationText}>
            • Esto significa que superas al {userPercentile.toFixed(1)}% de los
            estudiantes
          </Text>
        </View>

        <View style={styles.explanationSection}>
          <Text style={styles.explanationSubtitle}>Comparación:</Text>
          <Text style={styles.explanationText}>
            • Total de estudiantes: {filteredData.length}
          </Text>
          <Text style={styles.explanationText}>
            • Mediana del grupo: {percentiles.p50?.toFixed(1)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#594545",
    marginBottom: 16,
    textAlign: "center",
  },
  graphContainer: {
    height: 300,
    backgroundColor: "#fff",
    marginVertical: 20,
    position: "relative",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(158, 118, 118, 0.1)",
  },
  percentileBand: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  percentileLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(158, 118, 118, 0.5)',
    zIndex: 1,
  },
  percentileLabelContainer: {
    position: "absolute",
    left: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  percentileLabel: {
    position: "absolute",
    left: -40,
    top: -10,
    width: 35,
    textAlign: "right",
    fontSize: 12,
    color: "#666",
  },
  userMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    transform: [{ translateY: -20 }], // Ajusta la posición vertical para centrar el marcador
    zIndex: 999, // Asegura que el marcador esté siempre visible
  },
  explanationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "rgba(158, 118, 118, 0.05)",
    borderRadius: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#594545",
    marginBottom: 16,
  },
  explanationSection: {
    marginBottom: 16,
  },
  explanationSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#594545",
    marginBottom: 8,
  },
  explanationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  explanationText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  statsContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
});

export default MedianBarChart;
