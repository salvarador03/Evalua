// Components/LanguageSelection.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Language } from "../../types/language";
import { User } from "../../types/user";

const countryConfigs = {
  "es": {
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

  const handleCountrySelection = async (language: Language) => {
    try {
      if (user) {
        const selectedCountry = countryConfigs[language];
        
        if (!user.countryRole || 
            user.countryRole.language !== selectedCountry.language || 
            user.countryRole.country !== selectedCountry.country) {
          
          const updatedUser: User = {
            ...user,
            countryRole: {
              country: selectedCountry.country,
              language: selectedCountry.language,
              flag: selectedCountry.flag
            }
          };

          await updateUserProfile(updatedUser);
        }
      }

      await onLanguageSelect(language);
      
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
              ¡Bienvenido! /
              Welcome! /{'\n'}
              Bem-vindo! /
              Bem-vindo!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Selecciona tu idioma /{'\n'}
              Select your language /{'\n'}
              Selecione seu idioma / {'\n'}
              Selecione seu idioma
            </Text>
          </View>

          <View style={styles.gridContainer}>
            {/* European and North American flags */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es")}
              >
                <Image
                  source={require("../../assets/flags/spain.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("en")}
              >
                <Image
                  source={require("../../assets/flags/usa.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es")}
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
                onPress={() => handleCountrySelection("es")}
              >
                <Image
                  source={require("../../assets/flags/colombia.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es")}
              >
                <Image
                  source={require("../../assets/flags/peru.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es")}
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
                onPress={() => handleCountrySelection("es")}
              >
                <Image
                  source={require("../../assets/flags/chile.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es")}
              >
                <Image
                  source={require("../../assets/flags/argentina.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("es")}
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
                onPress={() => handleCountrySelection("es")}
              >
                <Image
                  source={require("../../assets/flags/cuba.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("pt-PT")}
              >
                <Image
                  source={require("../../assets/flags/portugal.webp")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => handleCountrySelection("pt-BR")}
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
      backgroundColor: '#f0f4f8',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    welcomeContainer: {
      alignItems: 'center',
      marginBottom: 40,
      width: '100%',
    },
    welcomeTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 34,
    },
    welcomeSubtitle: {
      fontSize: 18,
      color: '#34495e',
      textAlign: 'center',
      lineHeight: 26,
    },
    gridContainer: {
      width: '100%',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 16,
    },
    flagButton: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 12,
      marginHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    flagImage: {
      width: 65,
      height: 45,
      borderRadius: 8,
    }
});