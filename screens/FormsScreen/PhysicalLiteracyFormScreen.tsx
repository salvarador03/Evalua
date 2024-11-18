import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  BackHandler
} from "react-native";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import type { Language } from "../../types/language";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type {
  FormsStackParamList,
  MainTabParamList,
  RootStackParamList,
} from "../../navigation/types";
import auth from "@react-native-firebase/auth";
import db, { FirebaseDatabaseTypes } from "@react-native-firebase/database";
import { languageToCountry, type FormResponse } from "../../types/form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "../../Components/LanguageSelection/translations";
import { LanguageSelectionScreen } from "../../Components/LanguageSelection/LanguageSelection";
import { useAuth } from "../../context/AuthContext";
import FormContent from "./FormContent";
import { ResultsView } from "./ResultsView";
import { questions } from "./data/questions";
import { teenQuestions, isTeenager } from "./data/teenQuestions";
import { FormStats } from "../../types/formstats";

type PhysicalLiteracyFormNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<FormsStackParamList, "PhysicalLiteracyForm">,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

interface FormResponseData {
  answers: (number | null)[];
  completedAt: string;
  language: Language;
}

export const PhysicalLiteracyFormScreen: React.FC = () => {
  const navigation = useNavigation<PhysicalLiteracyFormNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showLanguageSelection, setShowLanguageSelection] = useState<boolean>(true);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(false);
  const [initialized, setInitialized] = useState(false);
  const [language, setLanguage] = useState<Language | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(6).fill(null));
  const [loading, setLoading] = useState(true);
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [stats, setStats] = useState<FormStats[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userAge, setUserAge] = useState<number | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);

  const getUserSpecificKeys = (id: string) => ({
    languageKey: `@app_language_${id}`,
    languageSelectedKey: `@language_selected_${id}`,
  });

  const generateGuestId = () => `guest_${Date.now()}`;

    // Prevenir la navegación hacia atrás
    useEffect(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      );
      return () => backHandler.remove();
    }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Iniciando inicialización...");
        let currentUserId = user?.uid || "";
        
        // 1. Inicializar userId
        if (!currentUserId) {
          const storedGuestId = await AsyncStorage.getItem("@guest_user_id");
          currentUserId = storedGuestId || `guest_${Date.now()}`;
          if (!storedGuestId) {
            await AsyncStorage.setItem("@guest_user_id", currentUserId);
          }
        }
        setUserId(currentUserId);

        // 2. Establecer edad
        if (user?.age) {
          setUserAge(user.age);
        }

        // 3. Cargar idioma y respuesta del formulario
        const { languageKey, languageSelectedKey } = getUserSpecificKeys(currentUserId);
        const savedLanguage = await AsyncStorage.getItem(languageKey);
        const languageSelected = await AsyncStorage.getItem(languageSelectedKey);

        const formSnapshot = await db()
          .ref(`/form_responses/${currentUserId}/physical_literacy`)
          .once("value");
        
        const existingResponse = formSnapshot.val();

        if (existingResponse) {
          setFormResponse(existingResponse);
          setAnswers(existingResponse.answers);
          setLanguage(existingResponse.language);
          setHasSelectedLanguage(true);
          setShowLanguageSelection(false);
        } else if (savedLanguage && languageSelected === "true") {
          console.log("Usando idioma guardado:", savedLanguage);
          setLanguage(savedLanguage as Language);
          setHasSelectedLanguage(true);
          setShowLanguageSelection(false);
        } else {
          setShowLanguageSelection(true);
          setLanguage(null);
          setHasSelectedLanguage(false);
        }

      } catch (error) {
        console.error("Error en inicialización:", error);
        setShowLanguageSelection(true);
      } finally {
        setLoading(false);
        setInitialized(true);
        setIsFormReady(true);
      }
    };

    initializeApp();
  }, [user]);

  useEffect(() => {
    if (language && !formResponse) {
      calculateStats();
    }
  }, [language, formResponse]);

  const handleLanguageSelect = async (selectedLanguage: Language) => {
    try {
      setLoading(true);
      
      if (!userId) {
        throw new Error("No userId available");
      }
  
      const { languageKey, languageSelectedKey } = getUserSpecificKeys(userId);
      
      // Separamos las operaciones asíncronas según el tipo de usuario
      const storageOperations = [
        AsyncStorage.setItem(languageKey, selectedLanguage),
        AsyncStorage.setItem(languageSelectedKey, "true")
      ];
  
      // Solo intentamos actualizar la base de datos si es un usuario autenticado
      if (user && !userId.startsWith('guest_')) {
        await Promise.all([
          ...storageOperations,
          db().ref(`/users/${userId}`).update({
            countryRole: {
              country: languageToCountry[selectedLanguage],
              language: selectedLanguage,
              flag: selectedLanguage === 'es' ? 'spain' : 
                    selectedLanguage === 'en' ? 'usa' : 
                    selectedLanguage === 'pt-PT' ? 'portugal' : 'brazil'
            }
          })
        ]);
      } else {
        // Si es un usuario invitado, solo actualizamos AsyncStorage
        await Promise.all([
          ...storageOperations,
          // Opcionalmente, podemos guardar la información en la colección de invitados
          db().ref(`/guests/${userId}`).update({
            role: 'guest',
            language: selectedLanguage,
            country: languageToCountry[selectedLanguage]
          })
        ]);
      }
  
      setLanguage(selectedLanguage);
      setHasSelectedLanguage(true);
      setShowLanguageSelection(false);
      setCurrentQuestion(0);
      setAnswers(Array(6).fill(null));
      setIsFormReady(true);
  
    } catch (error) {
      console.error("Error en handleLanguageSelect:", error);
      // Mostrar un mensaje de error más específico
      Alert.alert(
        "Error",
        error instanceof Error 
          ? `${translations[selectedLanguage].languageSelectionError}: ${error.message}`
          : translations[selectedLanguage].languageSelectionError
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (): Promise<FormStats[]> => {
    if (!language) return [];
    
    try {
      const snapshot = await db().ref("/form_responses").once("value");
      const allResponses: FormResponseData[] = [];
  
      snapshot.forEach((childSnapshot: FirebaseDatabaseTypes.DataSnapshot) => {
        const response = childSnapshot.child("physical_literacy").val() as FormResponseData | null;
        if (response?.answers) {
          allResponses.push(response);
        }
        return undefined;
      });
  
      const currentQuestions = userAge && isTeenager(userAge) 
        ? teenQuestions[language] 
        : questions[language];
  
      const calculatedStats = currentQuestions.map((_, questionIndex) => {
        const values = allResponses
          .map(response => response.answers[questionIndex])
          .filter((value): value is number => value !== null && !isNaN(value));
  
        values.sort((a, b) => a - b);
  
        if (values.length === 0) {
          return {
            median: 0,
            belowMedian: 0,
            aboveMedian: 0,
            totalUsers: 0,
            min: 0,
            max: 0,
            distanceFromMedian: 0,
            percentageFromMedian: 0
          };
        }
  
        const totalUsers = values.length;
        const min = values[0];
        const max = values[totalUsers - 1];
        const medianIndex = Math.floor(totalUsers / 2);
        const median = totalUsers % 2 === 0
          ? (values[medianIndex - 1] + values[medianIndex]) / 2
          : values[medianIndex];
  
        // Get user's current answer for this question
        const userAnswer = answers[questionIndex];
        
        // Calculate distance and percentage from median
        const distanceFromMedian = userAnswer !== null ? userAnswer - median : 0;
        const percentageFromMedian = median !== 0 
          ? ((userAnswer !== null ? userAnswer : 0) / median * 100) - 100 
          : 0;
  
        return {
          median,
          belowMedian: values.filter(v => v < median).length,
          aboveMedian: values.filter(v => v > median).length,
          totalUsers,
          min,
          max,
          distanceFromMedian,
          percentageFromMedian
        };
      });
  
      setStats(calculatedStats);
      return calculatedStats;
    } catch (error) {
      console.error("Error calculating stats:", error);
      return [];
    }
  };

  const handleSubmit = async () => {
    if (!language) {
      Alert.alert("Error", "No language selected");
      return;
    }

    if (answers.some(answer => answer === null)) {
      Alert.alert(
        translations[language].incompleteAnswers,
        translations[language].pleaseAnswerAll,
        [{ text: "OK" }]
      );
      return;
    }

    try {
      if (!userId) {
        throw new Error("No se pudo identificar al usuario");
      }

      const response: FormResponse = {
        userId,
        answers: answers as number[],
        completedAt: Date.now(),
        language,
        isGuest: !user || user.role === "guest",
        country: languageToCountry[language],
      };

      await db()
        .ref(`/form_responses/${userId}/physical_literacy`)
        .set(response);

      setFormResponse(response);
      await calculateStats();

      Alert.alert(
        translations[language].success,
        translations[language].answersSubmitted
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert(
        translations[language].error,
        translations[language].couldNotSave
      );
    }
  };

  if (!initialized || loading) {
    return (
      <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ade80" />
        </View>
      </BackgroundContainer>
    );
  }

  if (showLanguageSelection && !formResponse && !language) {
    return (
      <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.languageSelectionContainer}>
            <LanguageSelectionScreen
              onLanguageSelect={handleLanguageSelect}
              isStandalone={false}
            />
          </View>
        </SafeAreaView>
      </BackgroundContainer>
    );
  }

  if (userAge === null) {
    return (
      <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Error: No se pudo determinar la edad del usuario
          </Text>
        </View>
      </BackgroundContainer>
    );
  }

  if (formResponse) {
    return (
      <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
        <View style={styles.overlay}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            <ResultsView
              language={language!}
              formResponse={formResponse}
              answers={answers}
              stats={stats}
            />
          </ScrollView>
        </View>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
      <View style={styles.overlay}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {language && (
            <FormContent
              language={language}
              currentQuestion={currentQuestion}
              answers={answers}
              onAnswerChange={setAnswers}
              onQuestionChange={(direction) =>
                setCurrentQuestion((curr) =>
                  direction === "next" ? curr + 1 : curr - 1
                )
              }
              onSubmit={handleSubmit}
              userAge={userAge}
            />
          )}
        </ScrollView>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  safeArea: {
    flex: 1,
    width: "100%",
  },
  languageSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    margin: 20,
  },
});

export default PhysicalLiteracyFormScreen;