// src/screens/FormsScreen/FormsListScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme/typography';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, FormsStackParamList } from '../../navigation/types';


type FormsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Forms'>,
  NativeStackNavigationProp<FormsStackParamList>
>;

export const FormsListScreen: React.FC = () => {
  const navigation = useNavigation<FormsScreenNavigationProp>();

  return (
    <BackgroundContainer
      source={require('../../assets/images/surfer-1836366_1280.jpg')}
    >
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.title, styles.title]}>Formularios Disponibles</Text>
          <Text style={styles.subtitle}>
            Bienvenido/a a la sección de evaluación. Aquí podrás encontrar diferentes 
            cuestionarios para evaluar tu desarrollo físico.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('PhysicalLiteracyForm')}
          >
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
              <Ionicons name="arrow-forward" size={20} color="#056b05" />
            </View>
          </TouchableOpacity>
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
  cardMeta: {
    fontSize: 12,
    color: '#888',
  },
});