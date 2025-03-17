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

interface Feedback {
  id: string;
  userId: string;
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
  const [userDetails, setUserDetails] = useState<{[key: string]: any}>({});
  const [classDetails, setClassDetails] = useState<{[key: string]: any}>({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar datos de clases
      const classCodesSnapshot = await db().ref('/classCodes').once('value');
      if (classCodesSnapshot.exists()) {
        setClassDetails(classCodesSnapshot.val() || {});
      }
      
      // 2. Cargar datos de usuarios y invitados
      await Promise.all([
        loadUsers(),
        loadGuests()
      ]);
      
      // 3. Cargar feedbacks - esto debe ir al final para tener los datos de usuario primero
      await loadFeedbacks();
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const snapshot = await db().ref('/users').once('value');
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const updatedUserDetails = { ...userDetails };
        
        Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
          updatedUserDetails[userId] = userData;
        });
        
        setUserDetails(updatedUserDetails);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadGuests = async () => {
    try {
      const snapshot = await db().ref('/guests').once('value');
      if (snapshot.exists()) {
        const guestsData = snapshot.val();
        const updatedUserDetails = { ...userDetails };
        
        Object.entries(guestsData).forEach(([guestId, guestData]: [string, any]) => {
          updatedUserDetails[guestId] = guestData;
        });
        
        setUserDetails(updatedUserDetails);
      }
    } catch (error) {
      console.error('Error cargando invitados:', error);
    }
  };

  const loadFeedbacks = async () => {
    try {
      // Buscar en la nueva ubicación /feedback
      const newFeedbacksSnapshot = await db().ref('/feedback').once('value');
      const newFeedbacks: Feedback[] = [];
      
      if (newFeedbacksSnapshot.exists()) {
        const feedbackData = newFeedbacksSnapshot.val();
        
        Object.entries(feedbackData).forEach(([id, data]: [string, any]) => {
          newFeedbacks.push({
            id,
            ...data
          });
        });
      }
      
      // Buscar también en las ubicaciones antiguas
      const oldFeedbacksSnapshot = await db().ref('/form_responses').once('value');
      if (oldFeedbacksSnapshot.exists()) {
        const formResponsesData = oldFeedbacksSnapshot.val();
        
        Object.entries(formResponsesData).forEach(([userId, userForms]: [string, any]) => {
          // Buscar feedbacks en la estructura antigua
          if (userForms.feedback_physical_literacy) {
            newFeedbacks.push({
              id: `${userId}_physical_literacy`,
              userId,
              formType: 'physical_literacy',
              ...userForms.feedback_physical_literacy
            });
          }
        });
      }
      
      // Ordenar por fecha más reciente
      newFeedbacks.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
      
      setFeedbacks(newFeedbacks);
    } catch (error) {
      console.error('Error cargando feedbacks:', error);
      Alert.alert('Error', 'No se pudieron cargar las valoraciones');
    }
  };

  const getUserDisplayName = (userId: string) => {
    if (!userId) return "Usuario desconocido";
    
    // Si tenemos información del usuario en userDetails
    if (userDetails[userId]) {
      // Si tiene nombre, usar el nombre
      if (userDetails[userId].name) {
        return userDetails[userId].name;
      }
      
      // Si tiene correo, usar el correo
      if (userDetails[userId].email) {
        return userDetails[userId].email.split('@')[0]; // Solo usar la parte antes del @
      }
    }
    
    // Si el userId comienza con guest_, extraer información útil
    if (userId.startsWith('guest_')) {
      try {
        const timestamp = parseInt(userId.split('_')[1]);
        if (!isNaN(timestamp)) {
          const date = new Date(timestamp);
          return `Invitado (${date.toLocaleDateString()})`;
        }
      } catch (e) {
        // Si hay error, mostrar ID simplificado
      }
      
      // Mostrar formato simplificado
      return `Invitado (${userId.substring(6, 14)}...)`;
    }
    
    // Para otros casos, mostrar el ID recortado
    return `Usuario (${userId.substring(0, 8)}...)`;
  };

  const getUserClass = (userId: string) => {
    if (!userId || !userDetails[userId]) return null;
    
    const user = userDetails[userId];
    
    // Verificar si el usuario tiene un código de clase
    if (user.classCode && classDetails[user.classCode]) {
      return classDetails[user.classCode];
    }
    
    // Para usuarios teacher, verificar si tienen clases creadas
    if (user.role === 'teacher') {
      const teacherClasses = Object.values(classDetails || {})
        .filter((cls: any) => cls.teacherId === userId)
        .map((cls: any) => cls.className)
        .join(', ');
      
      if (teacherClasses) {
        return { 
          className: teacherClasses,
          institution: 'Profesor'
        };
      }
    }
    
    return null;
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
    const userClass = getUserClass(item.userId);
    
    return (
      <TouchableOpacity
        style={styles.feedbackItem}
        onPress={() => openFeedbackDetails(item)}
      >
        <View style={styles.feedbackHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userId}>{getUserDisplayName(item.userId)}</Text>
            {userClass && (
              <Text style={styles.userClass}>
                {userClass.className} {userClass.institution ? ` - ${userClass.institution}` : ''}
              </Text>
            )}
          </View>
          <Text style={styles.date}>
            {new Date(item.submittedAt).toLocaleDateString()}
          </Text>
        </View>
        
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

        <TouchableOpacity style={styles.viewMoreButton} onPress={() => openFeedbackDetails(item)}>
          <Text style={styles.viewMoreText}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color="#9E7676" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFeedbackDetail = () => {
    if (!selectedFeedback) return null;
    
    const userClass = getUserClass(selectedFeedback.userId);
    
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

            {/* Reemplazado FlatList con ScrollView para evitar el error */}
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
        <Text style={styles.headerTitle}>Valoraciones ({feedbacks.length})</Text>
        <TouchableOpacity style={styles.refreshIconButton} onPress={loadAllData}>
          <Ionicons name="refresh" size={24} color="#9E7676" />
        </TouchableOpacity>
      </View>
      
      {/* Reemplazando FlatList con ScrollView según la sugerencia */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {feedbacks.map((item) => (
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
  }
});

export default AdminFeedbackView;