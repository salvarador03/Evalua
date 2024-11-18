import React, { useState } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Text,
  TextInputProps
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  error,
  placeholder = "Contraseña",
  placeholderTextColor = 'rgba(255, 255, 255, 0.7)',
  editable = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            Platform.select({
              ios: styles.inputIOS,
              android: styles.inputAndroid,
            }),
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          selectionColor="rgba(255, 255, 255, 0.9)"
          secureTextEntry={!showPassword}
          editable={editable}
          {...props}
        />
        
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
          disabled={!editable}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={24} 
            color={editable ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)"}
          />
        </TouchableOpacity>
      </View>
      
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: Platform.select({
      ios: 19,
      android: 18
    }),
    color: '#FFFFFF',
    paddingHorizontal: 0,
    paddingVertical: 12,
    paddingRight: 45,
    fontWeight: Platform.select({
      ios: '500',
      android: '400'
    }),
    letterSpacing: 0.5,
  },
  inputIOS: {
    fontFamily: 'System',
  },
  inputAndroid: {
    fontFamily: 'sans-serif-medium',
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    paddingHorizontal: 10,
    justifyContent: 'center',
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