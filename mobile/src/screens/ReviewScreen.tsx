import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';

export default function ReviewScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Actions</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Pending Approval</Text>

                {/* Example Action Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Send Email</Text>
                        <Text style={styles.cardSubtitle}>Gmail</Text>
                    </View>
                    <Text style={styles.cardBody}>
                        To: hr@company.com{'\n'}
                        Subject: Graduation Certificate{'\n'}
                        Attachment: certificate.pdf
                    </Text>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
                            <X color={COLORS.text} size={20} />
                            <Text style={styles.buttonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
                            <Check color={COLORS.text} size={20} />
                            <Text style={styles.buttonText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
    },
    content: {
        flex: 1,
        padding: SPACING.m,
    },
    sectionTitle: {
        ...TYPOGRAPHY.caption,
        marginBottom: SPACING.m,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.s,
    },
    cardTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
    },
    cardSubtitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
    },
    cardBody: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        lineHeight: 24,
    },
    cardActions: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        gap: SPACING.xs,
    },
    rejectButton: {
        backgroundColor: COLORS.surfaceHighlight,
    },
    approveButton: {
        backgroundColor: COLORS.primary,
    },
    buttonText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        fontWeight: '600',
    },
});
