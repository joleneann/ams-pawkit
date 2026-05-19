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
 * Typography + spacing per the frontend-design SKILL principle of restraint
 * and precision for refined designs. Hierarchy: large headline (28px tight),
 * mid-weight subline (15px), tiny tracked eyebrow label (11px), input value
 * (16px medium), faint helper (12px). Form intrinsic-height (no flex-1)
 * with a flex spacer below so the buttons sit at a comfortable distance
 * from the form, not floored at the screen bottom.
 *
 * All values traced to mockups/parent-app-source/tokens.css + primitives.css.
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
      {/* Header: progress dots + headline + subline. Generous top padding
          so the headline has room below the device status bar. */}
      <View className="px-6 pt-8">
        <ProgressDots total={2} at={0} />

        {/* Headline. Pawkit hero size (28px), Inter SemiBold, tight tracking,
            tight line-height. Sized larger than RNR's default h3 to match
            mockup hero weight. */}
        <Text
          className="mt-6 font-inter-semibold text-foreground text-[28px] leading-[32px] tracking-[-0.01em]"
        >
          Welcome to Pawkit
        </Text>

        {/* Subline. Mid contrast (ink-70 via foreground/70), 15px, comfortable
            line-height for the longer sentence. */}
        <Text className="mt-2 font-inter text-foreground/70 text-[15px] leading-[22px]">
          Let&apos;s set up your household. You can change any of this later
          in Settings.
        </Text>
      </View>

      {/* Form. Intrinsic height (no flex-1), so the buttons can sit closer
          to the form rather than getting pushed to the absolute bottom. */}
      <View className="px-6 pt-10">
        <Label className="font-inter-semibold text-[11px] tracking-[0.14em] uppercase text-foreground/50">
          Household name
        </Label>
        <Input
          value={householdName}
          onChangeText={setHouseholdName}
          placeholder="e.g. The Fernandes family"
          className="mt-2 border-0 border-b-2 border-foreground rounded-none bg-transparent px-0 shadow-none h-10 text-[16px] font-inter-medium leading-[24px]"
        />
        <Text className="mt-3 font-inter text-foreground/50 text-[12px] leading-[18px]">
          Optional · defaults to &quot;Your household&quot;
        </Text>
      </View>

      {/* Spacer that takes remaining vertical space. Pushes the footer to
          the bottom but in a balanced way (since the form above is now
          intrinsic-height, the spacer absorbs the gap). */}
      <View className="flex-1" />

      {/* Footer. Two-button row, outline Skip + filled Continue. Per mockup
          screens-onboarding.jsx the container has `padding: 20` on every
          side (20px top, 20px bottom). Plus extra bottom space (pb-8 = 32px)
          so the buttons sit visibly above the device's rounded corner edge,
          not flush against it. */}
      <View className="px-5 pt-5 pb-8 flex-row gap-2.5">
        <Button variant="outline" onPress={onNext} className="flex-1 h-12">
          <Text className="font-inter-medium text-[14px]">Skip</Text>
        </Button>
        <Button
          onPress={onNext}
          className="flex-[2] flex-row items-center justify-center gap-2 h-12"
        >
          <Text className="font-inter-medium text-[14px] text-primary-foreground">
            Continue
          </Text>
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
