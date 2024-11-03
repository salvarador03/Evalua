// src/components/CustomInput.tsx
import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  ...props
}) => {
  return (
    <TextInput
      style={styles.loginTextField}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  loginTextField: {
    borderBottomWidth: 1,
    height: 60,
    fontSize: 25,
    marginVertical: 10,
    fontWeight: '300',
  },
});
