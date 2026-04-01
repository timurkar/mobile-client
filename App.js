import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatProvider } from './src/context/ChatContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/utils/theme';

const colors = theme.dark;

const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.accent,
    background: colors.background,
    card: colors.headerBackground,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ChatProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </ChatProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
