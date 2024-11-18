import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
  RefreshControl,
  StyleSheet
} from "react-native";
import { BackgroundContainer } from "../../Components/BackgroundContainer/BackgroundContainer";
import { Ionicons } from "@expo/vector-icons";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, FormsStackParamList } from "../../navigation/types";
import auth from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";
import type { FormResponse } from "../../types/form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { Language } from "../../types/language";

// Interfaces
interface Creator {
  name: string;
  role: string;
  institution: string;
  department: string;
  imageUrl: string;
  socialLinks?: {
    linkedin?: string;
    researchGate?: string;
    email?: string;
  };
}

interface Institution {
  name: string;
  description: string;
  country: string;
  logo: any;
  website?: string;
  stats?: {
    founded: string;
    students?: number;
    ranking?: string;
  };
}

interface Publication {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
}

// Data
const CREATORS: Creator[] = [
  {
    name: "Dr. María García",
    role: "Investigadora Principal",
    institution: "Universidad de Extremadura",
    department: "Facultad de Ciencias del Deporte",
    imageUrl: "/api/placeholder/100/100",
    socialLinks: {
      linkedin: "https://linkedin.com/in/maria-garcia",
      researchGate: "https://researchgate.net/profile/Maria-Garcia",
      email: "maria.garcia@unex.es",
    },
  },
  {
    name: "Dr. João Silva",
    role: "Co-Investigador",
    institution: "Universidade de Lisboa",
    department: "Faculdade de Motricidade Humana",
    imageUrl: "/api/placeholder/100/100",
    socialLinks: {
      linkedin: "https://linkedin.com/in/joao-silva",
      researchGate: "https://researchgate.net/profile/Joao-Silva",
      email: "j.silva@ulisboa.pt",
    },
  },
  {
    name: "Dra. Ana Santos",
    role: "Investigadora Asociada",
    institution: "Universidade de Lisboa",
    department: "Laboratory of Motor Behavior",
    imageUrl: "/api/placeholder/100/100",
    socialLinks: {
      linkedin: "https://linkedin.com/in/ana-santos",
      researchGate: "https://researchgate.net/profile/Ana-Santos",
      email: "a.santos@ulisboa.pt",
    },
  },
];

const INSTITUTIONS: Institution[] = [
  {
    name: "Universidad de Extremadura",
    description:
      "Centro de investigación deportiva líder en España, especializado en desarrollo motor y actividad física juvenil. Pioneros en metodologías de evaluación física y programas de intervención temprana.",
    country: "España",
    logo: require("../../assets/images/logo-uex.png"),
    website: "https://www.unex.es",
    stats: {
      founded: "1973",
      students: 24000,
      ranking: "Top 5 en España en Ciencias del Deporte",
    },
  },
  {
    name: "Universidade de Lisboa",
    description:
      "Referente internacional en investigación del movimiento humano y desarrollo motor. Sede de importantes estudios sobre alfabetización física y desarrollo motor en jóvenes.",
    country: "Portugal",
    logo: require("../../assets/images/ulisboa.png"),
    website: "https://www.ulisboa.pt",
    stats: {
      founded: "1911",
      students: 50000,
      ranking: "Top 3 en Portugal",
    },
  },
];

const PUBLICATIONS: Publication[] = [
  {
    title:
      "Nuevas Perspectivas en la Evaluación de la Alfabetización Física en Jóvenes",
    authors: "García, M., Silva, J., Santos, A.",
    journal: "Revista Internacional de Ciencias del Deporte",
    year: 2023,
    doi: "10.1000/j.rid.2023.001",
  },
  {
    title: "Herramientas Digitales para la Evaluación del Desarrollo Motor",
    authors: "Silva, J., Santos, A., García, M.",
    journal: "Physical Education and Technology",
    year: 2023,
    doi: "10.1000/j.pet.2023.002",
  },
];

type FormsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Forms">,
  NativeStackNavigationProp<FormsStackParamList>
>;

export const FormsListScreen: React.FC = () => {
  const navigation = useNavigation<FormsScreenNavigationProp>();
  const { user } = useAuth();
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "about">("form");

  useEffect(() => {
    loadFormResponse();
  }, [user]);

  const generateAndSaveGuestId = async () => {
    const guestId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    await AsyncStorage.setItem("@guest_user_id", guestId);
    return guestId;
  };

  const loadFormResponse = async () => {
    try {
      setError(null);
      let userId = user?.uid;

      if (!userId) {
        const storedGuestId = await AsyncStorage.getItem("@guest_user_id");
        userId = storedGuestId || (await generateAndSaveGuestId());
      }

      const snapshot = await db()
        .ref(`/form_responses/${userId}/physical_literacy`)
        .once("value");

      setFormResponse(snapshot.val() || null);
    } catch (error) {
      console.error("Error in loadFormResponse:", error);
      setError(
        error instanceof Error ? error.message : "Error al cargar el formulario"
      );
      if (!refreshing) {
        Alert.alert(
          "Error",
          "No se pudo cargar el formulario. Por favor, intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = () => {
    if (formResponse) {
      try {
        const validLanguage = (formResponse.language || "es") as Language;
        const studentData = {
          name: user?.name || "Usuario",
          email: user?.email || "",
          uid: user?.uid || "",
        };

        navigation.navigate("PhysicalLiteracyResults", {
          formResponse,
          language: validLanguage,
          answers: formResponse.answers,
          studentData,
          isTeacherView: false,
          stats: [],
        });
      } catch (error) {
        console.error("[FormsListScreen] Error navigating to results:", error);
        Alert.alert("Error", "No se pudieron cargar los resultados.");
      }
    }
  };

  const handleStartForm = async () => {
    try {
      let userId = auth().currentUser?.uid;
      if (!userId) {
        const storedGuestId = await AsyncStorage.getItem("@guest_user_id");
        userId = storedGuestId || (await generateAndSaveGuestId());
      }
      if (userId) {
        navigation.navigate("PhysicalLiteracyForm");
      } else {
        throw new Error("No se pudo obtener o generar ID de usuario");
      }
    } catch (error) {
      console.error("Error starting form:", error);
      Alert.alert("Error", "No se pudo iniciar el formulario.");
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "No se puede abrir este enlace");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el enlace");
    }
  };

  // Render Methods
  const renderAboutContent = () => (
    <>
      {renderInstitutions()}
      {renderCreators()}
      {renderPublications()}
    </>
  );

  const renderPublications = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Publicaciones Relacionadas</Text>
      {PUBLICATIONS.map((pub, index) => (
        <TouchableOpacity
          key={index}
          style={styles.publicationCard}
          onPress={() =>
            pub.doi && handleOpenLink(`https://doi.org/${pub.doi}`)
          }
        >
          <Text style={styles.publicationTitle}>{pub.title}</Text>
          <Text style={styles.publicationAuthors}>{pub.authors}</Text>
          <Text style={styles.publicationMeta}>
            {pub.journal} ({pub.year})
          </Text>
          {pub.doi && <Text style={styles.publicationDOI}>DOI: {pub.doi}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInstitutions = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Instituciones Participantes</Text>
      {INSTITUTIONS.map((institution, index) => (
        <View key={index} style={styles.institutionCard}>
          <TouchableOpacity
            onPress={() =>
              institution.website && handleOpenLink(institution.website)
            }
          >
            <Image
              source={institution.logo}
              style={styles.institutionLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.institutionInfo}>
            <Text style={styles.institutionName}>{institution.name}</Text>
            <Text style={styles.institutionCountry}>{institution.country}</Text>
            <Text style={styles.institutionDescription}>
              {institution.description}
            </Text>
            {institution.stats && (
              <View style={styles.institutionStats}>
                <Text style={styles.institutionStatItem}>
                  Fundada en {institution.stats.founded}
                </Text>
                {institution.stats.students && (
                  <Text style={styles.institutionStatItem}>
                    {institution.stats.students.toLocaleString()} estudiantes
                  </Text>
                )}
                {institution.stats.ranking && (
                  <Text style={styles.institutionStatItem}>
                    {institution.stats.ranking}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCreators = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Equipo de Investigación</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.creatorsScroll}
      >
        {CREATORS.map((creator, index) => (
          <View key={index} style={styles.creatorCard}>
            <Image
              source={{ uri: creator.imageUrl }}
              style={styles.creatorImage}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{creator.name}</Text>
              <Text style={styles.creatorRole}>{creator.role}</Text>
              <Text style={styles.creatorInstitution}>
                {creator.institution}
              </Text>
              <Text style={styles.creatorDepartment}>{creator.department}</Text>
              {creator.socialLinks && (
                <View style={styles.socialLinks}>
                  {creator.socialLinks.linkedin && (
                    <TouchableOpacity
                      onPress={() =>
                        handleOpenLink(creator.socialLinks!.linkedin!)
                      }
                      style={styles.socialButton}
                    >
                      <Ionicons
                        name="logo-linkedin"
                        size={20}
                        color="#0077B5"
                      />
                    </TouchableOpacity>
                  )}
                  {creator.socialLinks.researchGate && (
                    <TouchableOpacity
                      onPress={() =>
                        handleOpenLink(creator.socialLinks!.researchGate!)
                      }
                      style={styles.socialButton}
                    >
                      <Ionicons name="book" size={20} color="#00CCBB" />
                    </TouchableOpacity>
                  )}
                  {creator.socialLinks.email && (
                    <TouchableOpacity
                      onPress={() =>
                        handleOpenLink(`mailto:${creator.socialLinks!.email}`)
                      }
                      style={styles.socialButton}
                    >
                      <Ionicons name="mail" size={20} color="#9E7676" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderFormCard = () => (
    <View style={styles.card}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9E7676" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadFormResponse()}
          >
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : formResponse ? (
        <>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#9E7676" />
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>
                Cuestionario de Autoevaluación de la Alfabetización Física
              </Text>
              <View style={styles.ageRangeContainer}>
                <Ionicons name="people-outline" size={16} color="#9E7676" />
                <Text style={styles.ageRangeText}>
                  {user?.age && user.age >= 6 && user.age <= 12
                    ? "Franja de edad: 6-12 años"
                    : user?.age && user.age > 12 && user.age <= 18
                    ? "Franja de edad: 12-18 años"
                    : "Edades: 6-18 años"}
                </Text>
              </View>
            </View>
          </View>
          <Image
            source={require("../../assets/images/foto_primer_form.jpg")}
            style={styles.questionnaire}
            resizeMode="contain"
          />
          <Text style={styles.cardDescription}>
            Has completado este cuestionario el{" "}
            {new Date(formResponse.completedAt).toLocaleDateString()}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>Respuestas guardadas</Text>
            <TouchableOpacity
              onPress={handleViewResults}
              style={styles.viewResultsButton}
            >
              <Text style={styles.viewResultsText}>Ver resultados</Text>
              <Ionicons name="arrow-forward" size={20} color="#9E7676" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={24} color="#9E7676" />
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>
                Cuestionario de Autoevaluación de la Alfabetización Física
              </Text>
              <View style={styles.ageRangeContainer}>
                <Ionicons name="people-outline" size={16} color="#9E7676" />
                <Text style={styles.ageRangeText}>
                  {user?.age && user.age >= 6 && user.age <= 12
                    ? "Franja de edad: 6-12 años"
                    : user?.age && user.age > 12 && user.age <= 18
                    ? "Franja de edad: 12-18 años"
                    : "Edades: 6-18 años"}
                </Text>
              </View>
            </View>
          </View>
          <Image
            source={require("../../assets/images/foto_primer_form.jpg")}
            style={styles.questionnaire}
            resizeMode="contain"
          />
          <Text style={styles.cardDescription}>
            {user?.age && user.age >= 6 && user.age <= 12
              ? "Evalúa tu forma física y actividad física, comparándote con otros niños/as de 6-12 años."
              : user?.age && user.age > 12 && user.age <= 18
              ? "Evalúa tu forma física y actividad física, comparándote con otros adolescentes de 12-18 años."
              : "Evalúa tu forma física y actividad física según tu grupo de edad."}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>6 preguntas • ~5 minutos</Text>
            <TouchableOpacity
              onPress={handleStartForm}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>Comenzar</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadFormResponse().finally(() => {
      setRefreshing(false);
    });
  }, []);
  
  

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "form" && styles.activeTab]}
        onPress={() => setActiveTab("form")}
      >
        <Ionicons
          name="document-text"
          size={24}
          color={activeTab === "form" ? "#9E7676" : "#666"}
        />
        <Text
          style={[styles.tabText, activeTab === "form" && styles.activeTabText]}
        >
          Formulario
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "about" && styles.activeTab]}
        onPress={() => setActiveTab("about")}
      >
        <Ionicons
          name="information-circle"
          size={24}
          color={activeTab === "about" ? "#9E7676" : "#666"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "about" && styles.activeTabText,
          ]}
        >
          Acerca de
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BackgroundContainer source={require("../../assets/images/fondo.svg")}>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh" size={24} color="#9E7676" />
      </TouchableOpacity>

      {renderTabs()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9E7676"]}
            tintColor="#9E7676"
          />
        }
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCard}>
            <View style={styles.logosWrapper}>
              <Image
                source={require("../../assets/images/logo-uex.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.logoDivider} />
              <Image
                source={require("../../assets/images/ulisboa.png")}
                style={styles.logoLisboa}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {activeTab === "form" ? renderFormCard() : renderAboutContent()}
        </View>
      </ScrollView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  logoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logosWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  logo: {
    height: 45,
    width: 140,
  },
  logoLisboa: {
    height: 110,
    width: 100,
  },
  logoDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#DFCCCC",
    marginHorizontal: 15,
  },
  questionnaire: {
    width: "100%",
    height: 200,
    marginVertical: 15,
    borderRadius: 10,
  },
  cardsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#9E7676",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  titleContainer: {
    flex: 1,
  },
  ageRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ageRangeText: {
    fontSize: 12,
    color: "#9E7676",
    fontWeight: "500",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9E7676",
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: "#594545",
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 10,
  },
  cardMeta: {
    fontSize: 12,
    color: "#B4AAAA",
  },
  refreshButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9E7676",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  startButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  viewResultsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewResultsText: {
    color: "#9E7676",
    fontWeight: "500",
    fontSize: 14,
  },
  // Nuevos estilos para las secciones de información
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 60,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(158, 118, 118, 0.1)',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#9E7676',
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9E7676",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  institutionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  institutionLogo: {
    height: 60,
    width: "100%",
    marginBottom: 10,
  },
  institutionInfo: {
    gap: 5,
  },
  institutionName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#594545",
  },
  institutionCountry: {
    fontSize: 14,
    color: "#9E7676",
    fontWeight: "500",
  },
  institutionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 5,
  },
  institutionStats: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderRadius: 10,
    gap: 5,
  },
  institutionStatItem: {
    fontSize: 13,
    color: "#594545",
  },
  creatorsScroll: {
    flexGrow: 0,
    paddingBottom: 10,
  },
  creatorCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 250,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  creatorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 10,
  },
  creatorInfo: {
    alignItems: "center",
    gap: 5,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#594545",
  },
  creatorRole: {
    fontSize: 14,
    color: "#9E7676",
    fontWeight: "500",
  },
  creatorInstitution: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  creatorDepartment: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
  socialLinks: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  socialButton: {
    padding: 8,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderRadius: 20,
  },
  publicationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  publicationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#594545",
    marginBottom: 5,
  },
  publicationAuthors: {
    fontSize: 14,
    color: "#9E7676",
    marginBottom: 3,
  },
  publicationMeta: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  publicationDOI: {
    fontSize: 12,
    color: "#9E7676",
    marginTop: 5,
    textDecorationLine: "underline",
  }
});

export default FormsListScreen;
