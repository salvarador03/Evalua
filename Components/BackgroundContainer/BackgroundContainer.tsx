import React from 'react';
import { ImageBackground, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

interface BackgroundContainerProps {
  children: React.ReactNode;
  source: any;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  children,
  source,
  onPress,
  style
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
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.container}>
            {children}
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </Container>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  }
});