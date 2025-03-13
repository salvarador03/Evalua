// Components/GuestProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
  FlatList
} from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../Components/CustomButton/CustomButton';
import { GuestUser } from '../../types/user';
import { DateButton } from "../../Components/DateButton/DateButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import db from '@react-native-firebase/database';

interface ClassCode {
  id: string;
  code: string;
  description?: string;
  institution?: string;
  country?: string;
  active: boolean;
}

// Definición de la interfaz para los datos sin procesar
interface ClassCodeData {
  code: string;
  description?: string;
  institution?: string;
  country?: string;
  active: boolean;
}

export const GuestProfileScreen: React.FC = () => {
  const { user, signOut, updateUserProfile } = useAuth();
  const guestUser = user as GuestUser;
  const [isEditing, setIsEditing] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');
  const [showTempAccessInfo, setShowTempAccessInfo] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    guestUser?.dateOfBirth ? new Date(guestUser.dateOfBirth) : new Date()
  );
  
  // Estado para mostrar información de la clase
  const [showClassInfo, setShowClassInfo] = useState(false);
  const [currentClassInfo, setCurrentClassInfo] = useState<ClassCode | null>(null);

  // Estados para el selector de clase
  const [showClassModal, setShowClassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [loadingClassCodes, setLoadingClassCodes] = useState(false);
  const [selectedClassCode, setSelectedClassCode] = useState<string>(guestUser?.classCode || "");

  // Cargar códigos de clase disponibles
  useEffect(() => {
    if (showClassModal) {
      fetchClassCodes();
    }
  }, [showClassModal]);

  // Cargar información de la clase actual
  useEffect(() => {
    if (guestUser?.classCode) {
      fetchCurrentClassInfo(guestUser.classCode);
    }
  }, [guestUser?.classCode]);

  const fetchCurrentClassInfo = async (classCode: string) => {
    try {
      const snapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(classCode)
        .once('value');
      
      const data = snapshot.val();
      
      if (data) {
        const classId = Object.keys(data)[0];
        const classData = data[classId] as ClassCodeData;
        
        setCurrentClassInfo({
          id: classId,
          code: classData.code,
          description: classData.description,
          institution: classData.institution,
          country: classData.country,
          active: classData.active
        });
      }
    } catch (error) {
      console.error("Error al obtener información de la clase:", error);
    }
  };

  const fetchClassCodes = async () => {
    setLoadingClassCodes(true);
    try {
      const snapshot = await db().ref('/classCodes').once('value');
      const data = snapshot.val();
      
      if (data) {
        const codesArray = Object.entries(data).map(([id, codeData]: [string, any]) => {
          const typedCodeData = codeData as ClassCodeData;
          return {
            id,
            code: typedCodeData.code,
            description: typedCodeData.description,
            institution: typedCodeData.institution,
            country: typedCodeData.country,
            active: typedCodeData.active
          } as ClassCode;
        }).filter((code: ClassCode) => code.active);
        
        setClassCodes(codesArray);
      } else {
        setClassCodes([]);
      }
    } catch (error: any) {
      console.error("Error al cargar códigos de clase:", error);
    } finally {
      setLoadingClassCodes(false);
    }
  };

  // Filtrar códigos basados en la búsqueda
  const filteredClassCodes = classCodes.filter(classCode => {
    const query = searchQuery.toLowerCase();
    return (
      classCode.code.toLowerCase().includes(query) ||
      (classCode.description && classCode.description.toLowerCase().includes(query)) ||
      (classCode.institution && classCode.institution.toLowerCase().includes(query)) ||
      (classCode.country && classCode.country.toLowerCase().includes(query))
    );
  });

  // Función para refrescar los códigos de clase
  const refreshClassCodes = async () => {
    setLoadingClassCodes(true);
    try {
      const snapshot = await db().ref('/classCodes').once('value');
      const data = snapshot.val();

      if (data) {
        const codesArray = Object.entries(data).map(([id, codeData]: [string, any]) => {
          const typedCodeData = codeData as ClassCodeData;
          return {
            id,
            code: typedCodeData.code,
            description: typedCodeData.description,
            institution: typedCodeData.institution,
            country: typedCodeData.country,
            active: typedCodeData.active
          } as ClassCode;
        }).filter((code: ClassCode) => code.active);

        setClassCodes(codesArray);
      } else {
        setClassCodes([]);
      }
    } catch (error: any) {
      console.error("Error al cargar códigos de clase:", error);
    } finally {
      setLoadingClassCodes(false);
    }
  };

  const handleClassCodeSelected = async (code: string) => {
    try {
      setIsValidating(true);
      const classSnapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(code.trim())
        .once('value');

      const classData = classSnapshot.val();
      
      if (!classData) {
        Alert.alert(
          "Código no válido",
          "El código de clase seleccionado no existe o no está activo."
        );
        return;
      }

      const updatedUser = {
        ...guestUser,
        classCode: code
      };
      
      await updateUserProfile(updatedUser, { preventNavigation: true });
      setSelectedClassCode(code);
      setShowClassModal(false);
      
    } catch (error) {
      console.error("Error al actualizar clase:", error);
      Alert.alert("Error", "No se pudo actualizar la clase seleccionada");
    } finally {
      setIsValidating(false);
    }
  };

  // Renderizar un código de clase
  const renderClassCodeItem = ({ item }: { item: ClassCode }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.classCodeItem}
      onPress={() => handleClassCodeSelected(item.code)}
      disabled={isValidating}
    >
      <View style={styles.classCodeItemContent}>
        <View style={styles.classCodeItemHeader}>
          <Text style={styles.classCodeItemCode}>{item.code}</Text>
          <View style={styles.classCodeItemActiveStatus}>
            <Text style={styles.classCodeItemActiveText}>Activo</Text>
          </View>
        </View>
        
        <Text style={styles.classCodeItemDescription}>
          {item.description || 'Sin descripción'}
        </Text>
        
        <View style={styles.classCodeItemDetails}>
          {item.country && (
            <View style={styles.classCodeItemDetail}>
              <Text style={styles.classCodeItemDetailText}>
                {item.country}
              </Text>
            </View>
          )}
          {item.institution && (
            <View style={styles.classCodeItemDetail}>
              <Text style={styles.classCodeItemDetailText}>
                {item.institution}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const validateClassCode = async (code: string) => {
    try {
      const classSnapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(code.trim())
        .once('value');

      return classSnapshot.val() !== null;
    } catch (error) {
      console.error('Error validating class code:', error);
      return false;
    }
  };

  const handleEdit = (field: string, currentValue: string) => {
    setIsEditing(field);
    if (field === 'dateOfBirth') {
      setSelectedDate(currentValue ? new Date(currentValue) : new Date());
      setShowDatePicker(true);
    } else if (field === 'classCode') {
      setShowClassModal(true);
    } else {
      setEditValue(currentValue || '');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      handleSaveDate(date);
    } else {
      setIsEditing('');
    }
  };

  const handleSaveDate = async (date: Date) => {
    try {
      setIsValidating(true);
      const updatedUser = {
        ...guestUser,
        dateOfBirth: date.toISOString().split('T')[0]
      };
      await updateUserProfile(updatedUser, { preventNavigation: true });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la fecha');
    } finally {
      setIsValidating(false);
      setIsEditing('');
    }
  };

  const handleSave = async () => {
    setIsValidating(true);
    try {
      if (isEditing === 'classCode') {
        const isValid = await validateClassCode(editValue);
        if (!isValid) {
          Alert.alert(
            'Código Inválido',
            'El código de clase ingresado no existe. Por favor, verifica e intenta nuevamente.'
          );
          setIsValidating(false);
          return;
        }
      }

      const updatedUser = {
        ...guestUser,
        [isEditing]: editValue
      };
      await updateUserProfile(updatedUser, { preventNavigation: true });
      setIsEditing('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el campo');
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Advertencia de Cierre de Sesión',
      '¿Estás seguro de que quieres cerrar sesión? Al salir, perderás todos los datos ingresados y no podrás volver a acceder con esta cuenta de invitado.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación Final',
              'IMPORTANTE: Esta es tu última oportunidad. Si cierras sesión:\n\n' +
              '• Perderás TODOS los datos ingresados\n' +
              '• Tu cuenta de invitado será eliminada\n' +
              '• No podrás recuperar el acceso\n\n' +
              '¿Estás completamente seguro de que deseas cerrar sesión?',
              [
                {
                  text: 'No, Mantener Sesión',
                  style: 'cancel',
                },
                {
                  text: 'Sí, Cerrar Sesión',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await signOut();
                    } catch (error) {
                      console.error('Error during logout:', error);
                      Alert.alert('Error', 'No se pudo cerrar sesión');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderEditableField = (field: string, value: string, label: string) => {
    if (field === 'dateOfBirth' && isEditing === field) {
      return (
        <View style={styles.infoRow}>
          <View style={styles.editContainer}>
            <DateButton
              date={selectedDate}
              onPress={() => setShowDatePicker(true)}
              label={label}
            />
            <TouchableOpacity 
              onPress={() => {
                setIsEditing('');
                setSelectedDate(value ? new Date(value) : new Date());
              }} 
              style={styles.cancelButton}
            >
              <Ionicons name="close" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Personalizar la fila para el código de clase
    if (field === 'classCode') {
      return (
        <View style={styles.infoRow}>
          <Ionicons 
            name="school-outline" 
            size={24} 
            color="#9E7676" 
          />
          <Text style={styles.infoLabel}>{label}:</Text>
          <Text style={styles.infoValue}>
            {value || 'No disponible'}
          </Text>
          
          {/* Botón para mostrar información adicional de la clase */}
          {value && (
            <TouchableOpacity 
              onPress={() => setShowClassInfo(true)} 
              style={styles.infoIconButton}
            >
              <Ionicons name="information-circle-outline" size={20} color="#9E7676" />
            </TouchableOpacity>
          )}
          
          {/* Botón para cambiar la clase */}
          <TouchableOpacity onPress={() => handleEdit(field, value)}>
            <Ionicons name="list" size={20} color="#9E7676" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.infoRow}>
        {field === isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
            />
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.saveButton}
              disabled={isValidating}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsEditing('')} 
              style={styles.cancelButton}
            >
              <Ionicons name="close" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Ionicons 
              name={field === 'dateOfBirth' ? 'calendar-outline' : 'person-outline'} 
              size={24} 
              color="#9E7676" 
            />
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={styles.infoValue}>{value || 'No disponible'}</Text>
            <TouchableOpacity onPress={() => handleEdit(field, value)}>
              <Ionicons name="pencil" size={20} color="#9E7676" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <BackgroundContainer source={require('../../assets/images/p_fondo.webp')}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil de Invitado</Text>
          <View style={styles.guestBadge}>
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.guestBadgeText}>Invitado</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#9E7676" />
            </View>
            {renderEditableField('name', guestUser?.name, 'Nombre')}
            {renderEditableField('classCode', guestUser?.classCode, 'Clase')}
            {renderEditableField('dateOfBirth', guestUser?.dateOfBirth, 'Fecha de nacimiento')}
            
            <TouchableOpacity 
              style={styles.roleContainer}
              onPress={() => setShowTempAccessInfo(true)}
            >
              <Ionicons name="time" size={20} color="#9E7676" />
              <Text style={styles.roleText}>Acceso Temporal</Text>
              <Ionicons name="information-circle-outline" size={20} color="#9E7676" style={styles.infoIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.logoutContainer}>
            <CustomButton
              title="Cerrar Sesión"
              onPress={handleLogout}
              variant="gradient"
              size="large"
              icon={<Ionicons name="log-out-outline" size={24} color="#fff" />}
            />
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Modal para información adicional de la clase */}
        <Modal
          visible={showClassInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setShowClassInfo(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Información de la Clase</Text>
              
              <View style={styles.classInfoContainer}>
                <View style={styles.classInfoRow}>
                  <Text style={styles.classInfoLabel}>Código:</Text>
                  <Text style={styles.classInfoValue}>{currentClassInfo?.code || ''}</Text>
                </View>
                
                {currentClassInfo?.description && (
                  <View style={styles.classInfoRow}>
                    <Text style={styles.classInfoLabel}>Descripción:</Text>
                    <Text style={styles.classInfoValue}>{currentClassInfo.description}</Text>
                  </View>
                )}
                
                {currentClassInfo?.institution && (
                  <View style={styles.classInfoRow}>
                    <Text style={styles.classInfoLabel}>Institución:</Text>
                    <Text style={styles.classInfoValue}>{currentClassInfo.institution}</Text>
                  </View>
                )}
                
                {currentClassInfo?.country && (
                  <View style={styles.classInfoRow}>
                    <Text style={styles.classInfoLabel}>País:</Text>
                    <Text style={styles.classInfoValue}>{currentClassInfo.country}</Text>
                  </View>
                )}
              </View>
              
              <CustomButton
                title="Cerrar"
                onPress={() => setShowClassInfo(false)}
                variant="secondary"
              />
            </View>
          </View>
        </Modal>

        {/* Modal para información de acceso temporal */}
        <Modal
          visible={showTempAccessInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTempAccessInfo(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Información de Acceso Temporal</Text>
              
              <Text style={styles.modalSubtitle}>¿Qué significa acceso temporal?</Text>
              <Text style={styles.modalText}>
                Tu cuenta de invitado es temporal y tiene algunas limitaciones importantes:
              </Text>
              
              <View style={styles.bulletPoints}>
                <Text style={styles.bulletPoint}>• Los datos y progreso se mantienen solo mientras la sesión está activa</Text>
                <Text style={styles.bulletPoint}>• No podrás recuperar el acceso una vez cierres sesión</Text>
                <Text style={styles.bulletPoint}>• Todas las actividades y datos se perderán al cerrar sesión</Text>
              </View>
              
              <Text style={styles.modalText}>
                Para mantener tu progreso y tener acceso permanente, te recomendamos crear una cuenta completa.
              </Text>
              
              <CustomButton
                title="Entendido"
                onPress={() => setShowTempAccessInfo(false)}
                variant="secondary"
              />
            </View>
          </View>
        </Modal>

        {/* Modal para selección de clase */}
        <Modal
          visible={showClassModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowClassModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.classModalContainer}>
              <View style={styles.classModalHeader}>
                <Text style={styles.classModalTitle}>Seleccionar Institución/Clase</Text>
                <View style={styles.headerActions}>
                  {/* Botón de refresco */}
                  <TouchableOpacity
                    onPress={refreshClassCodes}
                    disabled={loadingClassCodes}
                    style={styles.refreshButton}
                  >
                    <Text style={styles.refreshIcon}>🔄</Text>
                  </TouchableOpacity>

                  {/* Botón de cerrar */}
                  <TouchableOpacity onPress={() => setShowClassModal(false)}>
                    <Text style={styles.classModalCloseButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buscador */}
              <View style={styles.classSearchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.classSearchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar institución o clase..."
                  placeholderTextColor="#666"
                />
                {searchQuery !== "" && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.classSearchClear}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {loadingClassCodes ? (
                <ActivityIndicator size="large" color="#9E7676" style={styles.loadingIndicator} />
              ) : (
                <>
                  {classCodes.length === 0 ? (
                    <Text style={styles.noClassCodesText}>
                      No hay clases disponibles
                    </Text>
                  ) : (
                    <FlatList
                      data={filteredClassCodes}
                      renderItem={renderClassCodeItem}
                      keyExtractor={(item) => item.id}
                      style={styles.classCodeList}
                      ListEmptyComponent={
                        <Text style={styles.noClassCodesText}>
                          No se encontraron resultados para "{searchQuery}"
                        </Text>
                      }
                    />
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>
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
    backgroundColor: 'rgba(158, 118, 118, 0.9)',
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
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9E7676',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9E7676',
    borderRadius: 8,
    padding: 8,
    color: '#333',
  },
  saveButton: {
    padding: 5,
  },
  cancelButton: {
    padding: 5,
  },
  infoIcon: {
    marginLeft: 8,
  },
  infoIconButton: {
    padding: 5,
    marginRight: 5,
  },
  bulletPoints: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  guestBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
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
  avatarContainer: {
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderRadius: 50,
    padding: 10,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9E7676',
    marginBottom: 8,
  },
  classCode: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  roleText: {
    color: '#9E7676',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 16,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(158, 118, 118, 0.1)',
    width: '100%',
  },
      infoLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(158, 118, 118, 0.1)',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  optionArrow: {
    marginLeft: 'auto',
  },
  logoutContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  // Estilos para el modal de selección de clase
  classModalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  classModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  classModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#594545",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  refreshIcon: {
    fontSize: 18,
    color: "#594545",
  },
  classModalCloseButton: {
    fontSize: 20,
    color: "#666",
    padding: 5,
  },
  classSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  classSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  classSearchClear: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#666",
  },
  classCodeList: {
    maxHeight: 300,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  noClassCodesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    padding: 20,
    fontStyle: "italic",
  },
  // Estilos para los items de código de clase
  classCodeItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  classCodeItemContent: {
    padding: 15,
  },
  classCodeItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  classCodeItemCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#594545",
  },
  classCodeItemActiveStatus: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  classCodeItemActiveText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  classCodeItemDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  classCodeItemDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  classCodeItemDetail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  classCodeItemDetailText: {
    fontSize: 12,
    color: "#9E7676",
  },
  // Estilos para el modal de información de clase
  classInfoContainer: {
    marginVertical: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  classInfoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  classInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#594545",
    width: 100,
  },
  classInfoValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  }
});