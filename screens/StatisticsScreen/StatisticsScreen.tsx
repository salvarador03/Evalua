// src/screens/StatisticsScreen/StatisticsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import db from '@react-native-firebase/database';
import { Ionicons } from '@expo/vector-icons';

interface StatsSummary {
  totalStudents: number;
  averageCompletion: number;
  lastWeekSubmissions: number;
  weeklyStats: WeeklyStat[];
}

interface WeeklyStat {
  week: string;
  submissions: number;
  averageScore: number;
}

export const StatisticsScreen: React.FC = () => {
  const [stats, setStats] = useState<StatsSummary>({
    totalStudents: 0,
    averageCompletion: 0,
    lastWeekSubmissions: 0,
    weeklyStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await db()
          .ref('/users')
          .orderByChild('role')
          .equalTo('student')
          .once('value');
        
        const totalStudents = usersSnapshot.numChildren();

        const weeklyStats = [
          { week: 'Semana 1', submissions: 15, averageScore: 7.5 },
          { week: 'Semana 2', submissions: 18, averageScore: 8.0 },
          { week: 'Semana 3', submissions: 12, averageScore: 7.8 },
          { week: 'Semana 4', submissions: 20, averageScore: 8.2 },
        ];
        
        setStats({
          totalStudents,
          averageCompletion: 75,
          lastWeekSubmissions: weeklyStats[weeklyStats.length - 1].submissions,
          weeklyStats,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <BackgroundContainer
      source={require('../../assets/images/fondo_app.jpg')}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Estadísticas</Text>
          <View style={styles.teacherBadge}>
            <Ionicons name="school" size={20} color="#fff" />
            <Text style={styles.teacherBadgeText}>Profesor</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Resumen General</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color="#056b05" />
                <Text style={styles.statValue}>{stats.totalStudents}</Text>
                <Text style={styles.statLabel}>Total Alumnos</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color="#056b05" />
                <Text style={styles.statValue}>{stats.averageCompletion}%</Text>
                <Text style={styles.statLabel}>Promedio Completado</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="document-text" size={24} color="#056b05" />
                <Text style={styles.statValue}>{stats.lastWeekSubmissions}</Text>
                <Text style={styles.statLabel}>Envíos esta semana</Text>
              </View>
            </View>
          </View>

          {stats.weeklyStats.map((stat, index) => (
            <View key={index} style={styles.statsCard}>
              <Text style={styles.statsTitle}>{stat.week}</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statValue}>Envíos: {stat.submissions}</Text>
                <Text style={styles.statValue}>Promedio: {stat.averageScore}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 107, 5, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
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
    fontWeight: 'bold',
    color: '#fff',
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  teacherBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#056b05',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(5, 107, 5, 0.1)',
    padding: 16,
    borderRadius: 12,
    minWidth: '30%',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#056b05',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});