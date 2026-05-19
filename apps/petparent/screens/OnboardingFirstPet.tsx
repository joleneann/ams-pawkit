import { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getCurrentHousehold, getHouseholdPets } from '../lib/current-household';

/**
 * Onboarding step 2 of 2: first pet (5 fields).
 *
 * Pre-populates from the first non-deceased pet of the Fernandes household
 * (Gabby in the seed). User can edit any field; form does not INSERT.
 * "Create pet page" navigates to the existing PetPage which loads from DB.
 *
 * Components: React Native Reusables for Button, Input, Label, Text,
 * ToggleGroup. @react-native-picker/picker for Breed / Years / Months
 * dropdowns. Calendar for Birthday Date mode is deferred; placeholder text
 * shows in its place until react-native-calendars is wired up.
 */

type BirthMode = 'date' | 'age';
type Species = 'Dog' | 'Cat';
type Sex = 'Female' | 'Male';

const DOG_BREEDS = [
  'Indie',
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'Pug',
  'Beagle',
  'Dachshund',
  'French Bulldog',
  'Shih Tzu',
  'Pomeranian',
  'Boxer',
  'Rottweiler',
];

const CAT_BREEDS = [
  'Indie',
  'Domestic Shorthair',
  'Persian',
  'Maine Coon',
  'Siamese',
  'British Shorthair',
  'Bengal',
  'Ragdoll',
  'Bombay',
];

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
  const [birthMode, setBirthMode] = useState<BirthMode>('age');

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

  const breeds = species === 'Dog' ? DOG_BREEDS : CAT_BREEDS;
  const age = useMemo(() => calcAge(birthday), [birthday]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-6">
        <ProgressDots total={2} at={1} />

        <Text variant="h3" className="mt-5 mb-1.5">
          Tell us about your pet
        </Text>
        <Text variant="muted">All five are required. Add a photo later.</Text>
      </View>

      {/* Form body */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Name. Underline-only per mockup `.pk-field .value`. */}
        <View className="mb-5">
          <Label className="mb-2 text-xs tracking-widest uppercase text-muted-foreground">
            Name
          </Label>
          <Input
            value={petName}
            onChangeText={setPetName}
            placeholder="Pet name"
            className="border-0 border-b-2 border-foreground rounded-none bg-transparent px-0 shadow-none h-10 text-md font-inter-medium"
          />
        </View>

        {/* Species. Pill toggle per mockup `.pk-seg`. */}
        <View className="mb-5">
          <Label className="mb-2 text-xs tracking-widest uppercase text-muted-foreground">
            Species
          </Label>
          <ToggleGroup
            type="single"
            value={species}
            onValueChange={(v) => v && setSpecies(v as Species)}
            className="bg-secondary rounded-full p-0.5 self-start"
          >
            <ToggleGroupItem value="Dog" className="rounded-full px-4 py-1 border-0">
              <Text>Dog</Text>
            </ToggleGroupItem>
            <ToggleGroupItem value="Cat" className="rounded-full px-4 py-1 border-0">
              <Text>Cat</Text>
            </ToggleGroupItem>
          </ToggleGroup>
        </View>

        {/* Breed. Underline-only Picker; the View wrapper renders the rule
            border, the Picker itself is transparent inside it. */}
        <View className="mb-5">
          <Label className="mb-2 text-xs tracking-widest uppercase text-muted-foreground">
            Breed
          </Label>
          <View className="border-0 border-b-2 border-foreground bg-transparent">
            <Picker
              selectedValue={breed}
              onValueChange={(v) => setBreed(v as string)}
              style={pickerStyle}
            >
              {/* If current breed isn't in the list, surface it first so it
                  doesn't silently disappear from the dropdown */}
              {breed && !breeds.includes(breed) ? (
                <Picker.Item label={breed} value={breed} />
              ) : null}
              {breeds.map((b) => (
                <Picker.Item key={b} label={b} value={b} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Gender. Pill toggle. */}
        <View className="mb-5">
          <Label className="mb-2 text-xs tracking-widest uppercase text-muted-foreground">
            Gender
          </Label>
          <ToggleGroup
            type="single"
            value={sex}
            onValueChange={(v) => v && setSex(v as Sex)}
            className="bg-secondary rounded-full p-0.5 self-start"
          >
            <ToggleGroupItem value="Female" className="rounded-full px-4 py-1 border-0">
              <Text>Female</Text>
            </ToggleGroupItem>
            <ToggleGroupItem value="Male" className="rounded-full px-4 py-1 border-0">
              <Text>Male</Text>
            </ToggleGroupItem>
          </ToggleGroup>
        </View>

        {/* Birthday with Date/Age pill toggle next to the label. */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">
              Birthday
            </Label>
            <ToggleGroup
              type="single"
              value={birthMode === 'age' ? 'Age' : 'Date'}
              onValueChange={(v) => v && setBirthMode(v === 'Age' ? 'age' : 'date')}
              className="bg-secondary rounded-full p-0.5"
            >
              <ToggleGroupItem value="Date" className="rounded-full px-3.5 py-1 border-0">
                <Text>Date</Text>
              </ToggleGroupItem>
              <ToggleGroupItem value="Age" className="rounded-full px-3.5 py-1 border-0">
                <Text>Age</Text>
              </ToggleGroupItem>
            </ToggleGroup>
          </View>

          {birthMode === 'age' ? (
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <Label className="mb-1.5 text-xs tracking-widest uppercase text-muted-foreground">
                  Years
                </Label>
                <View className="border-0 border-b-2 border-foreground bg-transparent">
                  <Picker
                    selectedValue={age.years}
                    onValueChange={(v) => {
                      const years = typeof v === 'number' ? v : parseInt(String(v), 10);
                      setBirthday(approxBirthdayFromAge(years, age.months));
                    }}
                    style={pickerStyle}
                  >
                    {Array.from({ length: 31 }).map((_, i) => (
                      <Picker.Item key={i} label={String(i)} value={i} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View className="flex-1">
                <Label className="mb-1.5 text-xs tracking-widest uppercase text-muted-foreground">
                  Months
                </Label>
                <View className="border-0 border-b-2 border-foreground bg-transparent">
                  <Picker
                    selectedValue={age.months}
                    onValueChange={(v) => {
                      const months = typeof v === 'number' ? v : parseInt(String(v), 10);
                      setBirthday(approxBirthdayFromAge(age.years, months));
                    }}
                    style={pickerStyle}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Picker.Item key={i} label={String(i)} value={i} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          ) : (
            <View className="rounded-md border border-input bg-background overflow-hidden">
              <Calendar
                current={toISODate(birthday ?? new Date())}
                onDayPress={(day: { dateString: string }) =>
                  setBirthday(new Date(day.dateString))
                }
                markedDates={
                  birthday
                    ? {
                        [toISODate(birthday)]: {
                          selected: true,
                          selectedColor: '#9C2B5C',
                        },
                      }
                    : {}
                }
                theme={{
                  backgroundColor: '#F8F7F5',
                  calendarBackground: '#F8F7F5',
                  selectedDayBackgroundColor: '#9C2B5C',
                  selectedDayTextColor: '#F8F7F5',
                  todayTextColor: '#9C2B5C',
                  dayTextColor: '#0F0C0A',
                  textDisabledColor: '#8F8B86',
                  monthTextColor: '#0F0C0A',
                  arrowColor: '#5C5550',
                  textSectionTitleColor: '#5C5550',
                  textDayFontFamily: 'Inter_400Regular',
                  textMonthFontFamily: 'Inter_600SemiBold',
                  textDayHeaderFontFamily: 'Inter_500Medium',
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pt-4 pb-7 flex-row gap-2.5">
        <Button variant="outline" onPress={onBack} className="flex-1">
          <Text>Back</Text>
        </Button>
        <Button onPress={onNext} className="flex-[2] flex-row gap-2">
          <Text className="text-primary-foreground">Create pet page</Text>
          <CaretRight size={16} color="#F8F7F5" weight="bold" />
        </Button>
      </View>
    </View>
  );
}

// Progress dots per mockup primitives.css `.pk-progress .d`.
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

// Picker on web renders as <select>; on native it shows the system picker.
// Setting fontFamily ensures the web <select> doesn't fall back to system-ui
// (which sticks out next to RNR's Inter-everywhere typography). Inter
// Regular matches the Input field weight for visual consistency.
const pickerStyle = Platform.select({
  web: {
    width: '100%',
    height: 40,
    padding: 8,
    border: 'none',
    background: 'transparent',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#0F0C0A',
  },
  default: { width: '100%', fontFamily: 'Inter_400Regular' },
}) as any;

// ─────────────────────────────────────────────────────────────
// DB → UI shape mappers.
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
// Birthday ↔ age helpers.
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

function approxBirthdayFromAge(years: number, months: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - months);
  return d;
}

// react-native-calendars expects ISO date strings (`YYYY-MM-DD`).
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
