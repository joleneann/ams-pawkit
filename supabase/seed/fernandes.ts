import { randomUUID } from 'crypto';
import { supabase } from './client';

/**
 * Phase 4a: Fernandes anchor seed.
 * 1 household, 1 parent user, 4 pets (Raffy/Gabby/Angel/Galaxy), visits,
 * vaccinations, invoices, messages, and Gabby's open follow-up window.
 *
 * Per docs/decisions-log.md and project_pets.md auto-memory.
 */
export async function seedFernandes(clinicId: string, vetId: string): Promise<void> {
  // Household
  const { data: household, error: hhErr } = await supabase
    .from('households')
    .insert({
      name: 'The Fernandes Family',
      address: 'Koregaon Park, Pune',
      phone: '+91-9876543210',
    })
    .select('id')
    .single();
  if (hhErr || !household) throw new Error(`Household: ${hhErr?.message}`);
  console.log(`  + household: Fernandes (${household.id})`);

  // Parent user
  const { data: parent, error: parentErr } = await supabase
    .from('users')
    .insert({
      household_id: household.id,
      role: 'parent',
      full_name: 'Jolene Fernandes',
      phone: '+91-9876543210',
      email: 'joleneann@gmail.com',
      preferred_language: 'en',
    })
    .select('id')
    .single();
  if (parentErr || !parent) throw new Error(`Parent: ${parentErr?.message}`);

  // Four pets. Fur-match values are placeholders pending Phase 7 (Day 7 of build week)
  // when the algorithm runs on real photos.
  const pets = [
    {
      name: 'Raffy',
      species: 'dog' as const,
      breed: 'Labrador Retriever',
      sex: 'male' as const,
      birthday: '2010-04-15',
      weight_kg: 32.5,
      deceased: true,
      deceased_at: '2024-08-20T14:00:00Z',
      fur_match_primary: 'vanilla',
      algorithm_match_primary: 'vanilla',
      algorithm_confidence: 0.92,
    },
    {
      name: 'Gabby',
      species: 'dog' as const,
      breed: 'Golden Retriever',
      sex: 'male' as const,
      birthday: '2022-02-10',
      weight_kg: 28.0,
      fur_match_primary: 'honey',
      fur_match_secondary: 'peach',
      is_auto_pair: false,
      algorithm_match_primary: 'honey',
      algorithm_match_secondary: 'peach',
      algorithm_confidence: 0.84,
    },
    {
      name: 'Angel',
      species: 'cat' as const,
      breed: 'Persian',
      sex: 'female' as const,
      birthday: '2018-06-22',
      weight_kg: 4.2,
      fur_match_primary: 'milk',
      fur_match_secondary: 'vanilla',
      is_auto_pair: true,
      algorithm_match_primary: 'milk',
      algorithm_confidence: 0.96,
    },
    {
      name: 'Galaxy',
      species: 'cat' as const,
      breed: 'Domestic Shorthair',
      sex: 'female' as const,
      birthday: '2021-11-03',
      weight_kg: 3.8,
      fur_match_primary: 'smoke',
      algorithm_match_primary: 'smoke',
      algorithm_confidence: 0.78,
    },
  ];

  const insertedPets: Record<string, string> = {};
  for (const p of pets) {
    const { data, error } = await supabase
      .from('pets')
      .insert({
        household_id: household.id,
        clinic_id: clinicId,
        regular_vet_id: vetId,
        ...p,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`Pet ${p.name}: ${error?.message}`);
    insertedPets[p.name] = data.id;
    console.log(`  + pet: ${p.name} (${data.id})`);
  }

  // Visits. Gabby's recent one creates the open follow-up window scenario.
  const visits = [
    {
      pet_name: 'Gabby',
      visit_type: 'consultation' as const,
      visit_date: daysAgo(2),
      chief_complaint: 'Limping on right hind leg after morning walk',
      diagnosis: 'Mild soft-tissue strain. NSAIDs prescribed; rest 7 days.',
      soap_note: 'S: Owner reports limping x 1 day, started post-walk. O: TPR normal. Mild swelling R hind, weight-bearing intact. A: Soft-tissue strain. P: Meloxicam 1.5mg PO SID x 5 days, restricted exercise.',
    },
    {
      pet_name: 'Angel',
      visit_type: 'vaccination' as const,
      visit_date: daysAgo(370),
      chief_complaint: 'Annual booster',
      diagnosis: 'Healthy. FVRCP given.',
    },
    {
      pet_name: 'Raffy',
      visit_type: 'consultation' as const,
      visit_date: '2024-08-15',
      chief_complaint: 'Reduced appetite, lethargy',
      diagnosis: 'End-stage renal disease. Palliative care discussed.',
    },
    {
      pet_name: 'Galaxy',
      visit_type: 'grooming' as const,
      visit_date: daysAgo(45),
      chief_complaint: 'Routine grooming + nail trim',
    },
  ];

  const visitIds: Record<string, string> = {};
  for (const v of visits) {
    const { data, error } = await supabase
      .from('visits')
      .insert({
        pet_id: insertedPets[v.pet_name]!,
        vet_id: vetId,
        visit_type: v.visit_type,
        visit_date: v.visit_date,
        chief_complaint: v.chief_complaint,
        diagnosis: v.diagnosis,
        soap_note: v.soap_note,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`Visit ${v.pet_name}: ${error?.message}`);
    visitIds[`${v.pet_name}-${v.visit_date}`] = data.id;
  }
  console.log(`  + ${visits.length} visits`);

  // Vaccinations
  const vaccinations = [
    { pet: 'Gabby', vaccine: 'DHPPi+L', administered: daysAgo(180), nextDue: daysAhead(185) },
    { pet: 'Gabby', vaccine: 'Rabies', administered: daysAgo(180), nextDue: daysAhead(185) },
    { pet: 'Angel', vaccine: 'FVRCP', administered: daysAgo(370), nextDue: daysAhead(-3) }, // 3 days OVERDUE: reminder scenario
    { pet: 'Angel', vaccine: 'Rabies', administered: daysAgo(370), nextDue: daysAhead(-3) },
    { pet: 'Galaxy', vaccine: 'FVRCP', administered: daysAgo(95), nextDue: daysAhead(270) },
    { pet: 'Galaxy', vaccine: 'Rabies', administered: daysAgo(95), nextDue: daysAhead(270) },
    { pet: 'Raffy', vaccine: 'DHPPi+L', administered: '2023-04-15', nextDue: '2024-04-15' },
  ];
  for (const v of vaccinations) {
    const { error } = await supabase.from('vaccinations').insert({
      pet_id: insertedPets[v.pet]!,
      vaccine_type: v.vaccine,
      administered_date: v.administered,
      next_due_date: v.nextDue,
    });
    if (error) throw new Error(`Vaccination: ${error.message}`);
  }
  console.log(`  + ${vaccinations.length} vaccinations`);

  // Invoices: one per visit, 4 total
  const invoices = [
    { pet: 'Gabby', visitKey: `Gabby-${daysAgo(2)}`, total: 1850, items: [
      { type: 'consultation' as const, name: 'Lameness consult', code: 'CONS-LAME', qty: 1, unit: 800 },
      { type: 'medication' as const, name: 'Meloxicam 1.5mg (5 day course)', code: 'MED-MELOX', qty: 5, unit: 130 },
      { type: 'consultation' as const, name: 'Follow-up review', code: 'CONS-FU', qty: 1, unit: 400 },
    ] },
    { pet: 'Angel', visitKey: `Angel-${daysAgo(370)}`, total: 1100, items: [
      { type: 'vaccination' as const, name: 'FVRCP vaccine', code: 'VAC-FVRCP', qty: 1, unit: 700 },
      { type: 'vaccination' as const, name: 'Rabies vaccine', code: 'VAC-RAB', qty: 1, unit: 400 },
    ] },
    { pet: 'Galaxy', visitKey: `Galaxy-${daysAgo(45)}`, total: 600, items: [
      { type: 'procedure' as const, name: 'Grooming session', code: 'GROOM', qty: 1, unit: 500 },
      { type: 'procedure' as const, name: 'Nail trim', code: 'GROOM-NAIL', qty: 1, unit: 100 },
    ] },
  ];
  for (let i = 0; i < invoices.length; i++) {
    const inv = invoices[i]!;
    const subtotal = inv.items.reduce((s, it) => s + it.qty * it.unit, 0);
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        pet_id: insertedPets[inv.pet]!,
        visit_id: visitIds[inv.visitKey] ?? null,
        household_id: household.id,
        invoice_number: `INV-2026-FERN-${String(i + 1).padStart(3, '0')}`,
        subtotal_inr: subtotal,
        gst_inr: gst,
        total_inr: total,
        status: 'paid',
      })
      .select('id')
      .single();
    if (error || !invoice) throw new Error(`Invoice ${inv.pet}: ${error?.message}`);
    for (const item of inv.items) {
      await supabase.from('invoice_line_items').insert({
        invoice_id: invoice.id,
        item_type: item.type,
        item_name: item.name,
        item_code: item.code,
        qty: item.qty,
        unit_price_inr: item.unit,
        line_total_inr: item.qty * item.unit,
      });
    }
  }
  console.log(`  + ${invoices.length} invoices with line items`);

  // Messages: Gabby's open follow-up scenario
  const threadId = randomUUID();
  const gabbyVisitId = visitIds[`Gabby-${daysAgo(2)}`]!;

  // Open follow-up window (3 days for surgery isn't right; we'll use 48h since this is special-case consult)
  await supabase.from('follow_up_windows').insert({
    pet_id: insertedPets['Gabby']!,
    visit_id: gabbyVisitId,
    thread_id: threadId,
    window_days: 2,
    closes_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // 3 messages on the thread
  const messages = [
    {
      sender_type: 'parent' as const,
      sender_id: parent.id,
      body: "Gabby's still limping a bit this morning. Should I be worried?",
      bucket: 'clinical_followup' as const,
      created_at: hoursAgoIso(8),
    },
    {
      sender_type: 'parent' as const,
      sender_id: parent.id,
      body: 'What time do you open tomorrow? I might bring him in if it gets worse.',
      bucket: 'logistics' as const,
      ai_drafted_reply: "We're open from 10am tomorrow. Happy to see Gabby. No need to call ahead, just walk in.",
      created_at: hoursAgoIso(7),
    },
    {
      sender_type: 'parent' as const,
      sender_id: parent.id,
      body: 'Thanks for yesterday. Gabby seemed comfortable on the drive home.',
      bucket: 'feedback' as const,
      replied_at: hoursAgoIso(36),
      replied_by: vetId,
      created_at: hoursAgoIso(40),
    },
  ];
  for (const m of messages) {
    const { error } = await supabase.from('messages').insert({
      pet_id: insertedPets['Gabby']!,
      household_id: household.id,
      thread_id: threadId,
      sender_type: m.sender_type,
      sender_id: m.sender_id,
      body: m.body,
      bucket: m.bucket,
      bucket_assigned_at: m.created_at,
      ai_drafted_reply: m.ai_drafted_reply,
      replied_at: m.replied_at,
      replied_by: m.replied_by,
      created_at: m.created_at,
    });
    if (error) throw new Error(`Message: ${error.message}`);
  }
  console.log(`  + 3 messages on Gabby's open follow-up thread`);
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function daysAhead(n: number): string {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function hoursAgoIso(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}
