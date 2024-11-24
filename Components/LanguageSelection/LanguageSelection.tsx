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
      // Si hay un usuario, actualizamos su perfil
      if (user) {
        const selectedCountry = countryConfigs[language];
        
        // Solo actualizamos si el countryRole es diferente
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

      // Siempre llamamos a onLanguageSelect, independientemente del usuario
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
              Selecione seu idioma /
              Selecione seu idioma
            </Text>
          </View>

          <View style={styles.gridContainer}>
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
            </View>

            <View style={styles.row}>
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
      backgroundColor: 'transparent',
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
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 32,
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: 24,
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
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 12,
      marginHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    flagImage: {
      width: 65,
      height: 45,
      borderRadius: 8,
    }
});