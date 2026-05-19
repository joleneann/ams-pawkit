import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ArrowRight } from 'phosphor-react-native';

import { getCurrentHousehold } from '../lib/current-household';

/**
 * Onboarding step 1 of 2: household name.
 *
 * Per docs (2026-05-19 decision): the demo preloads the Fernandes household
 * via seed data. This screen renders the new mockup's two-step onboarding
 * shape, pre-populating the household name field from Supabase so the demo
 * shows a real "The Fernandes Family" value rather than the mockup's
 * placeholder. Skip and Continue both advance to step 2. No INSERTs happen.
 *
 * Mockup source: mockups/parent-app-source/screens-onboarding.jsx OnbHousehold.
 */

// Color tokens duplicated from PetPage.tsx for now. Tech-debt F004 + F020 will
// import these from @pawkit/design-tokens once the package re-exports them.
const INK = '#0F0C0A';
const INK_SOFT = '#5C5550';
const INK_FAINT = '#8F8B86';
const CANVAS = '#F8F7F5';
const RAIL_TINT = '#EFE6E8';
const RULE = '#E5DEE0';

export default function OnboardingHousehold({ onNext }: { onNext: () => void }) {
  const [householdName, setHouseholdName] = useState('');

  useEffect(() => {
    getCurrentHousehold()
      .then((h) => setHouseholdName(h.name))
      .catch((err) => {
        // Soft-fail: if seed is missing or DB is down, the field stays empty
        // and the user can still proceed via Skip. Don't block the flow.
        console.warn('[OnboardingHousehold] preload failed:', err?.message);
      });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: CANVAS }}>
      {/* Header block: progress + headline + subline */}
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Progress total={2} at={0} />

        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 22,
            lineHeight: 26,
            color: INK,
            marginTop: 20,
            marginBottom: 6,
            letterSpacing: -0.22,
          }}
        >
          Welcome to Pawkit
        </Text>

        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 21,
            color: INK_SOFT,
          }}
        >
          Let&apos;s set up your household. You can change any of this later in Settings.
        </Text>
      </View>

      {/* Form block */}
      <View style={{ paddingHorizontal: 24, paddingTop: 32, flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            color: INK_SOFT,
            textTransform: 'uppercase',
            letterSpacing: 1.4,
            marginBottom: 10,
          }}
        >
          Household name
        </Text>

        <TextInput
          value={householdName}
          onChangeText={setHouseholdName}
          placeholder="e.g. The Fernandes family"
          placeholderTextColor={INK_FAINT}
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 17,
            lineHeight: 24,
            color: INK,
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: RULE,
          }}
        />

        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            lineHeight: 18,
            color: INK_FAINT,
            marginTop: 10,
          }}
        >
          Optional · defaults to &quot;Your household&quot;
        </Text>
      </View>

      {/* Footer buttons */}
      <View style={{ padding: 20, flexDirection: 'row', gap: 10 }}>
        <OutlineBtn label="Skip" onPress={onNext} />
        <PrimaryBtn label="Continue" onPress={onNext} trailingIcon />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Inline primitives. Extracted to a shared file if/when reused
// across other onboarding steps or screens.
// ─────────────────────────────────────────────────────────────

function Progress({ total, at }: { total: number; at: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 24,
            height: 4,
            borderRadius: 2,
            backgroundColor: i <= at ? INK : RAIL_TINT,
          }}
        />
      ))}
    </View>
  );
}

function OutlineBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: RULE,
        backgroundColor: pressed ? RAIL_TINT : CANVAS,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 14,
          color: INK,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PrimaryBtn({
  label,
  onPress,
  trailingIcon,
}: {
  label: string;
  onPress: () => void;
  trailingIcon?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: pressed ? '#000' : INK,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      })}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 14,
          color: CANVAS,
        }}
      >
        {label}
      </Text>
      {trailingIcon && <ArrowRight size={16} color={CANVAS} weight="bold" />}
    </Pressable>
  );
}
