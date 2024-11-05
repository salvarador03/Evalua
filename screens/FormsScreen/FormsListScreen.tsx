import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme/typography';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, FormsStackParamList } from '../../navigation/types';
import auth from '@react-native-firebase/auth';
import db from '@react-native-firebase/database';
import type { FormResponse } from '../../types/form';
import { RefreshControl } from 'react-native';

type FormsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Forms'>,
  NativeStackNavigationProp<FormsStackParamList>
>;

export const FormsListScreen: React.FC = () => {
  const navigation = useNavigation<FormsScreenNavigationProp>();
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFormResponse();
  }, []);

  const loadFormResponse = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const snapshot = await db()
          .ref(`/form_responses/${currentUser.uid}/physical_literacy`)
          .once('value');
        
        setFormResponse(snapshot.val());
      }
    } catch (error) {
      console.error('Error loading form response:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadFormResponse().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const renderCardContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#056b05" />
        </View>
      );
    }

    if (formResponse) {
      return (
        <>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#056b05" />
            <Text style={styles.cardTitle}>
              Cuestionario Completado
            </Text>
          </View>
          <Text style={styles.cardDescription}>
            Has completado este cuestionario el{' '}
            {new Date(formResponse.completedAt).toLocaleDateString()}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>Respuestas guardadas</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PhysicalLiteracyForm')}
            >
              <Text style={styles.viewResults}>Ver resultados</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.cardHeader}>
          <Ionicons name="fitness" size={24} color="#056b05" />
          <Text style={styles.cardTitle}>
            Cuestionario de Autoevaluación de la Alfabetización Física
          </Text>
        </View>
        <Text style={styles.cardDescription}>
          Evalúa tu forma física, actividad física, conocimientos y motivación 
          en comparación con otros niños de tu edad.
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>6 preguntas • ~5 minutos</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PhysicalLiteracyForm')}
          >
            <Ionicons name="arrow-forward" size={20} color="#056b05" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <BackgroundContainer
      source={require('../../assets/images/surfer-1836366_1280.jpg')}
    >
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={24} color="#056b05" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#056b05']}
            tintColor="#056b05"
          />
        }
      >
        <View style={styles.header}>
          <Text style={[typography.title, styles.title]}>Formularios Disponibles</Text>
          <Text style={styles.subtitle}>
            Bienvenido/a a la sección de evaluación. Aquí podrás encontrar diferentes 
            cuestionarios para evaluar tu desarrollo físico.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            {renderCardContent()}
          </View>
        </View>
      </ScrollView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    margin: 20,
  },
  title: {
    color: '#056b05',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  cardsContainer: {
    padding: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  viewResults: {
    color: '#056b05',
    fontWeight: '500',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#056b05',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  cardMeta: {
    fontSize: 12,
    color: '#888',
  },
});