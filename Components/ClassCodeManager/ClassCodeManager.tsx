// components/ClassCodeManager/ClassCodeManager.tsx
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const classCodesRef = db()
      .ref('/classCodes')
      .orderByChild('teacherId')
      .equalTo(teacherId);

    const onClassCodesUpdate = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const codesList = Object.values(data) as ClassCode[];
        setClassCodes(codesList);
      } else {
        setClassCodes([]);
      }
    };

    classCodesRef.on('value', onClassCodesUpdate);

    return () => classCodesRef.off('value', onClassCodesUpdate);
  }, [teacherId]);

  const handleAddClassCode = async () => {
    if (!newCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de clase');
      return;
    }

    setLoading(true);

    try {
      // Verificar si el código ya existe
      const snapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(newCode.trim())
        .once('value');

      if (snapshot.exists()) {
        Alert.alert('Error', 'Este código de clase ya existe');
        return;
      }

      // Crear nuevo código de clase
      const classCodeData: ClassCode = {
        code: newCode.trim(),
        teacherId,
        teacherName,
        createdAt: Date.now(),
        description: description.trim(),
        active: true,
      };

      await db()
        .ref('/classCodes')
        .push(classCodeData);

      setNewCode('');
      setDescription('');
      Alert.alert('Éxito', 'Código de clase creado correctamente');
    } catch (error) {
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
        />
        <CustomInput
          placeholder="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          editable={!loading}
        />
        <CustomButton
          title="Crear Código de Clase"
          onPress={handleAddClassCode}
          disabled={loading}
        />
      </View>

      <Text style={styles.subtitle}>Tus Códigos de Clase</Text>
      <FlatList
        data={classCodes}
        keyExtractor={(item) => item.code}
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
          <Text style={styles.emptyText}>
            No tienes códigos de clase creados
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  form: {
    marginBottom: 20,
  },
  codeItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});