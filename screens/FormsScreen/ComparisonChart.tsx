import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComparisonData } from "../../types/formstats";
import MedianBarChart from "./MedianBarChart";
import db from "@react-native-firebase/database";
import { FormResponse } from "../../types/form";

interface MedianStats {
  median: number;
  belowMedian: number;
  aboveMedian: number;
  atMedian: number;
  totalStudents: number;
  distanceFromMedian: number;
  percentageFromMedian: number;
}

interface ChartProps {
  userScore: number;
  userData: {
    userId: string;
    name: string;
    classCode: string;
    country: string;
    age: number;
  };
  questionIndex: number;
  formResponse?: FormResponse;
}

const ComparisonChart: React.FC<ChartProps> = ({
  userScore,
  userData,
  questionIndex,
  formResponse,
}) => {
  const [activeView, setActiveView] = useState<"class" | "global" | "country">(
    "class"
  );
  const [allResponses, setAllResponses] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      setIsLoading(true);
      try {
        // Si es un usuario guest, primero obtenemos su código de clase
        if (formResponse?.isGuest && userData.userId) {
          const guestSnapshot = await db()
            .ref(`/guests/${userData.userId}`)
            .once("value");

          const guestData = guestSnapshot.val();

          if (guestData?.classCode) {
            userData.classCode = guestData.classCode;
          }
        }

        // Cargar todas las respuestas
        const [formResponsesSnapshot, usersSnapshot, guestsSnapshot] =
          await Promise.all([
            db().ref("/form_responses").once("value"),
            db().ref("/users").once("value"),
            db().ref("/guests").once("value"),
          ]);

        const formResponses = formResponsesSnapshot.val() || {};
        const users = usersSnapshot.val() || {};
        const guests = guestsSnapshot.val() || {};


        const responses: ComparisonData[] = [];

        Object.entries(formResponses).forEach(
          ([userId, responseData]: [string, any]) => {
            const physicalLiteracy = responseData.physical_literacy;

            if (physicalLiteracy?.answers?.[questionIndex] !== undefined) {
              const userInfo = users[userId] || guests[userId];
              const userName = userInfo?.name || "Anónimo";

              responses.push({
                userId,
                userName,
                score: physicalLiteracy.answers[questionIndex],
                classCode:
                  userInfo?.classCode || physicalLiteracy.classCode || "",
                country:
                  userInfo?.countryRole?.country ||
                  physicalLiteracy.country ||
                  "Unknown",
                age: userInfo?.age || 0,
                completedAt: physicalLiteracy.completedAt,
              });
            }
          }
        );

        setAllResponses(responses);
      } catch (error) {
        console.error("Error loading responses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResponses();
  }, [questionIndex, userData.userId, formResponse]);

  const calculateMedianStats = (data: ComparisonData[]): MedianStats => {
    if (!data || data.length === 0) {
      return {
        median: 0,
        belowMedian: 0,
        aboveMedian: 0,
        atMedian: 0,
        totalStudents: 0,
        distanceFromMedian: 0,
        percentageFromMedian: 0,
      };
    }

    // Obtener y ordenar los scores válidos
    const scores = data
      .map((r) => r.score)
      .filter((score): score is number => score !== null && !isNaN(score))
      .sort((a, b) => a - b);

    // Calcular la mediana
    const mid = Math.floor(scores.length / 2);
    const median =
      scores.length % 2 === 0
        ? (scores[mid - 1] + scores[mid]) / 2
        : scores[mid];

    // Contar estudiantes en cada categoría
    const belowMedian = scores.filter((s) => s < median).length;
    const aboveMedian = scores.filter((s) => s > median).length;
    const atMedian = scores.filter((s) => s === median).length;

    // Calcular la distancia desde la mediana
    const distanceFromMedian = userScore - median;

    // Calcular el porcentaje desde la mediana teniendo en cuenta la distribución
    let percentageFromMedian = 0;
    if (median !== 0) {
      if (Math.abs(distanceFromMedian) < 0.1) {
        // Si está en la mediana, el porcentaje es 0
        percentageFromMedian = 0;
      } else {
        // Calcular el porcentaje teniendo en cuenta la distribución
        const totalScores = scores.length;
        if (userScore > median) {
          // Si está por encima, calcular qué porcentaje de estudiantes está por debajo
          const studentsBelow = belowMedian + atMedian / 2;
          percentageFromMedian = (studentsBelow / totalScores) * 100;
        } else {
          // Si está por debajo, calcular qué porcentaje de estudiantes está por encima
          const studentsAbove = aboveMedian + atMedian / 2;
          percentageFromMedian = -(studentsAbove / totalScores) * 100;
        }
      }
    }

    return {
      median,
      belowMedian,
      aboveMedian,
      atMedian,
      totalStudents: scores.length,
      distanceFromMedian,
      percentageFromMedian,
    };
  };

  const renderMedianComparison = (stats: MedianStats, context: string) => {
    if (stats.totalStudents === 0) {
      return (
        <View style={styles.medianComparisonCard}>
          <Text style={styles.noDataText}>
            No hay datos disponibles para comparar en {context}
          </Text>
        </View>
      );
    }

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
                  left: `${Math.min(
                    Math.max(50 + stats.percentageFromMedian / 2, 0),
                    100
                  )}%`,
                  backgroundColor: atMedian
                    ? "#FFB442"
                    : isAboveMedian
                    ? "#4ADE80"
                    : "#FF6B6B",
                },
              ]}
            />
          </View>
          <Text style={styles.medianLabel}>
            Mediana: {stats.median.toFixed(1)}
          </Text>
          <Text
            style={[
              styles.userScoreLabel,
              {
                color: atMedian
                  ? "#FFB442"
                  : isAboveMedian
                  ? "#4ADE80"
                  : "#FF6B6B",
                left: `${Math.min(
                  Math.max(50 + stats.percentageFromMedian / 2, 0),
                  100
                )}%`,
              },
            ]}
          >
            Tu puntuación:{"\n"}
            {userScore.toFixed(1)}
          </Text>
        </View>

        <View style={styles.medianStats}>
          <View style={styles.statItem}>
            <Ionicons
              name={
                atMedian
                  ? "remove-circle"
                  : isAboveMedian
                  ? "arrow-up-circle"
                  : "arrow-down-circle"
              }
              size={24}
              color={
                atMedian ? "#FFB442" : isAboveMedian ? "#4ADE80" : "#FF6B6B"
              }
            />
            <Text style={styles.statLabel}>
              {atMedian
                ? "Estás en la mediana"
                : `${Math.abs(stats.percentageFromMedian).toFixed(1)}% ${
                    isAboveMedian ? "por encima" : "por debajo"
                  }`}
            </Text>
          </View>

          <View style={styles.distributionStats}>
            <Text style={styles.distributionLabel}>
              {`${stats.belowMedian} estudiantes por debajo • ${stats.atMedian} en la mediana • ${stats.aboveMedian} por encima • ${stats.totalStudents} total`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderClassView = () => {

    if (!userData.classCode && formResponse?.isGuest) {
      // Intentar obtener el código de clase del guest
      const guestId = userData.userId;
      db()
        .ref(`/guests/${guestId}`)
        .once("value")
        .then((snapshot) => {
          const guestData = snapshot.val();
          if (guestData?.classCode) {
            userData.classCode = guestData.classCode;
          }
        });
    }

    if (!userData.classCode) {
      return (
        <View style={styles.viewContainer}>
          <View style={styles.headerCard}>
            <Ionicons name="school" size={32} color="#9E7676" />
            <Text style={styles.headerTitle}>Comparación con mi Clase</Text>
            <Text style={styles.headerSubtitle}>
              Sin código de clase asignado
            </Text>
          </View>
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>
              Necesitas un código de clase asignado para ver comparaciones
            </Text>
          </View>
        </View>
      );
    }

    const classResponses = allResponses.filter(
      (r) => r.classCode === userData.classCode
    );
    const classStats = calculateMedianStats(classResponses);

    return (
      <View style={styles.viewContainer}>
        <View style={styles.headerCard}>
          <Ionicons name="school" size={32} color="#9E7676" />
          <Text style={styles.headerTitle}>Comparación con mi Clase</Text>
          <Text style={styles.headerSubtitle}>
            {`Código: ${userData.classCode} ${
              classResponses.length > 0
                ? `(${classResponses.length} estudiantes)`
                : ""
            }`}
          </Text>
        </View>

        {classResponses.length > 0 ? (
          <>
            {renderMedianComparison(classStats, "tu clase")}
            <MedianBarChart
              data={classResponses.map((r) => r.score)}
              median={classStats.median}
              userScore={userScore}
              viewType="class"
              classCode={userData.classCode}
              countryName={userData.country}
              allResponses={allResponses} // Pasar todas las respuestas
            />
          </>
        ) : (
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>
              No hay suficientes datos en tu clase para hacer comparaciones
            </Text>
          </View>
        )}
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
          <Text style={styles.headerSubtitle}>
            {allResponses.length} estudiantes en total
          </Text>
        </View>

        {allResponses.length > 0 ? (
          <>
            {renderMedianComparison(globalStats, "todos los estudiantes")}
            <MedianBarChart
              data={allResponses.map((r) => r.score)}
              median={globalStats.median}
              userScore={userScore}
              viewType="global"
              classCode={userData.classCode}
              countryName={userData.country}
              allResponses={allResponses}
            />
          </>
        ) : (
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>
              No hay datos globales disponibles para comparar
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCountryView = () => {
    const countryResponses = allResponses.filter(
      (r) =>
        r.country && r.country.toLowerCase() === userData.country.toLowerCase()
    );

    const countryStats = calculateMedianStats(countryResponses);

    return (
      <View style={styles.viewContainer}>
        <View style={styles.headerCard}>
          <Ionicons name="flag" size={32} color="#9E7676" />
          <Text style={styles.headerTitle}>Comparación por País</Text>
          <Text style={styles.headerSubtitle}>
            {userData.country || "País no especificado"}
            {countryResponses.length > 0
              ? ` (${countryResponses.length} estudiantes)`
              : ""}
          </Text>
        </View>

        {countryResponses.length > 0 ? (
          <>
            {renderMedianComparison(countryStats, "tu país")}
            <MedianBarChart
              data={countryResponses.map((r) => r.score)}
              median={countryStats.median}
              userScore={userScore}
              viewType="country"
              classCode={userData.classCode}
              countryName={userData.country}
              allResponses={allResponses}
            />
          </>
        ) : (
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>
              No hay datos disponibles para comparar en tu país
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeView === "class" && styles.activeTab]}
          onPress={() => setActiveView("class")}
        >
          <Ionicons
            name="people"
            size={24}
            color={activeView === "class" ? "#fff" : "#9E7676"}
          />
          <Text
            style={[
              styles.tabText,
              activeView === "class" && styles.activeTabText,
            ]}
          >
            Mi Clase
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeView === "global" && styles.activeTab]}
          onPress={() => setActiveView("global")}
        >
          <Ionicons
            name="globe"
            size={24}
            color={activeView === "global" ? "#fff" : "#9E7676"}
          />
          <Text
            style={[
              styles.tabText,
              activeView === "global" && styles.activeTabText,
            ]}
          >
            Global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeView === "country" && styles.activeTab]}
          onPress={() => setActiveView("country")}
        >
          <Ionicons
            name="flag"
            size={24}
            color={activeView === "country" ? "#fff" : "#9E7676"}
          />
          <Text
            style={[
              styles.tabText,
              activeView === "country" && styles.activeTabText,
            ]}
          >
            Por País
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
            {activeView === "class" && renderClassView()}
            {activeView === "global" && renderGlobalView()}
            {activeView === "country" && renderCountryView()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#9E7676",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9E7676",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  viewContainer: {
    marginBottom: 20,
  },
  headerCard: {
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#594545",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9E7676",
    marginTop: 4,
  },
  medianComparisonCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noDataText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    padding: 20,
  },
  medianIndicator: {
    marginVertical: 20,
  },
  medianLine: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginVertical: 20,
    position: "relative",
  },
  medianMarker: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -2 }],
    width: 4,
    height: 16,
    backgroundColor: "#9E7676",
    borderRadius: 2,
    top: -6,
  },
  userScoreMarker: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ADE80",
    top: -4,
    transform: [{ translateX: -6 }],
  },
  medianLabel: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -30 }],
    bottom: -40,
    fontSize: 12,
    color: "#9E7676",
    fontWeight: "500",
  },
  userScoreLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    bottom: -20,
    transform: [{ translateX: -40 }],
  },
  medianStats: {
    marginTop: 40,
    padding: 12,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderRadius: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#594545",
    fontWeight: "500",
  },
  distributionStats: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(158, 118, 118, 0.2)",
  },
  distributionLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default ComparisonChart;
