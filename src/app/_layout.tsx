import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { Theme } from '../constants/theme';

const WEB_SHELL_BG = '#FBFDFD';

export default function RootLayout() {
  const shellBackground = Platform.OS === 'web' ? WEB_SHELL_BG : Theme.bg;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: shellBackground }}>
      <StatusBar style={Platform.OS === 'web' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: shellBackground },
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player" options={{ animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom' }} />
        <Stack.Screen name="calibrate" options={{ animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom' }} />
        <Stack.Screen name="live/[showId]" />
        <Stack.Screen name="live/[showId]/pocket" options={{ animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom' }} />
        <Stack.Screen name="live/[showId]/host" />
        <Stack.Screen name="tuner" />
      </Stack>
    </GestureHandlerRootView>
  );
}
