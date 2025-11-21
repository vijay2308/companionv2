import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/theme';
import { Copy, ThumbsUp, ThumbsDown, Share2, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ThreadItemProps {
    message: {
        id: string;
        text: string;
        sender: 'user' | 'agent';
        actions?: any[];
        decision?: any;
        decisionRequired?: boolean;
    };
}

export const ThreadItem: React.FC<ThreadItemProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

    const handleFeedback = (type: 'up' | 'down') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFeedbackGiven(type);
    };

    if (isUser) {
        return (
            <Animated.View
                entering={FadeInDown.duration(300)}
                style={styles.userContainer}
            >
                <View style={styles.userBubble}>
                    <Text style={styles.userText}>{message.text}</Text>
                </View>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.agentContainer}
        >
            <View style={styles.headerRow}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarGradient}>
                        <Text style={styles.avatarText}>C</Text>
                    </View>
                </View>
                <Text style={styles.agentName}>Companion</Text>
            </View>

            <View style={styles.responseContainer}>
                <Text style={styles.agentText}>{message.text}</Text>
            </View>

            {message.actions && message.actions.length > 0 && (
                <Animated.View
                    entering={FadeIn.duration(400).delay(200)}
                    style={styles.sourcesContainer}
                >
                    <View style={styles.sectionHeader}>
                        <CheckCircle size={14} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Actions Performed</Text>
                    </View>
                    <View style={styles.sourcesList}>
                        {message.actions.map((action, idx) => (
                            <Animated.View
                                key={idx}
                                entering={FadeIn.duration(300).delay(250 + idx * 50)}
                            >
                                <TouchableOpacity
                                    style={styles.sourceCard}
                                    onPress={() => Haptics.selectionAsync()}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.sourceIndex}>{idx + 1}</Text>
                                    <Text style={styles.sourceTitle} numberOfLines={1}>
                                        {action.tool}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>
            )}

            {message.decisionRequired && (
                <Animated.View
                    entering={FadeIn.duration(400).delay(300)}
                    style={styles.decisionContainer}
                >
                    <View style={styles.decisionHeader}>
                        <AlertCircle size={18} color={COLORS.warning} />
                        <Text style={styles.decisionTitle}>Confirmation Needed</Text>
                    </View>
                    <Text style={styles.decisionText}>
                        I need your permission to proceed with this action.
                    </Text>
                    <View style={styles.decisionActions}>
                        <TouchableOpacity
                            style={[styles.decisionButton, styles.denyButton]}
                            onPress={() => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.denyButtonText}>Deny</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.decisionButton, styles.approveButton]}
                            onPress={() => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.approveButtonText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={() => {
                        Haptics.selectionAsync();
                    }}
                    activeOpacity={0.6}
                >
                    <Copy size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={() => {
                        Haptics.selectionAsync();
                    }}
                    activeOpacity={0.6}
                >
                    <Share2 size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <View style={styles.spacer} />
                <TouchableOpacity
                    style={[styles.footerButton, feedbackGiven === 'up' && styles.footerButtonActive]}
                    onPress={() => handleFeedback('up')}
                    activeOpacity={0.6}
                >
                    <ThumbsUp
                        size={16}
                        color={feedbackGiven === 'up' ? COLORS.primary : COLORS.textSecondary}
                        fill={feedbackGiven === 'up' ? COLORS.primary : 'none'}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.footerButton, feedbackGiven === 'down' && styles.footerButtonActive]}
                    onPress={() => handleFeedback('down')}
                    activeOpacity={0.6}
                >
                    <ThumbsDown
                        size={16}
                        color={feedbackGiven === 'down' ? COLORS.error : COLORS.textSecondary}
                        fill={feedbackGiven === 'down' ? COLORS.error : 'none'}
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    userContainer: {
        paddingVertical: SPACING.l,
        alignItems: 'flex-end',
    },
    userBubble: {
        maxWidth: '85%',
        paddingVertical: SPACING.m,
    },
    userText: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600',
    },
    agentContainer: {
        paddingVertical: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    avatarContainer: {
        marginRight: SPACING.s,
    },
    avatarGradient: {
        width: 28,
        height: 28,
        borderRadius: RADIUS.m,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    avatarText: {
        color: COLORS.background,
        fontWeight: '700',
        fontSize: 14,
    },
    agentName: {
        ...TYPOGRAPHY.caption,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    responseContainer: {
        marginBottom: SPACING.m,
    },
    agentText: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 26,
    },
    sourcesContainer: {
        marginTop: SPACING.m,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.s,
    },
    sectionTitle: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    sourcesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.s,
    },
    sourceCard: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.m,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border,
        maxWidth: 180,
    },
    sourceIndex: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primary,
        backgroundColor: 'rgba(43, 184, 167, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.round,
        minWidth: 24,
        textAlign: 'center',
    },
    sourceTitle: {
        ...TYPOGRAPHY.caption,
        fontSize: 13,
        flex: 1,
        color: COLORS.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.m,
        paddingTop: SPACING.m,
        gap: SPACING.m,
    },
    footerButton: {
        padding: SPACING.xs,
        borderRadius: RADIUS.s,
    },
    footerButtonActive: {
        backgroundColor: COLORS.surfaceHighlight,
    },
    spacer: {
        flex: 1,
    },
    decisionContainer: {
        marginTop: SPACING.m,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        borderWidth: 1.5,
        borderColor: COLORS.warning,
        ...SHADOWS.medium,
    },
    decisionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.s,
    },
    decisionTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.warning,
    },
    decisionText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.m,
    },
    decisionActions: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    decisionButton: {
        flex: 1,
        paddingVertical: SPACING.m,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButton: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.light,
    },
    denyButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    approveButtonText: {
        ...TYPOGRAPHY.button,
        fontSize: 15,
        color: COLORS.background,
        fontWeight: '600',
    },
    denyButtonText: {
        ...TYPOGRAPHY.button,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600',
    },
});
