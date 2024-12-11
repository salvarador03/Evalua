import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackgroundContainer } from '../../Components/BackgroundContainer/BackgroundContainer';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';
import { CustomButton } from '../../Components/CustomButton/CustomButton';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WelcomeScreen'
>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const logoScale = new Animated.Value(0);
  const titleOpacity = new Animated.Value(0);
  const subtitleOpacity = new Animated.Value(0);
  const buttonScale = new Animated.Value(0.5);

  useEffect(() => {
    const animations = [
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ];

    Animated.sequence(animations).start();

    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
      delay: 500,
    }).start();
  }, []);

  return (
    <BackgroundContainer source={require('../../assets/images/p_fondo.webp')}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoCard}>
            <View style={styles.logosWrapper}>
              <Image
                source={require('../../assets/images/logo-uex.webp')}
                style={[styles.logo, { width: 60, height: 60 }]}
                resizeMode="contain"
              />
              <View style={styles.logoDivider} />
              <Image
                source={require('../../assets/images/ulisboa.webp')}
                style={[styles.logo, { width: 60, height: 60 }]}
                resizeMode="contain"
              />
              <View style={styles.logoDivider} />
              <Image
                source={require('../../assets/images/Brasao4_vertical_cor_300dpi.webp')}
                style={[styles.logo, { width: 60, height: 60 }]}
                resizeMode="contain"
              />
              <View style={styles.logoDivider} />
              <Image
                source={require('../../assets/images/Logo_de_la_Universidad_del_Atlántico.svg.webp')}
                style={[styles.logo, { width: 60, height: 60 }]}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
            <Text style={styles.preTitle}>AUTOEVALUACIÓN</Text>
            <Text style={styles.title}>ALFABETIZACIÓN</Text>
            <Text style={styles.titleSecond}>FÍSICA</Text>
          </Animated.View>

          <Animated.View style={[styles.subtitleContainer, { opacity: subtitleOpacity }]}>
            <Text style={styles.subtitle}>
              Evalúa y comprende tu desarrollo físico de manera integral
            </Text>
          </Animated.View>

          <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
            <CustomButton
              title="Comenzar Evaluación"
              onPress={() => navigation.navigate('Login')}
              variant="gradient"
              size="large"
              icon={<Feather name="arrow-right" size={24} color="#fff" />}
            />
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Universidad de Extremadura • Universidade de Lisboa • Universidade Federal do Ceará • Universidad del Atlántico
          </Text>
        </View>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: height * 0.02,
  },
  logoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logosWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  logo: {
    marginHorizontal: 5,
  },
  logoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#D4A5A5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  preTitle: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    ...typography.title,
    fontSize: 33,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  titleSecond: {
    ...typography.title,
    fontSize: 42,
    color: '#9E7676',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitleContainer: {
    marginBottom: height * 0.06,
    paddingHorizontal: 20,
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
});