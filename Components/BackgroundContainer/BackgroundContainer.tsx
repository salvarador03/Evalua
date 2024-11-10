import React from 'react';
import { ImageBackground, StyleSheet, Pressable, StyleProp, ViewStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BackgroundContainerProps {
  children: React.ReactNode;
  source: any;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  overlayOpacity?: number;
  overlayColor?: string;
}

export const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  children,
  source,
  onPress,
  style,
  overlayOpacity = 0.3,
  overlayColor = "rgba(0, 0, 0, 0.8)"
}) => {
  const Container = onPress ? Pressable : React.Fragment;
  const containerProps = onPress ? { onPress } : {};

  return (
    <Container {...containerProps}>
      <ImageBackground
        source={source}
        style={[styles.backgroundImage, style]}
        resizeMode="cover"
      >
        {/* Overlay principal con efecto de viñeta */}
        <View 
          style={[
            styles.overlay,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }
          ]}
        >
          {/* Capa de viñeta superior */}
          <View style={[styles.vignette, styles.topVignette]} />
          
          {/* Capa de viñeta inferior */}
          <View style={[styles.vignette, styles.bottomVignette]} />
        </View>

        {/* Capa de ajuste de brillo */}
        <View 
          style={[
            styles.overlay,
            {
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }
          ]}
        />

        {/* Contenido con márgenes seguros */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {/* Contenedor con scroll y márgenes adicionales */}
            <View style={styles.innerContainer}>
              {children}
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </Container>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'transparent',
  },
  topVignette: {
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    opacity: 0.7,
  },
  bottomVignette: {
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    opacity: 0.7,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 40, // Margen superior adicional
    paddingBottom: 20, // Margen inferior adicional
  },
});