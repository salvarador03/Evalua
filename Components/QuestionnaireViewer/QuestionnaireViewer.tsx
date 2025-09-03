import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Language } from "../../translations/types";
import { BackgroundContainer } from "../BackgroundContainer/BackgroundContainer";
import { FormContent } from "../../screens/FormsScreen/FormContent";

interface QuestionnaireViewerProps {
    visible: boolean;
    onClose: () => void;
    language: Language;
}

type AgeGroup = 'kids' | 'teen' | 'university';

const ageGroupTranslations: Record<Language, Record<AgeGroup, string>> = {
    es: {
        kids: "Niños (6-12 años)",
        teen: "Adolescentes (12-18 años)",
        university: "Universitarios (18-24 años)"
    },
    en: {
        kids: "Kids (6-12 years)",
        teen: "Teenagers (12-18 years)",
        university: "University Students (18-24 years)"
    },
    "es-PA": {
        kids: "Niños (6-12 años)",
        teen: "Adolescentes (12-18 años)",
        university: "Universitarios (18-24 años)"
    },
    "pt-PT": {
        kids: "Crianças (6-12 anos)",
        teen: "Adolescentes (12-18 anos)",
        university: "Universitários (18-24 anos)"
    },
    "pt-BR": {
        kids: "Crianças (6-12 anos)",
        teen: "Adolescentes (12-18 anos)",
        university: "Universitários (18-24 anos)"
    }
};

const buttonTranslations: Record<Language, {
    observeQuestionnaires: string;
    selectAgeGroup: string;
    close: string;
    backToSelection: string;
}> = {
    es: {
        observeQuestionnaires: "Observar Cuestionarios",
        selectAgeGroup: "Selecciona una franja de edad",
        close: "Cerrar",
        backToSelection: "Volver a Selección"
    },
    en: {
        observeQuestionnaires: "Observe Questionnaires",
        selectAgeGroup: "Select an age group",
        close: "Close",
        backToSelection: "Back to Selection"
    },
    "es-PA": {
        observeQuestionnaires: "Observar Cuestionarios",
        selectAgeGroup: "Selecciona una franja de edad",
        close: "Cerrar",
        backToSelection: "Volver a Selección"
    },
    "pt-PT": {
        observeQuestionnaires: "Observar Questionários",
        selectAgeGroup: "Seleciona um grupo etário",
        close: "Fechar",
        backToSelection: "Voltar à Seleção"
    },
    "pt-BR": {
        observeQuestionnaires: "Observar Questionários",
        selectAgeGroup: "Selecione um grupo etário",
        close: "Fechar",
        backToSelection: "Voltar à Seleção"
    }
};

export default function QuestionnaireViewer({ visible, onClose, language }: QuestionnaireViewerProps) {
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    
    const t = buttonTranslations[language];
    const ageT = ageGroupTranslations[language];

    const handleClose = () => {
        setSelectedAgeGroup(null);
        setCurrentQuestion(0);
        onClose();
    };

    const handleAgeGroupSelect = (ageGroup: AgeGroup) => {
        setSelectedAgeGroup(ageGroup);
        setCurrentQuestion(0);
    };

    const handleBackToSelection = () => {
        setSelectedAgeGroup(null);
        setCurrentQuestion(0);
    };

    const getAgeForGroup = (ageGroup: AgeGroup): number => {
        switch (ageGroup) {
            case 'kids': return 10;
            case 'teen': return 15;
            case 'university': return 20;
            default: return 10;
        }
    };

    // Funciones mock para el FormContent
    const mockAnswers = new Array(8).fill(5); // Valor neutral para mostrar (no null)
    const mockOnAnswerChange = () => {}; // No hacer nada en modo solo lectura
    const mockOnQuestionChange = (direction: 'next' | 'prev') => {
        if (direction === 'next' && currentQuestion < 7) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (direction === 'prev' && currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };
    const mockOnSubmit = () => {
        // No hacer nada en modo solo lectura
    };

    // Si se ha seleccionado una franja de edad, mostrar el cuestionario completo
    if (selectedAgeGroup) {
        return (
            <BackgroundContainer>
                <SafeAreaView style={styles.fullScreenContainer}>
                    {/* Header con botón de volver */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={handleBackToSelection}
                        >
                            <Ionicons name="arrow-back" size={24} color="#4ade80" />
                            <Text style={styles.backButtonText}>{t.backToSelection}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Contenido del cuestionario */}
                    <View style={styles.content}>
                        <FormContent
                            language={language}
                            currentQuestion={currentQuestion}
                            answers={mockAnswers}
                            onAnswerChange={mockOnAnswerChange}
                            onQuestionChange={mockOnQuestionChange}
                            onSubmit={mockOnSubmit}
                            userAge={getAgeForGroup(selectedAgeGroup)}
                            readOnly={true}
                        />
                    </View>
                </SafeAreaView>
            </BackgroundContainer>
        );
    }

    // Modal para seleccionar franja de edad
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#594545" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t.selectAgeGroup}</Text>
                        
                        <View style={styles.ageGroupContainer}>
                            <TouchableOpacity
                                style={styles.ageGroupButton}
                                onPress={() => handleAgeGroupSelect('kids')}
                            >
                                <Image
                                    source={require("../../assets/images/preguntas/kids/primera_pregunta.webp")}
                                    style={styles.ageGroupImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.ageGroupText}>{ageT.kids}</Text>
                                <Ionicons name="chevron-forward" size={24} color="#9E7676" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.ageGroupButton}
                                onPress={() => handleAgeGroupSelect('teen')}
                            >
                                <Image
                                    source={require("../../assets/images/preguntas/teen/primera_pregunta.webp")}
                                    style={styles.ageGroupImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.ageGroupText}>{ageT.teen}</Text>
                                <Ionicons name="chevron-forward" size={24} color="#9E7676" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.ageGroupButton}
                                onPress={() => handleAgeGroupSelect('university')}
                            >
                                <Image
                                    source={require("../../assets/images/preguntas/universitary/primera_pregunta.webp")}
                                    style={styles.ageGroupImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.ageGroupText}>{ageT.university}</Text>
                                <Ionicons name="chevron-forward" size={24} color="#9E7676" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

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
        width: "90%",
        maxWidth: 500,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    modalContent: {
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 24,
    },
    ageGroupContainer: {
        gap: 16,
    },
    ageGroupButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        gap: 16,
    },
    ageGroupImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    ageGroupText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
    },
    fullScreenContainer: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        backgroundColor: "white",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#4ade80",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
});
