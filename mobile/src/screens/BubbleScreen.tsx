import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, NativeModules, NativeEventEmitter } from 'react-native';
import { MessageSquare, X, Maximize2, Pause, CheckCircle, Play } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import bubbleNotification from '../services/bubbleNotification';

const { BubbleNotification } = NativeModules;
const bubbleEmitter = new NativeEventEmitter(BubbleNotification);

const INITIAL_STATUS = {
    message: "Ready",
    status: "idle",
    progress: 0
};

export default function BubbleScreen() {
    const [status, setStatus] = useState(INITIAL_STATUS);

    useEffect(() => {
        const subscription = bubbleEmitter.addListener('BubbleUpdate', (event) => {
            setStatus(event);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const handleDismiss = () => {
        bubbleNotification.dismiss();
    };

    const handleOpenApp = () => {
        bubbleNotification.dismiss();
        // Intent to open main app would be handled by native side usually, 
        // or we just close this and let user tap the notification if it exists.
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconContainer}>
                            <MessageSquare size={14} color={COLORS.primary} />
                        </View>
                        <Text style={styles.headerTitle}>Companion</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={handleOpenApp} style={styles.iconButton}>
                            <Maximize2 size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDismiss} style={styles.iconButton}>
                            <X size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.statusRow}>
                        {status.status === 'running' ? (
                            <ActivityIndicator size="small" color={COLORS.primary} style={styles.statusIcon} />
                        ) : status.status === 'completed' ? (
                            <CheckCircle size={18} color={COLORS.success} style={styles.statusIcon} />
                        ) : (
                            <View style={[styles.statusIcon, { width: 18, height: 18 }]} />
                        )}
                        <Text style={styles.statusText} numberOfLines={1}>
                            {status.message}
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    {status.status === 'running' && (
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressBar, { width: `${status.progress}%` }]} />
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                            <Text style={styles.primaryActionText}>Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.s,
        justifyContent: 'center', // Center vertically in the bubble activity
        backgroundColor: 'transparent',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: RADIUS.s,
        backgroundColor: 'rgba(43, 184, 167, 0.1)', // Primary with opacity
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.s,
    },
    headerTitle: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.text,
    },
    headerRight: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 4,
        marginLeft: SPACING.xs,
    },
    content: {
        gap: SPACING.m,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        marginRight: SPACING.s,
    },
    statusText: {
        ...TYPOGRAPHY.body,
        fontSize: 15,
        flex: 1,
    },
    progressTrack: {
        height: 4,
        backgroundColor: COLORS.surfaceHighlight,
        borderRadius: RADIUS.round,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    actionButton: {
        flex: 1,
        paddingVertical: SPACING.s,
        alignItems: 'center',
        borderRadius: RADIUS.m,
        backgroundColor: COLORS.surfaceHighlight,
    },
    primaryAction: {
        backgroundColor: COLORS.primary,
    },
    actionButtonText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.text,
    },
    primaryActionText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.background, // Dark text on teal button
    },
});
