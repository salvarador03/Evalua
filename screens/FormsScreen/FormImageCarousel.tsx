import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Animated,
} from 'react-native';

interface FormImageCarouselProps {
    userAge: number;
    isFormCompleted: boolean;
}

const FormImageCarousel: React.FC<FormImageCarouselProps> = ({ userAge, isFormCompleted }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Define image sets based on age groups
    const childImages = [
        require("../../assets/images/preguntas/kids/primera_pregunta.webp"),
        require("../../assets/images/preguntas/kids/segunda_pregunta.webp"),
        require("../../assets/images/preguntas/kids/tercera_pregunta.webp"),
        require("../../assets/images/preguntas/kids/cuarta_pregunta.webp"),
        require("../../assets/images/preguntas/kids/quinta_pregunta.webp"),
        require("../../assets/images/preguntas/kids/sexta_pregunta.webp"),
        require("../../assets/images/preguntas/kids/septima_pregunta.webp"),
    ];

    const teenImages = [
        require("../../assets/images/preguntas/teen/primera_pregunta.webp"),
        require("../../assets/images/preguntas/teen/segunda_pregunta.webp"),
        require("../../assets/images/preguntas/teen/tercera_pregunta.webp"),
        require("../../assets/images/preguntas/teen/cuarta_pregunta.webp"),
        require("../../assets/images/preguntas/teen/quinta_pregunta.webp"),
        require("../../assets/images/preguntas/teen/sexta_pregunta.webp"),
        require("../../assets/images/preguntas/teen/septima_pregunta.webp"),
    ];

    const universityImages = [
        require("../../assets/images/preguntas/universitary/primera_pregunta.webp"),
        require("../../assets/images/preguntas/universitary/segunda_pregunta.webp"),
        require("../../assets/images/preguntas/universitary/tercera_pregunta.webp"),
        require("../../assets/images/preguntas/universitary/cuarta_pregunta.webp"),
        require("../../assets/images/preguntas/universitary/quinta_pregunta.webp"),
        require("../../assets/images/preguntas/universitary/sexta_pregunta.webp"),
        require("../../assets/images/preguntas/universitary/septima_pregunta.webp"),
    ];

    const getImageSet = () => {
        if (userAge >= 18 && userAge <= 24) return universityImages;
        if (userAge >= 12 && userAge < 18) return teenImages;
        return childImages;
    };

    const images = getImageSet();
    const defaultImage = require("../../assets/images/foto_primer_form.webp");

    const navigateImage = (direction: number) => {
        fadeOut();
        setTimeout(() => {
            setCurrentImageIndex((prevIndex) => {
                const newIndex = prevIndex + direction;
                if (newIndex < 0) return images.length - 1;
                if (newIndex >= images.length) return 0;
                return newIndex;
            });
            fadeIn();
        }, 300);
    };

    const fadeOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const fadeIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        if (isFormCompleted) {
            return;
        }

        const interval = setInterval(() => {
            navigateImage(1);
        }, 5000); // Increased interval time to 5000ms (5 seconds)

        return () => clearInterval(interval);
    }, [isFormCompleted, images.length]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.imageContainer,
                    {
                        opacity: fadeAnim
                    }
                ]}
            >
                <Image
                    source={isFormCompleted ? defaultImage : images[currentImageIndex]}
                    style={styles.image}
                    resizeMode="contain"
                />
            </Animated.View>

            {!isFormCompleted && (
                <View style={styles.dotsContainer}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentImageIndex && styles.activeDot
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 280,
        position: 'relative',
        backgroundColor: '#FFF',
        borderRadius: 15,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        resizeMode: 'contain',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(158, 118, 118, 0.3)',
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: 'rgba(158, 118, 118, 0.8)',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

export default FormImageCarousel;
