// components/ClassCodeManager/ClassCodeManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';
import { CustomInput } from '../CustomInput/CustomInput';
import { CustomButton } from '../CustomButton/CustomButton';
import db from '@react-native-firebase/database';
import { ClassCode } from '../../types/classcode';

interface Props {
  teacherId: string;
  teacherName: string;
}

export const ClassCodeManager: React.FC<Props> = ({ teacherId, teacherName }) => {
  const [newCode, setNewCode] = useState('');
  const [description, setDescription] = useState('');
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClassCodes = useCallback(async () => {
    if (!teacherId) return;

    try {
      const snapshot = await db()
        .ref('/classCodes')
        .orderByChild('teacherId')
        .equalTo(teacherId)
        .once('value');

      const data = snapshot.val();
      if (data) {
        const codesArray = Object.entries(data).map(([id, code]) => ({
          id,
          ...(code as any),
        }));
        setClassCodes(codesArray);
      } else {
        setClassCodes([]);
      }
    } catch (error) {
      console.error('Error loading class codes:', error);
      setClassCodes([]);
    }
  }, [teacherId]);

  useEffect(() => {
    loadClassCodes();
  }, [loadClassCodes]);

  const handleAddClassCode = async () => {
    if (!teacherId || !teacherName) {
      Alert.alert('Error', 'Información del profesor no disponible');
      return;
    }

    if (!newCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de clase');
      return;
    }

    setLoading(true);

    try {
      const snapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(newCode.trim())
        .once('value');

      if (snapshot.exists()) {
        Alert.alert('Error', 'Este código de clase ya existe');
        return;
      }

      const classCodeData: Omit<ClassCode, 'id'> = {
        code: newCode.trim(),
        teacherId,
        teacherName,
        createdAt: Date.now(),
        description: description.trim() || '',
        active: true,
      };

      await db()
        .ref('/classCodes')
        .push(classCodeData);

      setNewCode('');
      setDescription('');
      Alert.alert('Éxito', 'Código de clase creado correctamente');
      await loadClassCodes(); // Recargar códigos después de crear uno nuevo
    } catch (error) {
      console.error('Error creating class code:', error);
      Alert.alert('Error', 'No se pudo crear el código de clase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionar Códigos de Clase</Text>
      
      <View style={styles.form}>
        <CustomInput
          placeholder="Nuevo código de clase"
          value={newCode}
          onChangeText={setNewCode}
          editable={!loading}
          style={styles.input}
          placeholderTextColor="#666"
        />
        <CustomInput
          placeholder="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          editable={!loading}
          style={styles.input}
          placeholderTextColor="#666"
        />
        <CustomButton
          title="Crear Código de Clase"
          onPress={handleAddClassCode}
          disabled={loading}
          variant='secondary'
        />
      </View>

      <Text style={styles.subtitle}>Tus Códigos de Clase</Text>
      <FlatList
        data={classCodes}
        keyExtractor={item => item.id || item.code}
        renderItem={({ item }) => (
          <View style={styles.codeItem}>
            <Text style={styles.codeText}>Código: {item.code}</Text>
            {item.description && (
              <Text style={styles.descriptionText}>{item.description}</Text>
            )}
            <Text style={styles.dateText}>
              Creado: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tienes códigos de clase creados
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000000',
  },
  form: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderRadius: 8,
    padding: 12,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  createButton: {
    backgroundColor: '#056b05',
    marginTop: 10,
    borderRadius: 8,
    padding: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  codeItem: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontStyle: 'italic',
    fontSize: 14,
  },
});