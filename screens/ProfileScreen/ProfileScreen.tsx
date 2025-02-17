import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../Components/CustomButton/CustomButton';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import db from '@react-native-firebase/database';

export const ProfileScreen: React.FC = () => {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    displayName: '',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const snapshot = await db().ref(`/users/${currentUser.uid}`).once('value');
        const data = snapshot.val();
        const userDataUpdate = {
          name: data?.name || currentUser.displayName || 'Usuario',
          email: currentUser.email || 'Sin email',
          displayName: currentUser.displayName || data?.name || 'Usuario',
        };
        setUserData(userDataUpdate);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (field: string, currentValue: string) => {
    setIsEditing(field);
    setEditValue(currentValue || '');
  };

  const handleSave = async () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'El campo no puede estar vacío');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser && isEditing === 'name') {
        await Promise.all([
          db().ref(`/users/${currentUser.uid}`).update({ name: editValue.trim() }),
          currentUser.updateProfile({ displayName: editValue.trim() })
        ]);
        setUserData(prev => ({
          ...prev,
          name: editValue.trim(),
          displayName: editValue.trim(),
        }));
        setIsEditing('');
        Alert.alert('Éxito', 'Nombre actualizado correctamente');
      }
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert('Error', 'No se pudo actualizar el campo');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.current || !passwordData.new) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (passwordData.new.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const user = auth().currentUser;
      if (!user?.email) throw new Error('No email found');

      const credential = auth.EmailAuthProvider.credential(
        user.email,
        passwordData.current
      );

      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(passwordData.new);

      setIsEditing('');
      setPasswordData({ current: '', new: '' });
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEditableField = (field: string, value: string, label: string, iconName: keyof typeof Ionicons.glyphMap, editable: boolean = true) => {
    return (
      <View style={styles.infoRow}>
        <Ionicons name={iconName} size={24} color="#9E7676" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          {isEditing === field ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Ingresa tu ${label.toLowerCase()}`}
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setIsEditing('');
                    setEditValue('');
                  }} 
                  style={styles.actionButton}
                >
                  <Ionicons name="close" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={[styles.infoValue, field === 'email' && styles.emailValue]}>
              {value || 'No disponible'}
            </Text>
          )}
        </View>
        {editable && !isEditing && (
          <TouchableOpacity 
            onPress={() => handleEdit(field, value)}
            style={styles.editButton}
          >
            <Ionicons name="pencil" size={20} color="#9E7676" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPasswordFields = () => {
    return (
      <View style={styles.passwordFieldsContainer}>
        <View style={styles.passwordField}>
          <Text style={styles.passwordLabel}>Contraseña actual</Text>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.current}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, current: text }))}
            placeholder="Ingresa tu contraseña actual"
            secureTextEntry
          />
        </View>
        <View style={styles.passwordField}>
          <Text style={styles.passwordLabel}>Nueva contraseña</Text>
          <TextInput
            style={styles.passwordInput}
            value={passwordData.new}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, new: text }))}
            placeholder="Ingresa la nueva contraseña"
            secureTextEntry
          />
        </View>
        <View style={styles.buttonGroup}>
          <CustomButton
            title="Guardar contraseña"
            onPress={handlePasswordChange}
            variant="primary"
          />
          <CustomButton
            title="Cancelar"
            onPress={() => {
              setIsEditing('');
              setPasswordData({ current: '', new: '' });
            }}
            variant="secondary"
          />
        </View>
      </View>
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
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
  };

  if (isLoading && !isEditing) {
    return (
      <BackgroundContainer source={require('../../assets/images/p_fondo.webp')}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9E7676" />
        </View>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer source={require('../../assets/images/p_fondo.webp')}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <View style={styles.userBadge}>
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.userBadgeText}>Estudiante</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#9E7676" />
            </View>
            {renderEditableField('name', userData.name, 'Nombre', 'person-outline', true)}
            {renderEditableField('email', userData.email, 'Email', 'mail-outline', false)}
            <View style={styles.roleContainer}>
              <Ionicons name="school" size={20} color="#9E7676" />
              <Text style={styles.roleText}>Cuenta de Estudiante</Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            {isEditing === 'password' ? (
              renderPasswordFields()
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.optionItem} 
                  onPress={() => setIsEditing('password')}
                >
                  <Ionicons name="key-outline" size={24} color="#9E7676" />
                  <Text style={styles.optionText}>Cambiar contraseña</Text>
                  <Ionicons name="chevron-forward" size={24} color="#9E7676" style={styles.optionArrow} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.optionItem, styles.lastOptionItem]}
                  onPress={() => Alert.alert('Ayuda', 'Esta funcionalidad estará disponible próximamente')}
                >
                  <Ionicons name="help-circle-outline" size={24} color="#9E7676" />
                  <Text style={styles.optionText}>Ayuda</Text>
                  <Ionicons name="chevron-forward" size={24} color="#9E7676" style={styles.optionArrow} />
                </TouchableOpacity>
              </>
            )}
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
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  userBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileInfo: {
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
  infoContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  emailValue: {
    fontSize: 15,
    marginTop: 2,
    color: '#666',
  },
  editButton: {
    padding: 8,
  },
  avatarContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    borderRadius: 50,
    padding: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(158, 118, 118, 0.1)',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginRight: 12,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9E7676',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
    color: '#333',
    backgroundColor: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 16,
    alignSelf: 'center',
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
  passwordFieldsContainer: {
    padding: 10,
  },
  passwordField: {
    marginBottom: 15,
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  passwordForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
  },
  passwordInputContainer: {
    marginBottom: 15,
  },
  passwordLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#9E7676',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'column',
    gap: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 4,
  },
});