import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, Cloud, Smartphone, Zap, Bell, Shield, Info, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/theme';
import { AnimatedGradient } from '../components/AnimatedGradient';
import { GlassView } from '../components/GlassView';

export default function SettingsScreen({ navigation }: any) {
    const [isPilotMode, setIsPilotMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const handleModeToggle = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsPilotMode(value);
    };

    const handleNotificationToggle = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setNotifications(value);
    };

    const SettingItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
                Haptics.selectionAsync();
                onPress?.();
            }}
            activeOpacity={0.7}
        >
            <View style={styles.settingIconContainer}>
                <Icon size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <AnimatedGradient />
            <SafeAreaView style={styles.safeArea}>
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={styles.header}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            Haptics.selectionAsync();
                            navigation.goBack();
                        }}
                    >
                        <ArrowLeft color={COLORS.text} size={22} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={{ width: 40 }} />
                </Animated.View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <Text style={styles.sectionTitle}>Operation Mode</Text>
                        <GlassView style={styles.modeCard} intensity={60}>
                            <View style={styles.modeInfo}>
                                <View style={styles.modeHeader}>
                                    <View style={[
                                        styles.modeIconContainer,
                                        isPilotMode && styles.modeIconContainerActive
                                    ]}>
                                        {isPilotMode ? (
                                            <Smartphone color={isPilotMode ? COLORS.primary : COLORS.textSecondary} size={24} />
                                        ) : (
                                            <Cloud color={COLORS.primary} size={24} />
                                        )}
                                    </View>
                                    <View style={styles.modeTitleContainer}>
                                        <Text style={styles.modeTitle}>
                                            {isPilotMode ? 'Pilot Mode' : 'Concierge Mode'}
                                        </Text>
                                        <Text style={styles.modeLabel}>
                                            {isPilotMode ? 'Direct Control' : 'Cloud-Based'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.modeDescription}>
                                    {isPilotMode
                                        ? 'Agent controls your device directly to automate tasks and apps.'
                                        : 'Agent uses cloud APIs to perform tasks in the background without device control.'}
                                </Text>
                            </View>
                            <Switch
                                value={isPilotMode}
                                onValueChange={handleModeToggle}
                                trackColor={{ false: COLORS.surfaceHighlight, true: COLORS.primary }}
                                thumbColor={COLORS.text}
                                ios_backgroundColor={COLORS.surfaceHighlight}
                            />
                        </GlassView>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <GlassView style={styles.preferencesCard} intensity={60}>
                            <View style={styles.preferenceItem}>
                                <View style={styles.preferenceLeft}>
                                    <View style={styles.preferenceIconContainer}>
                                        <Bell size={18} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.preferenceTitle}>Notifications</Text>
                                </View>
                                <Switch
                                    value={notifications}
                                    onValueChange={handleNotificationToggle}
                                    trackColor={{ false: COLORS.surfaceHighlight, true: COLORS.primary }}
                                    thumbColor={COLORS.text}
                                    ios_backgroundColor={COLORS.surfaceHighlight}
                                />
                            </View>
                        </GlassView>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <GlassView style={styles.aboutCard} intensity={60}>
                            <SettingItem
                                icon={Shield}
                                title="Privacy & Security"
                                subtitle="Manage your data and permissions"
                                onPress={() => {}}
                            />
                            <View style={styles.divider} />
                            <SettingItem
                                icon={Info}
                                title="About Companion"
                                subtitle="Version 1.0.0"
                                onPress={() => {}}
                            />
                        </GlassView>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: SPACING.m,
        paddingBottom: SPACING.xxl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textTertiary,
        marginBottom: SPACING.m,
        marginTop: SPACING.l,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    modeCard: {
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    modeInfo: {
        flex: 1,
        marginRight: SPACING.m,
    },
    modeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    modeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.m,
        backgroundColor: 'rgba(43, 184, 167, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeIconContainerActive: {
        backgroundColor: 'rgba(43, 184, 167, 0.15)',
    },
    modeTitleContainer: {
        flex: 1,
    },
    modeTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
    },
    modeLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '500',
    },
    modeDescription: {
        ...TYPOGRAPHY.caption,
        fontSize: 14,
        lineHeight: 20,
        color: COLORS.textSecondary,
    },
    preferencesCard: {
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    preferenceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
        flex: 1,
    },
    preferenceIconContainer: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.s,
        backgroundColor: 'rgba(43, 184, 167, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    preferenceTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        fontWeight: '500',
    },
    aboutCard: {
        borderRadius: RADIUS.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        gap: SPACING.m,
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.s,
        backgroundColor: 'rgba(43, 184, 167, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    settingSubtitle: {
        ...TYPOGRAPHY.caption,
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.m,
    },
});
