import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  translations,
  Language,
} from "../../Components/LanguageSelection/translations";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import db from "@react-native-firebase/database";
import { Notification } from "../../types/notification";

const DEFAULT_LANGUAGE: Language = "es";
const AUTO_UPDATE_INTERVAL = 10000; // 10 segundos

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(DEFAULT_LANGUAGE);
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const startAutoUpdate = useCallback(() => {
    if (autoUpdateIntervalRef.current) {
      clearInterval(autoUpdateIntervalRef.current);
    }

    autoUpdateIntervalRef.current = setInterval(async () => {
      if (isMountedRef.current && user?.uid) {
        try {
          await loadNotifications();
        } catch (error) {
          console.error("Error in auto-update:", error);
        }
      }
    }, AUTO_UPDATE_INTERVAL);
  }, [user?.uid]);

  const stopAutoUpdate = useCallback(() => {
    if (autoUpdateIntervalRef.current) {
      clearInterval(autoUpdateIntervalRef.current);
      autoUpdateIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          loadNotifications();
          startAutoUpdate();
        } else {
          stopAutoUpdate();
        }
      }
    );

    return () => {
      appStateSubscription.remove();
      isMountedRef.current = false;
      stopAutoUpdate();
    };
  }, [startAutoUpdate, stopAutoUpdate]);

  useEffect(() => {
    const initializeScreen = async () => {
      try {
        setIsLoading(true);
        await loadUserLanguage();
        await createWelcomeNotification();
        await loadNotifications();
        startAutoUpdate();
      } catch (error) {
        console.error("Error initializing notifications screen:", error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeScreen();

    return () => {
      stopAutoUpdate();
    };
  }, [user?.uid]);

  const loadUserLanguage = async () => {
    try {
      if (user?.uid) {
        // Primero intentar obtener del usuario
        const userSnapshot = await db()
          .ref(`/users/${user.uid}/settings/language`)
          .once("value");

        const userLanguage = userSnapshot.val();

        if (userLanguage && isValidLanguage(userLanguage)) {
          setCurrentLanguage(userLanguage);
          return;
        }

        // Si no hay en la base de datos, intentar desde AsyncStorage
        const storedLanguage = await AsyncStorage.getItem(
          `@app_language_${user.uid}`
        );
        if (storedLanguage && isValidLanguage(storedLanguage)) {
          setCurrentLanguage(storedLanguage as Language);
          return;
        }
      }
    } catch (error) {
      console.error("Error loading user language:", error);
    }
  };

  const isValidLanguage = (lang: string): lang is Language => {
    return ["es", "en", "pt-PT", "pt-BR"].includes(lang);
  };

  const createWelcomeNotification = async () => {
    if (!user?.uid) return;

    try {
      const welcomeShown = await AsyncStorage.getItem(
        `welcome_notification_shown_${user.uid}`
      );
      if (!welcomeShown) {
        const welcomeNotification: Notification = {
          id: `welcome_${Date.now()}`,
          title: translations[currentLanguage].welcomeTitle,
          message: translations[currentLanguage].welcomeMessage,
          timestamp: Date.now(),
          read: false,
          type: "welcome",
        };

        await addNotification(welcomeNotification);
        await AsyncStorage.setItem(
          `welcome_notification_shown_${user.uid}`,
          "true"
        );
      }
    } catch (error) {
      console.error("Error creating welcome notification:", error);
    }
  };

  const addNotification = async (notification: Notification) => {
    if (!user?.uid) return;

    try {
      await db()
        .ref(`/notifications/${user.uid}/${notification.id}`)
        .set(notification);

      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error("Error adding notification:", error);
      Alert.alert(
        translations[currentLanguage].error,
        translations[currentLanguage].couldNotSave
      );
    }
  };

  const loadNotifications = async () => {
    if (!user?.uid) return;

    try {
      const snapshot = await db()
        .ref(`/notifications/${user.uid}`)
        .orderByChild("timestamp")
        .once("value");

      const notificationsData = snapshot.val();
      if (notificationsData && isMountedRef.current) {
        const notificationsList = Object.values(notificationsData).sort(
          (a: any, b: any) => b.timestamp - a.timestamp
        );
        setNotifications(notificationsList as Notification[]);
      } else if (isMountedRef.current) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      if (isMountedRef.current) {
        Alert.alert(
          translations[currentLanguage].error,
          translations[currentLanguage].loadingNotifications
        );
      }
    }
  };

  const markAsRead = async (id: string) => {
    if (!user?.uid) return;

    try {
      await db().ref(`/notifications/${user.uid}/${id}`).update({ read: true });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      Alert.alert(
        translations[currentLanguage].error,
        translations[currentLanguage].couldNotSave
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
      startAutoUpdate();
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const language =
      currentLanguage === "en"
        ? "en-US"
        : currentLanguage === "pt-PT"
        ? "pt-PT"
        : currentLanguage === "pt-BR"
        ? "pt-BR"
        : "es-ES";

    return new Date(timestamp).toLocaleDateString(language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Añadir función para borrar notificaciones
  const handleDeleteNotification = async (id: string) => {
    if (!user?.uid) return;

    Alert.alert(
      translations[currentLanguage].confirmation,
      translations[currentLanguage].deleteNotificationConfirm,
      [
        {
          text: translations[currentLanguage].cancel,
          style: "cancel",
        },
        {
          text: translations[currentLanguage].delete,
          style: "destructive",
          onPress: async () => {
            try {
              await db().ref(`/notifications/${user.uid}/${id}`).remove();

              setNotifications((prev) =>
                prev.filter((notification) => notification.id !== id)
              );
            } catch (error) {
              console.error("Error deleting notification:", error);
              Alert.alert(
                translations[currentLanguage].error,
                translations[currentLanguage].couldNotDelete
              );
            }
          },
        },
      ]
    );
  };

  const markAllAsRead = async () => {
    if (!user?.uid || notifications.length === 0) return;
  
    try {
      // Define el tipo correcto para updates
      const updates: Record<string, boolean> = {};
      
      notifications
        .filter((notification) => !notification.read)
        .forEach((notification) => {
          const path = `/notifications/${user.uid}/${notification.id}/read`;
          updates[path] = true;
        });
  
      await db().ref().update(updates);
  
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      Alert.alert(
        translations[currentLanguage].error,
        translations[currentLanguage].couldNotUpdate
      );
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={
            item.type === "welcome"
              ? "happy-outline"
              : item.type === "form_completed"
              ? "checkbox-outline"
              : "information-circle-outline"
          }
          size={24}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
      <View style={styles.notificationActions}>
        {!item.read && <View style={styles.unreadDot} />}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </BackgroundContainer>
    );
  }

  // Añadir en el return, justo después del header
  return (
    <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {translations[currentLanguage].notifications}
            </Text>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.markAllButtonText}>
                  {translations[currentLanguage].markAllAsRead}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-off-outline"
                  size={48}
                  color={COLORS.inactive}
                />
                <Text style={styles.emptyText}>
                  {translations[currentLanguage].noNotifications}
                </Text>
              </View>
            }
            contentContainerStyle={[
              styles.listContainer,
              notifications.length === 0 && styles.emptyListContainer,
            ]}
          />
        </View>
      </SafeAreaView>
    </BackgroundContainer>
  );
};

const COLORS = {
  primary: "#9E7676",
  error: '#FF4646',
  secondary: "#DFCCCC",
  background: "#F5EBEB",
  text: "#594545",
  inactive: "#B4AAAA",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationIcon: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  readNotification: {
    opacity: 0.8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.inactive,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.inactive,
    textAlign: "center",
    marginTop: 16,
  },
});
