import React, { useState, useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
  View,
  Animated,
  Easing,
  Pressable
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'minimal' | 'glass';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  buttonStyle,
  textStyle
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animación de pulso continua para el estado loading
  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };

  const buttonAnimatedStyle = {
    transform: [
      { scale: loading ? pulseAnim : scaleAnim }
    ]
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'gradient' ? '#FFFFFF' : '#9E7676'} 
          size="small" 
        />
      ) : (
        <>
          {icon && (
            <Animated.View 
              style={[
                styles.iconContainer,
                isPressed && { transform: [{ scale: 0.9 }] }
              ]}
            >
              {icon}
            </Animated.View>
          )}
          <Text style={[
            styles.text,
            styles[`${size}Text`],
            styles[`${variant}Text`],
            disabled && styles.disabledText,
            textStyle
          ]}>{title}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <Animated.View style={buttonAnimatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={disabled || loading}
        >
          <LinearGradient
            colors={['#D4A5A5', '#9E7676']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              styles[`${size}Button`],
              disabled && styles.disabledButton,
              buttonStyle
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={buttonAnimatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          styles[`${size}Button`],
          styles[`${variant}Button`],
          disabled && styles.disabledButton,
          pressed && styles.pressedButton,
          buttonStyle
        ]}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#9E7676',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  pressedButton: {
    opacity: 0.9,
  },
  gradientTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  // Variantes de tamaño para botones
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  // Variantes de tamaño para texto
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Estilos de botón por variante
  primaryButton: {
    backgroundColor: '#9E7676', // Marrón rosado suave
  },
  secondaryButton: {
    backgroundColor: '#F5E6E6', // Rosa muy pálido
    borderWidth: 1,
    borderColor: '#9E7676',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#B7A6A6', // Marrón grisáceo medio
  },
  minimalButton: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  glassButton: {
    backgroundColor: 'rgba(158, 118, 118, 0.15)', // #9E7676 con transparencia
    borderWidth: 1,
    borderColor: 'rgba(158, 118, 118, 0.2)',
  },
  // Estilos de texto por variante
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryText: {
    color: '#9E7676', // Marrón rosado suave
    fontWeight: '600',
  },
  outlineText: {
    color: '#B7A6A6', // Marrón grisáceo medio
    fontWeight: '600',
  },
  gradientText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  minimalText: {
    color: '#9E7676', // Marrón rosado suave
    fontWeight: '500',
  },
  glassText: {
    color: '#9E7676', // Marrón rosado suave
    fontWeight: '600',
  },
  // Estados deshabilitados
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#CCBEBE', // Versión más clara del marrón grisáceo
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});