// Components/LanguageSelection.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert, Dimensions } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Language } from "../../types/language";
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
type CountryCodeType = "es_ES" | "es_CU" | "es_PE" | "es_PA" | "es_CO" | "es_CL" | "es_EC" | "es_AR" | "es_MX" | "en_US" | "pt_PT" | "pt_BR";

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
  }
};

export interface LanguageSelectionScreenProps {
  onLanguageSelect: (lang: Language) => void | Promise<void>;
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

  const handleCountrySelection = async (countryCode: CountryCodeType) => {
    try {
      if (user) {
        const selectedCountry = countryConfigs[countryCode];

        if (!user.countryRole ||
          user.countryRole.language !== selectedCountry.language ||
          user.countryRole.country !== selectedCountry.country ||
          user.countryRole.flag !== selectedCountry.flag) {

          const updatedUser: User = {
            ...user,
            countryRole: {
              country: selectedCountry.country, // Usamos el nombre del país del config
              language: selectedCountry.language, // Usamos el idioma del config
              flag: selectedCountry.flag // Usamos el flag del config
            }
          };

          await updateUserProfile(updatedUser);
        }

        await onLanguageSelect(selectedCountry.language);
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
            {/* European and North American flags */}
            <View style={styles.row}>
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
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_MX")}
              >
                <Image
                  source={require("../../assets/flags/mexico.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* South American flags row 1 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_CO")}
              >
                <Image
                  source={require("../../assets/flags/colombia.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
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

            {/* South American flags row 2 */}
            <View style={styles.row}>
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
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_PA")}
              >
                <Image
                  source={require("../../assets/flags/panama.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            {/* Caribbean and Portuguese flags */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es_CU")}
              >
                <Image
                  source={require("../../assets/flags/cuba.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
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
    marginBottom: '5%', // Cambiado a porcentaje
    width: '100%',
    paddingHorizontal: 38
  },
  welcomeTitle: {
    fontSize: Math.min(26, width * 0.06), // Tamaño responsivo
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '3%', // Cambiado a porcentaje
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: Math.min(18, width * 0.045), // Tamaño responsivo
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
    justifyContent: 'space-evenly', // Cambiado a space-evenly
    width: '100%',
    marginBottom: '3%', // Cambiado a porcentaje
    paddingHorizontal: 10,
  },
  flagButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: Math.min(12, width * 0.02), // Padding responsivo
    marginHorizontal: BUTTON_MARGIN,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    flex: 1, // Añadido flex: 1
    maxWidth: width * 0.25, // Máximo ancho responsivo
    aspectRatio: 1.5, // Mantener proporción
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.44, // Proporción de banderas estándar
    borderRadius: 8,
  },
});