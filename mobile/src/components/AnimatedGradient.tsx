import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedGradientProps {
    children?: React.ReactNode;
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ children }) => {
    const animation = useSharedValue(0);

    useEffect(() => {
        animation.value = withRepeat(
            withTiming(1, { duration: 8000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animation.value,
            [0, 0.5, 1],
            [0.6, 0.8, 0.6],
            Extrapolate.CLAMP
        );

        return {
            opacity,
        };
    });

    return (
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
            <LinearGradient
                colors={['#191A1A', '#1A1A2E', '#202838', '#1A1A2E', '#191A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </Animated.View>
    );
};
