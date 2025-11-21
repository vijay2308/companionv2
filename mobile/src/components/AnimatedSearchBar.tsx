import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard, ActivityIndicator } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    withSpring,
    useSharedValue,
    withRepeat,
    withSequence,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { Mic, ArrowRight, Search, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface AnimatedSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    isExpanded: boolean;
    onFocus?: () => void;
    isListening?: boolean;
    isLoading?: boolean;
    onMicPress?: () => void;
}

export const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({
    value,
    onChangeText,
    onSubmit,
    isExpanded,
    onFocus,
    isLoading,
    isListening,
    onMicPress
}) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const pulseAnim = useSharedValue(1);
    const focusAnim = useSharedValue(0);

    useEffect(() => {
        if (isListening) {
            pulseAnim.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                true
            );
        } else {
            pulseAnim.value = withTiming(1, { duration: 300 });
        }
    }, [isListening]);

    useEffect(() => {
        focusAnim.value = withSpring(isFocused ? 1 : 0, {
            damping: 15,
            stiffness: 150,
        });
    }, [isFocused]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(isExpanded ? '100%' : '90%', { duration: 300 }) as any,
        };
    });

    const animatedInputWrapperStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            focusAnim.value,
            [0, 1],
            [1, 1.02],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ scale }],
        };
    });

    const micStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseAnim.value }],
            opacity: isListening ? 0.8 : 1
        };
    });

    const handleSubmit = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSubmit();
    };

    const handleMicPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onMicPress?.();
    };

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            <Animated.View style={[animatedInputWrapperStyle]}>
                <View style={[
                    styles.inputWrapper,
                    isListening && styles.inputWrapperListening,
                    isFocused && styles.inputWrapperFocused,
                ]}>
                    <View style={styles.iconContainer}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Sparkles
                                color={isFocused ? COLORS.primary : COLORS.textSecondary}
                                size={20}
                            />
                        )}
                    </View>

                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={isListening ? "Listening..." : value}
                        onChangeText={onChangeText}
                        placeholder="Ask anything..."
                        placeholderTextColor={COLORS.textSecondary}
                        onFocus={() => {
                            setIsFocused(true);
                            onFocus?.();
                        }}
                        onBlur={() => setIsFocused(false)}
                        onSubmitEditing={handleSubmit}
                        returnKeyType="search"
                        editable={!isListening && !isLoading}
                        multiline={false}
                    />

                    <View style={styles.rightActions}>
                        {value.length > 0 && !isListening && !isLoading ? (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.sendButton]}
                                onPress={handleSubmit}
                                activeOpacity={0.8}
                            >
                                <ArrowRight color={COLORS.background} size={20} strokeWidth={2.5} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleMicPress}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Animated.View style={micStyle}>
                                    <Mic
                                        color={isListening ? COLORS.primary : COLORS.textSecondary}
                                        size={20}
                                        fill={isListening ? COLORS.primary : 'none'}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 680,
        alignSelf: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.round,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        height: 56,
        paddingHorizontal: SPACING.m,
        ...SHADOWS.medium,
    },
    inputWrapperFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surfaceHighlight,
    },
    inputWrapperListening: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(43, 184, 167, 0.05)',
    },
    iconContainer: {
        marginRight: SPACING.s,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.body,
        fontSize: 16,
        color: COLORS.text,
        paddingVertical: SPACING.m,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    actionButton: {
        padding: SPACING.xs,
        borderRadius: RADIUS.round,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButton: {
        backgroundColor: COLORS.primary,
    },
});
