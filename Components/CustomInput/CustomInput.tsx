import React, { useState } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
  Platform
} from 'react-native';

interface CustomInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  error,
  containerStyle,
  inputStyle,
  placeholder,
  placeholderTextColor = 'rgba(255, 255, 255, 0.7)',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [lineAnimation] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(lineAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(lineAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const lineWidth = lineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[
          styles.input,
          inputStyle,
          Platform.select({
            ios: styles.inputIOS,
            android: styles.inputAndroid,
          })
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        selectionColor="rgba(255, 255, 255, 0.9)"
        {...props}
      />
      
      <View style={styles.baseLine} />
      
      {!error && (
        <Animated.View 
          style={[
            styles.focusLine,
            { width: lineWidth }
          ]} 
        />
      )}
      
      {error && (
        <>
          <View style={styles.errorLine} />
          <Text style={styles.errorText}>
            {error}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingBottom: 24,
  },
  input: {
    height: 56,
    fontSize: Platform.select({
      ios: 19,
      android: 18
    }),
    color: '#FFFFFF',
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontWeight: Platform.select({
      ios: '500',
      android: '400'
    }),
    letterSpacing: 0.5,
  },
  inputIOS: {
    fontFamily: 'System', // Font por defecto de iOS, muy legible
  },
  inputAndroid: {
    fontFamily: 'sans-serif-medium', // Font nativa de Android más legible
  },
  baseLine: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  focusLine: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorLine: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: '#FF6B6B',
  },
  errorText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    fontSize: 13,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
    color: '#FF6B6B',
    letterSpacing: 0.4,
  },
});