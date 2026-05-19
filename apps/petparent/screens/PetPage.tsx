import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CaretRight, Gear } from 'phosphor-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { getCurrentHousehold } from '../lib/current-household';
import {
  FUR_HEX,
  formatAge,
  formatFollowUpDate,
  formatShortDate,
  getActiveFollowUp,
  getClinicVet,
  getPetByName,
  getPetVisits,
  shortVetName,
} from '../lib/pet-data';

type Pet = Awaited<ReturnType<typeof getPetByName>>;
type Visit = Awaited<ReturnType<typeof getPetVisits>>[number];
type FollowUp = Awaited<ReturnType<typeof getActiveFollowUp>>;
type Vet = Awaited<ReturnType<typeof getClinicVet>>;

// Mauve-only v1.4 tokens (locked 2026-05-14; saturation-lifted 2026-05-15 evening).
// Font imports swapped Spectral → Lora and icon kit swapped lucide-react-native
// → phosphor-react-native on 2026-05-16. Color constants below already on the
// mauve palette.
// TODO (tech-debt F004 + F020): hex values duplicate `@pawkit/design-tokens`
// palette — import from there. See `docs/tech-debt-plan.md` Phase 2.
const INK = '#0F0C0A';
const INK_SOFT = '#5C5550';
const INK_FAINT = '#8F8B86';      // bumped 2026-05-15 (was #A8A39E in v1.3) for 3.5:1 contrast on cool canvas
const CANVAS = '#F8F7F5';         // cool off-white (was Paper #F5F1E8 in v1.3)
const RAIL_TINT = '#EFE6E8';      // workspace ground (barely-there mauve)
const BERRY = '#9C2B5C';          // Boysenberry primary (was Teal #006D6F in v1.3)
const BERRY_DEEP = '#7C1F47';     // hover, accent text on tinted bg
// TODO (tech-debt F020): legacy aliases — sweep references then drop. See
// `docs/tech-debt-plan.md` Phase 1.
const PAPER = CANVAS;
const TEAL = BERRY;

// docs/premium-feel/motion.md, ease-decelerate for entrances
const easeDecelerate = Easing.bezier(0, 0, 0.2, 1);

function titleCaseType(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Editorial vet byline. Full variant per docs/premium-feel/byline.md.
 * Two lines max: name (Inter 14 semibold) over clinic (Inter 11 small caps).
 * Credential format locked 2026-05-09: name + clinic only. No school, year,
 * or license number; that detail belongs to a future "About this vet" surface.
 */
function VetBylineFull({ vet }: { vet: Vet }) {
  // v0 has exactly one clinic; hardcoded until multi-clinic schema lands.
  const clinic = 'Animal Medical Services';
  return (
    <View>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: INK, lineHeight: 18 }}>
        {vet.full_name}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          color: INK_SOFT,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginTop: 4,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {clinic}
      </Text>
    </View>
  );
}

export default function PetPage() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [followUp, setFollowUp] = useState<FollowUp>(null);
  const [vet, setVet] = useState<Vet | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Entrance motion (docs/premium-feel.md §1 + layout-spec.md #9):
  // photo fades + scales 1.02 → 1.0 in 800ms ceremonial,
  // name + byline stagger 150ms after,
  // timeline cards stagger 30ms each (handled in the map below).
  const coverProgress = useSharedValue(0);
  const nameProgress = useSharedValue(0);

  useEffect(() => {
    (async () => {
      try {
        const household = await getCurrentHousehold();
        const gabby = await getPetByName(household.id, 'Gabby');
        const [v, fu, theVet] = await Promise.all([
          getPetVisits(gabby.id),
          getActiveFollowUp(gabby.id),
          getClinicVet(),
        ]);
        setPet(gabby);
        setVisits(v);
        setFollowUp(fu);
        setVet(theVet);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  useEffect(() => {
    if (pet && vet) {
      coverProgress.value = withTiming(1, { duration: 800, easing: easeDecelerate });
      nameProgress.value = withDelay(
        150,
        withTiming(1, { duration: 400, easing: easeDecelerate }),
      );
    }
  }, [pet, vet, coverProgress, nameProgress]);

  const coverStyle = useAnimatedStyle(() => ({
    opacity: coverProgress.value,
    transform: [{ scale: 1.02 - 0.02 * coverProgress.value }],
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameProgress.value,
    transform: [{ translateY: (1 - nameProgress.value) * 8 }],
  }));

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: PAPER, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: INK, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 }}>
          Something went wrong loading Gabby's page.
        </Text>
        <Text style={{ color: INK_SOFT, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 8 }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!pet || !vet) {
    return (
      <View style={{ flex: 1, backgroundColor: PAPER, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={TEAL} />
      </View>
    );
  }

  const primaryFur = pet.fur_match_primary?.toLowerCase() ?? 'honey';
  const secondaryFur = pet.fur_match_secondary?.toLowerCase() ?? 'peach';
  const gradientStart = FUR_HEX[primaryFur] ?? FUR_HEX.honey;
  const gradientEnd = FUR_HEX[secondaryFur] ?? FUR_HEX.peach;
  // For the 3px accent bar: solo-fur pets must not show the peach fallback;
  // fall back to primary so the bar reads as solid primary instead of an
  // invented primary→peach gradient. Two-tone pets render primary→secondary.
  const barEnd = pet.fur_match_secondary ? gradientEnd : gradientStart;

  const ageStr = formatAge(pet.birthday);
  // Patient-since uses birthday year (fallback to created_at). For the Fernandes anchor,
  // pets were born into AMS care, so birthday year is the meaningful "patient since".
  const sinceYear = pet.birthday
    ? new Date(pet.birthday).getFullYear()
    : new Date(pet.created_at).getFullYear();
  const breedStr = pet.breed ?? (pet.species === 'dog' ? 'Mixed breed' : 'Cat');
  const contextLine = [breedStr, ageStr, `Patient at AMS since ${sinceYear}`].filter(Boolean).join(' · ');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: PAPER }}
      contentContainerStyle={{ paddingBottom: 64 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover: 320px gradient using the pet's fur-match tones, ceremonial entrance */}
      <Animated.View style={[{ height: 320, position: 'relative' }, coverStyle]}>
        <LinearGradient
          colors={[gradientStart, gradientEnd] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
        {/* 3px accent bar along bottom: horizontal gradient from primary
            (left) to secondary (right). Solo-fur pets render solid primary
            because `barEnd` falls back to `gradientStart` when no secondary
            exists. Fur-match's ambient contribution, two-tone visible. */}
        <LinearGradient
          colors={[gradientStart, barEnd] as [string, string]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
          }}
        />
        {/* Caption overlay: uppercase Inter at bottom-left */}
        <Text
          style={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            color: PAPER,
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          {pet.name}'s page
        </Text>
      </Animated.View>

      {/* Body: 16px screen edge padding per spacing scale */}
      <Animated.View style={[{ paddingHorizontal: 16, paddingTop: 32 }, nameStyle]}>
        {/* Pet name row + per-pet settings gear, right-aligned. The gear is the
            entry point to Per-pet Settings (photo, fur-match override, adoption
            year). Refined 2026-05-09 from a cover-pill to an inline body icon
            so the cover photo stays clean. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10, // 8 + 2 ascent compensation
          }}
        >
          {/* Pet name in Lora italic 600 + 2px ascent compensation per premium-feel/spacing.md
              (was Spectral italic in v1.3; font swap locked 2026-05-15 evening) */}
          <Text
            style={{
              flex: 1,
              fontFamily: 'Lora_600SemiBold_Italic',
              fontSize: 32,
              color: INK,
              lineHeight: 36,
              letterSpacing: -0.4,
            }}
          >
            {pet.name}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${pet.name}'s pet settings`}
            onPress={() => {
              // TODO(build): navigate to per-pet Settings sub-screen for this pet.id.
              // Route TBD when navigation is wired up.
            }}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Gear size={18} color={INK_SOFT} weight="fill" />
          </Pressable>
        </View>

        {/* Warm context line */}
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: INK_SOFT,
            lineHeight: 18,
            marginBottom: 24,
          }}
        >
          {contextLine}
        </Text>

        {/* Vet byline: Full variant editorial signature */}
        <View style={{ marginBottom: 32 }}>
          <VetBylineFull vet={vet} />
        </View>

        {/* Open follow-up window banner: two-row card. Row 1 is the editorial
            Lora italic context. Row 2 is an explicit "Open thread →" CTA
            so the banner clearly reads as a link (refined 2026-05-09 after
            the chevron-alone affordance was too subtle). Whole card stays the
            press target. Renders only when an open follow-up window exists. */}
        {followUp && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open thread with ${shortVetName(vet.full_name)}`}
            onPress={() => {
              // TODO(build): navigate to per-pet thread detail screen
              // (Inbox tab → that pet's thread). Route TBD when navigation
              // is wired up.
            }}
            style={({ pressed }) => ({
              backgroundColor: PAPER,
              borderWidth: 1.5,
              borderColor: INK,
              borderLeftWidth: 4,
              borderLeftColor: TEAL,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 24,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: 'Lora_600SemiBold_Italic',
                fontSize: 15,
                color: INK,
                lineHeight: 21,
              }}
            >
              {shortVetName(vet.full_name)} is here for {pet.name} until {formatFollowUpDate(followUp.closes_at)}.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12,
                  color: INK,
                  lineHeight: 16,
                }}
              >
                Open thread
              </Text>
              <CaretRight size={14} color={INK} weight="fill" />
            </View>
          </Pressable>
        )}

        {/* Closed-window fallback link: when there's no active window but past
            messages exist, render a smaller Ink-soft link to the thread.
            Hidden when neither has occurred. (Locked 2026-05-08; refined
            2026-05-09 to render the chevron via Unicode rsaquo.) */}
        {!followUp && (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`View past conversations with ${shortVetName(vet.full_name)}`}
            onPress={() => {
              // TODO(build): navigate to per-pet thread detail (closed state).
              // Component should hide itself when there are zero past messages.
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 24,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: INK_SOFT,
                lineHeight: 18,
              }}
            >
              View past conversations with {shortVetName(vet.full_name)}
            </Text>
            <CaretRight size={14} color={INK_SOFT} weight="fill" />
          </Pressable>
        )}

        {/* Timeline section header: small caps editorial label */}
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 11,
            color: INK_SOFT,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Timeline
        </Text>

        {/* Timeline cards: staggered entrance, 30ms apart */}
        {visits.length === 0 ? (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontStyle: 'italic',
              fontSize: 16,
              color: INK_FAINT,
              paddingVertical: 32,
            }}
          >
            No visits yet.
          </Text>
        ) : (
          visits.map((v, i) => <TimelineCard key={v.id} visit={v} index={i} />)
        )}
      </Animated.View>
    </ScrollView>
  );
}

/**
 * Single timeline card with staggered entrance per premium-feel/motion.md
 * (30ms between rows). Lives inside this file for v0; extract to its own
 * component when reused on the dashboard side.
 */
function TimelineCard({ visit, index }: { visit: Visit; index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      950 + index * 30, // wait for cover (800) + byline (150) before staggering
      withTiming(1, { duration: 250, easing: easeDecelerate }),
    );
  }, [progress, index]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 8 }],
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: PAPER,
          borderWidth: 1.5,
          borderColor: INK,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: INK,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {visit.chief_complaint ?? titleCaseType(visit.visit_type)}
        </Text>
        {visit.diagnosis && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              color: INK_SOFT,
              lineHeight: 16,
              marginTop: 4,
            }}
            numberOfLines={2}
          >
            {visit.diagnosis}
          </Text>
        )}
      </View>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
          color: INK_FAINT,
          marginLeft: 12,
        }}
      >
        {formatShortDate(visit.visit_date)}
      </Text>
    </Animated.View>
  );
}
