import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { BubbleNotification } = NativeModules;

// Log if module is available
if (Platform.OS === 'android') {
    if (BubbleNotification) {
        console.log('[BubbleNotification] Native module loaded successfully');
    } else {
        console.error('[BubbleNotification] Native module NOT found! Make sure to rebuild the app with: npx expo run:android');
    }
}

/**
 * Request notification permission (required for Android 13+)
 */
async function requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
        // Android 13+ requires POST_NOTIFICATIONS permission
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
                title: 'Notification Permission',
                message: 'Companion needs notification permission to show task status',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
            }
        );
        console.log('[BubbleNotification] Notification permission:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
        console.error('[BubbleNotification] Error requesting permission:', error);
        return false;
    }
}

interface BubbleOptions {
    title?: string;
    message: string;
    status?: 'running' | 'done' | 'error';
}

interface UpdateOptions {
    message: string;
    progress?: number;
    status?: 'running' | 'done' | 'error';
}

interface CompleteOptions {
    message: string;
}

/**
 * Show a bubble notification (Android only)
 * On Android 11+, this creates a floating bubble
 * On older versions, it shows a persistent notification
 */
export async function showBubble(options: BubbleOptions): Promise<boolean> {
    if (Platform.OS !== 'android') {
        console.log('[BubbleNotification] Not supported on iOS');
        return false;
    }

    if (!BubbleNotification) {
        console.error('[BubbleNotification] Native module not available. Did you rebuild the app?');
        return false;
    }

    // Request notification permission first (required for Android 13+)
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        console.warn('[BubbleNotification] Notification permission denied');
        // Continue anyway - it might still work on older Android versions
    }

    try {
        console.log('[BubbleNotification] Calling show with:', options);
        const result = await BubbleNotification.show({
            title: options.title || 'Companion',
            message: options.message,
            status: options.status || 'running',
        });
        console.log('[BubbleNotification] Show result:', result);
        return result;
    } catch (error) {
        console.error('[BubbleNotification] Error showing bubble:', error);
        return false;
    }
}

/**
 * Update the current bubble notification
 */
export async function updateBubble(options: UpdateOptions): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return false;
    }

    try {
        return await BubbleNotification.update({
            message: options.message,
            progress: options.progress,
            status: options.status || 'running',
        });
    } catch (error) {
        console.error('[BubbleNotification] Error updating bubble:', error);
        return false;
    }
}

/**
 * Mark the bubble notification as complete
 */
export async function completeBubble(options: CompleteOptions): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return false;
    }

    try {
        return await BubbleNotification.complete({
            message: options.message,
        });
    } catch (error) {
        console.error('[BubbleNotification] Error completing bubble:', error);
        return false;
    }
}

/**
 * Dismiss the bubble notification
 */
export async function dismissBubble(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return false;
    }

    try {
        return await BubbleNotification.dismiss();
    } catch (error) {
        console.error('[BubbleNotification] Error dismissing bubble:', error);
        return false;
    }
}

export default {
    show: showBubble,
    update: updateBubble,
    complete: completeBubble,
    dismiss: dismissBubble,
};
