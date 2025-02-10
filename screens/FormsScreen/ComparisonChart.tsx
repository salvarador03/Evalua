import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComparisonData } from "../../types/formstats";
import MedianBarChart from "./MedianBarChart";
import db from "@react-native-firebase/database";
import { FormResponse } from "../../types/form";
import { translations } from "../../Components/LanguageSelection/translations";
import { Language } from "../../types/language";

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
    countryRole: {
      country: string;
      language: string;
      flag: string;
    };
    country: string;
    age: number;
  };
  questionIndex: number;
  formResponse?: FormResponse;
  language: Language;
}

interface Filter {
  id: "class" | "global" | "country" | "age";
  active: boolean;
  icon: string;
  label: string;
}

const ComparisonChart: React.FC<ChartProps> = ({
  userScore,
  userData,
  questionIndex,
  formResponse,
  language,
}) => {
  const [filters, setFilters] = useState<Filter[]>([
    { id: "class", active: false, icon: "school", label: translations[language].class },
    { id: "global", active: false, icon: "globe", label: translations[language].global },
    { id: "country", active: false, icon: "flag", label: translations[language].country },
    { id: "age", active: true, icon: "calendar", label: translations[language].age }
  ]);
  const [allResponses, setAllResponses] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      setIsLoading(true);
      try {
        if (formResponse?.isGuest && userData.userId) {
          const guestSnapshot = await db()
            .ref(`/guests/${userData.userId}`)
            .once("value");

          const guestData = guestSnapshot.val();
          if (guestData?.classCode) {
            userData.classCode = guestData.classCode;
          }
        }

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
              // Usar la edad del formResponse para el usuario actual
              const age = userId === formResponse?.userId
                ? formResponse.age
                : userInfo?.age || 0;

              responses.push({
                userId,
                userName: userInfo?.name || "Anónimo",
                score: physicalLiteracy.answers[questionIndex],
                classCode: userInfo?.classCode || physicalLiteracy.classCode || "",
                country: userInfo?.countryRole?.country || physicalLiteracy.country || "Unknown",
                age: age,
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

    const scores = data
      .map((r) => r.score)
      .filter((score): score is number => score !== null && !isNaN(score))
      .sort((a, b) => a - b);

    const mid = Math.floor(scores.length / 2);
    const median =
      scores.length % 2 === 0
        ? (scores[mid - 1] + scores[mid]) / 2
        : scores[mid];

    const belowMedian = scores.filter((s) => s < median).length;
    const aboveMedian = scores.filter((s) => s > median).length;
    const atMedian = scores.filter((s) => s === median).length;

    const distanceFromMedian = userScore - median;

    let percentageFromMedian = 0;
    if (median !== 0) {
      if (Math.abs(distanceFromMedian) < 0.1) {
        percentageFromMedian = 0;
      } else {
        const totalScores = scores.length;
        if (userScore > median) {
          const studentsBelow = belowMedian + atMedian / 2;
          percentageFromMedian = (studentsBelow / totalScores) * 100;
        } else {
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

  const toggleFilter = (filterId: Filter['id']) => {
    setFilters(currentFilters =>
      currentFilters.map(filter => ({
        ...filter,
        active: filter.id === filterId ? !filter.active : filter.active
      }))
    );
  };

  // Modificamos la función getFilteredResponses
  const getFilteredResponses = () => {
    let filteredData = [...allResponses];
    const activeFilters = filters.filter(f => f.active);

    if (activeFilters.length === 0) return [];

    activeFilters.forEach(filter => {
      switch (filter.id) {
        case "class":
          if (userData.classCode) {
            filteredData = filteredData.filter(r => r.classCode === userData.classCode);
          }
          break;
        case "age":
          if (userData?.age) {
            filteredData = filteredData.filter(r => r.age === userData.age);
          }
          break;
        case "country":
          // Usamos countryRole.country en lugar de country
          filteredData = filteredData.filter(
            r => r.country.toLowerCase() === (userData.countryRole?.country || "").toLowerCase()
          );
          break;
        case "global":
          // No aplicar filtro adicional para global
          break;
      }
    });

    return filteredData;
  };

  // Modificamos la función getComparisonTitle
  const getComparisonTitle = () => {
    const activeFilters = filters.filter(f => f.active);
    if (activeFilters.length === 0) return translations[language].selectFiltersToCompare;

    return activeFilters
      .map(f => {
        switch (f.id) {
          case "class": return translations[language].classComparison;
          case "global": return translations[language].globalComparison;
          case "country": return `${translations[language].countryComparison} ${userData.countryRole?.country || ""}`;
          case "age": return userData?.age
            ? `${translations[language].ageComparison} (${userData.age} ${translations[language].years})`
            : translations[language].ageComparison;
          default: return "";
        }
      })
      .join(" y ");
  };


  const renderMedianComparison = (stats: MedianStats, context: string) => {
    if (stats.totalStudents === 0) {
      return (
        <View style={styles.medianComparisonCard}>
          <Text style={styles.noDataText}>
            {translations[language].noDataAvailable}
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
            {translations[language].median}: {stats.median.toFixed(1)}
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
            {translations[language].score}:{"\n"}
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
                ? translations[language].atMedian
                : `${Math.abs(stats.percentageFromMedian).toFixed(1)}% ${isAboveMedian ? translations[language].aboveMedian : translations[language].belowMedian
                }`}
            </Text>
          </View>

          <View style={styles.distributionStats}>
            <Text style={styles.distributionLabel}>
              {`${stats.belowMedian} ${translations[language].students} ${translations[language].belowMedian} • ${stats.atMedian} ${translations[language].atMedian} • ${stats.aboveMedian} ${translations[language].aboveMedian} • ${stats.totalStudents} ${translations[language].total}`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderComparison = () => {
    const filteredResponses = getFilteredResponses();
    const stats = calculateMedianStats(filteredResponses);

    if (!userData.classCode && filters.some(f => f.id === "class" && f.active)) {
      return (
        <View style={styles.viewContainer}>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>{getComparisonTitle()}</Text>
          </View>
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>
              Necesitas un código de clase asignado para usar el filtro de clase
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.viewContainer}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>{getComparisonTitle()}</Text>
          {filteredResponses.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {filteredResponses.length} estudiantes
            </Text>
          )}
        </View>

        {filteredResponses.length > 0 ? (
          <>
            {renderMedianComparison(stats, "la selección")}
            <MedianBarChart
              data={filteredResponses.map(r => r.score)}
              median={stats.median}
              userScore={userScore}
              viewType="custom"
              classCode={userData.classCode}
              countryName={userData.countryRole?.country || ""}
              allResponses={allResponses}
              language={language}
            />
          </>
        ) : (
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>
              No hay datos disponibles para la combinación de filtros seleccionada
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {filters.slice(0, 2).map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, filter.active && styles.activeFilterChip]}
              onPress={() => toggleFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={20}
                color={filter.active ? "#fff" : "#9E7676"}
              />
              <Text
                style={[
                  styles.filterText,
                  filter.active && styles.activeFilterText
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          {filters.slice(2, 4).map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, filter.active && styles.activeFilterChip]}
              onPress={() => toggleFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={20}
                color={filter.active ? "#fff" : "#9E7676"}
              />
              <Text
                style={[
                  styles.filterText,
                  filter.active && styles.activeFilterText
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.medianComparisonCard}>
            <Text style={styles.noDataText}>Cargando datos...</Text>
          </View>
        ) : (
          renderComparison()
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
  filterContainer: {
    flexDirection: 'column',
    gap: 8,
    padding: 8,
    backgroundColor: '#F8F6F4',
    borderRadius: 12,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E4D0D0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '45%',
    minWidth: 130,
  },
  activeFilterChip: {
    backgroundColor: '#9E7676',
    borderColor: '#9E7676',
  },
  filterText: {
    fontSize: 15,
    color: '#9E7676',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
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
  headerValue: {
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
