import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  placeholderTextColor = 'rgba(255, 255, 255, 0.7)',
  ...props
}) => {
  return (
    <TextInput
      style={styles.loginTextField}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  loginTextField: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    height: 60,
    fontSize: 24,
    marginVertical: 10,
    fontWeight: '300',
    color: '#fff',
    paddingHorizontal: 5,
  },
});