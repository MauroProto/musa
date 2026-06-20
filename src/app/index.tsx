import { Redirect } from 'expo-router';
import { INITIAL_ENTRY_TARGET } from '../lib/onboarding-entry';

export default function Index() {
  return <Redirect href={INITIAL_ENTRY_TARGET} />;
}
