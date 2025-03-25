import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import db from "@react-native-firebase/database";
import { feedbackTranslations } from "../../translations/feedbackTranslations";
import type { Language } from "../../translations/types";

interface TeacherFeedbackFormProps {
  visible: boolean;
  onClose: () => void;
  language: Language;
  userId: string;
  formType: string;
}

const TeacherFeedbackForm: React.FC<TeacherFeedbackFormProps> = ({
  visible,
  onClose,
  language: initialLanguage,
  userId,
  formType,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [susScores, setSusScores] = useState<number[]>(Array(10).fill(0));
  const [ueqScores, setUeqScores] = useState({
    attractive: Array(5).fill(0),
    perspicuity: Array(4).fill(0),
    efficiency: Array(4).fill(0),
    dependability: Array(4).fill(0),
    stimulation: Array(4).fill(0),
    novelty: Array(4).fill(0),
  });
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");

  const t = feedbackTranslations[language];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const handleSusChange = (index: number, value: number) => {
    const newScores = [...susScores];
    newScores[index] = value;
    setSusScores(newScores);
  };

  const handleUeqChange = (dimension: keyof typeof ueqScores, index: number, value: number) => {
    const newScores = { ...ueqScores };
    newScores[dimension][index] = value;
    setUeqScores(newScores);
  };

  const calculateSusScore = (): number => {
    let total = 0;
    susScores.forEach((score, index) => {
      if (index % 2 === 0) {
        total += score - 1;
      } else {
        total += 5 - score;
      }
    });
    return total * 2.5;
  };

  const handleSubmit = async () => {
    if (susScores.some(score => score === 0)) {
      Alert.alert(t.errorSubmitting, t.feedbackRequired);
      return;
    }

    setLoading(true);

    try {
      const timestamp = Date.now();
      const feedbackId = `${userId}_${formType}_${timestamp}`;

      const feedbackData = {
        userId,
        formType,
        ratings: {
          overall: calculateSusScore(),
          usability: 0,
          content: 0,
          design: 0,
        },
        sus: {
          scores: susScores,
          total: calculateSusScore(),
        },
        ueq: ueqScores,
        comments: {
          generalFeedback,
          improvementSuggestions,
        },
        language,
        submittedAt: timestamp,
        lastModified: timestamp,
      };

      await db().ref(`/feedback/${feedbackId}`).set(feedbackData);
      setSubmitted(true);
    } catch (error) {
      console.error("[handleSubmit] Error:", error);
      Alert.alert(t.errorSubmitting, t.pleaseTryAgain);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSusScores(Array(10).fill(0));
    setUeqScores({
      attractive: Array(5).fill(0),
      perspicuity: Array(4).fill(0),
      efficiency: Array(4).fill(0),
      dependability: Array(4).fill(0),
      stimulation: Array(4).fill(0),
      novelty: Array(4).fill(0),
    });
    setGeneralFeedback("");
    setImprovementSuggestions("");
  };

  const renderSusQuestion = (question: string, index: number) => (
    <View key={index} style={styles.questionContainer}>
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.ratingButton,
              susScores[index] === value && styles.ratingButtonActive,
            ]}
            onPress={() => handleSusChange(index, value)}
          >
            <Text
              style={[
                styles.ratingButtonText,
                susScores[index] === value && styles.ratingButtonTextActive,
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUeqPair = (dimension: keyof typeof ueqScores, pair: string, index: number) => (
    <View key={index} style={styles.questionContainer}>
      <Text style={styles.questionText}>{pair}</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.ratingButton,
              ueqScores[dimension][index] === value && styles.ratingButtonActive,
            ]}
            onPress={() => handleUeqChange(dimension, index, value)}
          >
            <Text
              style={[
                styles.ratingButtonText,
                ueqScores[dimension][index] === value && styles.ratingButtonTextActive,
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getFlagSource = (lang: Language) => {
    switch (lang) {
      case "es":
        return require("../../assets/flags/spain.webp");
      case "en":
        return require("../../assets/flags/usa.webp");
      case "pt-PT":
        return require("../../assets/flags/portugal.webp");
      case "pt-BR":
        return require("../../assets/flags/brazil.webp");
      default:
        return require("../../assets/flags/spain.webp");
    }
  };

  if (submitted) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.thankYouContainer}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color="#4CAF50"
              style={styles.successIcon}
            />
            <Text style={styles.thankYouTitle}>{t.thankYou}</Text>
            <Text style={styles.thankYouText}>{t.yourFeedbackHelps}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>{t.feedbackTitle}</Text>
              <View style={styles.languageSelector}>
                <TouchableOpacity
                  style={[styles.flagButton, language === "es" && styles.flagButtonActive]}
                  onPress={() => handleLanguageChange("es")}
                >
                  <Image
                    source={getFlagSource("es")}
                    style={styles.flagImage}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.flagButton, language === "en" && styles.flagButtonActive]}
                  onPress={() => handleLanguageChange("en")}
                >
                  <Image
                    source={getFlagSource("en")}
                    style={styles.flagImage}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.flagButton, language === "pt-PT" && styles.flagButtonActive]}
                  onPress={() => handleLanguageChange("pt-PT")}
                >
                  <Image
                    source={getFlagSource("pt-PT")}
                    style={styles.flagImage}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.flagButton, language === "pt-BR" && styles.flagButtonActive]}
                  onPress={() => handleLanguageChange("pt-BR")}
                >
                  <Image
                    source={getFlagSource("pt-BR")}
                    style={styles.flagImage}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#594545" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* SUS Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.susTitle}</Text>
              <Text style={styles.sectionDescription}>{t.susDescription}</Text>
              {t.susQuestions.map((question, index) => renderSusQuestion(question, index))}
            </View>

            {/* UEQ Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.ueqTitle}</Text>
              <Text style={styles.sectionDescription}>{t.ueqDescription}</Text>
              
              {Object.entries(t.ueqPairs).map(([dimension, pairs]) => (
                <View key={dimension} style={styles.dimensionSection}>
                  <Text style={styles.dimensionTitle}>
                    {t.ueqDimensions[dimension as keyof typeof t.ueqDimensions]}
                  </Text>
                  {pairs.map((pair, index) =>
                    renderUeqPair(
                      dimension as keyof typeof ueqScores,
                      pair,
                      index
                    )
                  )}
                </View>
              ))}
            </View>

            {/* General Feedback Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.tellUsMore}</Text>
              <TextInput
                style={styles.textInput}
                value={generalFeedback}
                onChangeText={setGeneralFeedback}
                placeholder={t.tellUsMore}
                placeholderTextColor="#B4AAAA"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Improvement Suggestions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.improvementSuggestions}</Text>
              <TextInput
                style={styles.textInput}
                value={improvementSuggestions}
                onChangeText={setImprovementSuggestions}
                placeholder={t.improvementSuggestions}
                placeholderTextColor="#B4AAAA"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetForm}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>{t.resetFeedback}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{t.submitFeedback}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    width: "90%",
    height: "90%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#594545",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#594545",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  dimensionSection: {
    marginBottom: 20,
  },
  dimensionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#594545",
    marginBottom: 12,
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    color: "#594545",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9E7676",
  },
  ratingButtonText: {
    fontSize: 16,
    color: "#9E7676",
    fontWeight: "500",
  },
  ratingButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  ratingButtonActive: {
    backgroundColor: "#9E7676",
    borderColor: "#9E7676",
  },
  textInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    minHeight: 100,
    textAlignVertical: "top",
    color: "#594545",
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9E7676",
  },
  resetButtonText: {
    color: "#9E7676",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#9E7676",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  thankYouContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    width: "80%",
    maxWidth: 400,
  },
  successIcon: {
    marginBottom: 20,
  },
  thankYouTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#594545",
    marginBottom: 10,
    textAlign: "center",
  },
  thankYouText: {
    fontSize: 16,
    color: "#594545",
    textAlign: "center",
    marginBottom: 25,
  },
  closeButton: {
    backgroundColor: "#9E7676",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  languageSelector: {
    flexDirection: 'row',
    marginLeft: 10,
    gap: 8,
  },
  flagButton: {
    width: 32,
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#B4AAAA',
    backgroundColor: '#f5f5f5',
  },
  flagButtonActive: {
    borderWidth: 2,
    borderColor: '#9E7676',
    backgroundColor: '#fff',
    shadowColor: '#9E7676',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
});

export default TeacherFeedbackForm; 