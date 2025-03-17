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
import AdminFeedbackView from '../../Components/AdminFeedbackView/AdminFeedbackView';

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
  const [activeTab, setActiveTab] = useState<'stats' | 'feedback'>('stats');

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

  const renderContent = () => {
    if (activeTab === 'stats') {
      return (
        <View style={styles.statsContainer}>
          <Text style={styles.title}>Estadísticas</Text>
          {/* Aquí va el contenido de estadísticas existente */}
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
        </View>
      );
    } else {
      return <AdminFeedbackView language="es" />;
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
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Ionicons
              name="stats-chart"
              size={24}
              color={activeTab === 'stats' ? '#9E7676' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Estadísticas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'feedback' && styles.activeTab]}
            onPress={() => setActiveTab('feedback')}
          >
            <Ionicons
              name="star"
              size={24}
              color={activeTab === 'feedback' ? '#9E7676' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'feedback' && styles.activeTabText]}>
              Valoraciones
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderContent()}
        </ScrollView>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#9E7676',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#594545',
    marginBottom: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
