import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { ArrowLeft, Cloud, Smartphone } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';

export default function SettingsScreen({ navigation }: any) {
    const [isPilotMode, setIsPilotMode] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Operation Mode</Text>

                <View style={styles.modeCard}>
                    <View style={styles.modeInfo}>
                        <View style={styles.modeHeader}>
                            {isPilotMode ? (
                                <Smartphone color={COLORS.secondary} size={24} />
                            ) : (
                                <Cloud color={COLORS.primary} size={24} />
                            )}
                            <Text style={styles.modeTitle}>
                                {isPilotMode ? 'Pilot Mode' : 'Concierge Mode'}
                            </Text>
                        </View>
                        <Text style={styles.modeDescription}>
                            {isPilotMode
                                ? 'Agent controls your device directly to automate apps.'
                                : 'Agent uses cloud APIs to perform tasks in the background.'}
                        </Text>
                    </View>
                    <Switch
                        value={isPilotMode}
                        onValueChange={setIsPilotMode}
                        trackColor={{ false: COLORS.surfaceHighlight, true: COLORS.secondary }}
                        thumbColor={COLORS.text}
                    />
                </View>
            </View>
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
    modeCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modeInfo: {
        flex: 1,
        marginRight: SPACING.m,
    },
    modeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.xs,
    },
    modeTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 16,
    },
    modeDescription: {
        ...TYPOGRAPHY.caption,
        lineHeight: 20,
    },
});
