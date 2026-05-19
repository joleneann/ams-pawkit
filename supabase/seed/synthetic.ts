import { faker } from '@faker-js/faker';
import { supabase } from './client';

/**
 * Phase 4b: Synthetic Pune dataset.
 * 199 pets across 149 households for population realism.
 * Pune-realistic name + breed distribution per session-logs/2026-05-04-parallel-coding-plan.md.
 */

// Locked breed distribution per the plan
const DOG_BREEDS = [
  { breed: 'Indie / Mixed', weight: 32 },
  { breed: 'Labrador Retriever', weight: 15 },
  { breed: 'Pug', weight: 10 },
  { breed: 'Golden Retriever', weight: 8 },
  { breed: 'Shih Tzu', weight: 8 },
  { breed: 'German Shepherd', weight: 7 },
  { breed: 'Beagle', weight: 5 },
  { breed: 'Dachshund', weight: 4 },
  { breed: 'Boxer', weight: 4 },
  { breed: 'Pomeranian', weight: 4 },
  { breed: 'Rottweiler', weight: 3 },
];

const CAT_BREEDS = [
  { breed: 'Persian', weight: 40 },
  { breed: 'Domestic Shorthair', weight: 30 },
  { breed: 'Maine Coon', weight: 10 },
  { breed: 'Bombay', weight: 10 },
  { breed: 'Siamese', weight: 5 },
  { breed: 'Ragdoll', weight: 5 },
];

// Curated Pune Marathi/Hindi surnames
const PUNE_SURNAMES = [
  'Patil', 'Joshi', 'Deshpande', 'Kulkarni', 'Gokhale', 'Bhosale', 'Jadhav', 'Chavan',
  'Apte', 'Karandikar', 'Bhide', 'Dixit', 'Phadke', 'Marathe', 'Kanitkar',
  'Chitnis', 'Inamdar', 'Sathe', 'Rao', 'Iyer', 'Pillai', 'Khan', 'Sheikh',
  'Ahmed', 'Gupta', 'Sharma', 'Verma', 'Singh', 'Pandey', 'Mehta',
];

const PUNE_FIRST_NAMES = [
  // Marathi
  'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Kabir', 'Reyansh', 'Sai', 'Dhruv',
  'Anaya', 'Aadya', 'Saanvi', 'Ananya', 'Kavya', 'Kiara', 'Diya', 'Riya',
  'Pranav', 'Sanjay', 'Rajesh', 'Suresh', 'Vinod', 'Mahesh', 'Anand', 'Prakash',
  'Sunita', 'Meena', 'Nita', 'Geeta', 'Lata', 'Asha', 'Manju', 'Pooja',
  // English-style common in Pune urban
  'Rohan', 'Karan', 'Akash', 'Neha', 'Priya', 'Shreya', 'Tanvi', 'Isha',
];

const PET_NAMES = [
  // Western
  'Bruno', 'Simba', 'Coco', 'Snowy', 'Pepper', 'Bella', 'Max', 'Buddy', 'Charlie', 'Rocky',
  'Daisy', 'Lucy', 'Milo', 'Oreo', 'Whiskey', 'Tiger', 'Ginger', 'Smokey',
  // Marathi/Hindi
  'Mishti', 'Kalu', 'Rani', 'Moti', 'Sheru', 'Bhola', 'Laxmi', 'Bandar',
  'Chinki', 'Pinky', 'Bullet', 'Rambo', 'Sonu', 'Chiku', 'Goldy', 'Champi',
];

const PUNE_NEIGHBOURHOODS = [
  'Koregaon Park', 'Kothrud', 'Aundh', 'Hadapsar', 'Wakad', 'Baner',
  'Viman Nagar', 'Camp', 'Sinhagad Road', 'Karve Nagar', 'Erandwane',
  'Bavdhan', 'Pashan', 'Magarpatta', 'Kalyani Nagar', 'Hinjewadi',
];

const VISIT_TYPES = ['consultation', 'consultation', 'consultation', 'vaccination', 'vaccination', 'surgery', 'grooming'] as const;

const FUR_TONES = [
  'milk', 'vanilla', 'honey', 'peach', 'rust', 'mushroom', 'smoke', 'steel', 'bark', 'sable',
] as const;

faker.seed(42); // deterministic synthetic dataset

export async function seedSyntheticPune(clinicId: string, vetId: string): Promise<void> {
  const HOUSEHOLDS = 149;
  const PETS = 199;

  // 1. Households + parent users
  const householdIds: string[] = [];
  for (let i = 0; i < HOUSEHOLDS; i++) {
    const surname = pick(PUNE_SURNAMES);
    const firstName = pick(PUNE_FIRST_NAMES);

    const { data: hh } = await supabase
      .from('households')
      .insert({
        name: `The ${surname} Family`,
        address: `${pick(PUNE_NEIGHBOURHOODS)}, Pune`,
        phone: `+91-9${faker.string.numeric(9)}`,
      })
      .select('id')
      .single();
    if (!hh) continue;
    householdIds.push(hh.id);

    await supabase.from('users').insert({
      household_id: hh.id,
      role: 'parent',
      full_name: `${firstName} ${surname}`,
      phone: `+91-9${faker.string.numeric(9)}`,
      preferred_language: faker.helpers.weightedArrayElement([
        { value: 'en', weight: 0.5 },
        { value: 'mr', weight: 0.5 },
      ]),
    });
  }
  console.log(`  + ${householdIds.length} synthetic households`);

  // 2. Pets: distributed across households (some have 2+ pets)
  const allPetIds: string[] = [];
  for (let i = 0; i < PETS; i++) {
    const householdId = pick(householdIds);
    const species = faker.helpers.weightedArrayElement([
      { value: 'dog' as const, weight: 0.7 },
      { value: 'cat' as const, weight: 0.3 },
    ]);
    const breed = species === 'dog' ? weightedBreed(DOG_BREEDS) : weightedBreed(CAT_BREEDS);
    const ageYears = faker.helpers.weightedArrayElement([
      { value: faker.number.int({ min: 0, max: 1 }), weight: 0.15 }, // puppy/kitten
      { value: faker.number.int({ min: 1, max: 8 }), weight: 0.7 },  // adult
      { value: faker.number.int({ min: 8, max: 16 }), weight: 0.15 }, // senior
    ]);
    const birthday = new Date(Date.now() - ageYears * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const furPrimary = pick(FUR_TONES);
    const isAutoPair = furPrimary === 'milk' || furPrimary === 'sable';
    const furSecondary = isAutoPair
      ? furPrimary === 'milk'
        ? 'vanilla'
        : 'bark'
      : null;

    const { data: pet } = await supabase
      .from('pets')
      .insert({
        household_id: householdId,
        clinic_id: clinicId,
        regular_vet_id: vetId,
        name: pick(PET_NAMES),
        species,
        breed,
        sex: faker.helpers.arrayElement(['male', 'female']),
        birthday,
        weight_kg: species === 'dog' ? faker.number.float({ min: 4, max: 45, fractionDigits: 1 }) : faker.number.float({ min: 2.5, max: 8, fractionDigits: 1 }),
        microchip_id: faker.string.numeric(15),
        fur_match_primary: furPrimary,
        fur_match_secondary: furSecondary,
        is_auto_pair: isAutoPair,
        algorithm_match_primary: furPrimary,
        algorithm_match_secondary: furSecondary,
        algorithm_confidence: faker.number.float({ min: 0.65, max: 0.98, fractionDigits: 2 }),
      })
      .select('id')
      .single();
    if (pet) allPetIds.push(pet.id);
  }
  console.log(`  + ${allPetIds.length} synthetic pets`);

  // 3. Visits: 600-800 visits across all pets (avg 3-4 per pet)
  const visitsPerPet = 3;
  let visitCount = 0;
  for (const petId of allPetIds) {
    const numVisits = faker.number.int({ min: 1, max: 6 });
    for (let v = 0; v < numVisits; v++) {
      const monthsAgo = faker.number.int({ min: 1, max: 24 });
      const visitDate = new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      await supabase.from('visits').insert({
        pet_id: petId,
        vet_id: vetId,
        visit_type: pick(VISIT_TYPES),
        visit_date: visitDate,
      });
      visitCount++;
    }
  }
  console.log(`  + ${visitCount} synthetic visits`);

  // 4. A handful of vaccinations (~250 across the population)
  let vacCount = 0;
  for (const petId of faker.helpers.arrayElements(allPetIds, 150)) {
    const numVac = faker.number.int({ min: 1, max: 3 });
    for (let v = 0; v < numVac; v++) {
      const monthsAgo = faker.number.int({ min: 1, max: 18 });
      await supabase.from('vaccinations').insert({
        pet_id: petId,
        vaccine_type: faker.helpers.arrayElement(['DHPPi+L', 'Rabies', 'FVRCP', 'Bordetella']),
        administered_date: new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        next_due_date: new Date(Date.now() + (12 - monthsAgo) * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      });
      vacCount++;
    }
  }
  console.log(`  + ${vacCount} synthetic vaccinations`);

  // Skip synthetic invoices, line items, messages for v0; Fernandes anchor covers those.
  // Build week Day 7 can add more if demo data feels thin.
}

function pick<T>(arr: readonly T[]): T {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })]!;
}

function weightedBreed(breeds: { breed: string; weight: number }[]): string {
  return faker.helpers.weightedArrayElement(breeds.map((b) => ({ value: b.breed, weight: b.weight })));
}
