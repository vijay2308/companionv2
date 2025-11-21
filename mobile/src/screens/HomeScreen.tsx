import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, Platform, KeyboardAvoidingView, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, Layout, SlideInUp } from 'react-native-reanimated';
import { Compass, Menu, Plus, Sparkles, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { showBubble, completeBubble, dismissBubble } from '../services/bubbleNotification';
import voiceService from '../services/voiceService';
import { AnimatedSearchBar } from '../components/AnimatedSearchBar';
import { ThreadItem } from '../components/ThreadItem';
import { GlassView } from '../components/GlassView';
import { AnimatedGradient } from '../components/AnimatedGradient';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    actions?: Array<{ tool: string; args: any }>;
    toolOutput?: string[];
    decisionRequired?: boolean;
    decision?: any;
}

export default function HomeScreen({ navigation }: any) {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'concierge' | 'pilot'>('pilot');
    const [isThreadActive, setIsThreadActive] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const flatListRef = useRef<FlatList>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Voice state
    const [isListening, setIsListening] = useState(false);

    const handleVoiceToggle = async () => {
        if (isListening) {
            await voiceService.stopListening();
            setIsListening(false);
        } else {
            setIsListening(true);
            try {
                const result = await voiceService.startListening((text) => {
                    setQuery(text);
                });

                if (result) {
                    setQuery(result);
                    // Optional: auto-submit after a pause?
                }
            } catch (error) {
                console.error('Voice error:', error);
            } finally {
                setIsListening(false);
            }
        }
    };

    const handleSearchSubmit = async () => {
        if (!query.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const userText = query;
        setQuery('');
        setShowSuggestions(false);
        setIsThreadActive(true);

        // Add user message
        const userMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
        setChatHistory(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/agent/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, mode }),
            });

            const data = await response.json();

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I didn't get that.",
                sender: 'agent',
                actions: data.actions,
                toolOutput: data.toolOutput,
                decisionRequired: data.decisionRequired,
                decision: data.decision,
            };

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setChatHistory(prev => [...prev, agentMsg]);

            // Handle Bubble notifications
            const hasDeviceActions = data.actions && data.actions.length > 0 &&
                data.actions.some((action: any) => action.tool.startsWith('mobile_'));

            if (mode === 'pilot' && hasDeviceActions) {
                if (data.decisionRequired) {
                    await showBubble({
                        title: 'Companion',
                        message: 'Input needed',
                        status: 'running',
                    });
                } else {
                    await completeBubble({
                        message: 'Task complete!',
                    });
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                text: "Sorry, I couldn't connect to the server.",
                sender: 'agent'
            };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        { text: 'Summarize this article', icon: '📄' },
        { text: 'Plan a trip to Tokyo', icon: '✈️' },
        { text: 'Debug my code', icon: '🐛' },
        { text: 'Write an email', icon: '✉️' },
        { text: 'Translate to Spanish', icon: '🌐' },
        { text: 'Create a workout plan', icon: '💪' },
    ];

    const renderHero = () => (
        <ScrollView
            ref={scrollViewRef}
            style={styles.heroScrollContainer}
            contentContainerStyle={styles.heroContainer}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View
                entering={FadeInDown.duration(800).delay(100)}
                style={styles.heroContent}
            >
                <Animated.View
                    entering={FadeInDown.duration(600).delay(200)}
                    style={styles.logoContainer}
                >
                    <View style={styles.logoGlow}>
                        <Zap color={COLORS.primary} size={40} fill={COLORS.primary} />
                    </View>
                </Animated.View>

                <Animated.Text
                    entering={FadeInDown.duration(600).delay(300)}
                    style={styles.heroTitle}
                >
                    Where knowledge begins
                </Animated.Text>

                <Animated.Text
                    entering={FadeInDown.duration(600).delay(400)}
                    style={styles.heroSubtitle}
                >
                    Ask anything. Get instant answers.
                </Animated.Text>

                <Animated.View
                    entering={FadeInDown.duration(600).delay(500)}
                    style={styles.searchBarContainer}
                >
                    <AnimatedSearchBar
                        value={query}
                        onChangeText={setQuery}
                        onSubmit={handleSearchSubmit}
                        isExpanded={false}
                        isListening={isListening}
                        onMicPress={handleVoiceToggle}
                    />
                </Animated.View>

                {showSuggestions && (
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(600)}
                        style={styles.suggestionsWrapper}
                    >
                        <Text style={styles.suggestionsLabel}>Try asking:</Text>
                        <View style={styles.suggestionsContainer}>
                            {suggestions.map((suggestion, idx) => (
                                <Animated.View
                                    key={idx}
                                    entering={FadeInDown.duration(400).delay(700 + idx * 100)}
                                >
                                    <TouchableOpacity
                                        style={styles.suggestionChip}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setQuery(suggestion.text);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                                        <Text style={styles.suggestionText}>{suggestion.text}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>
                )}
            </Animated.View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AnimatedGradient />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <Animated.View
                    entering={FadeIn.duration(400)}
                    style={styles.header}
                >
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.selectionAsync();
                            navigation.navigate('Settings');
                        }}
                        style={styles.headerButton}
                    >
                        <Menu color={COLORS.text} size={22} />
                    </TouchableOpacity>
                    <Text style={styles.headerLogo}>Companion</Text>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setIsThreadActive(false);
                            setChatHistory([]);
                            setShowSuggestions(true);
                        }}
                    >
                        <Plus color={COLORS.text} size={22} />
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.content}>
                    {!isThreadActive ? (
                        renderHero()
                    ) : (
                        <Animated.View
                            entering={FadeIn.duration(400)}
                            style={styles.threadContainer}
                        >
                            <FlatList
                                ref={flatListRef}
                                data={chatHistory}
                                keyExtractor={item => item.id}
                                renderItem={({ item, index }) => (
                                    <Animated.View
                                        entering={SlideInUp.duration(400).delay(index * 100)}
                                        layout={Layout.duration(300)}
                                    >
                                        <ThreadItem message={item} />
                                    </Animated.View>
                                )}
                                contentContainerStyle={styles.threadContent}
                                showsVerticalScrollIndicator={false}
                            />

                            <GlassView style={styles.bottomInputContainer} intensity={80}>
                                <AnimatedSearchBar
                                    value={query}
                                    onChangeText={setQuery}
                                    onSubmit={handleSearchSubmit}
                                    isExpanded={true}
                                    isLoading={isLoading}
                                    isListening={isListening}
                                    onMicPress={handleVoiceToggle}
                                />
                            </GlassView>
                        </Animated.View>
                    )}
                </View>
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
        zIndex: 10,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
    },
    headerLogo: {
        ...TYPOGRAPHY.h3,
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
    },
    heroScrollContainer: {
        flex: 1,
    },
    heroContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.xxl,
    },
    heroContent: {
        alignItems: 'center',
        gap: SPACING.l,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.s,
    },
    logoGlow: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        backgroundColor: 'rgba(43, 184, 167, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    heroTitle: {
        ...TYPOGRAPHY.h1,
        fontSize: 36,
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: -1,
    },
    heroSubtitle: {
        ...TYPOGRAPHY.body,
        fontSize: 17,
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
    },
    searchBarContainer: {
        width: '100%',
        marginBottom: SPACING.l,
    },
    suggestionsWrapper: {
        width: '100%',
        marginTop: SPACING.l,
    },
    suggestionsLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 13,
        color: COLORS.textTertiary,
        marginBottom: SPACING.m,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SPACING.s,
    },
    suggestionChip: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    suggestionIcon: {
        fontSize: 14,
    },
    suggestionText: {
        ...TYPOGRAPHY.caption,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    threadContainer: {
        flex: 1,
    },
    threadContent: {
        paddingHorizontal: SPACING.m,
        paddingBottom: 100,
        paddingTop: SPACING.m,
    },
    bottomInputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.m,
        paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.m,
    },
});
