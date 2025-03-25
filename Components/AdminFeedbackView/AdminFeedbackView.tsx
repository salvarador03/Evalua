import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import db from '@react-native-firebase/database';
import { Language } from '../../types/language';
import { feedbackTranslations } from '../../translations/feedbackTranslations';

const COLORS = {
  primary: "#9E7676",
  secondary: "#DFCCCC",
  background: "#F5EBEB",
  text: "#594545",
  inactive: "#B4AAAA",
};

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  studentName?: string | null;
  isAnonymous?: boolean;
  userClass?: {
    className: string;
    institution: string;
  } | null;
  formType: string;
  ratings: {
    overall: number;
    usability: number;
    content: number;
    design: number;
  };
  comments: {
    generalFeedback: string;
    improvementSuggestions: string;
  };
  language: Language;
  submittedAt: number;
  lastModified?: number;
  isTeacherFeedback?: boolean;
  sus?: {
    scores: number[];
    total: number;
  };
  ueq?: any;
}

interface UserData {
  name: string;
  email?: string;
  role: string;
  classDetails?: {
    className: string;
    institution: string;
    code: string;
  };
}

interface GuestData {
  name: string;
  email?: string;
  age?: number;
  dateOfBirth?: string;
  classCode?: string;
  role: string;
  classDetails?: {
    className: string;
    institution: string;
    code: string;
  };
}

interface FormResponse {
  userId: string;
  classCode?: string;
  timestamp?: number;
}

interface AdminFeedbackViewProps {
  language: Language;
}

// Obtener dimensiones de la pantalla
const { width, height } = Dimensions.get('window');

const AdminFeedbackView: React.FC<AdminFeedbackViewProps> = ({ language }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [usersData, setUsersData] = useState<{[key: string]: UserData | GuestData}>({});
  const [classCodesData, setClassCodesData] = useState<{[key: string]: any}>({});
  const [activeTab, setActiveTab] = useState<'all' | 'teachers' | 'students'>('all');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Primero cargamos los datos de las clases para tenerlos disponibles
      const classCodesSnapshot = await db().ref('/classCodes').once('value');
      const classCodesData = classCodesSnapshot.val() || {};
      setClassCodesData(classCodesData);

      // Cargar los datos de usuarios y guests
      await loadUsersAndGuests(classCodesData);

      // Cargamos los feedbacks
      await loadFeedbacks();

    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const normalizeUserId = (userId: string): string => {
    // Eliminar sufijos como _physical_literacy_ y timestamps
    let normalizedId = userId;
    
    // Remover sufijo physical_literacy
    if (normalizedId.includes('_physical_literacy_')) {
      normalizedId = normalizedId.split('_physical_literacy_')[0];
    }
    
    // Remover timestamp si existe
    const parts = normalizedId.split('_');
    if (parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))) {
      normalizedId = parts.slice(0, -1).join('_');
    }
    
    return normalizedId;
  };

  const findUserInData = (userId: string): UserData | GuestData | null => {
    const normalizedId = normalizeUserId(userId);
    
    // Búsqueda directa
    if (usersData[normalizedId]) {
      return usersData[normalizedId];
    }
    
    // Búsqueda por coincidencia parcial
    for (const [id, userData] of Object.entries(usersData)) {
      const normalizedCurrentId = normalizeUserId(id);
      if (normalizedCurrentId === normalizedId || 
          normalizedCurrentId.startsWith(normalizedId) || 
          normalizedId.startsWith(normalizedCurrentId)) {
        return userData;
      }
    }
    
    return null;
  };

  const loadUsersAndGuests = async (classCodesData: any) => {
    try {
      // Cargamos usuarios y guests
      const [usersSnapshot, guestsSnapshot, responsesSnapshot] = await Promise.all([
        db().ref('/users').once('value'),
        db().ref('/guests').once('value'),
        db().ref('/form_responses').once('value')
      ]);

      const users = usersSnapshot.val() || {};
      const guests = guestsSnapshot.val() || {};
      const responses = responsesSnapshot.val() || {};

      // Combinamos los datos de usuarios y guests
      const combinedUsersData: {[key: string]: UserData | GuestData} = {};

      // Procesamos usuarios (profesores)
      Object.entries(users).forEach(([userId, userData]: [string, any]) => {
        combinedUsersData[userId] = {
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'teacher',
          classDetails: userData.classDetails || null
        };
      });

      // Procesamos invitados y sus respuestas
      Object.entries(guests).forEach(([guestId, guestData]: [string, any]) => {
        // Buscar la respuesta más reciente del guest
        const guestResponses = Object.entries(responses)
          .filter(([_, response]: [string, any]) => response.userId === guestId)
          .sort((a, b) => ((b[1] as FormResponse).timestamp || 0) - ((a[1] as FormResponse).timestamp || 0));

        let classInfo = null;
        
        // Usar la información de clase más reciente
        if (guestResponses.length > 0) {
          const latestResponse = guestResponses[0][1] as FormResponse;
          if (latestResponse.classCode && classCodesData[latestResponse.classCode]) {
            classInfo = classCodesData[latestResponse.classCode];
          }
        }
        
        // Si no hay info de clase en respuestas, usar la del guest
        if (!classInfo && guestData.classCode && classCodesData[guestData.classCode]) {
          classInfo = classCodesData[guestData.classCode];
        }
        
        combinedUsersData[guestId] = {
          name: guestData.name || '',
          email: guestData.email || '',
          age: guestData.age || null,
          dateOfBirth: guestData.dateOfBirth || '',
          role: 'guest',
          classCode: guestData.classCode || '',
          classDetails: classInfo || guestData.classDetails || null
        };
      });

      setUsersData(combinedUsersData);
      return combinedUsersData;
    } catch (error) {
      console.error('Error cargando usuarios y guests:', error);
      return {};
    }
  };

  const loadFeedbacks = async () => {
    try {
      const feedbackSnapshot = await db().ref('/feedback').once('value');
      const feedbackData = feedbackSnapshot.val() || {};
      
      // Cargar todos los usuarios y guests para tener acceso inmediato
      const [usersSnapshot, guestsSnapshot] = await Promise.all([
        db().ref('/users').once('value'),
        db().ref('/guests').once('value')
      ]);
      
      const usersData = usersSnapshot.val() || {};
      const guestsData = guestsSnapshot.val() || {};
      
      const newFeedbacks = Object.entries(feedbackData).map(([id, data]: [string, any]): Feedback => {
        // Extraer el ID de usuario base para buscar información del usuario
        let baseFeedbackUserId = data.userId || '';
        
        // Si el ID tiene formato guest_TIMESTAMP_physical_literacy_TIMESTAMP
        if (baseFeedbackUserId.includes('_physical_literacy_')) {
          baseFeedbackUserId = baseFeedbackUserId.split('_physical_literacy_')[0];
        }
        
        // Buscar el usuario correspondiente
        let userName = "Usuario desconocido";
        let userClass: { className: string; institution: string; } | null = null;
        
        // Primero buscar coincidencia exacta
        if (usersData[baseFeedbackUserId]) {
          const userData = usersData[baseFeedbackUserId] as UserData;
          userName = userData.name;
          if (userData.classDetails) {
            userClass = {
              className: userData.classDetails.className,
              institution: userData.classDetails.institution
            };
          }
        } else if (guestsData[baseFeedbackUserId]) {
          const guestData = guestsData[baseFeedbackUserId] as GuestData;
          userName = guestData.name;
          if (guestData.classDetails) {
            userClass = {
              className: guestData.classDetails.className,
              institution: guestData.classDetails.institution
            };
          }
        } else if (baseFeedbackUserId.startsWith('guest_')) {
          // Buscar coincidencia parcial
          const baseId = baseFeedbackUserId.split('_').slice(0, 2).join('_');
          
          const matchingGuests = Object.entries(guestsData)
            .filter(([guestId, _]: [string, any]) => 
              guestId === baseId || guestId.startsWith(baseId)
            );
          
          if (matchingGuests.length > 0) {
            const guestData = matchingGuests[0][1] as GuestData;
            userName = guestData.name;
            if (guestData.classDetails) {
              userClass = guestData.classDetails;
            }
          }
        }
        
        return {
          id,
          userId: data.userId || '',
          userName,
          studentName: data.studentName || null,
          isAnonymous: data.isAnonymous || false,
          userClass,
          formType: data.formType || '',
          ratings: data.ratings || { overall: 0, usability: 0, content: 0, design: 0 },
          comments: data.comments || { generalFeedback: '', improvementSuggestions: '' },
          language: data.language || 'es',
          submittedAt: data.submittedAt || 0,
          lastModified: data.lastModified || 0,
          isTeacherFeedback: data.isTeacherFeedback || false,
          sus: data.sus || { scores: [], total: 0 },
          ueq: data.ueq || {}
        };
      });

      // Ordenar por fecha más reciente
      newFeedbacks.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
      
      setFeedbacks(newFeedbacks);
      console.log('Feedbacks cargados:', newFeedbacks.length);
    } catch (error) {
      console.error('Error cargando feedbacks:', error);
    }
  };

  const getUserDisplayName = (userId: string) => {
    if (!userId) return "👤 Usuario desconocido";
    
    const userData = findUserInData(userId);
    
    // Si es un feedback con nombre de estudiante proporcionado
    const feedback = feedbacks.find(f => f.userId === userId);
    if (feedback) {
      if (!feedback.isAnonymous && feedback.studentName) {
        return `👨‍🎓 ${feedback.studentName}`;
      } else {
        return `🎭 Anónimo`;
      }
    }
    
    if (!userData) {
      return `🎭 Anónimo`;
    }

    if (userData.role === 'teacher') {
      return `👨‍🏫 ${userData.name} (${userData.email})`;
    }

    if (userData.classDetails) {
      const { className, institution } = userData.classDetails;
      if (className && institution) {
        return `👨‍🎓 ${userData.name} - ${className} (${institution})`;
      }
    }

    return `👨‍🎓 ${userData.name}`;
  };

  const getUserClass = (userId: string) => {
    if (!userId) return null;
    
    const userData = findUserInData(userId);
    if (!userData || !userData.classDetails) return null;

    const { className, institution } = userData.classDetails;
    if (!className || !institution) return null;

    return { className, institution };
  };

  const getUserRoleText = (userId: string) => {
    if (!userId) return null;
    
    // Buscar usuario en los datos combinados
    let userData = usersData[userId];
    
    // Si no se encuentra, intentar por ID similar
    if (!userData && userId.startsWith('guest_')) {
      const baseGuestId = userId.split('_').slice(0, 2).join('_');
      
      const matchingUsers = Object.entries(usersData).filter(([id, _]) => 
        id.startsWith(baseGuestId) || userId.startsWith(id)
      );
      
      if (matchingUsers.length > 0) {
        userData = matchingUsers[0][1];
      }
    }
    
    if (userData) {
      const role = userData.role;
      return role === 'teacher' ? 'Profesor' : 'Estudiante';
    }
    
    // Si no encontramos el rol, inferir del ID
    return userId.includes('guest') ? 'Estudiante' : 'Usuario';
  };

  const getUserRoleColor = (userId: string) => {
    const role = getUserRoleText(userId);
    return COLORS.primary; // Usar el color primario de la app para todos
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFD700' : '#DDD'}
          />
        ))}
      </View>
    );
  };

  const openFeedbackDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setModalVisible(true);
  };

  const FeedbackItem = ({ item }: { item: Feedback }) => {
    const isTeacher = !item.userId.includes('guest_');
    
    const getDisplayName = () => {
      if (isTeacher) {
        return `👨‍🏫 ${item.userName}`;
      }
      if (!item.isAnonymous && item.studentName) {
        return `👨‍🎓 ${item.studentName}`;
      }
      return `🎭 Anónimo`;
    };

    return (
      <TouchableOpacity
        style={[
          styles.feedbackItem,
          isTeacher ? styles.teacherFeedbackItem : undefined
        ]}
        onPress={() => openFeedbackDetails(item)}
      >
        <View style={styles.feedbackHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userId}>
              {getDisplayName()}
            </Text>
            {item.userClass && (
              <Text style={styles.userClass}>
                {item.userClass.className} {item.userClass.institution ? ` - ${item.userClass.institution}` : ''}
              </Text>
            )}
            <Text style={[styles.userRole, { color: COLORS.primary }]}>
              {isTeacher ? 'Profesor' : 'Estudiante'}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.submittedAt).toLocaleDateString()}
          </Text>
        </View>
        
        {isTeacher ? (
          <View style={styles.teacherRatingsContainer}>
            <View style={styles.susScorePreview}>
              <Text style={[styles.susScorePreviewValue, { color: COLORS.primary }]}>
                {item.sus?.total.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.susScorePreviewLabel}>
                Puntuación SUS
              </Text>
            </View>
            <View style={styles.ueqPreview}>
              <Text style={styles.ueqPreviewTitle}>Dimensiones evaluadas:</Text>
              <View style={styles.ueqDimensionsPreview}>
                {Object.keys(item.ueq || {}).map((dimension) => (
                  <View key={dimension} style={[styles.ueqDimensionBadge, { backgroundColor: '#FDF2F2' }]}>
                    <Text style={[styles.ueqDimensionText, { color: COLORS.primary }]}>
                      {feedbackTranslations[language].ueqDimensions[dimension as keyof typeof feedbackTranslations[typeof language]['ueqDimensions']]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.ratingsContainer}>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>General:</Text>
              {renderStars(item.ratings.overall)}
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Usabilidad:</Text>
              {renderStars(item.ratings.usability)}
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Contenido:</Text>
              {renderStars(item.ratings.content)}
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Diseño:</Text>
              {renderStars(item.ratings.design)}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.viewMoreButton} onPress={() => openFeedbackDetails(item)}>
          <Text style={styles.viewMoreText}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFeedbackDetail = () => {
    if (!selectedFeedback) return null;
    
    const userClass = getUserClass(selectedFeedback.userId);
    const user = usersData[selectedFeedback.userId] || {};
    const isTeacherFeedback = user.role === 'teacher' || selectedFeedback.isTeacherFeedback === true;
    
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de la Valoración</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#9E7676" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollView}>
              <View style={styles.modalScrollContent}>
                <View style={styles.userDetailSection}>
                  <View style={styles.userHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {getUserDisplayName(selectedFeedback.userId).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userNameContainer}>
                      <Text style={styles.userName}>
                        {getUserDisplayName(selectedFeedback.userId)}
                      </Text>
                      {userClass && (
                        <Text style={styles.userClassDetail}>
                          {userClass.className} 
                          {userClass.institution ? ` - ${userClass.institution}` : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Fecha:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedFeedback.submittedAt).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Formulario:</Text>
                      <Text style={styles.detailValue}>
                        {selectedFeedback.formType === 'physical_literacy' 
                          ? 'Alfabetización Física' 
                          : selectedFeedback.formType}
                      </Text>
                    </View>
                  </View>
                </View>

                {isTeacherFeedback ? (
                  <>
                    <View style={styles.ratingSection}>
                      <Text style={styles.sectionTitle}>Cuestionario SUS</Text>
                      <View style={styles.susScoreContainer}>
                        <Text style={styles.susScoreValue}>{selectedFeedback.sus?.total.toFixed(1)}</Text>
                        <Text style={styles.susScoreLabel}>Puntuación Total SUS</Text>
                      </View>
                      <View style={styles.susQuestionsContainer}>
                        {selectedFeedback.sus?.scores.map((score, index) => (
                          <View key={index} style={styles.susQuestionItem}>
                            <Text style={styles.susQuestionText}>
                              {feedbackTranslations[language].susQuestions[index]}
                            </Text>
                            <View style={styles.susQuestionScore}>
                              {[1, 2, 3, 4, 5].map((value) => (
                                <View
                                  key={value}
                                  style={[
                                    styles.susScoreDot,
                                    score === value && styles.susScoreDotActive
                                  ]}
                                />
                              ))}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.ratingSection}>
                      <Text style={styles.sectionTitle}>Cuestionario UEQ</Text>
                      {Object.entries(selectedFeedback.ueq || {}).map(([dimension, scores]) => (
                        <View key={dimension} style={styles.ueqDimensionContainer}>
                          <Text style={styles.ueqDimensionTitle}>
                            {feedbackTranslations[language].ueqDimensions[dimension as keyof typeof feedbackTranslations[typeof language]['ueqDimensions']]}
                          </Text>
                          <View style={styles.ueqScoresContainer}>
                            {(scores as number[]).map((score: number, index: number) => (
                              <View key={index} style={styles.ueqScoreItem}>
                                <Text style={styles.ueqPairText}>
                                  {feedbackTranslations[language].ueqPairs[dimension as keyof typeof feedbackTranslations[typeof language]['ueqPairs']][index]}
                                </Text>
                                <View style={styles.ueqScoreValue}>
                                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                                    <View
                                      key={value}
                                      style={[
                                        styles.ueqScoreDot,
                                        score === value && styles.ueqScoreDotActive
                                      ]}
                                    />
                                  ))}
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>Valoraciones</Text>
                    <View style={styles.ratingGrid}>
                      <View style={styles.ratingGridItem}>
                        <Text style={styles.ratingGridValue}>{selectedFeedback.ratings.overall}</Text>
                        <Text style={styles.ratingGridLabel}>General</Text>
                        {renderStars(selectedFeedback.ratings.overall)}
                      </View>
                      <View style={styles.ratingGridItem}>
                        <Text style={styles.ratingGridValue}>{selectedFeedback.ratings.usability}</Text>
                        <Text style={styles.ratingGridLabel}>Usabilidad</Text>
                        {renderStars(selectedFeedback.ratings.usability)}
                      </View>
                      <View style={styles.ratingGridItem}>
                        <Text style={styles.ratingGridValue}>{selectedFeedback.ratings.content}</Text>
                        <Text style={styles.ratingGridLabel}>Contenido</Text>
                        {renderStars(selectedFeedback.ratings.content)}
                      </View>
                      <View style={styles.ratingGridItem}>
                        <Text style={styles.ratingGridValue}>{selectedFeedback.ratings.design}</Text>
                        <Text style={styles.ratingGridLabel}>Diseño</Text>
                        {renderStars(selectedFeedback.ratings.design)}
                      </View>
                    </View>
                  </View>
                )}

                {selectedFeedback.comments && (
                  <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>Comentarios</Text>
                    
                    {selectedFeedback.comments.generalFeedback ? (
                      <View style={styles.commentBox}>
                        <Text style={styles.commentBoxTitle}>Experiencia general:</Text>
                        <Text style={styles.commentBoxText}>
                          {selectedFeedback.comments.generalFeedback}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noCommentText}>No se proporcionó comentario general</Text>
                    )}

                    {selectedFeedback.comments.improvementSuggestions ? (
                      <View style={styles.commentBox}>
                        <Text style={styles.commentBoxTitle}>Sugerencias de mejora:</Text>
                        <Text style={styles.commentBoxText}>
                          {selectedFeedback.comments.improvementSuggestions}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noCommentText}>No se proporcionaron sugerencias</Text>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const user = usersData[feedback.userId] || {};
    const isTeacher = user.role === 'teacher' || (feedback.userId && !feedback.userId.includes('guest_'));
    
    if (activeTab === 'all') return true;
    if (activeTab === 'teachers') return isTeacher;
    if (activeTab === 'students') return !isTeacher;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9E7676" />
        <Text style={styles.loadingText}>Cargando valoraciones...</Text>
      </View>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={64} color="#9E7676" />
        <Text style={styles.emptyText}>No hay valoraciones todavía</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadAllData}>
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Valoraciones ({filteredFeedbacks.length})</Text>
        <TouchableOpacity style={styles.refreshIconButton} onPress={loadAllData}>
          <Ionicons name="refresh" size={24} color="#9E7676" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'all' && styles.tabButtonTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'teachers' && styles.tabButtonActive]}
          onPress={() => setActiveTab('teachers')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'teachers' && styles.tabButtonTextActive]}>
            Profesores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'students' && styles.tabButtonActive]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'students' && styles.tabButtonTextActive]}>
            Estudiantes
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredFeedbacks.map((item) => (
          <FeedbackItem key={item.id} item={item} />
        ))}
      </ScrollView>

      {renderFeedbackDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBEB',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#DFCCCC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#594545',
  },
  refreshIconButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EBEB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9E7676',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5EBEB',
  },
  emptyText: {
    fontSize: 16,
    color: '#594545',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#9E7676',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  feedbackItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#594545',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  userClass: {
    fontSize: 12,
    color: '#9E7676',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    color: '#9E7676',
  },
  ratingsContainer: {
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    width: 80,
    fontSize: 14,
    color: '#594545',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentPreview: {
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9E7676',
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#594545',
    marginBottom: 4,
  },
  comment: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderRadius: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#9E7676',
    fontWeight: '500',
    marginRight: 4,
  },
  
  // Estilos del modal renovado
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DFCCCC',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#594545',
  },
  closeButton: {
    padding: 8,
  },
  modalScrollView: {
    padding: 16,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  userDetailSection: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9E7676',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#594545',
    marginBottom: 2,
  },
  userClassDetail: {
    fontSize: 14,
    color: '#9E7676',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    color: '#594545',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#594545',
  },
  ratingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#594545',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#DFCCCC',
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  ratingGridItem: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  ratingGridValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9E7676',
  },
  ratingGridLabel: {
    fontSize: 14,
    color: '#594545',
    marginVertical: 4,
  },
  commentsSection: {
    marginBottom: 20,
  },
  commentBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#9E7676',
  },
  commentBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#594545',
    marginBottom: 8,
  },
  commentBoxText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noCommentText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DFCCCC',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: '#594545',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: 'white',
  },
  susScoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
  },
  susScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9E7676',
  },
  susScoreLabel: {
    fontSize: 14,
    color: '#594545',
    marginTop: 4,
  },
  susQuestionsContainer: {
    marginTop: 16,
  },
  susQuestionItem: {
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  susQuestionText: {
    fontSize: 14,
    color: '#594545',
    marginBottom: 8,
  },
  susQuestionScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  susScoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD',
  },
  susScoreDotActive: {
    backgroundColor: COLORS.primary,
  },
  ueqDimensionContainer: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
  },
  ueqDimensionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#594545',
    marginBottom: 12,
  },
  ueqScoresContainer: {
    gap: 12,
  },
  ueqScoreItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  ueqPairText: {
    fontSize: 14,
    color: '#594545',
    marginBottom: 8,
  },
  ueqScoreValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  ueqScoreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DDD',
  },
  ueqScoreDotActive: {
    backgroundColor: COLORS.primary,
  },
  teacherFeedbackItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  teacherRatingsContainer: {
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
  },
  susScorePreview: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  susScorePreviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  susScorePreviewLabel: {
    fontSize: 14,
    color: '#594545',
    marginTop: 4,
  },
  ueqPreview: {
    marginTop: 8,
  },
  ueqPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#594545',
    marginBottom: 8,
  },
  ueqDimensionsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ueqDimensionBadge: {
    backgroundColor: '#FDF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ueqDimensionText: {
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default AdminFeedbackView;