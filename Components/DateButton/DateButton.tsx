import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View,
  Platform 
} from 'react-native';
import { Calendar } from 'lucide-react-native';

interface DateButtonProps {
  date: Date;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
}

export const DateButton: React.FC<DateButtonProps> = ({
  date,
  onPress,
  label = "Fecha de nacimiento",
  disabled = false,
}) => {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.labelContainer}>
          <Calendar 
            size={20} 
            color="rgba(255, 255, 255, 0.9)"
            style={styles.icon}
          />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    marginVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    padding: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
});