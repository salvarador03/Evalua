// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import db from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, GuestUser } from '../types/user';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsGuest: (name: string, classCode: string, dateOfBirth: Date) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthProvider] Initializing effect');
    const initAuth = async () => {
      try {
        console.log('[AuthProvider] Checking stored user data');
        const storedUser = await AsyncStorage.getItem('userData');
        console.log('[AuthProvider] Stored user data:', storedUser);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('[AuthProvider] Setting user from storage:', userData);
          setUser(userData);
        } else {
          console.log('[AuthProvider] No stored user found');
        }
      } catch (error) {
        console.error('[AuthProvider] Error loading stored user:', error);
      } finally {
        console.log('[AuthProvider] Setting loading to false');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signInAsGuest = async (name: string, classCode: string, dateOfBirth: Date) => {
    console.log('[signInAsGuest] Starting guest sign in process', { name, classCode, dateOfBirth });
    try {
      setLoading(true);
      console.log('[signInAsGuest] Checking class code in Firebase');
      
      // Verificar si el código de clase existe
      const classSnapshot = await db()
        .ref('/classCodes')
        .orderByChild('code')
        .equalTo(classCode)
        .once('value');

      // Log detallado del snapshot
      console.log('[signInAsGuest] Full snapshot:', JSON.stringify(classSnapshot.val(), null, 2));

      const classData = classSnapshot.val();
      console.log('[signInAsGuest] Parsed class data:', classData);
      
      if (!classData) {
        console.log('[signInAsGuest] Invalid class code, throwing error');
        throw new Error('Código de clase no válido');
      }

      console.log('[signInAsGuest] Class code valid, calculating age');
      const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const timestamp = Date.now();
      const guestId = `guest_${timestamp}`;
      console.log('[signInAsGuest] Creating guest data with id:', guestId);

      // Crear datos del usuario invitado
      const guestData: GuestUser = {
        uid: guestId,
        name: name.trim(),
        email: `${guestId}@guest.com`,
        role: 'guest' as const,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        age: calculateAge(dateOfBirth),
        classCode: classCode.trim(),
        createdAt: timestamp,
        lastLogin: timestamp,
      };

      console.log('[signInAsGuest] Guest data created:', guestData);

      // Guardar en Firebase bajo la ruta "guests"
      console.log('[signInAsGuest] Saving to Firebase under guests path');
      await db().ref(`/guests/${guestId}`).set({
        ...guestData,
        classDetails: classData[Object.keys(classData)[0]], // Guardamos los detalles de la clase asociada
      });
      console.log('[signInAsGuest] Successfully saved to Firebase');

      // Guardar en AsyncStorage
      console.log('[signInAsGuest] Saving to AsyncStorage');
      await AsyncStorage.setItem('userData', JSON.stringify(guestData));
      console.log('[signInAsGuest] Successfully saved to AsyncStorage');
      
      // Actualizar estado
      console.log('[signInAsGuest] Updating user state');
      setUser(guestData);
      console.log('[signInAsGuest] User state updated successfully');

    } catch (error) {
      console.error('[signInAsGuest] Error during guest sign in:', error);
      if (error instanceof Error) {
        console.error('[signInAsGuest] Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    } finally {
      console.log('[signInAsGuest] Setting loading to false');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[signIn] Starting sign in process');
    try {
      const response = await auth().signInWithEmailAndPassword(email, password);
      console.log('[signIn] Firebase auth successful');
      
      const userDoc = await db().ref(`/users/${response.user.uid}`).once('value');
      const userData = userDoc.val();
      console.log('[signIn] User data from DB:', userData);
      
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('[signIn] User data saved to storage');
        setUser(userData);
      }
    } catch (error) {
      console.error('[signIn] Error during sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[signOut] Starting sign out process');
    try {
      setLoading(true);
      await AsyncStorage.removeItem('userData');
      console.log('[signOut] User data removed from storage');
      
      if (user?.role !== 'guest') {
        await auth().signOut();
        console.log('[signOut] Firebase sign out completed');
      }
      
      setUser(null);
      console.log('[signOut] User state cleared');
    } catch (error) {
      console.error('[signOut] Error during sign out:', error);
      throw error;
    } finally {
      setLoading(false);
      console.log('[signOut] Sign out completed');
    }
  };

  // Log cuando el estado del usuario cambia
  useEffect(() => {
    console.log('[AuthProvider] User state changed:', user);
  }, [user]);

  // Log cuando el estado de loading cambia
  useEffect(() => {
    console.log('[AuthProvider] Loading state changed:', loading);
  }, [loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signInAsGuest,
        signOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};