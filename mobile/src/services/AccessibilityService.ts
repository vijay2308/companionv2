import { NativeModules, Platform } from 'react-native';

const { AccessibilityModule } = NativeModules;

export interface AccessibilityService {
    isAccessibilityEnabled(): Promise<boolean>;
    promptEnableAccessibility(): void;
    tap(x: number, y: number): Promise<boolean>;
    swipe(x1: number, y1: number, x2: number, y2: number, duration: number): Promise<boolean>;
    getScreenHierarchy(): Promise<string>;
    performGlobalAction(action: number): Promise<boolean>;
}

export const AccessibilityService: AccessibilityService = {
    isAccessibilityEnabled: async () => {
        if (Platform.OS === 'android') {
            return AccessibilityModule.isAccessibilityEnabled();
        }
        return false;
    },
    promptEnableAccessibility: () => {
        if (Platform.OS === 'android') {
            AccessibilityModule.promptEnableAccessibility();
        }
    },
    tap: async (x: number, y: number) => {
        if (Platform.OS === 'android') {
            return AccessibilityModule.tap(x, y);
        }
        return false;
    },
    swipe: async (x1: number, y1: number, x2: number, y2: number, duration: number) => {
        if (Platform.OS === 'android') {
            return AccessibilityModule.swipe(x1, y1, x2, y2, duration);
        }
        return false;
    },
    getScreenHierarchy: async () => {
        if (Platform.OS === 'android') {
            return AccessibilityModule.getScreenHierarchy();
        }
        return "{}";
    },
    performGlobalAction: async (action: number) => {
        if (Platform.OS === 'android') {
            return AccessibilityModule.performGlobalAction(action);
        }
        return false;
    },
};

export const GLOBAL_ACTION_BACK = 1;
export const GLOBAL_ACTION_HOME = 2;
export const GLOBAL_ACTION_RECENTS = 3;
export const GLOBAL_ACTION_NOTIFICATIONS = 4;
export const GLOBAL_ACTION_QUICK_SETTINGS = 5;
export const GLOBAL_ACTION_POWER_DIALOG = 6;
export const GLOBAL_ACTION_LOCK_SCREEN = 8;
export const GLOBAL_ACTION_TAKE_SCREENSHOT = 9;
