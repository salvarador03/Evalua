import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
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
          <ActivityIndicator size="large" color="#9E7676" />
        </View>
      );
    }

    if (formResponse) {
      return (
        <>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#9E7676" />
            <Text style={styles.cardTitle}>
              Cuestionario de Autoevaluación de la Alfabetización Física
            </Text>
          </View>
          <Image 
            source={require('../../assets/images/pregunta_cuestionario.png')} 
            style={styles.questionnaire} 
            resizeMode="contain"
          />
          <Text style={styles.cardDescription}>
            Has completado este cuestionario el{' '}
            {new Date(formResponse.completedAt).toLocaleDateString()}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>Respuestas guardadas</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PhysicalLiteracyForm')}
              style={styles.viewResultsButton}
            >
              <Text style={styles.viewResultsText}>Ver resultados</Text>
              <Ionicons name="arrow-forward" size={20} color="#9E7676" />
            </TouchableOpacity>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.cardHeader}>
          <Ionicons name="fitness" size={24} color="#9E7676" />
          <Text style={styles.cardTitle}>
            Cuestionario de Autoevaluación de la Alfabetización Física
          </Text>
        </View>
        <Image 
          source={require('../../assets/images/pregunta_cuestionario.png')} 
          style={styles.questionnaire} 
          resizeMode="contain"
        />
        <Text style={styles.cardDescription}>
          Evalúa tu forma física, actividad física, conocimientos y motivación 
          en comparación con otros niños de tu edad.
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>6 preguntas • ~5 minutos</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PhysicalLiteracyForm')}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Comenzar</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <BackgroundContainer
      source={require('../../assets/images/fondo_app.jpg')}
    >
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={24} color="#9E7676" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9E7676']}
            tintColor="#9E7676"
          />
        }
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCard}>
            <View style={styles.logosWrapper}>
              <Image 
                source={require('../../assets/images/logo-uex.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <View style={styles.logoDivider} />
              <Image 
                source={require('../../assets/images/ulisboa.png')} 
                style={styles.logoLisboa} 
                resizeMode="contain"
              />
            </View>
          </View>
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
    paddingBottom: 80, // Añadido para evitar que el contenido se corte
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 10,
  },
  logoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logosWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  logo: {
    height: 45,
    width: 140,
  },
  logoLisboa: {
    height: 110,
    width: 100,
  },
  logoDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#DFCCCC', // Actualizado al nuevo color secundario
    marginHorizontal: 15,
  },
  questionnaire: {
    width: '100%',
    height: 200,
    marginVertical: 15,
    borderRadius: 10,
  },
  cardsContainer: {
    padding: 20,
    paddingBottom: 100, // Aumentado para dar más espacio al final
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
    color: '#9E7676', // Actualizado al nuevo color primario
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#594545', // Actualizado al nuevo color de texto
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 10, // Añadido para dar más espacio al botón
  },
  cardMeta: {
    fontSize: 12,
    color: '#B4AAAA', // Actualizado al nuevo color inactivo
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
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E7676', // Actualizado al nuevo color primario
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  viewResultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(158, 118, 118, 0.1)', // Actualizado al nuevo color primario con opacidad
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewResultsText: {
    color: '#9E7676', // Actualizado al nuevo color primario
    fontWeight: '500',
    fontSize: 14,
  },
});