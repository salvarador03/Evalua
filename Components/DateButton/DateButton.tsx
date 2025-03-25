import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View,
  TextInput,
  Platform
} from 'react-native';
import { Calendar } from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface DateButtonProps {
  date: Date;
  onDateChange: (date: Date) => void;
  label: string;
  isValidAge: boolean;
  disabled?: boolean;
  showAgeRequirement?: boolean;
}

export const DateButton: React.FC<DateButtonProps> = ({
  date,
  onDateChange,
  label = "Fecha de nacimiento",
  isValidAge = true,
  disabled = false,
  showAgeRequirement = true,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [day, setDay] = useState(date.getDate().toString());
  const [month, setMonth] = useState((date.getMonth() + 1).toString());
  const [year, setYear] = useState(date.getFullYear().toString());

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleConfirm = (selectedDate: Date) => {
    setDatePickerVisible(false);
    setDay(selectedDate.getDate().toString());
    setMonth((selectedDate.getMonth() + 1).toString());
    setYear(selectedDate.getFullYear().toString());
    onDateChange(selectedDate);
  };

  const handleManualDateChange = () => {
    const newDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  const age = calculateAge(date);

  return (
    <View style={styles.wrapper}>
      <View style={[
        styles.container,
        disabled && styles.disabled,
        !isValidAge && styles.invalidAge
      ]}>
        <View style={styles.content}>
          <View style={styles.labelContainer}>
            <Calendar 
              size={20} 
              color="rgba(255, 255, 255, 0.9)"
              style={styles.icon}
            />
            <Text style={styles.label}>{label}</Text>
          </View>

          <View style={styles.dateInputContainer}>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateInputLabel}>Día</Text>
              <TextInput
                style={styles.dateInput}
                value={day}
                onChangeText={setDay}
                keyboardType="number-pad"
                maxLength={2}
                onBlur={handleManualDateChange}
                placeholder="DD"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            <Text style={styles.dateSeparator}>/</Text>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateInputLabel}>Mes</Text>
              <TextInput
                style={styles.dateInput}
                value={month}
                onChangeText={setMonth}
                keyboardType="number-pad"
                maxLength={2}
                onBlur={handleManualDateChange}
                placeholder="MM"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            <Text style={styles.dateSeparator}>/</Text>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateInputLabel}>Año</Text>
              <TextInput
                style={[styles.dateInput, styles.yearInput]}
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
                maxLength={4}
                onBlur={handleManualDateChange}
                placeholder="AAAA"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => setDatePickerVisible(true)}
              disabled={disabled}
            >
              <Calendar size={24} color="rgba(255, 255, 255, 0.9)" />
            </TouchableOpacity>
          </View>

          <Text style={styles.age}>({age} años)</Text>
        </View>
      </View>

      {showAgeRequirement && (
        <Text style={[
          styles.ageRequirement,
          !isValidAge && styles.invalidAgeText
        ]}>
          {isValidAge 
            ? "* Debes tener entre 6 y 24 años para realizar los cuestionarios"
            : "⚠️ La edad debe estar entre 6 y 24 años"}
        </Text>
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisible(false)}
        date={date}
        minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 24))}
        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 6))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
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
  invalidAge: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  content: {
    padding: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateInputGroup: {
    alignItems: 'center',
  },
  dateInputLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    width: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  yearInput: {
    width: 80,
  },
  dateSeparator: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  calendarButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginLeft: 12,
    marginBottom: 2,
  },
  age: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  ageRequirement: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  invalidAgeText: {
    color: '#ff6b6b',
    fontWeight: '500',
  },
});