import { Tabs } from 'expo-router';
import { GlassTabBar } from '../../components/GlassTabBar';

/**
 * Main app shell — a floating liquid-glass tab bar over three destinations.
 * Settings/calibration is opened full-screen from the bar (see GlassTabBar),
 * so it isn't a persistent tab. The Player is a root-stack screen above this.
 */
export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="search"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tabs.Screen name="search" options={{ title: 'Songs' }} />
      <Tabs.Screen name="live" options={{ title: 'Live' }} />
      <Tabs.Screen name="demo" options={{ title: 'Demo' }} />
      <Tabs.Screen name="legend" options={{ title: 'Touch' }} />
    </Tabs>
  );
}
