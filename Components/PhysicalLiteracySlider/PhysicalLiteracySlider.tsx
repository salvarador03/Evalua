import React from 'react';
import Slider from "@react-native-community/slider";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { translations, Language } from '../LanguageSelection/translations';

interface PhysicalLiteracySliderProps {
    value: number | null;
    onChange: (value: number) => void;
    minLabel: string;
    maxLabel: string;
    language: Language;
  }

type SliderInfo = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  message: string;
  iconColor: string;
}

const PhysicalLiteracySlider: React.FC<PhysicalLiteracySliderProps> = ({ 
    value, 
    onChange, 
    minLabel, 
    maxLabel,
    language
}) => {
  const getSliderInfo = (value: number | null): SliderInfo => {
    if (value === null) {
      return {
        icon: "help-circle-outline",
        color: "#666",
        message: translations[language].selectLevel,
        iconColor: "#666"
      };
    }
    
    if (value <= 3) {
      return {
        icon: "sad",
        color: "#ef4444",
        message: minLabel,
        iconColor: "#ef4444"
      };
    }
    
    if (value <= 7) {
      return {
        icon: "happy-outline",
        color: "#fbbf24",
        message: translations[language].intermediate,
        iconColor: "#fbbf24"
      };
    }
    
    return {
      icon: "happy",
      color: "#4ade80",
      message: maxLabel,
      iconColor: "#4ade80"
    };
  };

  const getTrackColor = (value: number | null): string => {
    if (value === null || value <= 3) {
      return '#ef4444';
    }
    if (value <= 7) {
      return '#fbbf24';
    }
    return '#4ade80';
  };

  const renderValueIndicator = () => {
    const { icon, color, message, iconColor } = getSliderInfo(value);
    
    return (
      <View style={styles.valueIndicator}>
        <Ionicons name={icon} size={32} color={iconColor} />
        {value !== null && (
          <Text style={[styles.value, { color }]}>{value}</Text>
        )}
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  };

  const renderScaleMarkers = () => {
    return (
      <View style={styles.markersContainer}>
        <View style={styles.markersInnerContainer}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mark) => (
            <View key={mark} style={styles.markerColumn}>
              <View style={[
                styles.marker,
                mark === value && styles.activeMarker,
                mark <= 3 ? styles.redZone :
                mark <= 7 ? styles.yellowZone :
                styles.greenZone,
                (mark === 0 || mark === 3 || mark === 7 || mark === 10) && styles.majorMarker
              ]} />
              <Text style={[
                styles.markerLabel,
                mark === value && styles.activeLabel,
                mark <= 3 ? styles.redText :
                mark <= 7 ? styles.yellowText :
                styles.greenText
              ]}>
                {mark}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderValueIndicator()}
      
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrackBase} />
        {renderScaleMarkers()}
        <View style={[
          styles.sliderTrackActive,
          { 
            width: `${(value !== null ? value : 0) * 10}%`,
            backgroundColor: getTrackColor(value)
          }
        ]} />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={value !== null ? value : 0}
          onValueChange={onChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#ffffff"
        />
      </View>

      <View style={styles.labelContainer}>
        <Text style={styles.endLabel}>{minLabel}</Text>
        <Text style={[styles.endLabel, styles.rightLabel]}>{maxLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  valueIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },
  sliderContainer: {
    position: 'relative',
    height: 100,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  sliderTrackBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    top: '50%',
    marginTop: -2,
    zIndex: 1,
  },
  sliderTrackActive: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    top: '50%',
    marginTop: -2,
    zIndex: 2,
  },
  markersContainer: {
    position: 'absolute',
    width: '100%',
    paddingVertical: 15,
    zIndex: 1,
  },
  markersInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -10,
    paddingHorizontal: 10,
    width: '110%',
  },
  markerColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
  },
  marker: {
    width: 2,
    height: 10,
    borderRadius: 1,
  },
  majorMarker: {
    height: 16,
    width: 3,
  },
  activeMarker: {
    width: 3,
  },
  redZone: {
    backgroundColor: '#ef4444',
  },
  yellowZone: {
    backgroundColor: '#fbbf24',
  },
  greenZone: {
    backgroundColor: '#4ade80',
  },
  markerLabel: {
    fontSize: 12,
    color: '#666',
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  activeLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  redText: {
    color: '#ef4444',
  },
  yellowText: {
    color: '#fbbf24',
  },
  greenText: {
    color: '#4ade80',
  },
  slider: {
    width: '100%',
    height: 40,
    zIndex: 3,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  endLabel: {
    fontSize: 12,
    color: '#666',
    maxWidth: '45%',
  },
  rightLabel: {
    textAlign: 'right',
  },
});

export default PhysicalLiteracySlider;