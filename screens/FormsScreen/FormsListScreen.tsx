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
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
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
import { isUniversityStudent } from "./data/universityStudentQuestions";
import { isTeenager } from "./data/teenQuestions";
import FormImageCarousel from "./FormImageCarousel";
import FormCompletionFeedback from '../../Components/FormCompletionFeedback/FormCompletionFeedback';

// Actualiza la interfaz Creator para incluir el tipo correcto de imageUrl
interface Creator {
  name: string;
  role: string;
  institution: string;
  email: string;
  orcid: string;
  imageUrl: any;
  socialLinks?: {
    linkedin?: string;
    researchGate?: string;
    googleScholar?: string;
    other?: string;
    webOfScience?: string;
  };
}

interface Institution {
  name: string;
  description: string;
  country: string;
  logo: any;
  website?: string;
}

interface Publication {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
}

// Updated Data
const CREATORS: Creator[] = [
  {
    name: "José Carmelo Adsuar Sala",
    role: "Investigador Principal",
    institution: "University of Lisbon / University of Extremadura",
    email: "jadssal@unex.es",
    orcid: "https://orcid.org/0000-0001-7203-3168",
    imageUrl: require("../../assets/images/foto_Adsuar_app-José-Adsuar.webp"),
    socialLinks: {
      linkedin: "https://www.linkedin.com/feed/?trk=public_post_google-one-tap-submit",
      researchGate: "",
      googleScholar: "https://scholar.google.es/citations?user=j_RQI9wAAAAJ&hl=es"
    }
  },
  {
    name: "Jorge Carlos Vivas",
    role: "Investigador Principal",
    institution: "Universidad de Extremadura",
    email: "jorgecv@unex.es",
    orcid: "https://orcid.org/0000-0002-6377-9950",
    imageUrl: require("../../assets/images/8efeec09-5e60-4481-9e41-262f20d7297c-Jorge-Carlos-Vivas.webp"),
    socialLinks: {
      googleScholar: "https://scholar.google.es/citations?user=y98TYCoAAAAJ&hl=es&oi=ao",
      researchGate: "https://www.researchgate.net/profile/Jorge-Carlos-Vivas"
    }
  },
  {
    name: "María Mendoza Muñoz",
    role: "Investigador Postdoctoral",
    institution: "Universidad de Extremadura",
    email: "mamendozam@unex.es",
    orcid: "https://orcid.org/0000-0001-9502-5486",
    imageUrl: require("../../assets/images/maria.webp"),
    socialLinks: {
      linkedin: "https://es.linkedin.com/in/mar%C3%ADa-mendoza-mu%C3%B1oz-536995161",
      researchGate: "https://www.researchgate.net/profile/Maria-Mendoza-Munoz"
    }
  },
  {
    name: "Ricardo Hugo Gonzalez",
    role: "Investigador Principal",
    institution: "Universidade Federal do Ceará",
    email: "ricardo.gonzalez@ufc.br",
    orcid: "https://orcid.org/0000-0002-8447-4224",
    imageUrl: require("../../assets/images/Foto-Ricardo-Gonzalez.webp"),
    socialLinks: {
      researchGate: "https://www.researchgate.net/profile/Ricardo-Gonzalez-25"
    }
  },
  {
    name: "Raquel Pastor Cisneros",
    role: "Personal en formación (FPU)",
    institution: "Promoting a Healthy Society Research Group (PHeSO)",
    email: "raquelpc@unex.es",
    orcid: "https://orcid.org/0000-0001-7305-6783",
    imageUrl: require("../../assets/images/IMG_2487-Raquel-Pastor-Cisneros.webp"),
    socialLinks: {
      researchGate: "https://www.researchgate.net/profile/Raquel-Pastor-Cisneros",
      linkedin: "https://www.linkedin.com/in/raquel-pastor-cisneros-ab4454185"
    }
  },
  {
    name: "Adilson Passos da Costa Marques",
    role: "Investigador",
    institution: "University of Lisbon",
    email: "amarques@fmh.ulisboa.pt",
    orcid: "https://orcid.org/0000-0001-9850-7771",
    imageUrl: require("../../assets/images/adilson2-José-Adsuar.webp"),
    socialLinks: {
      googleScholar: "https://scholar.google.com/citations?user=0MPdDS0AAAAJ&hl=en",
      other: "https://www.cienciavitae.pt/portal/5F18-F9C3-11CB",
      webOfScience: "https://www.webofscience.com/wos/author/rid/K-4529-2014"
    }
  },
  {
    name: "Tiago D. Ribeiro",
    role: "PhD candidate",
    institution: "University of Lisbon",
    email: "tiagoribeiro@fmh.ulisboa.pt",
    orcid: "https://orcid.org/0000-0001-5602-048X",
    imageUrl: require("../../assets/images/tiago.webp"),
    socialLinks: {
      researchGate: "https://www.researchgate.net/profile/Tiago-Ribeiro-41",

    }
  },
  {
    name: "Sandy Dorian Isla Alcoser",
    role: "Investigador",
    institution: "Universidad Nacional Mayor de San Marcos",
    email: "sislaa@unmsm.edu.pe",
    orcid: "https://orcid.org/0000-0003-1330-3716",
    imageUrl: require("../../assets/images/sandy.webp"),
    socialLinks: {
      linkedin: "https://pe.linkedin.com/in/sandy-dorian-isla-alcoser-8515b9248",
      googleScholar: "https://scholar.google.com/citations?user=QKKUfcIAAAAJ&hl=es"
    }
  },
  {
    name: "Jose Antonio Romero Macarrilla",
    role: "Investigador Asociado",
    institution: "Universidad de Extremadura",
    email: "jaromerom01@unex.es",
    orcid: "https://orcid.org/0009-0006-3206-9928",
    imageUrl: require("../../assets/images/foto personal - José Antonio Romero Macarrilla.webp"),
    socialLinks: {
      linkedin: "https://www.linkedin.com/"
    }
  },
  {
    name: "Jean Carlos Rosales García",
    role: "Asistente",
    institution: "Universidad del Atlántico",
    email: "jeanrosales@mail.uniatlantico.edu.co",
    orcid: "https://orcid.org/0000-0003-0204-2127",
    imageUrl: require("../../assets/images/Yo-JEAN-CARLOS-ROSALES-GARCIA.webp"),
    socialLinks: {
      googleScholar: "https://scholar.google.com/citations?hl=es&user=zmW5JSUAAAAJ",
      researchGate: "https://www.researchgate.net/profile/Jean-Rosales-Garcia",
      linkedin: "https://www.linkedin.com/in/jean-carlos-rosales-garc%C3%ADa-3239a5193/"
    }
  },
  {
    name: "Jorge De Lázaro Coll Costa",
    role: "Vicerrector e Investigador",
    institution: "Universidad de Ciencias de la Cultura Física y el Deporte Manuel Fajardo",
    email: "jorgecoll@uccfd.cu",
    orcid: "https://orcid.org/0000-0001-8712-2948",
    imageUrl: require("../../assets/images/jorge.webp"),
    socialLinks: {
      researchGate: "https://www.researchgate.net/profile/Jorge-Coll-Costa"
    }
  },
  {
    name: "Cristian Pérez Tapia",
    role: "Investigador",
    institution: "Universidad Santo Tomás",
    email: "cristianperez@santotomas.cl",
    orcid: "https://orcid.org/0000-0002-9633-6064",
    imageUrl: require("../../assets/images/cristian.webp"),
    socialLinks: {
      googleScholar: "https://scholar.google.com/citations?user=g-ZhVhMAAAAJ",
      linkedin: "https://cl.linkedin.com/in/cristian-p%C3%A9rez-tapia-33401467"
    }
  },
  {
    name: "Natalia Triviño Amigo",
    role: "Profesora e Investigadora",
    institution: "Universidad Europea",
    email: "natalia.trivino@universidadeuropea.es",
    orcid: "",
    imageUrl: require("../../assets/images/natalia.webp"),
    socialLinks: {
      linkedin: "https://es.linkedin.com/in/natalia-trivi%C3%B1o-amigo-899718162",
      researchGate: "https://www.researchgate.net/profile/Natalia-Trivino-Amigo"
    }
  },
  // New researchers added
  {
    name: "Eddy Silva",
    role: "Investigador",
    institution: "Nicaragua",
    email: "",
    orcid: "https://orcid.org/0000-0002-1180-9804",
    imageUrl: require("../../assets/images/eddy.webp"),
    socialLinks: {}
  },
  {
    name: "Maristela De Lima Ferreira",
    role: "Investigadora",
    institution: "Panamá",
    email: "",
    orcid: "https://orcid.org/0009-0005-1252-6995",
    imageUrl: require("../../assets/images/investigadoralima.webp"),
    socialLinks: {}
  },
  {
    name: "Milton Fernando Rosero Duque",
    role: "Investigador",
    institution: "Ecuador",
    email: "",
    orcid: "https://orcid.org/0000-0002-5702-3524",
    imageUrl: require("../../assets/images/investigadorecuador.webp"),
    socialLinks: {}
  }
];


const INSTITUTIONS: Institution[] = [
  {
    name: "Universidad de Extremadura",
    description: "Centro de investigación líder en ciencias del deporte y promoción de la salud, con un enfoque especial en el desarrollo motor y la actividad física.",
    country: "España",
    logo: require("../../assets/images/logo-uex.webp"),
    website: "https://www.unex.es"
  },
  {
    name: "University of Lisbon",
    description: "Institución de referencia en investigación sobre movimiento humano y desarrollo motor, con énfasis en estudios de alfabetización física.",
    country: "Portugal",
    logo: require("../../assets/images/ulisboa.webp"),
    website: "https://www.ulisboa.pt"
  },
  {
    name: "Universidade Federal do Ceará",
    description: "Centro de excelencia en investigación deportiva y desarrollo motor, con un fuerte enfoque en la promoción de la actividad física.",
    country: "Brasil",
    logo: require("../../assets/images/Brasao4_vertical_cor_300dpi.webp"),
    website: "https://www.ufc.br"
  },
  {
    name: "Universidad Nacional Mayor de San Marcos",
    description: "La Universidad Nacional Mayor de San Marcos, fundada en 1551, es la universidad más antigua de América y una de las más prestigiosas del Perú, destacada en investigación y desarrollo académico.",
    country: "Perú",
    logo: require("../../assets/images/san_marcos.webp"),
    website: "https://www.unmsm.edu.pe"
  },
  {
    name: "Universidad del Atlántico",
    description: "Institución comprometida con la investigación en ciencias del deporte y el desarrollo de programas de actividad física.",
    country: "Colombia",
    logo: require("../../assets/images/Logo_de_la_Universidad_del_Atlántico.svg.webp"),
    website: "https://www.uniatlantico.edu.co"
  },
  {
    name: "Universidad de Ciencias de la Cultura Física y el Deporte",
    description: "Institución especializada en la formación de profesionales en cultura física y deporte, con énfasis en la investigación de la actividad física y la prevención de enfermedades.",
    country: "Cuba",
    logo: require("../../assets/images/UCCFD.webp"),
    website: "https://www.uccfd.cu"
  },
  {
    name: "Universidad Santo Tomás",
    description: "Institución dedicada a la investigación en educación física y formación inicial docente, con énfasis en la didáctica de la educación física.",
    country: "Chile",
    logo: require("../../assets/images/st.webp"),
    website: "https://www.santotomas.cl"
  },
  {
    name: "Universidad Europea de Madrid",
    description: "Institución especializada en ciencias del deporte y medicina deportiva, con estrecha colaboración con el Real Madrid para la formación e investigación deportiva.",
    country: "España",
    logo: require("../../assets/images/europea.webp"),
    website: "https://universidadeuropea.es"
  },
  {
    name: "Universidad Nacional Autónoma de Nicaragua, Managua",
    description: "Institución dedicada a la formación de profesionales e investigación en diversos campos académicos, incluyendo ciencias del deporte y educación física.",
    country: "Nicaragua",
    logo: require("../../assets/images/managua.webp"),
    website: "https://www.unan.edu.ni"
  }
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
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [formType, setFormType] = useState("physical_literacy");

  useEffect(() => {
    if (!showFeedback && !loading) {
      // Solo si el modal estaba abierto y ahora está cerrado, recargamos datos
      loadFormResponse();
    }
  }, [showFeedback]);

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

  const checkExistingFeedback = async (userId: string): Promise<boolean> => {
    try {
      // Limpiar el estado de feedback
      setShowFeedback(false);


      // 1. BÚSQUEDA EXACTA: Primero buscar con ID exacto
      const feedbackId = `${userId}_${formType}`;

      let snapshot = await db()
        .ref(`/feedback/${feedbackId}`)
        .once("value");

      if (snapshot.exists()) {
        return true;
      }


      snapshot = await db()
        .ref(`/form_responses/${userId}/feedback_${formType}`)
        .once("value");

      if (snapshot.exists()) {

        // Migrar datos a nueva ubicación si es necesario
        // [código de migración existente]

        return true;
      }


      // Obtener todos los feedbacks
      const allFeedbackSnapshot = await db()
        .ref('/feedback')
        .once('value');

      if (allFeedbackSnapshot.exists()) {
        const allFeedbacks = allFeedbackSnapshot.val();

        // Buscar feedbacks que coincidan con el prefijo
        const matchingKeys = Object.keys(allFeedbacks).filter(key =>
          key.startsWith(`${userId}_${formType}`) ||
          key.includes(`${userId}_${formType}`) ||
          key.startsWith(`${userId}`) && key.includes(formType)
        );


        if (matchingKeys.length > 0) {
          return true;
        }
      }

      // 4. BÚSQUEDA PROFUNDA: Buscar por userId y formType dentro de los objetos

      if (allFeedbackSnapshot && allFeedbackSnapshot.exists()) {
        const allFeedbacks = allFeedbackSnapshot.val();

        // Buscar en todas las entradas si contienen el userId y formType
        for (const key in allFeedbacks) {
          const feedback = allFeedbacks[key];
          if (feedback.userId === userId && feedback.formType === formType) {
            return true;
          }
        }
      }

      // Depuración final

      // Como último recurso, revisa todas las claves en la DB para debugging
      const allKeys = await db().ref('/feedback').once('value');

      return false;
    } catch (error) {
      console.error("[checkExistingFeedback] Error durante la búsqueda:", error);
      if (error instanceof Error) {
        console.error("[checkExistingFeedback] Detalles:", error.message, error.stack);
      }
      return false;
    }
  };
  // Reemplaza la función loadFormResponse con esta versión:
  const loadFormResponse = async () => {
    try {
      setError(null);
      setLoading(true);

      // Obtener el ID de usuario correctamente
      let userId = user?.uid;

      if (!userId) {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userId = userData.uid;
        } else {
          const guestId = await AsyncStorage.getItem("@guest_user_id");
          if (guestId) {
            userId = guestId;
          } else {
            setError("Error al identificar usuario");
            return;
          }
        }
      }

      // Cargar formulario
      const formSnapshot = await db()
        .ref(`/form_responses/${userId}/physical_literacy`)
        .once("value");

      const formData = formSnapshot.val();
      setFormResponse(formData || null);

      // IMPORTANTE: Verificar feedback SOLO si hay formulario completado
      if (formData && userId) {
        const hasFeedbackResult = await checkExistingFeedback(userId);
      }
    } catch (error) {
      console.error("[loadFormResponse] Error:", error);
      setError(error instanceof Error ? error.message : "Error loading the form");
      if (!refreshing) {
        Alert.alert("Error", "Could not load the form. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setShowLeftArrow(contentOffset.x > 0);
    setShowRightArrow(contentOffset.x < contentSize.width - layoutMeasurement.width);
  };

  const scrollTo = (direction: 'left' | 'right') => {
    scrollViewRef.current?.scrollTo({
      x: direction === 'left' ? 0 : 1000,
      animated: true
    });
  };

  // Render Methods
  const renderAboutContent = () => (
    <>
      {renderInstitutions()}
      {renderCreators()}
    </>
  );

  const renderLogoContainer = () => {
    if (activeTab === "form") {
      return (
        <View style={styles.logoContainer}>
          <View style={styles.logoCard}>
            <View style={styles.scrollContainer}>
              {showLeftArrow && (
                <TouchableOpacity
                  style={[styles.scrollButton, styles.scrollButtonLeft]}
                  onPress={() => scrollTo('left')}
                >
                  <Ionicons name="chevron-back" size={24} color="#9E7676" />
                </TouchableOpacity>
              )}
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.logosScrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                <Image
                  source={require("../../assets/images/logo-uex.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/ulisboa.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/Brasao4_vertical_cor_300dpi.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/Logo_de_la_Universidad_del_Atlántico.svg.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/UCCFD.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/st.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/europea.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/san_marcos.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
                <View style={styles.logoDivider} />
                <Image
                  source={require("../../assets/images/managua.webp")}
                  style={[styles.logo, { width: 60, height: 60 }]}
                  resizeMode="contain"
                />
              </ScrollView>
              {showRightArrow && (
                <TouchableOpacity
                  style={[styles.scrollButton, styles.scrollButtonRight]}
                  onPress={() => scrollTo('right')}
                >
                  <Ionicons name="chevron-forward" size={24} color="#9E7676" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

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
          </View>
        </View>
      ))}
    </View>
  );

  // Update the renderCreators method to include ORCID and email
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
              source={creator.imageUrl}
              style={styles.creatorImage}
              resizeMode="cover"
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{creator.name}</Text>
              <Text style={styles.creatorRole}>{creator.role}</Text>
              <Text style={styles.creatorInstitution}>
                {creator.institution}
              </Text>
              <TouchableOpacity
                onPress={() => handleOpenLink(creator.orcid)}
                style={styles.orcidButton}
              >
                <Text style={styles.orcidText}>ORCID</Text>
              </TouchableOpacity>
              <View style={styles.socialLinks}>
                {creator.socialLinks?.linkedin && (
                  <TouchableOpacity
                    onPress={() => handleOpenLink(creator.socialLinks!.linkedin!)}
                    style={styles.socialButton}
                  >
                    <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                  </TouchableOpacity>
                )}
                {creator.socialLinks?.researchGate && (
                  <TouchableOpacity
                    onPress={() => handleOpenLink(creator.socialLinks!.researchGate!)}
                    style={styles.socialButton}
                  >
                    <Ionicons name="book" size={20} color="#00CCBB" />
                  </TouchableOpacity>
                )}
                {creator.socialLinks?.googleScholar && (
                  <TouchableOpacity
                    onPress={() => handleOpenLink(creator.socialLinks!.googleScholar!)}
                    style={styles.socialButton}
                  >
                    <Ionicons name="school" size={20} color="#4285F4" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleOpenLink(`mailto:${creator.email}`)}
                  style={styles.socialButton}
                >
                  <Ionicons name="mail" size={20} color="#9E7676" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const getFormTitle = (age: number | undefined) => {
    if (age && isUniversityStudent(age)) {
      return "Cuestionario de Autoevaluación de Alfabetización Física - Universitarios";
    } else if (age && isTeenager(age)) {
      return "Cuestionario de Autoevaluación de Alfabetización Física - Adolescentes";
    } else {
      return "Cuestionario de Autoevaluación de Alfabetización Física - Niños";
    }
  };

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
                {getFormTitle(user?.age)}
              </Text>
              <View style={styles.ageRangeContainer}>
                <Ionicons name="people-outline" size={16} color="#9E7676" />
                <Text style={styles.ageRangeText}>
                  {user?.age && isUniversityStudent(user.age)
                    ? "Franja de edad: 18-24 años"
                    : user?.age && isTeenager(user.age)
                      ? "Franja de edad: 12-18 años"
                      : user?.age && user.age >= 6 && user.age < 12
                        ? "Franja de edad: 6-12 años"
                        : "Franja de edad: 6-24 años"}
                </Text>
              </View>
            </View>
          </View>
          <Image
            source={require("../../assets/images/foto_primer_form.webp")}
            style={styles.questionnaire}
            resizeMode="contain"
          />
          <Text style={styles.cardDescription}>
            Has completado este cuestionario el{" "}
            {new Date(formResponse.completedAt).toLocaleDateString()}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>Respuestas guardadas</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={() => {
                  setShowFeedback(true);
                }}
                style={styles.feedbackButton}
              >
                <Text style={styles.feedbackButtonText}>
                  Valorar
                </Text>
                <Ionicons
                  name="star"
                  size={20}
                  color="#9E7676"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleViewResults}
                style={styles.viewResultsButton}
              >
                <Text style={styles.viewResultsText}>Ver resultados</Text>
                <Ionicons name="arrow-forward" size={20} color="#9E7676" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={24} color="#9E7676" />
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>
                {getFormTitle(user?.age)}
              </Text>
              <View style={styles.ageRangeContainer}>
                <Ionicons name="people-outline" size={16} color="#9E7676" />
                <Text style={styles.ageRangeText}>
                  {user?.age && user.age >= 6 && user.age <= 12
                    ? "Franja de edad: 6-12 años"
                    : user?.age && user.age > 12 && user.age <= 18
                      ? "Franja de edad: 12-18 años"
                      : user?.age && user.age > 18 && user.age <= 24
                        ? "Franja de edad: 18-24 años"
                        : "Edades: 6-24 años"}
                </Text>
              </View>
            </View>
          </View>
          <FormImageCarousel
            userAge={user?.age ?? 0}
            isFormCompleted={formResponse !== null}
          />

          <Text style={styles.cardDescription}>
            {user?.age && user.age >= 6 && user.age <= 12
              ? "Evalúa tu forma física y actividad física, comparándote con otros niños/as de 6-12 años."
              : user?.age && user.age > 12 && user.age <= 18
                ? "Evalúa tu forma física y actividad física, comparándote con otros adolescentes de 12-18 años."
                : "Evalúa tu forma física y actividad física según tu grupo de edad."}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>8 preguntas • ~5 minutos</Text>
            <View style={styles.buttonGroup}>
              {user?.role === 'teacher' && (
                <TouchableOpacity
                  onPress={() => {
                    setShowFeedback(true);
                  }}
                  style={styles.feedbackButton}
                >
                  <Text style={styles.feedbackButtonText}>
                    Valorar
                  </Text>
                  <Ionicons
                    name="star"
                    size={20}
                    color="#9E7676"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleStartForm}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>Comenzar</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Modal de Feedback */}
      {showFeedback && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <FormCompletionFeedback
            formType={formType}
            language={user?.language || "es"}
            onFinish={() => {
              setShowFeedback(false);
            }}
          />
        </View>
      )}
    </View>
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFormResponse();
    } catch (error) {
      console.error("Error during refresh:", error);
    }
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
    <BackgroundContainer source={require("../../assets/images/p_fondo.webp")}>
      <SafeAreaView style={styles.safeArea}>
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
          {renderLogoContainer()}

          <View style={styles.cardsContainer}>
            {activeTab === "form" ? renderFormCard() : renderAboutContent()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 70,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
    marginBottom: 15,
  },
  logoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  feedbackButtonModified: {
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(158, 118, 118, 0.3)",
  },
  scrollButton: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollButtonLeft: {
    left: 0,
  },
  scrollButtonRight: {
    right: 0,
  },
  logosScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  logo: {
    marginHorizontal: 8,
    height: 50,
    width: 50,
  },
  logoDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#DFCCCC",
  },
  questionnaire: {
    width: "100%",
    height: 180,
    marginVertical: 10,
    borderRadius: 10,
  },
  cardsContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  loadingContainer: {
    padding: 15,
    alignItems: "center",
  },
  errorContainer: {
    padding: 15,
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
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  titleContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "85%",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#594545",
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: "#594545",
    marginBottom: 30,
    textAlign: "center",
  },
  closeModalButton: {
    backgroundColor: "#9E7676",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 8,
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
    marginBottom: 12,
  },
  // Nuevos estilos para añadir
  buttonGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: "column",
    marginTop: 8,
    paddingBottom: 5,
  },
  cardMeta: {
    fontSize: 12,
    color: "#B4AAAA",
    marginBottom: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Para alinearlos a la derecha
    gap: 10,
    flexWrap: 'wrap', // Para evitar que se desborden
  },
  refreshButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 5 : (StatusBar.currentHeight || 0) + 5,
    right: 20,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
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
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(158, 118, 118, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    width: '100%',
    maxWidth: 220,
  },
  feedbackButtonText: {
    color: "#9E7676",
    fontWeight: "500",
    fontSize: 14,
  },
  viewResultsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    maxWidth: 220,
  },
  viewResultsText: {
    color: "#9E7676",
    fontWeight: "500",
    fontSize: 14,
  },
  orcidButton: {
    backgroundColor: '#A6CE39',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 8,
  },
  orcidText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginTop: Platform.OS === "ios" ? 20 : (StatusBar.currentHeight || 0) + 15,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 5,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "rgba(158, 118, 118, 0.1)",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#9E7676",
  },
  sectionContainer: {
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#594545",
    marginBottom: 15,
    paddingHorizontal: 5,
    textAlign: "center",
  },
  institutionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(158, 118, 118, 0.1)",
  },
  institutionLogo: {
    height: 65,
    width: "100%",
    marginBottom: 12,
  },
  institutionInfo: {
    gap: 6,
  },
  institutionName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#594545",
    marginBottom: 4,
  },
  institutionCountry: {
    fontSize: 15,
    color: "#9E7676",
    fontWeight: "600",
    marginBottom: 6,
  },
  institutionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginVertical: 8,
  },
  institutionStats: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderRadius: 10,
    gap: 6,
  },
  institutionStatItem: {
    fontSize: 14,
    color: "#594545",
    fontWeight: "500",
  },
  creatorsScroll: {
    marginVertical: 8,
    paddingBottom: 12,
  },
  creatorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 270,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(158, 118, 118, 0.1)",
  },
  creatorImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginBottom: 12,
    backgroundColor: "#F5F5F5",
  },
  creatorInfo: {
    alignItems: "center",
    gap: 6,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#594545",
    textAlign: "center",
  },
  creatorRole: {
    fontSize: 14,
    color: "#9E7676",
    fontWeight: "600",
    textAlign: "center",
  },
  creatorInstitution: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  creatorDepartment: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 6,
  },
  socialLinks: {
    flexDirection: "row",
    gap: 15,
    marginTop: 12,
    justifyContent: "center",
  },
  socialButton: {
    padding: 8,
    backgroundColor: "rgba(158, 118, 118, 0.1)",
    borderRadius: 25,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  publicationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(158, 118, 118, 0.1)",
  },
  publicationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#594545",
    marginBottom: 8,
    lineHeight: 22,
  },
  publicationAuthors: {
    fontSize: 14,
    color: "#9E7676",
    marginBottom: 5,
    fontWeight: "500",
  },
  publicationMeta: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 6,
  },
  publicationDOI: {
    fontSize: 13,
    color: "#9E7676",
    marginTop: 6,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});

export default FormsListScreen;