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
import { ActivityIndicator, SafeAreaView, StatusBar, View } from 'react-native';

import './global.css';
import PetPage from './screens/PetPage';

// Font stack locked 2026-05-15 evening (mauve-only v1.4):
//   - Inter (body + display): handles every non-pet-name surface
//   - Lora italic 600 (pet-name hero ONLY): Pet Page cover, broadcast
//     personalisation, magic toast, memorial card per docs/premium-feel/byline.md
// Replaces v1.3's Spectral italic (rejected as too harsh) + Satoshi display
// (rejected as "circus" at 22-26px).
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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F7F5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#9C2B5C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F7F5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F5" />
      <PetPage />
    </SafeAreaView>
  );
}
