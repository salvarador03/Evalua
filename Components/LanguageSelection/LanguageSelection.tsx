// Components/LanguageSelection.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert, Dimensions, ScrollView, Animated, Easing } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { countryCodeToName, countryToLanguage, Language, CountryCode } from "../../types/language";
import { User } from "../../types/user";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

const { width, height } = Dimensions.get('window');
const BUTTON_MARGIN = 8;
const GRID_PADDING = 16;

// Define the interface for country configuration
interface CountryConfig {
  country: string;
  language: Language;
  flag: string;
}

// Define the countryConfigs object with the correct type annotations
const countryConfigs: Record<CountryCode, CountryConfig> = {
  "es": {
    country: "España",
    language: "es" as Language,
    flag: "spain"
  },
  "en": {
    country: "United States",
    language: "en" as Language,
    flag: "usa"
  },
  "pt-PT": {
    country: "Portugal",
    language: "pt-PT" as Language,
    flag: "portugal"
  },
  "pt-BR": {
    country: "Brasil",
    language: "pt-BR" as Language,
    flag: "brazil"
  },
  "es_ES": {
    country: "España",
    language: "es" as Language,
    flag: "spain"
  },
  "es_CU": {
    country: "Cuba",
    language: "es" as Language,
    flag: "cuba"
  },
  "es_PE": {
    country: "Perú",
    language: "es" as Language,
    flag: "peru"
  },
  "es_PA": {
    country: "Panamá",
    language: "es" as Language,
    flag: "panama"
  },
  "es_CO": {
    country: "Colombia",
    language: "es" as Language,
    flag: "colombia"
  },
  "es_CL": {
    country: "Chile",
    language: "es" as Language,
    flag: "chile"
  },
  "es_EC": {
    country: "Ecuador",
    language: "es" as Language,
    flag: "ecuador"
  },
  "es_AR": {
    country: "Argentina",
    language: "es" as Language,
    flag: "argentina"
  },
  "es_MX": {
    country: "México",
    language: "es" as Language,
    flag: "mexico"
  },
  "en_US": {
    country: "United States",
    language: "en" as Language,
    flag: "usa"
  },
  "pt_PT": {
    country: "Portugal",
    language: "pt-PT" as Language,
    flag: "portugal"
  },
  "pt_BR": {
    country: "Brasil",
    language: "pt-BR" as Language,
    flag: "brazil"
  },
  "es_NI": {
    country: "Nicaragua",
    language: "es" as Language,
    flag: "nicaragua"
  },
  "es_PY": {
    country: "Paraguay",
    language: "es" as Language,
    flag: "paraguay"
  }
};

export interface LanguageSelectionScreenProps {
  onLanguageSelect: (countryCode: CountryCode) => void | Promise<void>;
  isStandalone?: boolean;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  onLanguageSelect,
  isStandalone = false
}) => {
  const { user, updateUserProfile } = useAuth();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    width > Dimensions.get('window').height ? 'landscape' : 'portrait'
  );
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Animación de rebote para la flecha
    const startBounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (showScrollIndicator) {
          startBounceAnimation();
        }
      });
    };

    startBounceAnimation();
  }, [showScrollIndicator]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    // Ocultar el indicador cuando el usuario haya scrolleado más del 20% del contenido
    setShowScrollIndicator(contentOffset.y < contentSize.height * 0.2);
  };

  const handleCountrySelection = async (countryCode: CountryCode) => {
    setSelectedCountry(countryCode);
    setShowConfirmation(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedCountry) return;

    try {
      if (user) {
        const selectedCountryConfig = countryConfigs[selectedCountry];
        const countryName = countryCodeToName[selectedCountry];
        
        if (!user.countryRole ||
            user.countryRole.country !== countryName ||
            user.countryRole.flag !== selectedCountryConfig.flag) {
  
          const updatedUser: User = {
            ...user,
            countryRole: {
              country: countryName,
              language: countryToLanguage[selectedCountry],
              flag: selectedCountryConfig.flag
            }
          };
  
          await updateUserProfile(updatedUser);
        }
  
        await onLanguageSelect(selectedCountry);
      }
    } catch (error) {
      console.error('Error al actualizar el rol de país:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar el país seleccionado. Por favor, intenta nuevamente.'
      );
    }
  };

  const getLanguageName = (countryCode: CountryCode) => {
    switch (countryCode) {
      case "es_ES":
        return "Español de España";
      case "es_CU":
        return "Español de Cuba";
      case "es_PE":
        return "Español de Perú";
      case "es_PA":
        return "Español de Panamá";
      case "es_CO":
        return "Español de Colombia";
      case "es_CL":
        return "Español de Chile";
      case "es_EC":
        return "Español de Ecuador";
      case "es_AR":
        return "Español de Argentina";
      case "es_MX":
        return "Español de México";
      case "en_US":
        return "English";
      case "pt_PT":
        return "Português de Portugal";
      case "pt_BR":
        return "Português do Brasil";
      case "es_NI":
        return "Español de Nicaragua";
      case "es_PY":
        return "Español de Paraguay";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>
              ¡Bienvenido! / Welcome! /{'\n'}
              Bem-vindo! / Bem-vindo!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Selecciona tu idioma /{'\n'}
              Select your language /{'\n'}
              Selecione seu idioma /{'\n'}
              Selecione seu idioma
            </Text>
          </View>

          <View style={styles.gridContainer}>
            {/* Fila 1: España y USA */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_ES" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_ES")}
              >
                <Image
                  source={require("../../assets/flags/spain.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_ES" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "en_US" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("en_US")}
              >
                <Image
                  source={require("../../assets/flags/usa.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "en_US" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Fila 2: México y Colombia */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_MX" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_MX")}
              >
                <Image
                  source={require("../../assets/flags/mexico.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_MX" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_CO" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_CO")}
              >
                <Image
                  source={require("../../assets/flags/colombia.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_CO" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Fila 3: Perú y Ecuador */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_PE" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_PE")}
              >
                <Image
                  source={require("../../assets/flags/peru.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_PE" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_EC" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_EC")}
              >
                <Image
                  source={require("../../assets/flags/ecuador.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_EC" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Fila 4: Chile y Argentina */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_CL" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_CL")}
              >
                <Image
                  source={require("../../assets/flags/chile.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_CL" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_AR" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_AR")}
              >
                <Image
                  source={require("../../assets/flags/argentina.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_AR" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Fila 5: Panamá y Cuba */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_PA" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_PA")}
              >
                <Image
                  source={require("../../assets/flags/panama.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_PA" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_CU" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_CU")}
              >
                <Image
                  source={require("../../assets/flags/cuba.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_CU" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Fila 6: Portugal y Brasil */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "pt_PT" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("pt_PT")}
              >
                <Image
                  source={require("../../assets/flags/portugal.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "pt_PT" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "pt_BR" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("pt_BR")}
              >
                <Image
                  source={require("../../assets/flags/brazil.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "pt_BR" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Fila 7: Nicaragua y Paraguay */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_NI" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_NI")}
              >
                <Image
                  source={require("../../assets/flags/nicaragua.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_NI" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flagButton, selectedCountry === "es_PY" && styles.flagButtonActive]}
                onPress={() => handleCountrySelection("es_PY")}
              >
                <Image
                  source={require("../../assets/flags/paraguay.webp")}
                  style={styles.flagImage}
                />
                {selectedCountry === "es_PY" && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {showConfirmation && selectedCountry && (
            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationText}>
                Has seleccionado: {getLanguageName(selectedCountry)}
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmSelection}
              >
                <Text style={styles.confirmButtonText}>Confirmar selección</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {showScrollIndicator && (
        <Animated.View style={[
          styles.scrollIndicator,
          {
            transform: [{
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10]
              })
            }]
          }
        ]}>
          <Ionicons name="chevron-down" size={24} color="#9E7676" />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: GRID_PADDING,
    width: '100%',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: height * 0.02,
    width: '100%',
    paddingHorizontal: 20
  },
  welcomeTitle: {
    fontSize: Math.min(22, width * 0.055),
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: height * 0.015,
    lineHeight: Math.min(28, width * 0.07),
  },
  welcomeSubtitle: {
    fontSize: Math.min(16, width * 0.04),
    color: '#34495e',
    textAlign: 'center',
    lineHeight: Math.min(22, width * 0.055),
  },
  gridContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.05,
  },
  flagButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: width * 0.25,
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  flagButtonActive: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  flagImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.44,
    borderRadius: 6,
  },
  emptySpace: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  confirmationContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: '90%',
    alignSelf: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});