// BackgroundContainer.tsx
import React from 'react';
import { ImageBackground, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        imageStyle={{ opacity: 0.7 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {children}
        </SafeAreaView>
      </ImageBackground>
    </Container>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
});