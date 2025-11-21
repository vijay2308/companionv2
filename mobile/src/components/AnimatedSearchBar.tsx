import React, { useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    withSpring,
    useSharedValue,
    withRepeat,
    withSequence,
} from 'react-native-reanimated';
import { Mic, ArrowRight, Search, Globe } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface AnimatedSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    isExpanded: boolean;
    onFocus?: () => void;
    isListening?: boolean;
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
    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        if (isListening) {
            pulseAnim.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            pulseAnim.value = withTiming(1);
        }
    }, [isListening]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(isExpanded ? '100%' : '90%', { duration: 300 }) as any,
            transform: [
                { translateY: withTiming(isExpanded ? 0 : 0, { duration: 300 }) }
            ],
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
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={[styles.inputWrapper, isListening && styles.inputWrapperActive]}>
                <View style={styles.iconContainer}>
                    {isExpanded ? (
                        <Globe color={COLORS.primary} size={20} />
                    ) : (
                        <Search color={COLORS.textSecondary} size={20} />
                    )}
                </View>

                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={isListening ? "Listening..." : value}
                    onChangeText={onChangeText}
                    placeholder="Ask anything..."
                    placeholderTextColor={COLORS.textSecondary}
                    onFocus={onFocus}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="search"
                    editable={!isListening}
                />

                <View style={styles.rightActions}>
                    {value.length > 0 && !isListening ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.sendButton]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            <ArrowRight color={COLORS.background} size={20} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleMicPress}
                        >
                            <Animated.View style={micStyle}>
                                <Mic
                                    color={isListening ? COLORS.error : COLORS.textSecondary}
                                    size={20}
                                    fill={isListening ? COLORS.error : 'none'}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 56,
        paddingHorizontal: SPACING.m,
        ...SHADOWS.medium,
    },
    inputWrapperActive: {
        borderColor: COLORS.error,
        borderWidth: 1.5,
    },
    iconContainer: {
        marginRight: SPACING.s,
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        height: '100%',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    actionButton: {
        padding: SPACING.xs,
        borderRadius: RADIUS.round,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.s,
    },
});
