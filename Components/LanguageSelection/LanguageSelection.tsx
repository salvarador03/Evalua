// Components/LanguageSelection.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert, Dimensions } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { countryCodeToName, countryToLanguage, Language } from "../../types/language";
import { User } from "../../types/user";

const { width } = Dimensions.get('window');
const BUTTON_MARGIN = 8;
const GRID_PADDING = 20;

// Define the interface for country configuration
interface CountryConfig {
  country: string;
  language: Language;
  flag: string;
}

// Define the type for the countryConfigs object
type CountryCodeType = "es_ES" | "es_CU" | "es_PE" | "es_PA" | "es_CO" | "es_CL" | "es_EC" | "es_AR" | "es_MX" | "en_US" | "pt_PT" | "pt_BR" | "es_NI" | "es_PY";

// Define the countryConfigs object with the correct type annotations
const countryConfigs: Record<CountryCodeType, CountryConfig> = {
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
  onLanguageSelect: (countryCode: string) => void | Promise<void>;
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

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription?.remove();
  }, []);

// En LanguageSelectionScreen.tsx
const handleCountrySelection = async (countryCode: CountryCodeType) => {
  try {
    if (user) {
      const selectedCountry = countryConfigs[countryCode];
      // Obtener el nombre del país del mapeo
      const countryName = countryCodeToName[countryCode];
      
      // Siempre usar el nombre del país específico, no el del idioma
      if (!user.countryRole ||
          user.countryRole.country !== countryName ||
          user.countryRole.flag !== selectedCountry.flag) {
  
        const updatedUser: User = {
          ...user,
          countryRole: {
            country: countryName, // Usar el nombre específico del país
            language: countryToLanguage[countryCode], // Usar el idioma base para traducciones
            flag: selectedCountry.flag
          }
        };
  
        await updateUserProfile(updatedUser);
      }
  
      // Enviar el código de país completo en lugar del idioma base
      await onLanguageSelect(countryCode);  // <-- CAMBIO AQUÍ
    }
  } catch (error) {
    console.error('Error al actualizar el rol de país:', error);
    Alert.alert(
      'Error',
      'No se pudo actualizar el país seleccionado. Por favor, intenta nuevamente.'
    );
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
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
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_ES")}
              >
                <Image
                  source={require("../../assets/flags/spain.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("en_US")}
              >
                <Image
                  source={require("../../assets/flags/usa.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* Fila 2: México y Colombia */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_MX")}
              >
                <Image
                  source={require("../../assets/flags/mexico.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_CO")}
              >
                <Image
                  source={require("../../assets/flags/colombia.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* Fila 3: Perú y Ecuador */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_PE")}
              >
                <Image
                  source={require("../../assets/flags/peru.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_EC")}
              >
                <Image
                  source={require("../../assets/flags/ecuador.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* Fila 4: Chile y Argentina */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_CL")}
              >
                <Image
                  source={require("../../assets/flags/chile.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_AR")}
              >
                <Image
                  source={require("../../assets/flags/argentina.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* Fila 5: Panamá y Cuba */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_PA")}
              >
                <Image
                  source={require("../../assets/flags/panama.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_CU")}
              >
                <Image
                  source={require("../../assets/flags/cuba.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* Fila 6: Portugal y Brasil */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("pt_PT")}
              >
                <Image
                  source={require("../../assets/flags/portugal.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("pt_BR")}
              >
                <Image
                  source={require("../../assets/flags/brazil.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* Fila 7: Nicaragua y Paraguay */}
            <View style={styles.rowTwo}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_NI")}
              >
                <Image
                  source={require("../../assets/flags/nicaragua.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_PY")}
              >
                <Image
                  source={require("../../assets/flags/paraguay.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: GRID_PADDING,
    width: '100%',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: '5%',
    width: '100%',
    paddingHorizontal: 38
  },
  welcomeTitle: {
    fontSize: Math.min(26, width * 0.06),
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '3%',
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: Math.min(18, width * 0.045),
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 26,
  },
  gridContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: '3%',
    paddingHorizontal: 10,
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '3%',
    paddingHorizontal: width * 0.08, // Reducido para dar más espacio
  },
  flagButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 5, // Reducido
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    flex: 0,
    width: width * 0.19, // Reducido para que encajen en la pantalla
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  flagImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.44,
    borderRadius: 8,
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
});