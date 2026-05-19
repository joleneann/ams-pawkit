import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { getCurrentHousehold } from '../lib/current-household';

/**
 * Onboarding step 1 of 2: household name.
 *
 * Pre-populates from the Fernandes household in Supabase (the v0 demo
 * anchor). Skip and Continue both advance to step 2. No DB writes.
 *
 * Now uses React Native Reusables components (Button, Input, Label, Text)
 * for all interactive primitives. Progress dots are two inline rectangles.
 */
export default function OnboardingHousehold({ onNext }: { onNext: () => void }) {
  const [householdName, setHouseholdName] = useState('');

  useEffect(() => {
    getCurrentHousehold()
      .then((h) => setHouseholdName(h.name))
      .catch((err) => {
        console.warn('[OnboardingHousehold] preload failed:', err?.message);
      });
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-6">
        <ProgressDots total={2} at={0} />

        <Text variant="h3" className="mt-5 mb-1.5">
          Welcome to Pawkit
        </Text>
        <Text variant="muted">
          Let&apos;s set up your household. You can change any of this later in Settings.
        </Text>
      </View>

      {/* Form. Inputs are underline-only per mockup `.pk-field .value`:
          no box, no rounded corners, transparent bg, INK bottom border. */}
      <View className="px-6 pt-8 flex-1">
        <Label className="mb-2 text-xs tracking-widest uppercase text-muted-foreground">
          Household name
        </Label>
        <Input
          value={householdName}
          onChangeText={setHouseholdName}
          placeholder="e.g. The Fernandes family"
          className="border-0 border-b-2 border-foreground rounded-none bg-transparent px-0 shadow-none h-10 text-md font-inter-medium"
        />
        <Text variant="muted" className="mt-2 text-xs">
          Optional · defaults to &quot;Your household&quot;
        </Text>
      </View>

      {/* Footer */}
      <View className="px-5 pt-4 pb-7 flex-row gap-2.5">
        <Button variant="outline" onPress={onNext} className="flex-1">
          <Text>Skip</Text>
        </Button>
        <Button onPress={onNext} className="flex-[2] flex-row gap-2">
          <Text className="text-primary-foreground">Continue</Text>
          <CaretRight size={16} color="#F8F7F5" weight="bold" />
        </Button>
      </View>
    </View>
  );
}

// Progress dots per mockup `.pk-progress .d`: 8px circles, INK filled for
// completed steps, canvas-2 wash with rule border for upcoming steps.
function ProgressDots({ total, at }: { total: number; at: number }) {
  return (
    <View className="flex-row items-center">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={
            'h-2 w-2 rounded-full ' +
            (i < total - 1 ? 'mr-2 ' : '') +
            (i <= at
              ? 'bg-foreground border border-foreground'
              : 'bg-muted border border-border')
          }
        />
      ))}
    </View>
  );
}
