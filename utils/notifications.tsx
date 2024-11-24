import db from "@react-native-firebase/database";
import { Platform } from 'react-native';
import auth from "@react-native-firebase/auth";
import { Language } from '../Components/LanguageSelection/translations';

export interface LoginNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'welcome' | 'login' | 'info';
}

export const createLoginNotification = async (
  userId: string,
  type: 'welcome' | 'login' | 'info',
  userName: string
): Promise<void> => {
  const notification: LoginNotification = {
    id: `${type}_${Date.now()}`,
    title: type === 'welcome' ? '¡Bienvenido!' : 'Nuevo inicio de sesión',
    message: type === 'welcome' 
      ? `¡Bienvenido ${userName}! Gracias por unirte a nuestra aplicación.`
      : `Hola ${userName}, has iniciado sesión correctamente.`,
    timestamp: Date.now(),
    read: false,
    type
  };

  try {
    const notificationRef = db().ref(`/notifications/${userId}/${notification.id}`);
    await notificationRef.set(notification);
  } catch (error) {
    console.error('[createNotification] Error:', error);
    throw error; // Propagar el error para manejarlo en el componente
  }
};

// Función separada para verificación de email
export const sendVerificationEmail = async () => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser && !currentUser.emailVerified) {
      await currentUser.sendEmailVerification({
        handleCodeInApp: false, // Cambiado a false para email simple
        url: 'https://cuestionariosapp.com', // Tu dominio verificado
      });
    }
  } catch (error) {
    console.error('[sendVerificationEmail] Error:', error);
    throw error;
  }
};

// Función para email de login
export const sendLoginEmail = async (userName: string, userEmail: string) => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      // Solo enviamos el email de verificación si es necesario
      if (!currentUser.emailVerified) {
        await sendVerificationEmail();
      }
      // Aquí podrías implementar un email personalizado usando Firebase Functions
    }
  } catch (error) {
    console.error('[sendLoginEmail] Error:', error);
    // No lanzamos el error para no interrumpir el flujo de login
  }
};