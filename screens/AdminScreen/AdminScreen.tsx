import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import AdminFeedbackView from '../../Components/AdminFeedbackView/AdminFeedbackView';
import { Language } from '../../types/language';

const AdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feedback'>('feedback');
  const [language, setLanguage] = useState<Language>('es');

  const renderContent = () => {
    switch (activeTab) {
      case 'feedback':
        return <AdminFeedbackView language={language} />;
      default:
        return null;
    }
  };

  return (
    <BackgroundContainer source={require('../../assets/images/p_fondo.webp')}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Panel de Administración</Text>
        </View>

        <View style={styles.tabContainer}>
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

        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(158, 118, 118, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#594545',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  },
});

export default AdminScreen;