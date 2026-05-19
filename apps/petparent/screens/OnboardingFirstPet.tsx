import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CaretRight, CaretDown } from 'phosphor-react-native';

import { getCurrentHousehold, getHouseholdPets } from '../lib/current-household';

/**
 * Onboarding step 2 of 2: first pet (5 fields).
 *
 * Per docs (2026-05-19 decision): pre-populates from the first non-deceased
 * pet of the Fernandes household (Gabby in the seed). User can edit any
 * field but the form does not INSERT; "Create pet page" navigates to the
 * existing PetPage which loads Fernandes data directly.
 *
 * Mockup source: mockups/parent-app-source/screens-onboarding.jsx OnbFirstPet.
 */

// Color tokens (duplicated from PetPage.tsx until tech-debt F004 lands).
const INK = '#0F0C0A';
const INK_SOFT = '#5C5550';
const INK_FAINT = '#8F8B86';
const CANVAS = '#F8F7F5';
const CANVAS_2 = '#F1ECEC';
const RAIL_TINT = '#EFE6E8';
const RULE = '#E5DEE0';

type BirthMode = 'date' | 'age';
type Species = 'Dog' | 'Cat';
type Sex = 'Female' | 'Male';

export default function OnboardingFirstPet({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<Species>('Dog');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<Sex>('Male');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [birthMode, setBirthMode] = useState<BirthMode>('date');

  useEffect(() => {
    (async () => {
      try {
        const household = await getCurrentHousehold();
        const pets = await getHouseholdPets(household.id);
        const firstPet = pets.find((p) => !p.deceased) ?? pets[0];
        if (firstPet) {
          setPetName(firstPet.name ?? '');
          setSpecies(normalizeSpecies(firstPet.species));
          setBreed(firstPet.breed ?? '');
          setSex(normalizeSex(firstPet.sex));
          setBirthday(firstPet.birthday ? new Date(firstPet.birthday) : null);
        }
      } catch (err) {
        console.warn('[OnboardingFirstPet] preload failed:', (err as Error)?.message);
      }
    })();
  }, []);

  const age = useMemo(() => calcAge(birthday), [birthday]);

  return (
    <View style={{ flex: 1, backgroundColor: CANVAS }}>
      {/* Header block */}
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Progress total={2} at={1} />

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
          Tell us about your pet
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            lineHeight: 20,
            color: INK_SOFT,
          }}
        >
          All five are required. Add a photo later.
        </Text>
      </View>

      {/* Scrollable form body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <Field label="Name">
          <TextInput
            value={petName}
            onChangeText={setPetName}
            placeholder="Pet name"
            placeholderTextColor={INK_FAINT}
            style={fieldValueStyle}
          />
        </Field>

        {/* Species */}
        <Field label="Species">
          <View style={{ marginTop: 6 }}>
            <Seg options={['Dog', 'Cat']} value={species} onChange={(v) => setSpecies(v as Species)} />
          </View>
        </Field>

        {/* Breed */}
        <Field label="Breed">
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 6,
            }}
          >
            <TextInput
              value={breed}
              onChangeText={setBreed}
              placeholder="Breed"
              placeholderTextColor={INK_FAINT}
              style={[fieldValueStyle, { flex: 1, paddingVertical: 0 }]}
            />
            <CaretDown size={14} color={INK_FAINT} weight="bold" />
          </Pressable>
        </Field>

        {/* Gender */}
        <Field label="Gender">
          <View style={{ marginTop: 6 }}>
            <Seg options={['Female', 'Male']} value={sex} onChange={(v) => setSex(v as Sex)} />
          </View>
        </Field>

        {/* Birthday */}
        <Field label="Birthday" lastInGroup>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 11,
                color: INK_SOFT,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
              }}
            >
              {' '}
            </Text>
            <Seg
              options={['Date', 'Age']}
              value={birthMode === 'age' ? 'Age' : 'Date'}
              onChange={(v) => setBirthMode(v === 'Age' ? 'age' : 'date')}
            />
          </View>

          {birthMode === 'age' ? (
            <AgePicker years={age.years} months={age.months} />
          ) : (
            <MiniCalendar date={birthday ?? new Date(2021, 7, 12)} />
          )}
        </Field>
      </ScrollView>

      {/* Footer buttons. Inline static-style Pressables for cross-version
          Android reliability (no function-style Pressable, no `gap` reliance). */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 28,
          flexDirection: 'row',
          alignItems: 'stretch',
        }}
      >
        <Pressable
          onPress={onBack}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: RULE,
            backgroundColor: CANVAS,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: INK }}>
            Back
          </Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          style={{
            flex: 2,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: INK,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              color: CANVAS,
              marginRight: 8,
            }}
          >
            Create pet page
          </Text>
          <CaretRight size={16} color={CANVAS} weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Field wrapper. Renders a label-row above any child input.
// ─────────────────────────────────────────────────────────────
function Field({
  label,
  children,
  lastInGroup,
}: {
  label: string;
  children: React.ReactNode;
  lastInGroup?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
        borderBottomWidth: lastInGroup ? 0 : 1,
        borderBottomColor: RULE,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          color: INK_SOFT,
          textTransform: 'uppercase',
          letterSpacing: 1.4,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

const fieldValueStyle = {
  fontFamily: 'Inter_400Regular',
  fontSize: 17,
  lineHeight: 24,
  color: INK,
  paddingVertical: 4,
} as const;

// ─────────────────────────────────────────────────────────────
// Segmented control. 2-3 options, single selection.
// ─────────────────────────────────────────────────────────────
function Seg({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: CANVAS_2,
        borderRadius: 10,
        padding: 3,
        alignSelf: 'flex-start',
      }}
    >
      {options.map((opt, idx) => {
        const on = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: on ? CANVAS : 'transparent',
              marginRight: idx < options.length - 1 ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontFamily: on ? 'Inter_600SemiBold' : 'Inter_500Medium',
                fontSize: 13,
                color: on ? INK : INK_SOFT,
              }}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Mini calendar. Static render of the month containing `date`,
// with `date.getDate()` highlighted. No prev/next navigation in v0.
// ─────────────────────────────────────────────────────────────
function MiniCalendar({ date }: { date: Date }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const selectedDay = date.getDate();
  const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dow = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={{ marginTop: 10 }}>
      {/* Month label + nav chevrons */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 2,
          paddingBottom: 10,
          paddingTop: 4,
        }}
      >
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: INK }}>
          {monthLabel}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={chevronStyle}>
            <Text style={{ color: INK_FAINT, fontSize: 16, lineHeight: 18 }}>‹</Text>
          </View>
          <View style={chevronStyle}>
            <Text style={{ color: INK_FAINT, fontSize: 16, lineHeight: 18 }}>›</Text>
          </View>
        </View>
      </View>

      {/* Day-of-week row */}
      <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
        {dow.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 10,
                letterSpacing: 0.6,
                color: INK_FAINT,
                textTransform: 'uppercase',
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Day cells */}
      <View>
        {Array.from({ length: cells.length / 7 }).map((_, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: 'row', gap: 2, marginBottom: 2 }}>
            {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((d, colIdx) => {
              if (d == null) return <View key={colIdx} style={{ flex: 1, height: 30 }} />;
              const on = d === selectedDay;
              return (
                <View
                  key={colIdx}
                  style={{
                    flex: 1,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    backgroundColor: on ? INK : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: on ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      fontSize: 13,
                      color: on ? CANVAS : INK,
                    }}
                  >
                    {d}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const chevronStyle = {
  width: 22,
  height: 22,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderRadius: 6,
};

// ─────────────────────────────────────────────────────────────
// Age picker (years + months wheels). Static visualization for v0.
// Shows 5 values centered on the selected one; selection band in middle.
// ─────────────────────────────────────────────────────────────
function AgePicker({ years, months }: { years: number; months: number }) {
  return (
    <View style={{ marginTop: 10, flexDirection: 'row', gap: 10 }}>
      <Wheel label="Years" value={years} max={30} />
      <Wheel label="Months" value={months} max={11} />
    </View>
  );
}

function Wheel({ label, value, max }: { label: string; value: number; max: number }) {
  const items: number[] = [];
  for (let v = Math.max(0, value - 2); v <= Math.min(max, value + 2); v++) items.push(v);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: CANVAS_2,
        borderWidth: 1,
        borderColor: RULE,
        borderRadius: 12,
        paddingVertical: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: INK_FAINT,
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <View style={{ alignItems: 'center' }}>
        {items.map((v) => {
          const on = v === value;
          return (
            <Text
              key={v}
              style={{
                fontFamily: on ? 'Inter_600SemiBold' : 'Inter_400Regular',
                fontSize: on ? 17 : 13,
                color: on ? INK : INK_FAINT,
                lineHeight: 22,
              }}
            >
              {v}
            </Text>
          );
        })}
      </View>
      {/* Selection band centered vertically */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 6,
          right: 6,
          top: '50%',
          marginTop: -15,
          height: 30,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: RULE,
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Progress dots. marginRight (not `gap`) for Android render reliability.
// ─────────────────────────────────────────────────────────────
function Progress({ total, at }: { total: number; at: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 24,
            height: 4,
            borderRadius: 2,
            marginRight: i < total - 1 ? 6 : 0,
            backgroundColor: i <= at ? INK : RAIL_TINT,
          }}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// DB → UI shape mappers.
// Schema currently stores species/sex as short codes; the mockup
// uses display labels (Dog/Cat, Female/Male). Normalize at the edge.
// ─────────────────────────────────────────────────────────────
function normalizeSpecies(raw: string | null | undefined): Species {
  if (!raw) return 'Dog';
  const v = raw.toLowerCase();
  return v === 'cat' || v === 'feline' ? 'Cat' : 'Dog';
}

function normalizeSex(raw: string | null | undefined): Sex {
  if (!raw) return 'Male';
  const v = raw.toUpperCase();
  return v === 'F' || v === 'FEMALE' ? 'Female' : 'Male';
}

// ─────────────────────────────────────────────────────────────
// Age calculation from birthday → { years, months }.
// Used to seed the age-picker wheel when birthMode = 'age'.
// ─────────────────────────────────────────────────────────────
function calcAge(birthday: Date | null): { years: number; months: number } {
  if (!birthday) return { years: 4, months: 2 };
  const now = new Date();
  let years = now.getFullYear() - birthday.getFullYear();
  let months = now.getMonth() - birthday.getMonth();
  if (now.getDate() < birthday.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years: Math.max(0, years), months: Math.max(0, months) };
}
