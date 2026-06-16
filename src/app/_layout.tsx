import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { Theme } from '../constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Theme.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.bg },
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="search" />
        <Stack.Screen name="player" />
        <Stack.Screen name="calibrate" />
        <Stack.Screen name="demo" />
        <Stack.Screen name="legend" />
      </Stack>
    </GestureHandlerRootView>
  );
}
