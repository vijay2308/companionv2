import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { Copy, ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from 'lucide-react-native';
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

    if (isUser) {
        return (
            <View style={styles.userContainer}>
                <Text style={styles.userText}>{message.text}</Text>
            </View>
        );
    }

    return (
        <View style={styles.agentContainer}>
            <View style={styles.headerRow}>
                <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>C</Text>
                </View>
                <Text style={styles.agentName}>Companion</Text>
            </View>

            <Text style={styles.agentText}>{message.text}</Text>

            {/* Sources / Actions Section */}
            {message.actions && message.actions.length > 0 && (
                <View style={styles.sourcesContainer}>
                    <Text style={styles.sectionTitle}>Sources</Text>
                    <View style={styles.sourcesList}>
                        {message.actions.map((action, idx) => (
                            <View key={idx} style={styles.sourceCard}>
                                <Text style={styles.sourceTitle} numberOfLines={1}>
                                    {action.tool}
                                </Text>
                                <Text style={styles.sourceIndex}>{idx + 1}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Decision Required Section */}
            {message.decisionRequired && (
                <View style={styles.decisionContainer}>
                    <View style={styles.decisionHeader}>
                        <Text style={styles.decisionTitle}>Input Needed</Text>
                    </View>
                    <Text style={styles.decisionText}>
                        The agent needs your confirmation to proceed with the following action.
                    </Text>
                    <View style={styles.decisionActions}>
                        <TouchableOpacity
                            style={[styles.decisionButton, styles.denyButton]}
                            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)}
                        >
                            <Text style={styles.denyButtonText}>Deny</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.decisionButton, styles.approveButton]}
                            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
                        >
                            <Text style={styles.approveButtonText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Footer Actions */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerButton} onPress={() => Haptics.selectionAsync()}>
                    <Copy size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={() => Haptics.selectionAsync()}>
                    <Share2 size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <View style={styles.spacer} />
                <TouchableOpacity style={styles.footerButton} onPress={() => Haptics.selectionAsync()}>
                    <ThumbsUp size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={() => Haptics.selectionAsync()}>
                    <ThumbsDown size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    userContainer: {
        paddingVertical: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    userText: {
        ...TYPOGRAPHY.h1,
        fontSize: 28,
        lineHeight: 36,
    },
    agentContainer: {
        paddingVertical: SPACING.l,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    logoPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.s,
    },
    logoText: {
        color: COLORS.background,
        fontWeight: 'bold',
        fontSize: 14,
    },
    agentName: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.text,
    },
    agentText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        lineHeight: 26,
    },
    sourcesContainer: {
        marginTop: SPACING.l,
    },
    sectionTitle: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sourcesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.s,
    },
    sourceCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.s,
        borderRadius: RADIUS.s,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 100,
        maxWidth: 160,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sourceTitle: {
        ...TYPOGRAPHY.caption,
        flex: 1,
        marginRight: SPACING.s,
    },
    sourceIndex: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        backgroundColor: COLORS.surfaceHighlight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.round,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.l,
        gap: SPACING.m,
    },
    footerButton: {
        padding: SPACING.xs,
    },
    spacer: {
        flex: 1,
    },
    decisionContainer: {
        marginTop: SPACING.l,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    decisionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    decisionTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 16,
        color: COLORS.warning,
    },
    decisionText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
    },
    decisionActions: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    decisionButton: {
        flex: 1,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButton: {
        backgroundColor: COLORS.primary,
    },
    denyButton: {
        backgroundColor: COLORS.surfaceHighlight,
    },
    approveButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.background,
        fontWeight: '600',
    },
    denyButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.text,
    },
});
