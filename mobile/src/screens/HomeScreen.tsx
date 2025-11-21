import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, Platform, KeyboardAvoidingView, TouchableOpacity, Animated as RNAnimated, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Compass, Menu, Plus, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { showBubble, completeBubble, dismissBubble } from '../services/bubbleNotification';
import voiceService from '../services/voiceService';
import { AnimatedSearchBar } from '../components/AnimatedSearchBar';
import { ThreadItem } from '../components/ThreadItem';
import { GlassView } from '../components/GlassView';

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

    const flatListRef = useRef<FlatList>(null);

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

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

    const renderHero = () => (
        <View style={styles.heroContainer}>
            <View style={styles.heroContent}>
                <Sparkles color={COLORS.primary} size={48} style={styles.heroIcon} />
                <Text style={styles.heroTitle}>Where knowledge begins</Text>
                <AnimatedSearchBar
                    value={query}
                    onChangeText={setQuery}
                    onSubmit={handleSearchSubmit}
                    isExpanded={false}
                    isListening={isListening}
                    onMicPress={handleVoiceToggle}
                />

                <View style={styles.suggestionsContainer}>
                    {['Summarize this article', 'Plan a trip to Tokyo', 'Debug my code'].map((suggestion, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.suggestionChip}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setQuery(suggestion);
                                // Optional: auto-submit
                            }}
                        >
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[COLORS.background, '#1A1A2E']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Menu color={COLORS.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerLogo}>Companion</Text>
                    <TouchableOpacity
                        style={styles.newThreadButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setIsThreadActive(false);
                            setChatHistory([]);
                        }}
                    >
                        <Plus color={COLORS.text} size={24} />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {!isThreadActive ? (
                        renderHero()
                    ) : (
                        <View style={styles.threadContainer}>
                            <FlatList
                                ref={flatListRef}
                                data={chatHistory}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <ThreadItem message={item} />}
                                contentContainerStyle={styles.threadContent}
                                showsVerticalScrollIndicator={false}
                            />

                            {/* Bottom Input Area for Thread */}
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
                        </View>
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
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        zIndex: 10,
    },
    headerLogo: {
        ...TYPOGRAPHY.h3,
        fontFamily: Platform.OS === 'ios' ? 'serif' : 'serif', // Attempt to use a serif font for that "knowledge" feel
    },
    newThreadButton: {
        padding: SPACING.xs,
    },
    content: {
        flex: 1,
    },
    heroContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.l,
    },
    heroContent: {
        alignItems: 'center',
        gap: SPACING.xl,
        marginTop: -100, // Visual offset
    },
    heroIcon: {
        opacity: 0.9,
    },
    heroTitle: {
        ...TYPOGRAPHY.h1,
        textAlign: 'center',
        marginBottom: SPACING.m,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SPACING.s,
        marginTop: SPACING.l,
    },
    suggestionChip: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    suggestionText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    threadContainer: {
        flex: 1,
    },
    threadContent: {
        paddingHorizontal: SPACING.m,
        paddingBottom: 100, // Space for bottom input
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
