import React from 'react';
import { 
  ImageBackground, 
  StyleSheet, 
  Pressable, 
  StyleProp, 
  ViewStyle,
  View,
  ImageSourcePropType // Añadido para tipar correctamente source
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

interface BackgroundContainerProps {
  children: React.ReactNode;
  source: ImageSourcePropType; // Cambiado de any a ImageSourcePropType
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  children,
  source,
  onPress,
  style
}) => {
  // Si hay onPress, usar Pressable, si no, usar View
  const Container = onPress ? Pressable : View;

  return (
    <Container 
      style={styles.rootContainer}
      {...(onPress ? { onPress } : {})}
    >
      <ImageBackground
        source={source}
        style={[styles.backgroundImage, style]}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)']}
          style={styles.gradient}
        >
          <SafeAreaView 
            style={styles.container}
            edges={['top', 'left', 'right']} // Evitar el padding inferior
          >
            {children}
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </Container>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  }
});

export default BackgroundContainer;