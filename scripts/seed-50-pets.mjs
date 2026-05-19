#!/usr/bin/env node
/**
 * Pawkit demo seed (locked spec, 2026-05-17 evening rewrite).
 *
 * Creates:
 *   - 150 households, plausible Pune surnames + localities
 *   - 200 pets distributed: 110 single-pet hh + 30 two-pet + 10 three-pet
 *   - 50 ACTIVE pets (1 in every 4) with: 3 visits + 3 invoices + ~5 line items each,
 *     1 follow-up window, 1 distinct message (50 unique bodies via the multi-variant
 *     PARENT_MESSAGES locked 2026-05-16). Visits evenly spread Jan 1 2025 → today.
 *   - 150 QUIET pets with: bare identity only. No visits, no invoices, no messages.
 *
 * Preserves what's already in the DB:
 *   - clinics (AMS), the Fernandes Family household + 4 anchor pets,
 *     broadcasts (6), health_kits (3), audit_log (stub). The surgical wipe
 *     we ran before this seed cleared only fictional data; nothing in this
 *     script touches the preserved rows.
 *
 * Idempotency: deterministic. Re-running this on the same Postgres state
 * inserts the same 150/200 set. Run after a wipe; do not stack on top of
 * an existing fictional dataset (creates duplicates on phone numbers).
 *
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from supabase/.env.local.
 *
 * Run:  node scripts/seed-50-pets.mjs
 *  (filename retained from the 50-pet era; do not rename without updating
 *   docs/decisions-log.md + CLAUDE.md references)
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// --- env load --------------------------------------------------------------
const envText = readFileSync(resolve(".", "supabase", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx), l.slice(idx + 1)];
  })
);
const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in supabase/.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// --- locked constants ------------------------------------------------------
const CLINIC_ID = "7fbea79d-abee-4cdd-b960-513343f03094";
const VET_ID = "7c21dd53-8296-45c6-9957-8620a4e2f4eb";
const STORAGE_BASE =
  "https://pevofxnfjcvmamdcfkus.supabase.co/storage/v1/object/public/pet-photos";
const NOW = new Date("2026-05-17T00:00:00Z");

// ===========================================================================
// POOL DEFINITIONS
// ===========================================================================

/** 150 unique surnames, weighted Marathi/Pune with broader Indian mix. */
const SURNAMES = [
  // Marathi (Pune-leaning)
  "Joshi", "Kulkarni", "Patil", "Deshmukh", "Pawar", "Shinde", "Phadke", "Bapat",
  "Gokhale", "Sathe", "Naik", "Patwardhan", "Apte", "Tilak", "Sane", "Bhave",
  "Karandikar", "Limaye", "Marathe", "Tendulkar", "Pendse", "Phatak", "Karkhanis",
  "Bedekar", "Vaidya", "Joglekar", "Athavale", "Barve", "Bhide", "Bhandare",
  "Bagul", "Borkar", "Chitnis", "Dabholkar", "Dandekar", "Dani", "Datar", "Desai",
  "Dixit", "Garde", "Gondhalekar", "Gore", "Gosavi", "Gurav", "Kale", "Kanitkar",
  "Kakade", "Khadilkar", "Khanolkar", "Khare", "Khedkar", "Kher", "Kothavale",
  "Kshirsagar", "Lele", "Lokur", "Mahajan", "Mehendale", "Modak", "More", "Natu",
  "Nene", "Padhye", "Panshikar", "Phadnis", "Pradhan", "Punekar", "Purandare",
  "Rane", "Risbud", "Sabnis", "Sahasrabuddhe", "Sambare", "Savant", "Setalvad",
  "Shahane", "Shastri", "Tatake", "Thakar", "Thatte", "Tipnis", "Tulpule",
  "Vibhute", "Wagh", "Watve", "Yadav", "Bhalerao", "Mahabal", "Phadtare",
  "Manjrekar", "Date", "Walve", "Talnikar", "Tarkunde", "Tilekar", "Kotnis",
  "Sakhalkar", "Mhaskar", "Vijapurkar", "Borgaonkar", "Sangamkar",
  // Other Indian
  "Sharma", "Verma", "Khan", "Iyer", "Mehta", "Gupta", "Singh", "DSouza", "Nair",
  "Pereira", "Banerjee", "Reddy", "Jain", "Kapoor",
  "Aggarwal", "Sheikh", "Chopra", "Bhatia",
  "Saxena", "Shah", "Hussain", "Patel", "Menon", "Krishnan", "Ansari",
  "Talwar", "Bose", "Ghosh", "Mukherjee", "Chatterjee", "Das", "Dutta",
  "Malhotra", "Arora", "Sandhu", "Bajaj", "Bhat",
  "Nayak", "Hegde", "Shenoy", "Pai", "Rao", "Murthy", "Bhatt", "Mishra", "Pandey",
  "Bhattacharya", "Sundaram", "Raghavan",
];
if (SURNAMES.length !== 150) throw new Error(`SURNAMES must have 150, has ${SURNAMES.length}`);

const PUNE_LOCALITIES = [
  "Aundh", "Kothrud", "Baner", "Wakad", "Hadapsar", "Viman Nagar", "Kalyani Nagar",
  "Magarpatta", "Pune Camp", "Hinjawadi", "Bibwewadi", "Pashan", "Koregaon Park",
  "Salunke Vihar", "Pimpri", "Yerwada", "Sinhagad Road", "Karve Nagar", "Camp",
  "NIBM Road", "Sangamwadi", "Kondhwa", "Senapati Bapat Road", "Boat Club Road",
  "Bavdhan", "Wadgaon Sheri", "Mukundnagar", "NDA Road", "Sahakar Nagar",
  "Tilak Road", "Erandwane", "Karve Road", "Pirangut", "Kharadi", "Shivaji Nagar",
  "Pimple Saudagar", "Mundhwa", "Salisbury Park", "Fatima Nagar", "Lulla Nagar",
  "Chinchwad", "Akurdi", "Bhosari", "Vishrantwadi", "Dhayari", "Warje", "Katraj",
  "Dhankawadi", "Gokhalenagar", "Kasba Peth",
];

const FIRST_NAMES = [
  "Anjali", "Mahesh", "Priya", "Sandesh", "Ayesha", "Lakshmi", "Vaibhav", "Suchitra",
  "Riya", "Karan", "Rohan", "Karanjit", "Joanna", "Meera", "Liam", "Ananya",
  "Rajesh", "Vikram", "Aditya", "Riddhi", "Aniruddh", "Hetal", "Aravind", "Shruti",
  "Tanvi", "Anand", "Manasi", "Pradnya", "Snehal", "Sneha", "Naman", "Aliya",
  "Tarun", "Aryan", "Cyrus", "Imran", "Behram", "Shaila", "Harleen", "Vasant",
  "Ryan", "Manmeet", "Anu", "Kirti", "Saira", "Rohit", "Raghav", "Shabana",
  "Pooja", "Suresh", "Amit", "Devika", "Manoj", "Kavita", "Aniket", "Rahul",
  "Sameer", "Aishwarya", "Akshay", "Pallavi", "Vinay", "Smita", "Niraj", "Jyoti",
];

/** 200 unique pet names. Mix of dog/cat-suitable names. */
const PET_NAMES = [
  "Buddy", "Simba", "Luna", "Max", "Mowgli", "Misty", "Tiger", "Cookie", "Oscar",
  "Bella", "Ginger", "Rex", "Phantom", "Daisy", "Charlie", "Princess", "Thor",
  "Whiskers", "Boris", "Mishti", "Rocco", "Snowy", "Tommy", "Mira", "Zara",
  "Pluto", "Pepper", "Rio", "Bunny", "Leo", "Romeo", "Bobo", "Athena", "Bagheera",
  "Hazel", "Toby", "Smokey", "Goldie", "Toffee", "Yogi", "Pixie", "Storm",
  "Mochi", "Cinnamon", "Champ", "Ozzy", "Sushi", "Mango", "Coco",
  "Brutus", "Caesar", "Diego", "Elsa", "Finn", "Gizmo", "Hugo", "Iris", "Jasmine",
  "Kona", "Loki", "Maya", "Nala", "Olive", "Paws", "Quincy", "Riley", "Sadie",
  "Ursa", "Violet", "Whisper", "Xena", "Yuki", "Zelda", "Apollo", "Belle",
  "Cooper", "Duke", "Echo", "Frodo", "Gypsy", "Honey", "Ivy", "Jack", "Kiki",
  "Lola", "Milo", "Otis", "Pixel", "Quartz", "Rosie", "Stella",
  "Truman", "Una", "Vega", "Willow", "Yam", "Zeus", "Atlas", "Biscuit", "Comet",
  "Domino", "Eli", "Gus", "Hawk", "Indigo", "Juno", "Kira", "Lulu", "Marshmallow",
  "Nutmeg", "Onyx", "Patches", "Quinn", "Ruby", "Saffron", "Uno",
  "Vesper", "Waffles", "Yoshi", "Ziggy", "Arlo", "Brody", "Coal", "Dexter",
  "Ember", "Floyd", "Granite", "Halo", "Ivory", "Jude", "Kepler", "Moose", "Nyx",
  "Olympus", "Pancake", "Raisin", "Sage", "Tofu", "Wren", "Zen",
  "Apricot", "Beans", "Cricket", "Dot", "Espresso", "Fudge", "Gandalf", "Hershey",
  "Jasper", "Kix", "Lemon", "Maple", "Nutella", "Otter", "Plum", "Rooster",
  "Tater", "Umi", "Velvet", "Wasabi", "Aria", "Banjo", "Cherry", "Donut",
  "Freckles", "Goose", "Hopper", "Jelly", "Klaus", "Lentil", "Nikko",
  "Oats", "Quokka", "Rusty", "Spud", "Truffle", "Wally", "Zoom",
  "Bandit", "Cleo", "Doodle", "Frost", "Pebbles", "Sprout", "Tulip", "Vinnie",
  "Whiz", "Boba", "Crumble", "Dusty", "Fawn", "Jambo", "Koda",
  "Pip", "Reggie", "Tonka", "Woody", "Magnum", "Nori", "Saber",
];
if (PET_NAMES.length !== 200) throw new Error(`PET_NAMES must have 200, has ${PET_NAMES.length}`);

const BREEDS_BY_SPECIES = {
  dog: [
    "Labrador", "Indie", "German Shepherd", "Pomeranian", "Cocker Spaniel", "Pug",
    "Beagle", "Rottweiler", "Boxer", "Doberman", "Golden Retriever", "Indian Spitz",
    "Shih Tzu", "Saint Bernard mix", "Husky mix", "Dachshund", "Bulldog",
    "Dalmatian", "Mastiff mix", "Border Collie", "Schnauzer", "Greyhound mix",
    "Poodle", "French Bulldog",
  ],
  cat: [
    "Persian", "Domestic shorthair", "Bombay", "British Shorthair", "Maine Coon mix",
    "Siamese mix", "Domestic longhair", "Ragdoll mix", "Bengal mix", "Russian Blue mix",
  ],
};
const FUR_TONES = ["milk", "vanilla", "honey", "peach", "rust", "mushroom", "smoke", "steel", "bark", "sable"];
const PHOTO_FILES = [
  "indie01", "indie02", "indie03", "indie04", "indie05", "lab01", "gsd01", "gsd02",
  "gsd03", "pom01", "pom02", "pom03", "beagle01", "beagle02", "calico01", "calico02",
  "calico03", "tabby01", "tabby02", "tabby03", "tabby04", "bkcat01", "bkcat02",
  "bkcat03", "misha", "bruno", "coco", "pug01", "pug02",
];
const CHRONIC_POOL = [
  "Hip dysplasia", "Heart murmur grade 3/6", "Bilateral cataracts", "Osteoarthritis",
  "Atopic dermatitis", "Chronic kidney disease stage 1", "Chronic kidney disease stage 2",
  "BOAS", "Dry eye syndrome", "FLUTD", "Severe dental disease", "Chronic atopy",
  "Recurrent otitis", "Skin allergies", "Hyperthyroidism", "IVDD risk - chronic monitoring",
  "History of GDV", "Keratoconjunctivitis sicca", "Congestive heart failure",
];

// ===========================================================================
// HOUSEHOLD + PET DATASET GENERATION (deterministic)
// ===========================================================================

/** 150 households, sizes: 110 × 1 pet + 30 × 2 pets + 10 × 3 pets = 150 hh / 200 pets. */
const HOUSEHOLD_SIZES_RAW = [
  ...Array(110).fill(1),
  ...Array(30).fill(2),
  ...Array(10).fill(3),
];

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const datasetRng = makeRng(0xc0ffee);
const HOUSEHOLD_SIZES = shuffleInPlace(HOUSEHOLD_SIZES_RAW.slice(), datasetRng);
const HOUSEHOLDS_DATA = []; // [{ hhIdx, surname, locality, pets: [...] }]
const PETS_FLAT = [];        // flat 200-pet array
let petCursor = 0;

HOUSEHOLD_SIZES.forEach((size, hhIdx) => {
  const surname = SURNAMES[hhIdx];
  const locality = PUNE_LOCALITIES[hhIdx % PUNE_LOCALITIES.length];
  const householdPets = [];
  for (let p = 0; p < size; p++) {
    const species = datasetRng() < 0.7 ? "dog" : "cat";
    const breeds = BREEDS_BY_SPECIES[species];
    const breed = breeds[Math.floor(datasetRng() * breeds.length)];
    const sex = datasetRng() < 0.5 ? "male" : "female";
    const ageYears = 1 + Math.floor(datasetRng() * 14); // 1..14
    const weightKg = species === "dog"
      ? Number((5 + datasetRng() * 35).toFixed(1))   // 5-40kg dog
      : Number((3 + datasetRng() * 4).toFixed(1));   // 3-7kg cat
    const furTone = FUR_TONES[Math.floor(datasetRng() * FUR_TONES.length)];
    const photoFile = PHOTO_FILES[Math.floor(datasetRng() * PHOTO_FILES.length)];
    const chronic = datasetRng() < 0.2
      ? [CHRONIC_POOL[Math.floor(datasetRng() * CHRONIC_POOL.length)]]
      : [];
    const pet = {
      petIdx: petCursor,
      name: PET_NAMES[petCursor],
      species, breed, sex, ageYears, weightKg, furTone, photoFile, chronic,
      hhIdx, surname, locality,
      isActive: false, caseType: null,
    };
    householdPets.push(pet);
    PETS_FLAT.push(pet);
    petCursor++;
  }
  HOUSEHOLDS_DATA.push({ hhIdx, surname, locality, pets: householdPets });
});

if (HOUSEHOLDS_DATA.length !== 150) throw new Error(`expected 150 households, got ${HOUSEHOLDS_DATA.length}`);
if (PETS_FLAT.length !== 200) throw new Error(`expected 200 pets, got ${PETS_FLAT.length}`);

/** 50 active pets, spread evenly across the 200-pet array. Indices 0,4,8,...,196. */
const ACTIVE_CASE_POOL = [
  "tick_fever", "skin_allergy", "ckd_recheck", "lameness", "gi_upset",
  "flutd_recheck", "ear_otitis", "vaccination", "wellness", "breathing",
  "dietary_indiscretion", "eye_uri", "dental", "senior_decline", "fight_wound",
  "spay_recovery", "false_pregnancy",
]; // 17 case types; cycle to fill 50
for (let i = 0; i < 50; i++) {
  const petArrIdx = Math.floor(i * PETS_FLAT.length / 50); // 0, 4, 8, ..., 196
  PETS_FLAT[petArrIdx].isActive = true;
  PETS_FLAT[petArrIdx].caseType = ACTIVE_CASE_POOL[i % ACTIVE_CASE_POOL.length];
}
const ACTIVE_COUNT = PETS_FLAT.filter((p) => p.isActive).length;
if (ACTIVE_COUNT !== 50) throw new Error(`expected 50 active pets, got ${ACTIVE_COUNT}`);

// ===========================================================================
// CASE TEMPLATES (clinical content for active pets only)
// Unchanged from the 50-pet seed. Each visit references one of these for
// chief_complaint, diagnosis, SOAP note, and the line items that fan out
// into invoice_line_items.
// ===========================================================================
const soap = (s, o, a, p) => `S: ${s} | O: ${o} | A: ${a} | P: ${p}`;

const CASE_TEMPLATES = {
  tick_fever: {
    chief: "Tick fever recheck",
    diag: "Ehrlichia canis infection",
    soap: soap(
      "Parent reports lethargy 2 days, off food, mild fever, slight bleeding from gums when licking. Tick exposure on apartment lawn confirmed. No vomiting or diarrhea.",
      "T 39.6 C. Pale-pink mucous membranes. Mild submandibular lymphadenopathy bilaterally. Mild dehydration (~5%). Heart and lung sounds normal. Tick removed from right pinna at presentation.",
      "Canine monocytic ehrlichiosis (Ehrlichia canis), acute phase. Mild thrombocytopenia anticipated.",
      "CBC + 4DX SNAP sent today. Doxycycline 5mg/kg PO BID for 28 days started empirically. Subcut fluids 250ml. Recheck in 7 days with CBC for platelet recovery."
    ),
    items: [
      ["service", "Consultation", 500],
      ["lab", "CBC", 800],
      ["lab", "4DX SNAP test", 1500],
      ["medication", "Doxycycline 100mg x 56 tablets", 420],
      ["service", "Subcutaneous fluid therapy", 300],
    ],
  },
  skin_allergy: {
    chief: "Skin flare, intense itching",
    diag: "Atopic dermatitis with secondary pyoderma",
    soap: soap(
      "Parent reports relentless scratching for 1 week. Pet keeping family awake at night. Hot spots forming on flank and ventral abdomen. No diet change. Monsoon onset.",
      "Generalized erythema on ventrum and flanks. Two hot spots noted (3cm and 2cm). Skin scrape negative for Demodex. Cytology: cocci (+ + +), few yeast.",
      "Atopic dermatitis flare with secondary bacterial pyoderma. Seasonal pattern (monsoon-driven).",
      "Cytopoint injection 2mg/kg given today. Cephalexin 22mg/kg PO BID for 21 days. Chlorhexidine bathe twice weekly. Apoquel option discussed for chronic management. Recheck 2 weeks."
    ),
    items: [
      ["service", "Consultation", 500],
      ["lab", "Skin scrape + cytology", 400],
      ["medication", "Cytopoint injection", 2400],
      ["medication", "Cephalexin 500mg x 42 capsules", 630],
      ["medication", "Chlorhexidine shampoo 200ml", 350],
    ],
  },
  gi_upset: {
    chief: "Vomiting and diarrhea",
    diag: "Acute gastroenteritis, likely dietary indiscretion",
    soap: soap(
      "Parent reports 4 episodes of vomiting since last night and watery diarrhea this morning. Pet got into the kitchen bin yesterday evening. Eating habits normal until then.",
      "T 38.9 C. Mild dehydration (~5%). Abdomen soft, mildly tender on cranial palpation. No foreign body palpable. Mucous membranes pink, CRT under 2 sec.",
      "Acute gastroenteritis secondary to dietary indiscretion. No clinical evidence of obstruction.",
      "Maropitant 1mg/kg SC given. Subcut fluids 300ml. Bland diet (boiled chicken + rice) for 3 days. Probiotic paste BID for 7 days. Return if vomiting persists past 24h."
    ),
    items: [
      ["service", "Consultation", 500],
      ["medication", "Maropitant injection", 250],
      ["service", "Subcutaneous fluid therapy", 300],
      ["medication", "Probiotic paste x 7 days", 280],
      ["medication", "ORS sachets x 4", 100],
    ],
  },
  ear_otitis: {
    chief: "Head-shaking and ear scratching",
    diag: "Otitis externa, bacterial + Malassezia",
    soap: soap(
      "Parent reports head-shaking and scratching at right ear for 4 days. Yellow waxy discharge noted. Pet wincing when ear is touched. Monsoon humidity flaring chronic atopy.",
      "Right ear: erythema, purulent exudate, malodor. Tympanic membrane intact on otoscopy. Cytology: rod-shaped bacteria + + and Malassezia yeast + +. Left ear clear.",
      "Otitis externa, right ear. Mixed bacterial and yeast infection on atopic background.",
      "Ear cleaner flush done in-clinic. Mometamax otic drops 4 drops BID for 14 days. Recheck cytology at 2 weeks. Apoquel discussed for underlying atopy."
    ),
    items: [
      ["service", "Consultation", 500],
      ["service", "Ear flush + cleaning", 400],
      ["lab", "Ear cytology", 300],
      ["medication", "Mometamax otic 15ml", 850],
    ],
  },
  lameness: {
    chief: "Lameness, right hind limb",
    diag: "Acute soft-tissue injury vs early osteoarthritis",
    soap: soap(
      "Parent reports onset 4 days ago after a slip during evening walk. Pet bears weight intermittently. Sleeping more, less keen to climb stairs. Recent rain.",
      "Mild lameness right hind on walking. Pain on hip extension. No swelling. Range of motion reduced ~15%. Stifle stable on drawer test. No crepitus.",
      "Acute soft-tissue injury, right hip. Cannot rule out early osteoarthritis without imaging.",
      "Meloxicam 0.1mg/kg PO SID for 7 days. Strict rest for 10 days (lead-only walks under 10 min). Recheck if no improvement at 7 days. Hip radiographs if recurrent."
    ),
    items: [
      ["service", "Consultation", 500],
      ["service", "Orthopedic exam", 400],
      ["medication", "Meloxicam 1.5mg/ml suspension 30ml", 480],
    ],
  },
  flutd_recheck: {
    chief: "FLUTD recheck",
    diag: "Feline idiopathic cystitis, follow-up",
    soap: soap(
      "Parent reports no straining or blood in urine since last visit. Using litter normally. On Hill's c/d Multicare wet food + dry. Drinking from fountain.",
      "Weight stable 3.8kg. Bladder small, non-painful on palpation. Coat good. Mucous membranes pink, hydration normal.",
      "Feline idiopathic cystitis in remission on diet. No current obstruction.",
      "Continue c/d Multicare diet 100%. Maintain fountain access. Stress-reduction (Feliway diffuser, pheromone). Recheck UA in 3 months. Return immediately if straining."
    ),
    items: [
      ["service", "Consultation", 500],
      ["service", "Wellness recheck", 300],
      ["lab", "Urinalysis", 600],
      ["food", "Hill's c/d Multicare wet x 12 cans", 1440],
    ],
  },
  ckd_recheck: {
    chief: "CKD quarterly recheck",
    diag: "Chronic kidney disease IRIS stage 2, stable",
    soap: soap(
      "Parent reports steady appetite on renal diet. Drinking water normally, urine output normal. Energy slightly lower than 3 months ago.",
      "Weight 4.2kg (down 100g from last quarter). Coat slightly poorer. Mucous membranes pink. Kidneys palpate small, non-painful.",
      "CKD IRIS stage 2. Slight progression suggested by weight trend; bloodwork to confirm.",
      "Renal panel + UPC ratio + blood pressure sent today. Continue Hill's k/d diet. Subcut fluids 100ml/kg subcutaneously twice weekly at home. Recheck in 6 weeks."
    ),
    items: [
      ["service", "Consultation", 500],
      ["lab", "Renal panel + electrolytes", 1400],
      ["lab", "UPC ratio", 800],
      ["service", "Blood pressure measurement", 300],
      ["food", "Hill's k/d dry 1.5kg", 1600],
    ],
  },
  breathing: {
    chief: "Exercise intolerance and snoring",
    diag: "Brachycephalic obstructive airway syndrome (BOAS), grade 2",
    soap: soap(
      "Parent reports louder snoring, unable to walk more than 10 minutes without panting and stopping. Worse in afternoon heat. Owner-reported episode of cyanotic gums last week.",
      "T 38.9 C. Resp rate 36 at rest. Stenotic nares grade 2. Audible upper airway noise. Mild gum cyanosis on excitement.",
      "BOAS grade 2. Increased risk of progression with weight gain or heat exposure.",
      "Weight loss plan: target 1kg over 3 months. Restrict exercise to early-morning walks. Avoid afternoon outings. BOAS surgical correction discussed; referred to specialist. Recheck weight in 6 weeks."
    ),
    items: [
      ["service", "Consultation", 500],
      ["service", "Respiratory exam", 300],
      ["lab", "Thoracic radiographs (2 views)", 1200],
      ["service", "Pulse oximetry", 200],
      ["service", "Weight management plan", 0],
    ],
  },
  dietary_indiscretion: {
    chief: "Ate non-food item",
    diag: "Dietary indiscretion, no obstruction",
    soap: soap(
      "Parent caught pet eating a leather shoe insole approximately 6 hours ago. No vomiting yet. One small piece recovered; estimated 1/3 swallowed. Pet acting normal, eating normally.",
      "T 38.7 C. Abdomen soft, non-painful on palpation. Bowel sounds normal. No foreign body palpable. Mucous membranes pink, CRT under 2 sec.",
      "Recent dietary indiscretion. Material is soft and likely to pass; no current clinical signs of obstruction.",
      "Conservative management. Bland diet 48h. Monitor for vomiting, lethargy, anorexia. Return immediately if symptoms develop. Abdominal radiographs if no stool in 48h."
    ),
    items: [
      ["service", "Consultation - urgent", 700],
      ["service", "Abdominal palpation exam", 300],
      ["service", "Observation 2 hours", 200],
      ["medication", "Pumpkin paste supplement", 180],
    ],
  },
  eye_uri: {
    chief: "Eye discharge and sneezing",
    diag: "Feline upper respiratory infection",
    soap: soap(
      "Parent reports green discharge from both eyes for 3 days, sneezing, mild appetite reduction. Boarded last week, possible exposure. No coughing.",
      "T 39.2 C. Bilateral conjunctivitis with mucopurulent discharge. Mild nasal discharge. Lungs clear. Mucous membranes pink, hydration normal.",
      "Feline herpesvirus / calicivirus complex with secondary bacterial conjunctivitis.",
      "Doxycycline 10mg/kg PO SID for 14 days. Terramycin eye ointment TID for 10 days. L-lysine 500mg PO BID. Recheck in 10 days. Isolate from other cats."
    ),
    items: [
      ["service", "Consultation", 500],
      ["service", "Ophthalmic exam", 300],
      ["medication", "Doxycycline 100mg x 28 tablets", 280],
      ["medication", "Terramycin eye ointment", 220],
      ["medication", "L-lysine paste", 350],
    ],
  },
  dental: {
    chief: "Bad breath, reluctance to chew kibble",
    diag: "Periodontal disease grade 3, multiple dental fractures",
    soap: soap(
      "Parent reports strong odor from mouth for several months, recent reluctance to chew kibble and dropping food. Eating soft food normally.",
      "Tartar grade 3 generalized. Right upper carnassial (108) fractured with pulp exposure. Mobile left lower incisors (303, 304). Moderate gingivitis throughout.",
      "Periodontal disease grade 3 with two dental fractures requiring extraction. Patient is otherwise well.",
      "Pre-anesthetic bloodwork scheduled. Dental prophylaxis with extractions planned next week. Soft diet until procedure. Post-op antibiotics + analgesia at procedure time."
    ),
    items: [
      ["service", "Consultation", 500],
      ["service", "Dental assessment + charting", 600],
      ["lab", "Pre-anesthetic bloodwork", 1200],
      ["food", "Soft diet kibble 1kg", 600],
    ],
  },
  senior_decline: {
    chief: "Slowing down, joint stiffness",
    diag: "Geriatric osteoarthritis progression",
    soap: soap(
      "Parent reports steady decline over 2 months: slower on walks, reluctant to climb stairs, sleeping more. Appetite stable. No vomiting or diarrhea.",
      "Weight stable. BCS 5/9. Mild crepitus right hip on flexion. Reduced range of motion both stifles. Heart: grade 2/6 systolic murmur (unchanged from last). Lungs clear.",
      "Progressing osteoarthritis, multiple joints. Stable cardiac murmur. Senior status appropriate.",
      "Galliprant 2mg/kg PO SID started. Joint supplement (Dasuquin) chew daily. Senior wellness panel sent. Recommend orthopedic bed and ramps. Recheck in 4 weeks."
    ),
    items: [
      ["service", "Senior wellness consultation", 600],
      ["lab", "Senior wellness panel", 1800],
      ["medication", "Galliprant 60mg x 30 tablets", 1400],
      ["medication", "Dasuquin Advanced x 60 chews", 1900],
    ],
  },
  fight_wound: {
    chief: "Cat fight wound and abscess",
    diag: "Cat-bite abscess left flank with cellulitis",
    soap: soap(
      "Parent saw the pet in a fight 4 days ago. Today noticed a swelling on left flank. Slight lethargy and reduced appetite for 1 day.",
      "T 39.4 C. Fluctuant 3x4cm swelling left flank. Two puncture wounds visible. Mild lameness left rear. Otherwise systemic exam unremarkable.",
      "Cat-bite abscess with localized cellulitis. No deep structures involved on palpation.",
      "Abscess lanced and flushed under sedation. Penrose drain placed for 48h. Amoxicillin-clavulanate 20mg/kg PO BID for 10 days. Buprenorphine 0.02mg/kg buccal Q8h for 3 days. Recheck for drain removal."
    ),
    items: [
      ["service", "Consultation - urgent", 700],
      ["service", "Sedation for abscess drainage", 1200],
      ["service", "Lance + flush + drain placement", 800],
      ["medication", "Amoxicillin-clavulanate x 20 tablets", 480],
      ["medication", "Buprenorphine 0.3mg/ml x 1ml", 350],
    ],
  },
  spay_recovery: {
    chief: "Post-spay recovery check",
    diag: "Routine ovariohysterectomy, 10-day recheck",
    soap: soap(
      "Parent reports good recovery. Eating well from day 2. Wearing the e-collar consistently. No interference at incision. Mild swelling first 3 days, now resolved.",
      "Weight stable post-op. Incision dry, no discharge, slight pink suture line. Sutures intact. T 38.6 C. Behavior normal.",
      "Routine ovariohysterectomy with normal recovery course.",
      "Skin sutures removed today. E-collar off. Resume normal exercise gradually. Continue current diet. No further recheck needed unless concerns arise."
    ),
    items: [
      ["service", "Post-op recheck", 400],
      ["service", "Skin suture removal", 200],
    ],
  },
  false_pregnancy: {
    chief: "False pregnancy signs",
    diag: "Pseudopregnancy",
    soap: soap(
      "Parent reports mammary enlargement, nesting behavior, possessiveness over a soft toy. Last heat 6 weeks ago. Not bred. Appetite normal.",
      "Mammary glands moderately enlarged with serous milk on expression. Vulva normal size. Otherwise systemic exam unremarkable.",
      "Pseudopregnancy. Self-limiting condition; usually resolves over 2-3 weeks.",
      "Discussed: avoid handling mammary glands (worsens). Remove nesting objects. No medication needed unless severe distress. Spay strongly recommended after resolution. Recheck in 3 weeks."
    ),
    items: [
      ["service", "Consultation", 500],
      ["service", "Reproductive exam", 300],
      ["service", "Spay consultation + estimate", 0],
    ],
  },
  vaccination: {
    chief: "Annual booster",
    diag: "Routine vaccination, no clinical concerns",
    soap: soap(
      "Parent reports pet in excellent health. Eating, drinking, behaving normally. Last booster 12 months ago. No recent illness or medication.",
      "T 38.8 C. Weight stable. Heart and lung sounds normal. Mucous membranes pink, CRT under 2 sec. Coat and skin good. No lymphadenopathy.",
      "Healthy patient, suitable for annual core vaccinations.",
      "DHPPi+L4 + Rabies given today. Update record. Nail trim done at owner request. Return in 12 months for next booster. Continue monthly parasite prevention."
    ),
    items: [
      ["service", "Consultation - wellness", 500],
      ["medication", "DHPPi+L4 vaccine", 800],
      ["medication", "Rabies vaccine", 600],
      ["service", "Nail trim", 200],
    ],
  },
  wellness: {
    chief: "Annual wellness exam",
    diag: "Healthy adult, no clinical concerns",
    soap: soap(
      "Parent reports pet in good health, eating well, behaving normally. Concerns: occasional paw licking at night. No travel or known exposures. Diet unchanged.",
      "T 38.7 C. Weight stable. Heart and lung sounds normal. Mucous membranes pink, CRT under 2 sec. Mild interdigital erythema right front paw. Otherwise normal.",
      "Healthy adult on annual exam. Mild atopic dermatitis (paw chewing).",
      "Continue current diet and routine. Topical paw spray for itching, twice daily. Return if licking worsens or spreads. Next annual exam in 12 months."
    ),
    items: [
      ["service", "Wellness exam", 500],
      ["service", "Full physical exam", 300],
      ["medication", "Topical anti-itch spray 100ml", 280],
    ],
  },
};

// ===========================================================================
// MULTI-VARIANT PARENT MESSAGES (locked 2026-05-16; multi-variant fix)
// ===========================================================================

/** Render a parent-message template with the pet's name + sex pronouns.
 *  Templates use {name}, {they}, {them}, {their}. */
function renderParentMessage(template, pet) {
  const isMale = pet.sex === "male";
  return template
    .replaceAll("{name}", pet.name)
    .replaceAll("{they}", isMale ? "he" : "she")
    .replaceAll("{them}", isMale ? "him" : "her")
    .replaceAll("{their}", isMale ? "his" : "her");
}

const PARENT_MESSAGES = {
  tick_fever: [
    "Hi Doctor, since the doxycycline started 5 days ago the lethargy is much better but I'm seeing some gum bleeding when {they} chews {their} toy. Is that the platelets recovering or should I bring {them} in sooner?",
    "Doctor, {name} is eating and playing normally now. Should we still finish the full 28 days of doxycycline or recheck early?",
  ],
  skin_allergy: [
    "Hi Doctor, the Cytopoint helped for about a week but {they}'s started scratching again, woke us up at 3am. The hot spot near {their} hip looks bigger today. Should we move to Apoquel?",
    "Doctor, the bath and cephalexin routine has settled the worst of it, but {name} still chews {their} paws at night. Worth adding the medicated shampoo more often?",
    "Hi Doctor, the cephalexin finishes tomorrow. {their} skin looks 80% better but two spots on the belly are still pink. Bring {them} in or extend the course?",
    "Doctor, {name}'s itchiness is back in the same flank spot as last monsoon. We have 4 Apoquel tablets left from last year. Safe to start while we book a recheck?",
    "Hi Doctor, the Cytopoint is approaching the 4-week mark and the itching has crept back. {their} undercoat is thinner on the belly. Time for the next shot?",
    "Doctor, switched {name} to limited-ingredient kibble two weeks ago. Scratching reduced but ear flaps are still red. Adding the chlorhexidine wipes, anything else?",
  ],
  ckd_recheck: [
    "Doctor, {they}'s been refusing the renal kibble for 3 days now and only eating the wet food. Also {their} water bowl is emptying faster than usual. Worth a check-in?",
    "Hi Doctor, {name} did 4 subcut fluid sessions at home this week and tolerated them well. The next renal panel is in 2 weeks, anything to watch in the meantime?",
    "Doctor, {name}'s weight is down 200g from {their} last weigh-in. Eating the k/d but smaller portions. Should we move the recheck up?",
  ],
  lameness: [
    "Hi Doctor, {they}'s still favoring the right hind after a week of rest. Sometimes {they} yelps when getting up. The meloxicam is finished. What's next?",
    "Doctor, {name} can put weight on the leg now but slows down halfway through walks. The meloxicam course ends Friday. Joint supplements time?",
    "Hi Doctor, {name} slipped on the bathroom tile this morning and the limp is back. Same leg as before. Should I rest {them} or come in?",
    "Doctor, the orthopedic bed is here and {name} naps on it but still struggles on the stairs. Worth talking about Galliprant on top of the supplements?",
    "Hi Doctor, after 10 days of rest {name} ran for the door this morning, no yelping. Can we slowly reintroduce the evening walk or wait the full 2 weeks?",
    "Doctor, the X-ray from last visit showed mild changes. {name}'s mobility is similar today as it was a week ago. What does ongoing maintenance look like?",
  ],
  gi_upset: [
    "Doctor, the vomiting stopped but the diarrhea is still there today, more frequent than yesterday. {they}'s drinking but not eating the bland diet. Bring {them} in?",
    "Hi Doctor, {name} held down chicken and rice last night but threw up the kibble this morning. Should we go back to the maropitant or wait it out?",
    "Doctor, three days since the kitchen bin incident, stool is normal again and {name} is eating regular food. Anything to watch for or are we clear?",
    "Hi Doctor, {name} is hungry today and eating well, but the stool is still loose. Continue the probiotic past the 7-day mark?",
  ],
  flutd_recheck: [
    "Hi Doctor, {name}'s been in and out of the litter box a lot since last night. No urine that I can see, just straining. Worried this is another flare.",
  ],
  ear_otitis: [
    "Doctor, after 7 days of Mometamax the discharge is reduced but {they}'s still shaking {their} head. Smell is mostly gone. Continue full 14 days or recheck early?",
    "Hi Doctor, the right ear looks clear but {name} started scratching the left side yesterday. Same drops on the other ear or a fresh look first?",
    "Doctor, finished the 14 days of Mometamax. The discharge is gone but {name} still tilts {their} head sometimes. Is that residual or starting again?",
  ],
  vaccination: [
    "Hi Doctor, want to confirm {their} DHPP+Rabies booster schedule for the year. Also asking if we can do nail trim at the same appointment.",
    "Doctor, the DHPP card from last year says next booster in May. Can we book the slot, and add the lepto since we travel to the hills next month?",
    "Hi Doctor, {name}'s 16-week vaccines are due. Will the rabies happen the same day or do we space it out?",
    "Doctor, our boarding facility asks for a fresh DHPP record dated within 6 months. {their} last shot was 4 months ago, do they need a new one or just a copy of the card?",
    "Hi Doctor, the kitten vaccines start this weekend. Bringing {name} in for the first FVRCP, also wanted to ask about deworming timing.",
  ],
  wellness: [
    "Hi Doctor, due for {their} annual. Also one small thing, {they}'s been licking {their} front left paw at night. Probably nothing but worth a look at the visit.",
    "Doctor, the annual is overdue by 2 months. {name} is eating fine, energy is fine, but {they}'s gained almost a kilo. Bring {them} in for the full check?",
    "Hi Doctor, {name} feels lumpy on the right side near {their} ribs. Probably a fatty mass but I'd like that examined at the annual. Can we book?",
    "Doctor, the senior wellness flagged borderline kidney values last year. Time for the recheck along with the annual exam?",
  ],
  breathing: [
    "Doctor, {they} had another cyanotic gum episode this morning during the walk. Lasted maybe 10 seconds. Walks are now under 8 minutes. Is the BOAS surgery still on the table?",
    "Hi Doctor, the weight loss is going well, {name} is down 700g. The snoring is quieter at night but the panting still gets bad in the afternoon. Surgery referral?",
  ],
  dietary_indiscretion: [
    "Hi Doctor, 36 hours since {name} ate the shoe insole, no stool yet today. {they}'s eating and seems normal. When should I get worried?",
  ],
  eye_uri: [
    "Doctor, the eye discharge is much better but {they}'s started sneezing again today, more than 10 times in an hour. Should I add anything to the L-lysine?",
    "Hi Doctor, the doxycycline course is finishing, {name}'s eyes are clear and the sneezing has dropped to a few times a day. Isolation from the other cat over?",
    "Doctor, {name} is the new rescue we picked up last week, this is {their} first URI flare. The terramycin is hard to apply, any tips? Both eyes still gummy in the morning.",
    "Hi Doctor, finished the 14 days of doxycycline yesterday. {their} eyes look beautiful but I caught one sneeze this morning. False alarm or extend the course?",
  ],
  dental: [
    "Hi Doctor, scheduling {name}'s dental cleaning. {they}'s also dropping {their} food more often this week, is the procedure date still 3 weeks out or can we move it sooner?",
  ],
  senior_decline: [
    "Doctor, the Galliprant has helped but in the last 2 days {they}'s been refusing {their} evening walk and slept through dinner. Worth bringing {them} in for a recheck?",
    "Hi Doctor, {name} has been off the Dasuquin for a week (out of stock at the pharmacy). The stiffness on the stairs is back. Should I find another brand or wait for the same one?",
    "Doctor, {name}'s appetite dropped this week, eating maybe half of what {they} did last month. Senior panel is due. Bring {them} in this week?",
    "Hi Doctor, {name} is sleeping a lot more than usual and barely moves when I come home. The Galliprant routine hasn't changed. Is this the next stage or something else?",
  ],
  fight_wound: [
    "Doctor, {name}'s drain is staying in place but the area around it is warmer and swollen today. Day 3 post-procedure. The antibiotic is being given on time.",
  ],
  spay_recovery: [
    "Hi Doctor, all good post-spay! Sutures removed, {they}'s running around as usual. Asking for a copy of the discharge summary for our records, vacation boarding next month asked for it.",
    "Doctor, the spay incision is healing well, day 8. {name} licks at it when the e-collar slips. Two more days to suture removal, anything to watch for in the meantime?",
    "Hi Doctor, {name}'s eating well and the wound is dry. {they}'s back to normal energy on day 5 and the e-collar is making {them} miserable. Safe to take off if I supervise?",
  ],
  false_pregnancy: [
    "Doctor, {name}'s mammary swelling has gone down but now {they}'s hiding {their} toys aggressively and growling when I come near. Is this normal pseudopreg behavior or do we need to revisit?",
  ],
};

const MARATHI_PARENT_MESSAGES = {
  tick_fever: "हाय डॉक्टर, ५ दिवसांपूर्वी डॉक्सीसायक्लीन सुरू केल्यापासून थकवा खूप कमी झालाय, पण आज खेळणं चावताना हिरडीतून रक्त येताना दिसलं. प्लेटलेट्स वर येतायत का, की आधी आणून दाखवू?",
  skin_allergy: "डॉक्टर, सायटोपॉईंट एक आठवडा काम केलं पण परत खाजवायला लागलाय, पहाटे ३ ला उठवलं. हिप जवळचा हॉट स्पॉट आज मोठा वाटतोय. आता ॲपोक्वेल सुरू करूया का?",
  ckd_recheck: "डॉक्टर, ती ३ दिवसांपासून रीनल किबल खात नाहीये, फक्त wet food घेतेय. पाण्याची वाटीही नेहमीपेक्षा लवकर संपतेय. एकदा चेक करायला आणू का?",
  lameness: "हाय डॉक्टर, आठवडाभर विश्रांती घेऊनही तो अजून उजवा मागचा पाय सावरून चालतोय. कधीकधी उठताना कुई करतो. मेलॉक्सीकॅम संपलंय. आता पुढे काय?",
  gi_upset: "डॉक्टर, उलट्या थांबल्या पण आज जुलाब अजूनही आहेत, कालपेक्षा जास्त वेळा. पाणी पितोय पण ब्लँड डाएट खात नाहीये. आणू का?",
  flutd_recheck: "हाय डॉक्टर, ती कालपासून सारखी लिटर बॉक्समध्ये जातेय येतेय. लघवी दिसत नाहीये, फक्त जोर लावतेय. परत फ्लेअर वाटतोय, काळजी वाटतेय.",
  ear_otitis: "डॉक्टर, ७ दिवस मोमेटामॅक्स झालंय, डिस्चार्ज कमी झालाय पण अजूनही डोकं हलवतोय. वास जवळपास गेलाय. १४ दिवस पूर्ण करायचे का आधीच रीचेक करायचा?",
  vaccination: "हाय डॉक्टर, तिच्या DHPP आणि रेबीज बूस्टरचं या वर्षाचं शेड्यूल कन्फर्म करायचंय. त्याच भेटीत नखं कापायला घेऊ शकतो का?",
  wellness: "हाय डॉक्टर, त्याची वार्षिक तपासणी आहे. एक छोटी गोष्ट, रात्री तो समोरचा डावा पंजा चाटत बसतो. बहुधा काही नसेल पण भेटीत बघून घ्या.",
  breathing: "डॉक्टर, आज सकाळी फिरताना त्याच्या हिरड्या परत निळ्या पडल्या. साधारण १० सेकंद. आता वॉक्स ८ मिनिटांपेक्षा कमी झालेत. BOAS सर्जरीचा विचार करूया का?",
  dietary_indiscretion: "हाय डॉक्टर, शूचं इन्सोल खाऊन ३६ तास झालेत, अजून शी झाली नाहीये. खातोय आणि नॉर्मल वागतोय. कधी काळजी करायची?",
  eye_uri: "डॉक्टर, डोळ्यांचा डिस्चार्ज खूप कमी झालाय पण आज परत शिंकायला लागलीये, एका तासात १० पेक्षा जास्त वेळा. एल-लायसीन सोबत आणखी काही द्यायचं का?",
  dental: "हाय डॉक्टर, त्याचं डेंटल क्लीनिंग शेड्यूल करायचंय. या आठवड्यात तो खाताना अन्न जास्त पाडतोय. ३ आठवडे थांबायचं का आधी करायचं?",
  senior_decline: "डॉक्टर, गॅलिप्रंट काम करतंय पण २ दिवसांपासून संध्याकाळचा वॉक नाकारतोय आणि जेवण न करता झोपून गेलाय. एकदा रीचेकला आणू का?",
  fight_wound: "डॉक्टर, ड्रेन जागेवर आहे पण आजूबाजूचा भाग आज जास्त गरम आणि सुजलेला वाटतोय. प्रोसीजरचा तिसरा दिवस. अँटिबायोटिक वेळेवर देतोय.",
  spay_recovery: "हाय डॉक्टर, स्पे नंतर सगळं छान आहे! सूचर्स काढले, ती परत खेळतेय. आमच्या रेकॉर्डसाठी डिस्चार्ज समरीची कॉपी हवीये, पुढच्या महिन्यात बोर्डिंगसाठी मागितलीय.",
  false_pregnancy: "डॉक्टर, स्तनांची सूज कमी झालीये पण आता ती खेळणी लपवून ठेवतेय, मी जवळ गेले की गुरगुरते. हे नॉर्मल pseudopreg वर्तन आहे की परत भेटायला यायचं?",
};

// ===========================================================================
// VISIT SCHEDULE: 50 active pets × 3 visits = 150 unique dates spread across
// Jan 1 2025 → today (2026-05-17), 502 days. Deterministic shuffle.
// ===========================================================================
const WINDOW_START = new Date(Date.UTC(2025, 0, 1));
const WINDOW_DAYS = 502;
const TOTAL_VISITS = 50 * 3;
const VISIT_SCHEDULE = (() => {
  const slots = [];
  for (let i = 0; i < 50; i++) {
    for (let v = 0; v < 3; v++) slots.push({ activeOrd: i, v });
  }
  const sched = makeRng(0xfeedface);
  shuffleInPlace(slots, sched);
  const map = {};
  slots.forEach((s, rank) => {
    const days = Math.floor(rank * (WINDOW_DAYS - 1) / (TOTAL_VISITS - 1));
    const d = new Date(WINDOW_START);
    d.setUTCDate(d.getUTCDate() + days);
    map[`${s.activeOrd}-${s.v}`] = {
      date: d.toISOString().slice(0, 10),
      ts: d.toISOString(),
    };
  });
  return map;
})();
const visitDateFor = (activeOrd, v) => VISIT_SCHEDULE[`${activeOrd}-${v}`].date;
const visitTsFor = (activeOrd, v) => VISIT_SCHEDULE[`${activeOrd}-${v}`].ts;

const VISIT_TYPE_FOR_CASE = (caseType) => {
  if (caseType === "vaccination") return "vaccination";
  if (caseType === "spay_recovery") return "surgery";
  return "consultation";
};
const LINE_ITEM_TYPE_FOR_TAG = (tag, name) => {
  if (tag === "medication") return "medication";
  if (tag === "food") return "medication";
  if (tag === "lab") return "procedure";
  if (tag === "service") {
    const n = name.toLowerCase();
    if (n.includes("vaccin")) return "vaccination";
    if (n.startsWith("consult") || n.includes("wellness exam") || n.includes("recheck") || n.includes("post-op")) return "consultation";
    return "procedure";
  }
  return "procedure";
};

// ===========================================================================
// RUN
// ===========================================================================
async function run() {
  const start = Date.now();
  console.log(`Pawkit demo seed (150 hh / 200 pets / 50 active): starting...`);

  const householdsToInsert = [];
  const usersToInsert = [];
  const petsToInsert = [];
  const visitsToInsert = [];
  const invoicesToInsert = [];
  const lineItemsToInsert = [];
  const windowsToInsert = [];
  const messagesToInsert = [];
  const vaccinationsToInsert = [];

  // Trackers for broadcasts_read seeding (after main inserts).
  const allParentIds = [];
  const dogHouseholdParentIds = [];
  const activeHouseholdParentIds = [];

  let invoiceCounter = 5000;
  const marathiCasesSeen = new Set();
  const caseTypeOrdinal = new Map();
  let activeOrd = 0;

  HOUSEHOLDS_DATA.forEach((hh) => {
    const householdId = randomUUID();
    const parentId = randomUUID();
    const phone = `+91 9${String(7000000000 + hh.hhIdx * 13).slice(0, 9)}`;
    const parentName = `${FIRST_NAMES[hh.hhIdx % FIRST_NAMES.length]} ${hh.surname}`;
    const householdName = `The ${hh.surname} Family`;

    householdsToInsert.push({
      id: householdId,
      name: householdName,
      address: `${hh.locality}, Pune 411XXX, Maharashtra`,
      phone,
    });
    const parentRow = {
      id: parentId,
      household_id: householdId,
      role: "parent",
      full_name: parentName,
      phone,
      preferred_language: "en", // may flip to "mr" below if any active pet triggers MR
    };
    usersToInsert.push(parentRow);

    allParentIds.push(parentId);
    const hhHasDog = hh.pets.some((p) => p.species === "dog");
    const hhHasActivePet = hh.pets.some((p) => p.isActive);
    if (hhHasDog) dogHouseholdParentIds.push(parentId);
    if (hhHasActivePet) activeHouseholdParentIds.push(parentId);

    hh.pets.forEach((pet) => {
      const petId = randomUUID();
      const birthYear = NOW.getUTCFullYear() - pet.ageYears;
      const birthMonth = ((pet.petIdx * 7) % 12) + 1;
      const birthDay = ((pet.petIdx * 11) % 27) + 1;
      const birthday = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
      const avatarUrl = `${STORAGE_BASE}/${pet.photoFile}.jpg`;

      petsToInsert.push({
        id: petId,
        household_id: householdId,
        clinic_id: CLINIC_ID,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        sex: pet.sex,
        birthday,
        age_years_at_entry: pet.ageYears,
        weight_kg: pet.weightKg,
        chronic_conditions: pet.chronic,
        fur_match_primary: pet.furTone,
        avatar_url: avatarUrl,
        regular_vet_id: VET_ID,
      });

      if (!pet.isActive) return; // QUIET pet: identity only, done.

      // ACTIVE pet: 3 visits + 3 invoices + line items + 1 follow-up window + 1 message
      const caseType = pet.caseType;
      const useMarathi = MARATHI_PARENT_MESSAGES[caseType] && !marathiCasesSeen.has(caseType);
      if (useMarathi) {
        marathiCasesSeen.add(caseType);
        parentRow.preferred_language = "mr";
      }

      const v1Id = randomUUID();
      const v2Id = randomUUID();
      const v3Id = randomUUID();
      const v1Date = visitDateFor(activeOrd, 0);
      const v2Date = visitDateFor(activeOrd, 1);
      const v3Date = visitDateFor(activeOrd, 2);
      const v3Ts = visitTsFor(activeOrd, 2);

      const v1Template = CASE_TEMPLATES.vaccination;
      const v2Case = pet.chronic.length > 0 ? "skin_allergy" : (pet.petIdx % 2 === 0 ? "wellness" : "ear_otitis");
      const v2Template = CASE_TEMPLATES[v2Case] ?? CASE_TEMPLATES.wellness;
      const v3Template = CASE_TEMPLATES[caseType];

      const threadId = randomUUID();
      const visitPlan = [
        [v1Id, v1Template, v1Date, "vaccination"],
        [v2Id, v2Template, v2Date, VISIT_TYPE_FOR_CASE(v2Case)],
        [v3Id, v3Template, v3Date, VISIT_TYPE_FOR_CASE(caseType)],
      ];

      visitPlan.forEach(([visitId, tpl, vdate, vtype]) => {
        visitsToInsert.push({
          id: visitId,
          pet_id: petId,
          vet_id: VET_ID,
          visit_type: vtype,
          visit_date: vdate,
          chief_complaint: tpl.chief,
          diagnosis: tpl.diag,
          soap_note: tpl.soap,
        });
      });

      // Vaccinations on visit 1 (the vaccination visit): DHPP + Rabies for every
      // active pet. administered_date = v1; next_due_date = v1 + 12 months.
      const v1DateObj = new Date(`${v1Date}T00:00:00Z`);
      const nextDueObj = new Date(v1DateObj);
      nextDueObj.setUTCFullYear(nextDueObj.getUTCFullYear() + 1);
      const nextDueDate = nextDueObj.toISOString().slice(0, 10);
      ["DHPP", "Rabies"].forEach((vac, vidx) => {
        vaccinationsToInsert.push({
          pet_id: petId,
          visit_id: v1Id,
          vaccine_type: vac,
          administered_date: v1Date,
          next_due_date: nextDueDate,
          batch_number: `B${String(activeOrd).padStart(3, "0")}-${vidx + 1}`,
        });
      });

      visitPlan.forEach(([visitId, tpl, vdate]) => {
        const invoiceId = randomUUID();
        const subtotal = tpl.items.reduce((s, [, , p]) => s + p, 0);
        const gst = Math.round(subtotal * 0.18);
        const total = subtotal + gst;
        invoiceCounter += 1;
        const paidTs = new Date(`${vdate}T06:00:00Z`).toISOString();
        invoicesToInsert.push({
          id: invoiceId,
          pet_id: petId,
          visit_id: visitId,
          household_id: householdId,
          invoice_number: `INV-2026-${invoiceCounter}`,
          issued_date: vdate,
          subtotal_inr: subtotal,
          gst_inr: gst,
          total_inr: total,
          status: "paid",
          paid_at: paidTs,
        });
        tpl.items.forEach(([itype, iname, price]) => {
          lineItemsToInsert.push({
            invoice_id: invoiceId,
            item_type: LINE_ITEM_TYPE_FOR_TAG(itype, iname),
            item_name: iname,
            qty: 1,
            unit_price_inr: price,
            line_total_inr: price,
          });
        });
      });

      // Follow-up window: 14 days from v3 (most recent visit)
      const v3Open = new Date(v3Ts);
      const v3Close = new Date(v3Open);
      v3Close.setDate(v3Close.getDate() + 14);
      windowsToInsert.push({
        pet_id: petId,
        visit_id: v3Id,
        thread_id: threadId,
        window_days: 14,
        opened_at: v3Open.toISOString(),
        closes_at: v3Close.toISOString(),
      });

      // Multi-variant message pick (locked 2026-05-16)
      const caseOrd = caseTypeOrdinal.get(caseType) ?? 0;
      caseTypeOrdinal.set(caseType, caseOrd + 1);
      const enVariants = PARENT_MESSAGES[caseType] ?? [
        "Hi Doctor, following up on our recent visit.",
      ];
      const enTemplate = enVariants[caseOrd % enVariants.length];
      const msgBody = useMarathi
        ? MARATHI_PARENT_MESSAGES[caseType]
        : renderParentMessage(enTemplate, { name: pet.name, sex: pet.sex });

      const msgTs = new Date(v3Open);
      msgTs.setDate(msgTs.getDate() + (activeOrd % 4));
      msgTs.setHours(9 + (activeOrd % 8), 0, 0, 0);
      messagesToInsert.push({
        pet_id: petId,
        household_id: householdId,
        thread_id: threadId,
        sender_type: "parent",
        sender_id: parentId,
        body: msgBody,
        created_at: msgTs.toISOString(),
      });

      activeOrd++;
    });
  });

  // ============================================================
  // BROADCAST READ RECEIPTS (Patch 2026-05-17 evening)
  // Seeds broadcasts_read for the 3 already-sent broadcasts so the dashboard
  // can render realistic "X / Y read · Z%" pills. Definition of read =
  // parent tapped the broadcast detail screen. Rates locked in
  // docs/decisions-log.md (88% / 68% / 41%).
  // ============================================================
  const SENT_BROADCASTS = [
    {
      id: "17a04dd5-89da-4d46-b2ab-5bd6bafa6d79", // Monsoon ticks
      label: "Monsoon tick prevention",
      audience: dogHouseholdParentIds,
      audienceCount: dogHouseholdParentIds.length,
      readRate: 0.88,
      sentAt: new Date("2026-05-05T09:09:56Z"),
    },
    {
      id: "f40d8703-41bd-4d44-9284-c92152c0d0ac", // Vaccination drive
      label: "Annual vaccination drive",
      audience: activeHouseholdParentIds,
      audienceCount: activeHouseholdParentIds.length,
      readRate: 0.68,
      sentAt: new Date("2026-04-29T09:09:56Z"),
    },
    {
      id: "97b8d518-26fc-412a-8dc2-e0fce491c323", // Holiday hours Aug 15
      label: "Holiday hours Aug 15",
      audience: allParentIds,
      audienceCount: allParentIds.length,
      readRate: 0.41,
      sentAt: new Date("2026-04-22T09:09:56Z"),
    },
  ];

  const broadcastReadsToInsert = [];
  const broadcastAudienceUpdates = [];
  SENT_BROADCASTS.forEach((bc, bcIdx) => {
    const readN = Math.round(bc.audienceCount * bc.readRate);
    const rng = makeRng(0xbeef0001 + bcIdx);
    const shuffled = shuffleInPlace(bc.audience.slice(), rng);
    const readers = shuffled.slice(0, readN);
    readers.forEach((userId, rIdx) => {
      // Stagger read_at: spike in first 6h, taper over 24h.
      const offsetMin = rng() < 0.7
        ? Math.floor(rng() * 360) // 70% read within 6h
        : 360 + Math.floor(rng() * (24 * 60 - 360)); // 30% within 6-24h
      const readAt = new Date(bc.sentAt.getTime() + offsetMin * 60 * 1000);
      broadcastReadsToInsert.push({
        broadcast_id: bc.id,
        user_id: userId,
        read_at: readAt.toISOString(),
      });
    });
    broadcastAudienceUpdates.push({ id: bc.id, audience_count: bc.audienceCount });
  });

  console.log(`  Built: ${householdsToInsert.length} households, ${usersToInsert.length} users, ${petsToInsert.length} pets`);
  console.log(`         ${visitsToInsert.length} visits, ${invoicesToInsert.length} invoices, ${lineItemsToInsert.length} line items`);
  console.log(`         ${windowsToInsert.length} follow-up windows, ${messagesToInsert.length} messages (active=${activeOrd})`);
  console.log(`         ${vaccinationsToInsert.length} vaccinations (DHPP + Rabies × ${activeOrd} active pets)`);
  console.log(`         ${broadcastReadsToInsert.length} broadcast read receipts across 3 sent broadcasts`);
  SENT_BROADCASTS.forEach((bc) => {
    const reads = broadcastReadsToInsert.filter((r) => r.broadcast_id === bc.id).length;
    console.log(`           - ${bc.label}: ${reads} / ${bc.audienceCount} (${Math.round(reads / bc.audienceCount * 100)}%)`);
  });
  console.log("");

  async function bulkInsert(table, rows) {
    if (rows.length === 0) {
      console.log(`  - 0 ${table} (skipped)`);
      return;
    }
    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from(table).insert(chunk);
      if (error) throw new Error(`${table} insert (offset ${i}): ${error.message}`);
    }
    console.log(`  + ${rows.length} ${table}`);
  }

  await bulkInsert("households", householdsToInsert);
  await bulkInsert("users", usersToInsert);
  await bulkInsert("pets", petsToInsert);
  await bulkInsert("visits", visitsToInsert);
  await bulkInsert("vaccinations", vaccinationsToInsert);
  await bulkInsert("invoices", invoicesToInsert);
  await bulkInsert("invoice_line_items", lineItemsToInsert);
  await bulkInsert("follow_up_windows", windowsToInsert);
  await bulkInsert("messages", messagesToInsert);
  await bulkInsert("broadcasts_read", broadcastReadsToInsert);

  // Refresh broadcasts.audience_count to match current dataset.
  for (const upd of broadcastAudienceUpdates) {
    const { error } = await supabase
      .from("broadcasts")
      .update({ audience_count: upd.audience_count })
      .eq("id", upd.id);
    if (error) throw new Error(`broadcasts audience_count update (${upd.id}): ${error.message}`);
  }
  console.log(`  ~ refreshed audience_count on ${broadcastAudienceUpdates.length} sent broadcasts`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nSeed complete in ${elapsed}s`);
  console.log(`MR coverage: ${marathiCasesSeen.size}/${activeOrd} = ${Math.round(marathiCasesSeen.size / activeOrd * 100)}%`);
}

run().catch((err) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
