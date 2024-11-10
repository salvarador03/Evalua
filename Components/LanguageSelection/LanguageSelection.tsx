import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from "react-native";
import { translations } from "./translations";
import { Language } from "../../types/language";

export interface LanguageSelectionScreenProps {
  onLanguageSelect: (lang: Language) => void | Promise<void>;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ 
  onLanguageSelect 
}) => {
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
                onPress={() => onLanguageSelect("es")}
              >
                <Image
                  source={require("../../assets/flags/spain.png")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => onLanguageSelect("en")}
              >
                <Image
                  source={require("../../assets/flags/usa.png")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => onLanguageSelect("pt-PT")}
              >
                <Image
                  source={require("../../assets/flags/portugal.png")}
                  style={styles.flagImage}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.flagButton}
                onPress={() => onLanguageSelect("pt-BR")}
              >
                <Image
                  source={require("../../assets/flags/brazil.png")}
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
      marginBottom: 40, // Aumentado para dar más espacio
      width: '100%',
    },
    welcomeTitle: {
      fontSize: 24, // Aumentado de 20
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: 20, // Aumentado de 15
      lineHeight: 32, // Aumentado de 28
    },
    welcomeSubtitle: {
      fontSize: 16, // Aumentado de 14
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: 24, // Aumentado de 20
    },
    gridContainer: {
      width: '100%',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 16, // Aumentado de 12
    },
    flagButton: {
      backgroundColor: 'white',
      borderRadius: 16, // Aumentado de 12
      padding: 12, // Aumentado de 8
      marginHorizontal: 8, // Aumentado de 6
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
      width: 65, // Aumentado de 50
      height: 45, // Aumentado de 35
      borderRadius: 8, // Aumentado de 6
    }
  });