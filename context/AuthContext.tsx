import React, { createContext, useState, useContext, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, GuestUser, CountryRole } from "../types/user";
import {
  createLoginNotification,
} from "../utils/notifications";

// Función de utilidad para calcular la edad
const calculateAge = (birthDate: Date | string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

interface UpdateUserOptions {
  preventNavigation?: boolean;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isPartialUpdate: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsGuest: (
    name: string,
    classCode: string,
    dateOfBirth: Date
  ) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUserProfile: (
    updatedUser: User,
    options?: UpdateUserOptions
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPartialUpdate, setIsPartialUpdate] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("[AuthProvider] Error loading stored user:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const updateUserProfile = async (
    updatedUser: User,
    options?: UpdateUserOptions
  ) => {
    try {
      if (options?.preventNavigation) {
        setIsPartialUpdate(true);
      }

      if (updatedUser.dateOfBirth) {
        const newAge = calculateAge(updatedUser.dateOfBirth);
        updatedUser = {
          ...updatedUser,
          age: newAge,
        };
      }

      const dbPath = updatedUser.role === "guest" ? "guests" : "users";
      await db().ref(`/${dbPath}/${updatedUser.uid}`).update(updatedUser);
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      if (options?.preventNavigation) {
        setUser((prev) => ({ ...prev, ...updatedUser }));
      } else {
        setLoading(true);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("[updateUserProfile] Error:", error);
      throw error;
    } finally {
      if (!options?.preventNavigation) {
        setLoading(false);
      }
      if (options?.preventNavigation) {
        setTimeout(() => {
          setIsPartialUpdate(false);
        }, 100);
      }
    }
  };

  const signInAsGuest = async (
    name: string,
    classCode: string,
    dateOfBirth: Date
  ) => {
    try {
      setLoading(true);

      const classSnapshot = await db()
        .ref("/classCodes")
        .orderByChild("code")
        .equalTo(classCode)
        .once("value");

      const classData = classSnapshot.val();

      if (!classData) {
        throw new Error("Código de clase no válido");
      }

      const timestamp = Date.now();
      const guestId = `guest_${timestamp}`;

      const age = calculateAge(dateOfBirth);

      const guestData: GuestUser = {
        uid: guestId,
        name: name.trim(),
        email: `${guestId}@guest.com`,
        role: "guest",
        dateOfBirth: dateOfBirth.toISOString().split("T")[0],
        age: age,
        classCode: classCode.trim(),
        createdAt: timestamp,
        lastLogin: timestamp,
      };

      // Crear notificación de bienvenida para guest
      await createLoginNotification(guestId, "welcome", name.trim());

      await db()
        .ref(`/guests/${guestId}`)
        .set({
          ...guestData,
          classDetails: classData[Object.keys(classData)[0]],
        });

      await AsyncStorage.setItem("userData", JSON.stringify(guestData));
      setUser(guestData);
    } catch (error) {
      console.error("[signInAsGuest] Error during guest sign in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const verifyUserAge = async () => {
      if (user?.dateOfBirth && user?.age) {
        const newAge = calculateAge(user.dateOfBirth);
        if (newAge !== user.age) {
          await updateUserProfile(
            {
              ...user,
              age: newAge,
            },
            { preventNavigation: true }
          );
        }
      }
    };

    if (user) {
      verifyUserAge();
    }
  }, [user?.dateOfBirth]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await auth().signInWithEmailAndPassword(email, password);

      const userDoc = await db()
        .ref(`/users/${response.user.uid}`)
        .once("value");
      const userData = userDoc.val();

      if (userData) {
        try {
          // Crear notificación de login
          await createLoginNotification(
            response.user.uid,
            "login",
            userData.name
          );
        } catch (notifError) {
          console.error("[signIn] Notification error:", notifError);
          // Continuamos con el login aunque falle la notificación
        }

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error("[signIn] Error during sign in:", error);
      throw error;
    }
};

  const signOut = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem("userData");

      if (user?.role !== "guest") {
        await auth().signOut();
      }

      setUser(null);
    } catch (error) {
      console.error("[signOut] Error during sign out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  }, [user]);

  useEffect(() => {
  }, [loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPartialUpdate,
        signIn,
        signInAsGuest,
        signOut,
        setUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
