import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import db from "@react-native-firebase/database";
import DocumentPicker from "react-native-document-picker";
import { ExcelDataHandler } from "./ExcelDataHandler";

interface StatsSummary {
  totalStudents: number;
  totalGuests: number;
  totalResponses: number;
  lastWeekResponses: number;
  responsesByDay: {
    date: string;
    count: number;
  }[];
}

export const StatisticsScreen: React.FC = () => {
  const [stats, setStats] = useState<StatsSummary>({
    totalStudents: 0,
    totalGuests: 0,
    totalResponses: 0,
    lastWeekResponses: 0,
    responsesByDay: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  // Añade el estado de animación
  const [spinAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchStats();
  }, []);

  // Función para iniciar la animación
  const startSpinAnimation = () => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Función para detener la animación
  const stopSpinAnimation = () => {
    spinAnim.stopAnimation();
    spinAnim.setValue(0);
  };

  const fetchStats = async () => {
    try {
      startSpinAnimation();
      setLoading(true);
      const [usersSnapshot, guestsSnapshot, responsesSnapshot] =
        await Promise.all([
          db().ref("/users").once("value"),
          db().ref("/guests").once("value"),
          db().ref("/form_responses").once("value"),
        ]);

      const users = usersSnapshot.val() || {};
      const guests = guestsSnapshot.val() || {};
      const responses = responsesSnapshot.val() || {};

      const totalStudents = Object.values(users).filter(
        (user) => (user as any).role === "student"
      ).length;
      const totalGuests = Object.keys(guests).length;

      const responseData = new Map<string, number>();
      let totalResponses = 0;
      let lastWeekResponses = 0;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      Object.values(responses).forEach((userResponses: any) => {
        Object.values(userResponses).forEach((response: any) => {
          totalResponses++;
          const date = new Date(response.completedAt)
            .toISOString()
            .split("T")[0];
          responseData.set(date, (responseData.get(date) || 0) + 1);

          if (response.completedAt > oneWeekAgo) {
            lastWeekResponses++;
          }
        });
      });

      const responsesByDay = Array.from(responseData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }));

      setStats({
        totalStudents,
        totalGuests,
        totalResponses,
        lastWeekResponses,
        responsesByDay,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      Alert.alert("Error", "No se pudieron cargar las estadísticas");
    } finally {
      setLoading(false);
      stopSpinAnimation();
    }
  };

  // Crear el estilo de rotación
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await ExcelDataHandler.exportData();
    } catch (error) {
      console.error("Error exporting:", error);
      Alert.alert("Error", "No se pudo exportar el archivo Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleImportExcel = async () => {
    try {
      setImporting(true);
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
      });

      const fileUri = result[0].uri;
      await ExcelDataHandler.importData(fileUri);
      await fetchStats(); // Actualizar las estadísticas después de importar
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("Error importing:", err);
        Alert.alert("Error", "No se pudo importar el archivo");
      }
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9E7676" />
        </View>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Panel de Control</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchStats}
              disabled={loading}
            >
              <Animated.View
                style={{ transform: [{ rotate: spin }] }}
              ></Animated.View>
              <Ionicons
                name="refresh"
                size={20}
                color="#fff"
                style={loading ? styles.rotating : undefined}
              />
            </TouchableOpacity>
            <View style={styles.teacherBadge}>
              <Ionicons name="school" size={20} color="#fff" />
              <Text style={styles.teacherBadgeText}>Profesor</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.container}>
          {/* Quick Stats Cards */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatCard}>
              <Ionicons name="people" size={24} color="#9E7676" />
              <Text style={styles.quickStatValue}>
                {stats.totalStudents + stats.totalGuests}
              </Text>
              <Text style={styles.quickStatLabel}>Usuarios Totales</Text>
            </View>

            <View style={styles.quickStatCard}>
              <Ionicons name="document-text" size={24} color="#9E7676" />
              <Text style={styles.quickStatValue}>{stats.totalResponses}</Text>
              <Text style={styles.quickStatLabel}>Respuestas</Text>
            </View>

            <View style={styles.quickStatCard}>
              <Ionicons name="time" size={24} color="#9E7676" />
              <Text style={styles.quickStatValue}>
                {stats.lastWeekResponses}
              </Text>
              <Text style={styles.quickStatLabel}>Última Semana</Text>
            </View>
          </View>

          {/* Detailed Stats Card */}
          <View style={styles.detailedStatsCard}>
            <Text style={styles.cardTitle}>Estadísticas Detalladas</Text>

            <View style={styles.statRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Estudiantes Registrados</Text>
                <Text style={styles.statValue}>{stats.totalStudents}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Usuarios Invitados</Text>
                <Text style={styles.statValue}>{stats.totalGuests}</Text>
              </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Respuestas por Día</Text>
              {stats.responsesByDay.length > 0 ? (
                <LineChart
                  data={{
                    labels: stats.responsesByDay
                      .slice(-7)
                      .map((d) => d.date.split("-")[2]),
                    datasets: [
                      {
                        data: stats.responsesByDay
                          .slice(-7)
                          .map((d) => d.count),
                      },
                    ],
                  }}
                  width={Dimensions.get("window").width - 60}
                  height={220}
                  yAxisLabel=""
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(158, 118, 118, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(89, 69, 69, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#9E7676",
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              ) : (
                <Text style={styles.noDataText}>No hay datos disponibles</Text>
              )}
            </View>
          </View>

          {/* Actions Card */}
          <View style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Acciones</Text>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.exportButton,
                exporting && styles.buttonDisabled,
              ]}
              onPress={handleExportExcel}
              disabled={exporting}
            >
              <Ionicons name="download-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {exporting ? "Exportando..." : "Exportar Datos"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.importButton,
                importing && styles.buttonDisabled,
              ]}
              onPress={handleImportExcel}
              disabled={importing}
            >
              <Ionicons name="cloud-upload-sharp" size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {importing ? "Importando..." : "Importar Datos"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(158, 118, 118, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  teacherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  teacherBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickStatCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  refreshButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    marginLeft: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  rotating: {
    opacity: 0.7,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9E7676",
    marginVertical: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#594545",
    textAlign: "center",
  },
  detailedStatsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9E7676",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  statLabel: {
    fontSize: 14,
    color: "#594545",
    marginBottom: 8,
    textAlign: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9E7676",
  },
  chartContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#594545",
    marginBottom: 10,
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    color: "#594545",
    fontSize: 14,
    padding: 20,
  },
  actionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 12,
    gap: 8,
  },
  exportButton: {
    backgroundColor: "#9E7676",
  },
  importButton: {
    backgroundColor: "#594545",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
});
