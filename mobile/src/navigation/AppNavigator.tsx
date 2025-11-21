import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ReviewScreen from '../screens/ReviewScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { COLORS } from '../constants/theme';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: COLORS.background },
                    animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
                    presentation: 'card',
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                    animationDuration: 300,
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        animation: 'fade',
                    }}
                />
                <Stack.Screen
                    name="Review"
                    component={ReviewScreen}
                    options={{
                        animation: 'slide_from_bottom',
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        animation: 'slide_from_right',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
