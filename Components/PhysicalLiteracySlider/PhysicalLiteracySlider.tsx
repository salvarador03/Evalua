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
  readOnly?: boolean;
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
  language,
  readOnly = false
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
        message: '',
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

  // Modificar el renderScaleMarkers y el estilo de los labels
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
                    styles.greenText,
                // Añadir estilo especial para los extremos
                (mark === 0 || mark === 10) && styles.extremeLabel
              ]}>
                {mark}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const ExtremeLine = ({ isStart }: { isStart: boolean }) => (
    <View style={[
      styles.extremeLineContainer,
      isStart ? styles.extremeLineStart : styles.extremeLineEnd
    ]}>
      <View style={[
        styles.extremeLine,
        isStart ? styles.redLine : styles.greenLine
      ]} />
    </View>
  );

// Modificar el renderizado de las etiquetas
const renderLabels = () => {
  return (
    <View style={styles.labelContainer}>
      <View style={[styles.valueContainer, { alignItems: 'flex-start' }]}>
        {/* <ExtremeLine isStart={true} /> */}
        {/* <Text style={[styles.valueNumberLeft, { color: '#ef4444', marginLeft: 0 }]}>0</Text> */}
        <Text style={[styles.labelText, { marginLeft: 0 }]}>{minLabel}</Text>
      </View>
      <View style={[styles.valueContainer, { alignItems: 'flex-end' }]}>
        {/*<ExtremeLine isStart={false} />*/}
        {/* <Text style={[styles.valueNumberRight, { color: '#4ade80', marginRight: 0 }]}>10</Text> */}
        <Text style={[styles.labelText, { marginRight: 0 }]}>{maxLabel}</Text>
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
          onValueChange={readOnly ? undefined : onChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#ffffff"
          disabled={readOnly}
        />
      </View>
      {renderLabels()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  extremeContainer: {
    alignItems: 'center',
  },
  extremeLineContainer: {
    alignItems: 'center',
    position: 'relative',
    height: 20, // Altura de la línea vertical
    marginBottom: 5, // Espacio entre la línea y el texto
  },

  extremeLine: {
    width: 2, // Ancho de la línea
    height: '100%',
    backgroundColor: '#666', // Color de la línea
  },

  extremeLineStart: {
    alignItems: 'flex-start',
    marginLeft: 10, // Alinear con el inicio del slider
  },

  extremeLineEnd: {
    alignItems: 'flex-end',
    marginRight: 10, // Alinear con el final del slider
  },
  leftExtreme: {
    textAlign: 'left',
    fontWeight: '500',
  },
  rightExtreme: {
    textAlign: 'right',
    fontWeight: '500',
  },
  redLine: {
    backgroundColor: '#ef4444', // Color rojo que coincide con el inicio
  },

  greenLine: {
    backgroundColor: '#4ade80', // Color verde que coincide con el final
  },
  extremeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  extremeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rightLabel: {
    alignItems: 'flex-end',
  },
  leftLabel: {
    alignItems: 'flex-start',
  },
  valueNumberLeft: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 15,  // Añade este margen para separar el número del texto
  },
  valueNumberRight: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 11,  // Añade este margen para separar el número del texto
  },
  labelText: {
    fontSize: 12,
    color: '#666',
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
    marginHorizontal: 0, // Cambiado de 10 a 0
    justifyContent: 'center',
  },
  sliderTrackBase: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    top: '50%',
    marginTop: -2,
    zIndex: 1,
  },
  sliderTrackActive: {
    position: 'absolute',
    left: 10,
    height: 4,
    borderRadius: 2,
    top: '50%',
    marginTop: -2,
    zIndex: 1, // Cambiado de 2 a 1 para que esté por debajo
  },
  markersContainer: {
    position: 'absolute',
    width: '100%',
    paddingVertical: 15,
    zIndex: 2, // Aumentado para que esté por encima de las líneas
  },
  markersInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
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
    textAlign: 'center',
    width: 20,
    zIndex: 3, // Añadido para asegurar que está por encima
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
    zIndex: 4, // Aumentado para que esté por encima de todo
  },
  valueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start', // para el 0
  },
  valueContainerRight: {
    alignItems: 'flex-end', // para el 10
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  endLabel: {
    alignItems: 'flex-start',
  },
});

export default PhysicalLiteracySlider;