// Components/GuestProfileScreen.tsx
import React, { useState } from 'react';
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
  StyleSheet
} from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../Components/CustomButton/CustomButton';
import { GuestUser } from '../../types/user';
import { DateButton } from "../../Components/DateButton/DateButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import db from '@react-native-firebase/database';

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
    <BackgroundContainer source={require('../../assets/images/fondo.svg')}>
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
    marginLeft: 8,
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
});