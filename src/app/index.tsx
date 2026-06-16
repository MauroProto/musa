import { Redirect } from 'expo-router';
import { usePreferences } from '../store/preferences';

export default function Index() {
  const onboarded = usePreferences((s) => s.onboarded);
  if (!onboarded) return <Redirect href="/welcome" />;
  return <Redirect href="/search" />;
}
