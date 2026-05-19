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
import { ActivityIndicator, Platform, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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
          // shadow so the canvas reads as a device, not a panel.
          style={
            {
              width: 390,
              height: 844,
              maxHeight: '95vh',
              borderRadius: 36,
              overflow: 'hidden',
              backgroundColor: '#F8F7F5',
              boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
            } as any
          }
        >
          {/* Fake status bar (web preview only) per mockup primitives.css
              `.pk-status`: 40px tall, time on left, centered camera punch,
              minimal battery glyph on right. Consumes the top inset so the
              actual app content gets the same top margin SafeAreaView gives
              it on native. */}
          <View
            style={{
              height: 40,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 13,
                color: '#0F0C0A',
              }}
            >
              9:41
            </Text>
            <View
              style={{
                position: 'absolute',
                top: 10,
                left: '50%',
                marginLeft: -9,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: '#0F0C0A',
              }}
            />
            <View
              style={{
                width: 22,
                height: 11,
                borderWidth: 1,
                borderColor: '#0F0C0A',
                borderRadius: 2,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>{screens}</View>
        </View>
      </View>
    );
  }

  // Native path. SafeAreaView from react-native-safe-area-context (not the
  // legacy react-native one, which is iOS-only) so Android picks up the
  // status-bar inset and content doesn't bleed under the system bar.
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F7F5' }} edges={['top', 'bottom']}>
        {screens}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
