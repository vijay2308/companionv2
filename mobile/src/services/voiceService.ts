import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

// Configuration for voice services
const CONFIG = {
    // ElevenLabs API for natural-sounding TTS
    // Get your API key at: https://elevenlabs.io
    ELEVENLABS_API_KEY: '', // Set this in env or replace here
    ELEVENLABS_VOICE_ID: 'EXAVITQu4vr4xnSDxMaL', // Sarah - natural conversational voice

    // Use expo-speech as fallback when ElevenLabs key not set
    USE_NATIVE_TTS_FALLBACK: true,
};

// Voice state management
let isListening = false;
let currentSound: Audio.Sound | null = null;
let onSpeechResultCallback: ((text: string) => void) | null = null;
let onSpeechErrorCallback: ((error: string) => void) | null = null;
let onSpeechStartCallback: (() => void) | null = null;
let onSpeechEndCallback: (() => void) | null = null;

// Event subscriptions
let startSubscription: any = null;
let endSubscription: any = null;
let resultSubscription: any = null;
let errorSubscription: any = null;

/**
 * Initialize the voice service
 */
export async function initializeVoice(): Promise<boolean> {
    try {
        // Configure audio mode for playback
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        // Setup speech recognition event listeners using expo module's addListener
        startSubscription = ExpoSpeechRecognitionModule.addListener('start', () => {
            console.log('[VoiceService] Speech started');
            isListening = true;
            onSpeechStartCallback?.();
        });

        endSubscription = ExpoSpeechRecognitionModule.addListener('end', () => {
            console.log('[VoiceService] Speech ended');
            isListening = false;
            onSpeechEndCallback?.();
        });

        resultSubscription = ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
            console.log('[VoiceService] Results:', event.results);
            if (event.results && event.results.length > 0) {
                const result = event.results[0];
                if (result && result.transcript) {
                    onSpeechResultCallback?.(result.transcript);
                }
            }
        });

        errorSubscription = ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
            console.error('[VoiceService] Error:', event.error);
            isListening = false;
            onSpeechErrorCallback?.(event.error || 'Speech recognition error');
        });

        console.log('[VoiceService] Initialized successfully');
        return true;
    } catch (error) {
        console.error('[VoiceService] Initialization failed:', error);
        return false;
    }
}

/**
 * Request microphone permission (required for Android)
 */
export async function requestMicrophonePermission(): Promise<boolean> {
    try {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        console.log('[VoiceService] Permission result:', result);
        return result.granted;
    } catch (error) {
        console.error('[VoiceService] Permission error:', error);
        return false;
    }
}

/**
 * Set callbacks for speech recognition events
 */
export function setVoiceCallbacks(callbacks: {
    onResult?: (text: string) => void;
    onError?: (error: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
}) {
    onSpeechResultCallback = callbacks.onResult || null;
    onSpeechErrorCallback = callbacks.onError || null;
    onSpeechStartCallback = callbacks.onStart || null;
    onSpeechEndCallback = callbacks.onEnd || null;
}

/**
 * Start listening for speech input
 */
export async function startListening(): Promise<boolean> {
    if (isListening) {
        console.log('[VoiceService] Already listening');
        return true;
    }

    try {
        // Stop any playing audio first
        await stopSpeaking();

        // Request permission
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            console.error('[VoiceService] Microphone permission denied');
            return false;
        }

        // Configure audio for recording
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        // Start speech recognition
        ExpoSpeechRecognitionModule.start({
            lang: 'en-US',
            interimResults: false,
            maxAlternatives: 1,
            continuous: false,
        });

        isListening = true;
        console.log('[VoiceService] Started listening');
        return true;
    } catch (error) {
        console.error('[VoiceService] Failed to start listening:', error);
        isListening = false;
        return false;
    }
}

/**
 * Stop listening for speech input
 */
export async function stopListening(): Promise<void> {
    if (!isListening) return;

    try {
        ExpoSpeechRecognitionModule.stop();
        isListening = false;
        console.log('[VoiceService] Stopped listening');
    } catch (error) {
        console.error('[VoiceService] Failed to stop listening:', error);
    }
}

/**
 * Cancel speech recognition
 */
export async function cancelListening(): Promise<void> {
    try {
        ExpoSpeechRecognitionModule.abort();
        isListening = false;
    } catch (error) {
        console.error('[VoiceService] Failed to cancel listening:', error);
    }
}

/**
 * Check if currently listening
 */
export function getIsListening(): boolean {
    return isListening;
}

/**
 * Speak text using ElevenLabs API for natural voice synthesis
 * Falls back to expo-speech if ElevenLabs is not configured
 */
export async function speak(text: string): Promise<void> {
    // Stop any current speech
    await stopSpeaking();

    // Configure audio for playback
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
    });

    // Use ElevenLabs if API key is configured
    if (CONFIG.ELEVENLABS_API_KEY) {
        await speakWithElevenLabs(text);
    } else if (CONFIG.USE_NATIVE_TTS_FALLBACK) {
        await speakWithNativeTTS(text);
    } else {
        console.warn('[VoiceService] No TTS service configured');
    }
}

/**
 * Speak using ElevenLabs API for natural, expressive voice
 */
async function speakWithElevenLabs(text: string): Promise<void> {
    try {
        console.log('[VoiceService] Speaking with ElevenLabs:', text.substring(0, 50) + '...');

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${CONFIG.ELEVENLABS_VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': CONFIG.ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2', // Fast, high-quality model
                    voice_settings: {
                        stability: 0.5, // Balance between consistency and expressiveness
                        similarity_boost: 0.75,
                        style: 0.5, // Adds expressiveness
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        // Get audio data as base64
        const audioBlob = await response.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                try {
                    const base64Audio = (reader.result as string).split(',')[1];

                    // Create and play sound
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: `data:audio/mpeg;base64,${base64Audio}` },
                        { shouldPlay: true }
                    );

                    currentSound = sound;

                    // Clean up when done
                    sound.setOnPlaybackStatusUpdate((status) => {
                        if (status.isLoaded && status.didJustFinish) {
                            sound.unloadAsync();
                            currentSound = null;
                        }
                    });

                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });
    } catch (error) {
        console.error('[VoiceService] ElevenLabs error:', error);

        // Fallback to native TTS
        if (CONFIG.USE_NATIVE_TTS_FALLBACK) {
            console.log('[VoiceService] Falling back to native TTS');
            await speakWithNativeTTS(text);
        }
    }
}

/**
 * Speak using native TTS (expo-speech) as fallback
 * Uses the best available voice on the device
 */
async function speakWithNativeTTS(text: string): Promise<void> {
    return new Promise((resolve) => {
        console.log('[VoiceService] Speaking with native TTS:', text.substring(0, 50) + '...');

        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.9, // Slightly slower for natural feel
            onDone: () => {
                console.log('[VoiceService] Speech completed');
                resolve();
            },
            onError: (error) => {
                console.error('[VoiceService] Native TTS error:', error);
                resolve();
            },
        });
    });
}

/**
 * Stop any current speech
 */
export async function stopSpeaking(): Promise<void> {
    try {
        // Stop ElevenLabs audio
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            currentSound = null;
        }

        // Stop native TTS
        Speech.stop();

        console.log('[VoiceService] Stopped speaking');
    } catch (error) {
        console.error('[VoiceService] Error stopping speech:', error);
    }
}

/**
 * Check if currently speaking
 */
export async function isSpeaking(): Promise<boolean> {
    // Check expo-speech
    const nativeSpeaking = await Speech.isSpeakingAsync();

    // Check ElevenLabs audio
    if (currentSound) {
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
            return true;
        }
    }

    return nativeSpeaking;
}

/**
 * Configure ElevenLabs API key at runtime
 */
export function setElevenLabsApiKey(apiKey: string, voiceId?: string): void {
    CONFIG.ELEVENLABS_API_KEY = apiKey;
    if (voiceId) {
        CONFIG.ELEVENLABS_VOICE_ID = voiceId;
    }
    console.log('[VoiceService] ElevenLabs configured');
}

/**
 * Get available voice IDs for ElevenLabs
 */
export function getElevenLabsVoices(): { id: string; name: string; description: string }[] {
    return [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Natural conversational female' },
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, narration-style female' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, authoritative male' },
        { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', description: 'Energetic, conversational male' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong, confident female' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Youthful, friendly female' },
    ];
}

/**
 * Cleanup voice service
 */
export async function cleanupVoice(): Promise<void> {
    await stopSpeaking();
    await cancelListening();

    // Remove event subscriptions
    if (startSubscription) startSubscription.remove();
    if (endSubscription) endSubscription.remove();
    if (resultSubscription) resultSubscription.remove();
    if (errorSubscription) errorSubscription.remove();

    console.log('[VoiceService] Cleaned up');
}

export default {
    initialize: initializeVoice,
    requestPermission: requestMicrophonePermission,
    setCallbacks: setVoiceCallbacks,
    startListening,
    stopListening,
    cancelListening,
    isListening: getIsListening,
    speak,
    stopSpeaking,
    isSpeaking,
    setApiKey: setElevenLabsApiKey,
    getVoices: getElevenLabsVoices,
    cleanup: cleanupVoice,
};
