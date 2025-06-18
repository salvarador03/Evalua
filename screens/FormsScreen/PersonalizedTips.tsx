import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView, // Main container scroll
    FlatList,   // Horizontal scroll for tips
    Animated,
    Image,
    useColorScheme,
    Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next'; // For day names
import { Language } from '../../types/language';
// feedbackTranslations might not be needed directly here anymore if titles are removed
// import { feedbackTranslations } from '../../translations/feedbackTranslations';

// --- Design Tokens ---
const SPACING = {
    small: 8,
    medium: 12, // Adjusted for potentially tighter layout
    large: 16, // Adjusted
};

const FONTS = {
    title: { fontSize: 17, fontWeight: '600' as '600' },
    message: { fontSize: 14, lineHeight: 20 },
    label: { fontSize: 13, fontWeight: '500' as '500' },
    emoji: { fontSize: 24 }, // For the badge
};

// Define colors for light and dark modes
const getColors = (isDarkMode: boolean) => ({
    background: isDarkMode ? '#121212' : '#F8F9FA', // Lighter background
    cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF', // White cards
    textPrimary: isDarkMode ? '#E1E1E1' : '#212529', // Darker primary text
    textSecondary: isDarkMode ? '#B0B0B0' : '#6C757D', // Softer secondary text
    border: isDarkMode ? '#333333' : '#DEE2E6', // Standard border
    // Domain-specific colors (using softer/pastel tones)
    domainPhysical: isDarkMode ? '#4CAF50' : '#A5D6A7', // Green
    domainMotivation: isDarkMode ? '#FFCA28' : '#FFF59D', // Yellow
    domainKnowledge: isDarkMode ? '#42A5F5' : '#90CAF9', // Blue
    domainSocial: isDarkMode ? '#AB47BC' : '#CE93D8', // Purple
    // Priority colors for weekly plan
    danger: '#FF6B6B',
    warning: '#FFB347',
    success: '#4CAF50',
    neutral: isDarkMode ? '#555555' : '#CED4DA',
});

// --- Helper Functions ---

const getDomainImage = (domain: string): any => {
    switch (domain) {
        case 'physical': return require('../../assets/images/tips/actividad_fisica.webp');
        case 'motivation': return require('../../assets/images/tips/motivacion.webp');
        case 'knowledge': return require('../../assets/images/tips/knowledge.webp');
        case 'social': return require('../../assets/images/tips/social.webp');
        default: return null;
    }
};

// Helper to get domain color token
const getDomainColor = (domainKey: string, COLORS: ReturnType<typeof getColors>): string => {
    switch (domainKey) {
        case 'physical': return COLORS.domainPhysical;
        case 'motivation': return COLORS.domainMotivation;
        case 'knowledge': return COLORS.domainKnowledge;
        case 'social': return COLORS.domainSocial;
        default: return COLORS.neutral;
    }
};

// --- Tip Interface ---
interface Tip {
    domain: string;
    title: string;
    message: string;
    emoji: string; // Emoji is now part of the tip data
}

interface PersonalizedTipsProps {
    language: Language;
    answers: (number | null)[]; // Keep answers for potential future use, but not used for tips now
}

// --- Tip Data Function ---
// Returns structured data including the emoji for each tip
const getDomainTipsData = (domain: string, language: Language): Omit<Tip, 'domain'>[] => {
    const tipsContent: Record<string, { title: string; message: string; emoji: string }[]> = {
        'physical': [
            { title: language === 'es' ? 'Actividad Diaria' : language === 'en' ? 'Daily Activity' : 'Atividade Diária', message: language === 'es' ? '¡Cada paso suma! Busca moverte más en tu rutina.' : language === 'en' ? 'Every step counts! Find ways to move more.' : 'Cada passo conta! Procure mover-se mais.', emoji: '🏃' },
            { title: language === 'es' ? 'Fortalece' : language === 'en' ? 'Strength' : 'Fortaleça', message: language === 'es' ? 'Ejercicios de fuerza un par de veces por semana.' : language === 'en' ? 'Strength exercises a couple of times a week.' : 'Exercícios de força algumas vezes por semana.', emoji: '💪' },
        ],
        'motivation': [
            { title: language === 'es' ? 'Tu Pasión' : language === 'en' ? 'Your Passion' : 'Sua Paixão', message: language === 'es' ? 'Explora actividades hasta hallar tu favorita.' : language === 'en' ? 'Explore activities until you find your favorite.' : 'Explore atividades até achar a sua favorita.', emoji: '💫' },
            { title: language === 'es' ? 'Pequeños Pasos' : language === 'en' ? 'Small Steps' : 'Pequenos Passos', message: language === 'es' ? 'Empieza con metas fáciles y celebra logros.' : language === 'en' ? 'Start with easy goals and celebrate wins.' : 'Comece com metas fáceis e celebre conquistas.', emoji: '🎯' },
        ],
        'knowledge': [
            { title: language === 'es' ? 'Conoce Tu Cuerpo' : language === 'en' ? 'Know Your Body' : 'Conheça Seu Corpo', message: language === 'es' ? 'Aprender cómo funciona te ayuda a cuidarlo.' : language === 'en' ? 'Learning how it works helps you care for it.' : 'Aprender como funciona ajuda a cuidar dele.', emoji: '🧠' },
            { title: language === 'es' ? 'Mente Activa' : language === 'en' ? 'Active Mind' : 'Mente Ativa', message: language === 'es' ? 'Investiga los beneficios del ejercicio físico.' : language === 'en' ? 'Research the benefits of physical exercise.' : 'Pesquise os benefícios do exercício físico.', emoji: '📚' },
        ],
        'social': [
            { title: language === 'es' ? 'Con Amigos' : language === 'en' ? 'With Friends' : 'Com Amigos', message: language === 'es' ? 'Hacer actividad en grupo es más divertido.' : language === 'en' ? 'Group activity is more fun.' : 'Atividade em grupo é mais divertido.', emoji: '🤝' },
            { title: language === 'es' ? 'Comparte Alegría' : language === 'en' ? 'Share Joy' : 'Compartilhe Alegria', message: language === 'es' ? 'Anima a otros y comparte tus logros.' : language === 'en' ? 'Encourage others and share your wins.' : 'Incentive outros e compartilhe suas vitórias.', emoji: '🌟' },
        ]
    };
    return tipsContent[domain] || [];
};

// --- Components ---

// Tip Card Component (Refactored for Animation, Emoji Badge, Domain Color)
const TipCard: React.FC<{
    tip: Tip;
    index: number; // For animation delay
    domainColor: string;
    COLORS: ReturnType<typeof getColors>;
}> = ({ tip, index, domainColor, COLORS }) => {
    const anim = useRef(new Animated.Value(0)).current; // Single value for opacity and scale

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay: index * 150, // Stagger animation
            useNativeDriver: true,
        }).start();
    }, [anim, index]);

    // Interpolate for scale and opacity
    const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1], // Scale from 90% to 100%
    });
    const opacity = anim; // Use anim directly for opacity

    const styles = createStyleSheet(COLORS);

    return (
        <Animated.View
            style={[
                styles.tipCard,
                {
                    opacity: opacity,
                    transform: [{ scale: scale }],
                    backgroundColor: COLORS.cardBackground, // Use card background
                    borderColor: COLORS.border,
                }
            ]}
            accessibilityLabel={`${tip.title}: ${tip.message}`}
        >
            <View style={styles.tipContent}>
                {/* Emoji Badge */}
                <View style={[styles.emojiContainer, { backgroundColor: domainColor + '30' }]}>
                     {/* Light background from domain color */}
                    <Text style={styles.emojiText}>{tip.emoji}</Text>
                </View>
                 {/* Text Content */}
                <View style={styles.textContent}>
                   <Text style={[styles.tipTitle, { color: COLORS.textPrimary }]}>{tip.title}</Text>
                    <Text style={[styles.tipMessage, { color: COLORS.textSecondary }]}>{tip.message}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

// Main Component (Refactored for Auto-Scroll)
export const PersonalizedTips: React.FC<PersonalizedTipsProps> = ({ language, answers }) => {
    const { t } = useTranslation();
    const isDarkMode = useColorScheme() === 'dark';
    const COLORS = getColors(isDarkMode);
    const styles = createStyleSheet(COLORS);

    const domains = [
        { key: 'physical', name: t('domains.physical', 'Physical') },
        { key: 'motivation', name: t('domains.motivation', 'Motivation') },
        { key: 'knowledge', name: t('domains.knowledge', 'Knowledge') },
        { key: 'social', name: t('domains.social', 'Social') }
    ];

    // --- Lógica para Auto-Scroll ---
    // 1. Refs para cada FlatList horizontal
    const flatListRefs = useRef<Record<string, FlatList<Tip> | null>>({});
    // 2. Estado para guardar el índice actual de cada FlatList
    const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});

    // Procesar datos una vez para tener acceso fácil
    const sections = domains.map(domain => {
        const tipsData = getDomainTipsData(domain.key, language);
        return {
            key: domain.key,
            name: domain.name,
            color: getDomainColor(domain.key, COLORS),
            image: getDomainImage(domain.key),
            tips: tipsData.map(tipContent => ({ ...tipContent, domain: domain.key }))
        };
    });

    // 3. Efecto para configurar y limpiar los temporizadores
    useEffect(() => {
        const intervals: Record<string, NodeJS.Timeout> = {};

        sections.forEach(({ key, tips }) => {
            if (tips.length <= 1) return; // No auto-scroll si hay 1 o 0 tips

            // Inicializar estado si no existe para esta key
            if (currentIndexes[key] === undefined) {
                 setCurrentIndexes(prev => ({ ...prev, [key]: 0 }));
            }

            // 4. Crear el intervalo
            intervals[key] = setInterval(() => {
                // Acceder al estado MÁS RECIENTE usando el callback en setState
                setCurrentIndexes(prevIndexes => {
                    const currentDomainIndex = prevIndexes[key] ?? 0;
                    const nextIndex = (currentDomainIndex + 1) % tips.length; // Calcular siguiente índice (con loop)

                    // 5. Usar la ref para desplazar el FlatList correcto
                    flatListRefs.current[key]?.scrollToIndex({
                        index: nextIndex,
                        animated: true,
                        viewPosition: 0.5, // Intentar centrar el elemento
                    });

                    // Devolver el nuevo estado actualizado SOLO para esta key
                    return { ...prevIndexes, [key]: nextIndex };
                });
            }, 7000); // <-- Aumentado a 7 segundos
        });

        // 6. Limpieza: detener todos los intervalos al desmontar
        return () => {
            Object.values(intervals).forEach(clearInterval);
        };
    // Dependencias: Ejecutar cuando cambien las secciones (si los tips pueden cambiar dinámicamente)
    // Usar [] si los tips son siempre los mismos una vez cargado el componente.
    }, [sections]); // Depender de 'sections' asegura que se reinicien si los datos cambian

    const renderTip = ({ item, index }: { item: Tip, index: number }, domainColor: string) => (
        <TipCard tip={item} index={index} domainColor={domainColor} COLORS={COLORS} />
    );

    // Internationalized day keys
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: COLORS.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {sections.map((section) => (
                <View key={section.key} style={styles.domainSection}>
                    {/* Domain Header with Image */}
                     <View style={styles.domainHeader}>
                        <Image source={section.image} style={styles.domainImage} />
                        {/* Optional: Add domain title text overlay or below image if desired */}
                        {/* <Text style={[styles.domainTitle, { color: section.color }]}>{section.name}</Text> */}
                     </View>

                    {/* Horizontal FlatList for Tips */}
                    <FlatList
                        // 1. Asignar la ref dinámicamente
                        ref={el => flatListRefs.current[section.key] = el}
                        horizontal
                        data={section.tips}
                        renderItem={({ item, index }) => renderTip({ item, index }, section.color)}
                        keyExtractor={(item, index) => `${section.key}-tip-${index}`}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                        // Importante: Deshabilitar scroll manual si no quieres que interfiera
                        // scrollEnabled={false} // Descomenta si quieres bloquear el swipe manual
                        // Otras props útiles para carruseles:
                        pagingEnabled // Para que se detenga "clavado" en cada tarjeta
                        decelerationRate="fast"
                    />
                </View>
            ))}

            {/* --- Weekly Plan (Internationalized and Styled) --- */}
            <View style={[styles.weeklyPlanSection, { backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }]}>
                <Text style={[styles.weeklyPlanTitle, { color: COLORS.textPrimary }]}>
                    {t('weeklyPlan.title', '📅 Suggested Weekly Plan')}
                </Text>
                <View style={[styles.weeklyPlanGrid, { backgroundColor: COLORS.background }]}>
                    {dayKeys.map((dayKey, index) => {
                        const indicatorColor = index % 3 === 0 ? COLORS.danger : index % 3 === 1 ? COLORS.warning : COLORS.success;
                        return (
                            <View key={dayKey} style={styles.dayBox}>
                                <Text style={[styles.dayText, { color: COLORS.textSecondary }]}>
                                    {t(`weekdays.${dayKey}`, dayKey.toUpperCase())}
                                </Text>
                                <View style={[styles.activityIndicator, { backgroundColor: indicatorColor, borderColor: COLORS.border }]} />
                            </View>
                        );
                    })}
                </View>
                <Text style={[styles.weeklyPlanNote, { color: COLORS.textSecondary }]}>
                    {t('weeklyPlan.note', 'Alternate intense (🔴), moderate (🟡), and light (🟢) activity.')}
                </Text>
            </View>
        </ScrollView>
    );
};

// --- Dynamic Stylesheet ---
const screenWidth = Dimensions.get('window').width;
// Adjust card width calculation if needed based on screen size/padding
const tipCardWidth = screenWidth - SPACING.medium * 4; // Example: leave some padding on sides

const createStyleSheet = (COLORS: ReturnType<typeof getColors>) => StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: SPACING.large,
    },
    domainSection: {
        marginBottom: SPACING.large + SPACING.small, // More space between sections
    },
     domainHeader: {
         marginBottom: SPACING.medium,
         paddingHorizontal: SPACING.medium,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1,
         shadowRadius: 4,
         elevation: 3,
     },
    domainImage: {
        width: '100%',
        height: 160,
        resizeMode: 'cover',
        borderRadius: 16,
    },
    // Optional: Style for a domain title text if you add one
    // domainTitle: { ...FONTS.title, textAlign: 'center', marginBottom: SPACING.small },
    flatListContent: {
        paddingHorizontal: SPACING.medium, // Espacio a los lados del FlatList
        gap: SPACING.medium, // Espacio entre tarjetas
    },
    tipCard: {
        width: tipCardWidth,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 2,
        overflow: 'visible',
    },
    tipContent: {
        flexDirection: 'row', // Emoji badge and text side-by-side
        padding: SPACING.medium,
        alignItems: 'center', // Align items vertically
    },
    emojiContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.medium,
        // backgroundColor applied dynamically (semi-transparent domain color)
        shadowColor: '#000', // Optional subtle shadow for badge
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    emojiText: {
        ...FONTS.emoji, // Use emoji font style
    },
     textContent: {
         flex: 1, // Take remaining space
     },
    tipTitle: {
        ...FONTS.title,
        marginBottom: SPACING.small / 2, // Tighter spacing
        // color applied dynamically
    },
    tipMessage: {
        ...FONTS.message,
        // color applied dynamically
    },
    weeklyPlanSection: {
        marginTop: SPACING.large,
        marginHorizontal: SPACING.medium,
        padding: SPACING.medium,
        borderRadius: 12,
        borderWidth: 1,
    },
    weeklyPlanTitle: {
        ...FONTS.title,
        fontSize: 18, // Slightly smaller title
        marginBottom: SPACING.medium,
        textAlign: 'center',
    },
    weeklyPlanGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.medium,
        borderRadius: 8,
        paddingVertical: SPACING.small,
        paddingHorizontal: SPACING.small,
    },
    dayBox: {
        alignItems: 'center',
        paddingHorizontal: SPACING.small / 2, // Ensure days don't touch
    },
    dayText: {
        ...FONTS.label,
        fontSize: 12, // Smaller day text
        marginBottom: SPACING.small,
    },
    activityIndicator: {
        width: 18, // Smaller indicator
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
    },
    weeklyPlanNote: {
        ...FONTS.label,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: SPACING.small,
    },
}); 