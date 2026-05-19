import { useState } from 'react';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Lora_400Regular,
  Lora_600SemiBold,
  Lora_600SemiBold_Italic,
} from '@expo-google-fonts/lora';
import { ActivityIndicator, Platform, SafeAreaView, StatusBar, View } from 'react-native';

import './global.css';
import PetPage from './screens/PetPage';
import OnboardingHousehold from './screens/OnboardingHousehold';
import OnboardingFirstPet from './screens/OnboardingFirstPet';

// Web-only phone frame so design iteration in the browser previews at real
// phone proportions instead of stretched to laptop width. Native (Expo Go,
// EAS APK) renders full-screen as normal.
const IS_WEB = Platform.OS === 'web';

// Font stack locked 2026-05-15 evening (mauve-only v1.4):
//   - Inter (body + display): handles every non-pet-name surface
//   - Lora italic 600 (pet-name hero ONLY): Pet Page cover, broadcast
//     personalisation, magic toast, memorial card per docs/premium-feel/byline.md
// Replaces v1.3's Spectral italic (rejected as too harsh) + Satoshi display
// (rejected as "circus" at 22-26px).

// Onboarding state machine (2026-05-19): per the locked decision, the parent
// app boots into a 2-step onboarding (household → first pet) that pre-fills
// from Fernandes seed data and lands on the existing PetPage. No INSERTs yet;
// "Continue" / "Create pet page" are pure navigation. To skip onboarding in
// future builds, change `INITIAL_SCREEN` to `'petpage'`.
type Screen = 'onboarding-household' | 'onboarding-pet' | 'petpage';
const INITIAL_SCREEN: Screen = 'onboarding-household';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_600SemiBold_Italic,
  });

  const [screen, setScreen] = useState<Screen>(INITIAL_SCREEN);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F7F5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#9C2B5C" />
      </View>
    );
  }

  const screens = (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F5" />
      {screen === 'onboarding-household' && (
        <OnboardingHousehold onNext={() => setScreen('onboarding-pet')} />
      )}
      {screen === 'onboarding-pet' && (
        <OnboardingFirstPet
          onBack={() => setScreen('onboarding-household')}
          onNext={() => setScreen('petpage')}
        />
      )}
      {screen === 'petpage' && <PetPage />}
    </>
  );

  if (IS_WEB) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#E5DEE0',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          // Phone-shaped frame: 390x844 (iPhone 12/13/14 reference; close
          // enough to Pixel for design review). Rounded corners + soft drop
          // shadow so the canvas reads as a device, not a panel. Children
          // (the actual app) render inside.
          style={
            {
              width: 390,
              height: 844,
              maxHeight: '95vh',
              borderRadius: 36,
              overflow: 'hidden',
              backgroundColor: '#F8F7F5',
              boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
            } as any
          }
        >
          {screens}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F7F5' }}>
      {screens}
    </SafeAreaView>
  );
}
