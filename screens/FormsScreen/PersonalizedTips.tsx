import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Animated,
    Image,
    useColorScheme,
    Dimensions,
    Linking,
    TouchableOpacity
} from 'react-native';
// Ya no se necesita useTranslation de react-i18next
import { Language } from '../../types/language';

// --- Contenido de traducción local (NUEVO) ---
const localTranslations = {
    es: {
        domains: {
            physical: "Físico",
            motivation: "Motivación",
            knowledge: "Conocimiento",
            social: "Social"
        },
        weeklyPlan: {
            title: "📅 Plan Semanal Sugerido",
            note: "Alterna actividad intensa (🔴), moderada (🟡) y ligera (🟢)."
        },
        weekdays: {
            mon: "Lunes",
            tue: "Martes",
            wed: "Miércoles",
            thu: "Jueves",
            fri: "Viernes",
            sat: "Sábado",
            sun: "Domingo"
        },
        plan: {
            activity1: "30 min de cardio moderado",
            activity2: "20 min de fuerza",
            activity3: "Paseo relajante",
            activity4: "30 min de cardio vigoroso",
            activity5: "Yoga o estiramientos",
            activity6: "45 min de cardio moderado",
            activity7: "Descanso activo"
        }
    },
    en: {
        domains: {
            physical: "Physical",
            motivation: "Motivation",
            knowledge: "Knowledge",
            social: "Social"
        },
        weeklyPlan: {
            title: "📅 Suggested Weekly Plan",
            note: "Alternate intense (🔴), moderate (🟡), and light (🟢) activity."
        },
        weekdays: {
            mon: "Monday",
            tue: "Tuesday",
            wed: "Wednesday",
            thu: "Thursday",
            fri: "Friday",
            sat: "Saturday",
            sun: "Sunday"
        },
        plan: {
            activity1: "30 min of moderate cardio",
            activity2: "20 min of strength training",
            activity3: "Relaxing walk",
            activity4: "30 min of vigorous cardio",
            activity5: "Yoga or stretching",
            activity6: "45 min of moderate cardio",
            activity7: "Active rest"
        }
    },
    "pt-PT": {
        domains: {
            physical: "Físico",
            motivation: "Motivação",
            knowledge: "Conhecimento",
            social: "Social"
        },
        weeklyPlan: {
            title: "📅 Plano Semanal Sugerido",
            note: "Alterne atividade intensa (🔴), moderada (🟡) e leve (🟢)."
        },
        weekdays: {
            mon: "Segunda-feira",
            tue: "Terça-feira",
            wed: "Quarta-feira",
            thu: "Quinta-feira",
            fri: "Sexta-feira",
            sat: "Sábado",
            sun: "Domingo"
        },
        plan: {
            activity1: "30 min de cardio moderado",
            activity2: "20 min de treino de força",
            activity3: "Caminhada relaxante",
            activity4: "30 min de cardio vigoroso",
            activity5: "Ioga ou alongamentos",
            activity6: "45 min de cardio moderado",
            activity7: "Descanso ativo"
        }
    },
    "pt-BR": {
        domains: {
            physical: "Físico",
            motivation: "Motivação",
            knowledge: "Conhecimento",
            social: "Social"
        },
        weeklyPlan: {
            title: "📅 Plano Semanal Sugerido",
            note: "Alterne atividade intensa (🔴), moderada (🟡) e leve (🟢)."
        },
        weekdays: {
            mon: "Segunda-feira",
            tue: "Terça-feira",
            wed: "Quarta-feira",
            thu: "Quinta-feira",
            fri: "Sexta-feira",
            sat: "Sábado",
            sun: "Domingo"
        },
        plan: {
            activity1: "30 min de cardio moderado",
            activity2: "20 min de treino de força",
            activity3: "Caminhada relaxante",
            activity4: "30 min de cardio vigoroso",
            activity5: "Ioga ou alongamentos",
            activity6: "45 min de cardio moderado",
            activity7: "Descanso ativo"
        }
    }
} as const; // Added 'as const' to ensure deep type inference

// Define types based on the 'localTranslations' object
type LocalTranslations = typeof localTranslations;
type LocalLanguage = keyof LocalTranslations;
type TranslationKeys = keyof LocalTranslations['es'];

// Corrected type-safe `t` function
const getTranslation = (lang: Language, key: string): string => {
    // Safely get the translation object for the current language
    const safeLang = (Object.keys(localTranslations) as LocalLanguage[]).includes(lang as LocalLanguage) ? lang as LocalLanguage : 'es';
    
    // Use a type-safe object to start the lookup
    let currentTranslationObject: any = localTranslations[safeLang];
    
    const keys = key.split('.');
    for (const k of keys) {
        if (typeof currentTranslationObject === 'object' && currentTranslationObject !== null && k in currentTranslationObject) {
            currentTranslationObject = currentTranslationObject[k];
        } else {
            return key; // Return the key if the translation is missing.
        }
    }
    // Final check to ensure we return a string
    return typeof currentTranslationObject === 'string' ? currentTranslationObject : key;
};

// --- Design Tokens ---
const SPACING = {
    small: 8,
    medium: 12,
    large: 16,
};

const FONTS = {
    title: { fontSize: 17, fontWeight: '600' as '600' },
    message: { fontSize: 14, lineHeight: 20 },
    label: { fontSize: 13, fontWeight: '500' as '500' },
    emoji: { fontSize: 24 },
};

// Define colors for light and dark modes
const getColors = (isDarkMode: boolean) => ({
    background: isDarkMode ? '#121212' : '#F8F9FA',
    cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDarkMode ? '#E1E1E1' : '#212529',
    textSecondary: isDarkMode ? '#B0B0B0' : '#6C757D',
    border: isDarkMode ? '#333333' : '#DEE2E6',
    domainPhysical: isDarkMode ? '#4CAF50' : '#A5D6A7',
    domainMotivation: isDarkMode ? '#FFCA28' : '#FFF59D',
    domainKnowledge: isDarkMode ? '#42A5F5' : '#90CAF9',
    domainSocial: isDarkMode ? '#AB47BC' : '#CE93D8',
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

const getDomainColor = (domainKey: string, COLORS: ReturnType<typeof getColors>): string => {
    switch (domainKey) {
        case 'physical': return COLORS.domainPhysical;
        case 'motivation': return COLORS.domainMotivation;
        case 'knowledge': return COLORS.domainKnowledge;
        case 'social': return COLORS.domainSocial;
        default: return COLORS.neutral;
    }
};

// Get flag source
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

// --- Tip Interface ---
interface Tip {
    domain: string;
    title: string;
    message: string;
    emoji: string;
    reference: string;
}

interface PersonalizedTipsProps {
    language: Language;
    answers: (number | null)[];
}

// --- Tip Data Function (MODIFIED) ---
const getDomainTipsData = (domain: string, language: Language): Omit<Tip, 'domain'>[] => {
    const tipsContent: Record<string, { title: string; message: string; emoji: string; reference: string }[]> = {
        'physical': [
            {
                title: language === 'es' ? 'Actividad Diaria' : language === 'en' ? 'Daily Activity' : 'Atividade Diária',
                message: language === 'es' ? 'La OMS recomienda 150-300 minutos de actividad moderada a la semana para beneficios de salud.' : language === 'en' ? 'WHO recommends 150-300 minutes of moderate activity per week for health benefits.' : 'A OMS recomenda 150-300 minutos de atividade moderada por semana para benefícios de saúde.',
                emoji: '🏃',
                reference: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'
            },
            {
                title: language === 'es' ? 'Fortalece' : language === 'en' ? 'Strength' : 'Fortaleça',
                message: language === 'es' ? 'La investigación apoya el ejercicio de fuerza 2+ días/semana para la masa muscular y densidad ósea.' : language === 'en' ? 'Research supports strength training 2+ days/week for muscle mass and bone density.' : 'Pesquisas apoiam o treino de força 2+ dias/semana para massa muscular e densidade óssea.',
                emoji: '💪',
                reference: 'https://www.cdc.gov/physicalactivity/basics/adults/index.htm'
            },
        ],
        'motivation': [
            {
                title: language === 'es' ? 'Tu Pasión' : language === 'en' ? 'Your Passion' : 'Sua Paixão',
                message: language === 'es' ? 'Encontrar una actividad que disfrutes aumenta la adherencia y la motivación intrínseca a largo plazo.' : language === 'en' ? 'Finding an enjoyable activity increases long-term adherence and intrinsic motivation.' : 'Encontrar uma atividade que você goste aumenta a aderência e a motivação intrínseca a longo prazo.',
                emoji: '💫',
                reference: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6001292/'
            },
            {
                title: language === 'es' ? 'Pequeños Pasos' : language === 'en' ? 'Small Steps' : 'Pequenos Passos',
                message: language === 'es' ? 'Establecer metas pequeñas y alcanzables (teoría del establecimiento de metas) mejora el éxito y la autoeficacia.' : language === 'en' ? 'Setting small, achievable goals (goal-setting theory) improves success and self-efficacy.' : 'Estabelecer pequenas metas alcançáveis (teoria da definição de metas) melhora o sucesso e a autoeficácia.',
                emoji: '🎯',
                reference: 'https://psycnet.apa.org/record/1990-11234-001'
            },
        ],
        'knowledge': [
            {
                title: language === 'es' ? 'Conoce Tu Cuerpo' : language === 'en' ? 'Know Your Body' : 'Conheça Seu Corpo',
                message: language === 'es' ? 'La alfabetización en salud, incluyendo el conocimiento del cuerpo, es clave para tomar decisiones informadas sobre el bienestar.' : language === 'en' ? 'Health literacy, including body knowledge, is key to making informed wellness decisions.' : 'A literacia em saúde, incluindo o conhecimento do corpo, é fundamental para tomar decisões informadas sobre o bem-estar.',
                emoji: '🧠',
                reference: 'https://www.cdc.gov/healthliteracy/index.html'
            },
            {
                title: language === 'es' ? 'Mente Activa' : language === 'en' ? 'Active Mind' : 'Mente Ativa',
                message: language === 'es' ? 'La investigación muestra que aprender sobre los beneficios del ejercicio físico mejora la disposición a participar en él.' : language === 'en' ? 'Research shows that learning about exercise benefits improves readiness to engage in it.' : 'Pesquisas mostram que aprender sobre os benefícios do exercício melhora a disposição para praticá-lo.',
                emoji: '📚',
                reference: 'https://pubmed.ncbi.nlm.nih.gov/22197669/'
            },
        ],
        'social': [
            {
                title: language === 'es' ? 'Con Amigos' : language === 'en' ? 'With Friends' : 'Com Amigos',
                message: language === 'es' ? 'El apoyo social y la actividad física en grupo están correlacionados con una mayor adherencia a largo plazo.' : language === 'en' ? 'Social support and group physical activity are correlated with higher long-term adherence.' : 'O apoio social e a atividade física em grupo estão correlacionados com maior adesão a longo prazo.',
                emoji: '🤝',
                reference: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7323577/'
            },
            {
                title: language === 'es' ? 'Comparte Alegría' : language === 'en' ? 'Share Joy' : 'Compartilhe Alegria',
                message: language === 'es' ? 'Compartir logros puede fortalecer la autoeficacia y fomentar una red de apoyo mutuo para el bienestar.' : language === 'en' ? 'Sharing accomplishments can strengthen self-efficacy and foster a mutual support network for wellness.' : 'Compartilhar conquistas pode fortalecer a autoeficácia e fomentar uma rede de apoio mútuo para o bem-estar.',
                emoji: '🌟',
                reference: 'https://www.ncbi.nlm.nih.gov/books/NBK538189/'
            },
        ]
    };
    return tipsContent[domain] || [];
};

// --- Components ---
const TipCard: React.FC<{
    tip: Tip;
    index: number;
    domainColor: string;
    COLORS: ReturnType<typeof getColors>;
}> = ({ tip, index, domainColor, COLORS }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay: index * 150,
            useNativeDriver: true,
        }).start();
    }, [anim, index]);

    const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
    });
    const opacity = anim;

    const styles = createStyleSheet(COLORS);

    const handleLinkPress = () => {
        Linking.openURL(tip.reference).catch(err => console.error("Failed to open URL:", err));
    };

    return (
        <Animated.View
            style={[
                styles.tipCard,
                {
                    opacity: opacity,
                    transform: [{ scale: scale }],
                    backgroundColor: COLORS.cardBackground,
                    borderColor: COLORS.border,
                }
            ]}
            accessibilityLabel={`${tip.title}: ${tip.message}`}
        >
            <View style={styles.tipContent}>
                <View style={[styles.emojiContainer, { backgroundColor: domainColor + '30' }]}>
                    <Text style={styles.emojiText}>{tip.emoji}</Text>
                </View>
                <View style={styles.textContent}>
                    <Text style={[styles.tipTitle, { color: COLORS.textPrimary }]}>{tip.title}</Text>
                    <Text style={[styles.tipMessage, { color: COLORS.textSecondary }]}>{tip.message}</Text>
                    {tip.reference && (
                        <TouchableOpacity onPress={handleLinkPress} style={styles.referenceContainer}>
                            <Text style={[styles.referenceText, { color: COLORS.textSecondary }]}>
                                {tip.reference}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

// --- Main Component (MODIFIED) ---
export const PersonalizedTips: React.FC<PersonalizedTipsProps> = ({ language: initialLanguage, answers }) => {
    const [language, setLanguage] = useState<Language>(initialLanguage);
    
    // Updated type-safe 't' function
    const t = (key: string) => getTranslation(language, key);
    
    const isDarkMode = useColorScheme() === 'dark';
    const COLORS = getColors(isDarkMode);
    const styles = createStyleSheet(COLORS);

    const domains = [
        { key: 'physical', name: t('domains.physical') },
        { key: 'motivation', name: t('domains.motivation') },
        { key: 'knowledge', name: t('domains.knowledge') },
        { key: 'social', name: t('domains.social') }
    ];

    const flatListRefs = useRef<Record<string, FlatList<Tip> | null>>({});
    const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});

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

    useEffect(() => {
        const intervals: Record<string, NodeJS.Timeout> = {};
        sections.forEach(({ key, tips }) => {
            if (tips.length <= 1) return;
            if (currentIndexes[key] === undefined) {
                 setCurrentIndexes(prev => ({ ...prev, [key]: 0 }));
            }
            intervals[key] = setInterval(() => {
                setCurrentIndexes(prevIndexes => {
                    const currentDomainIndex = prevIndexes[key] ?? 0;
                    const nextIndex = (currentDomainIndex + 1) % tips.length;
                    flatListRefs.current[key]?.scrollToIndex({
                        index: nextIndex,
                        animated: true,
                        viewPosition: 0.5,
                    });
                    return { ...prevIndexes, [key]: nextIndex };
                });
            }, 7000);
        });
        return () => {
            Object.values(intervals).forEach(clearInterval);
        };
    }, [sections, language]);

    const renderTip = ({ item, index }: { item: Tip, index: number }, domainColor: string) => (
        <TipCard tip={item} index={index} domainColor={domainColor} COLORS={COLORS} />
    );

    // Internationalized day keys
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    // Updated and more dynamic weekly plan data
    const weeklyPlanData = [
        { dayKey: 'mon', activity: t('plan.activity1'), color: COLORS.warning },
        { dayKey: 'tue', activity: t('plan.activity2'), color: COLORS.danger },
        { dayKey: 'wed', activity: t('plan.activity3'), color: COLORS.success },
        { dayKey: 'thu', activity: t('plan.activity4'), color: COLORS.danger },
        { dayKey: 'fri', activity: t('plan.activity5'), color: COLORS.success },
        { dayKey: 'sat', activity: t('plan.activity6'), color: COLORS.warning },
        { dayKey: 'sun', activity: t('plan.activity7'), color: COLORS.success },
    ];

    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: COLORS.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Language Selector in Header */}
            <View style={styles.languageSelectorContainer}>
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

            {sections.map((section) => (
                <View key={section.key} style={styles.domainSection}>
                    <View style={styles.domainHeader}>
                        <Image source={section.image} style={styles.domainImage} />
                    </View>
                    <FlatList
                        ref={el => flatListRefs.current[section.key] = el}
                        horizontal
                        data={section.tips}
                        renderItem={({ item, index }) => renderTip({ item, index }, section.color)}
                        keyExtractor={(item, index) => `${section.key}-tip-${index}`}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                        pagingEnabled
                        decelerationRate="fast"
                    />
                </View>
            ))}

            {/* --- Weekly Plan (MODIFIED) --- */}
            <View style={[styles.weeklyPlanSection, { backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }]}>
                <Text style={[styles.weeklyPlanTitle, { color: COLORS.textPrimary }]}>
                    {t('weeklyPlan.title')}
                </Text>
                <View style={styles.weeklyPlanList}>
                    {weeklyPlanData.map((dayPlan) => {
                        return (
                            <View key={dayPlan.dayKey} style={styles.dayActivityRow}>
                                <View style={[styles.activityIndicator, { backgroundColor: dayPlan.color, borderColor: COLORS.border }]} />
                                <Text style={[styles.dayActivityText, { color: COLORS.textSecondary }]}>
                                    <Text style={styles.dayNameText}>
                                        {t(`weekdays.${dayPlan.dayKey}`)}:{" "}
                                    </Text>
                                    {dayPlan.activity}
                                </Text>
                            </View>
                        );
                    })}
                </View>
                <Text style={[styles.weeklyPlanNote, { color: COLORS.textSecondary }]}>
                    {t('weeklyPlan.note')}
                </Text>
            </View>
        </ScrollView>
    );
};

// --- Dynamic Stylesheet (MODIFIED) ---
const screenWidth = Dimensions.get('window').width;
const tipCardWidth = screenWidth - SPACING.medium * 4;

const createStyleSheet = (COLORS: ReturnType<typeof getColors>) => StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: SPACING.large,
    },
    languageSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.medium,
        marginBottom: SPACING.medium,
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
    domainSection: {
        marginBottom: SPACING.large + SPACING.small,
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
    flatListContent: {
        paddingHorizontal: SPACING.medium,
        gap: SPACING.medium,
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
        flexDirection: 'row',
        padding: SPACING.medium,
        alignItems: 'center',
    },
    emojiContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.medium,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    emojiText: {
        ...FONTS.emoji,
    },
    textContent: {
        flex: 1,
    },
    tipTitle: {
        ...FONTS.title,
        marginBottom: SPACING.small / 2,
    },
    tipMessage: {
        ...FONTS.message,
    },
    referenceContainer: {
        marginTop: SPACING.small,
    },
    referenceText: {
        ...FONTS.label,
        fontSize: 10,
        textDecorationLine: 'underline',
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
        fontSize: 18,
        marginBottom: SPACING.medium,
        textAlign: 'center',
    },
    weeklyPlanList: {
        gap: SPACING.small,
    },
    dayActivityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.small,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    activityIndicator: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        marginRight: SPACING.small,
    },
    dayActivityText: {
        ...FONTS.message,
        flex: 1,
    },
    dayNameText: {
        fontWeight: 'bold',
    },
    weeklyPlanNote: {
        ...FONTS.label,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: SPACING.medium,
    },
});