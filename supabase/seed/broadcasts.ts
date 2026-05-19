import { supabase } from './client';

/**
 * 3 pre-written broadcasts, all bilingual EN+MR.
 * The first one attaches the monsoon-tick-prevention kit (kit-as-broadcast-card flow).
 */
export async function seedBroadcasts(
  clinicId: string,
  vetId: string,
  kitIds: string[]
): Promise<void> {
  const broadcasts = [
    {
      topic_en: 'Monsoon is here. Protect your pets from ticks.',
      topic_mr: 'पावसाळा आला. तुमच्या पाळीव प्राण्यांना गोचिडांपासून वाचवा.',
      body_en: 'The first heavy rains have arrived. We\'re seeing tick-borne disease cases earlier than usual this year. Tap the attached guide for prevention basics: daily checks, spot-on application, and what warning signs to watch for.',
      body_mr: 'पहिले जोरदार पाऊस आले आहेत. यावर्षी आम्ही गोचिड-जनित आजारांची प्रकरणे नेहमीपेक्षा लवकर पाहत आहोत. प्रतिबंधाच्या मूलभूत गोष्टींसाठी जोडलेले मार्गदर्शक टॅप करा: दैनंदिन तपासणी, स्पॉट-ऑन वापर, आणि कोणत्या चेतावणी चिन्हांकडे लक्ष द्यावे.',
      audience_filter: { species: 'dog' },
      audience_count: 142,
      attached_kit_id: kitIds[1] ?? null, // monsoon-tick-prevention kit
      sent_at: daysAgoIso(1),
    },
    {
      topic_en: 'Annual vaccination drive. Bring your pet by month-end.',
      topic_mr: 'वार्षिक लसीकरण मोहीम. महिन्याच्या अखेरीस तुमच्या पाळीव प्राण्याला घेऊन या.',
      body_en: 'If your pet\'s vaccinations are due in the next 30 days, walk in this week or next. No appointment needed. We\'re running extended hours every Saturday until 6pm.',
      body_mr: 'जर तुमच्या पाळीव प्राण्याचे लसीकरण पुढच्या ३० दिवसांत येत असेल, तर या आठवड्यात किंवा पुढच्या आठवड्यात या. अपॉइंटमेंट लागत नाही. आम्ही दर शनिवारी संध्याकाळी ६ पर्यंत वाढीव तास चालवतो.',
      audience_filter: { vaccination_due_within_days: 30 },
      audience_count: 47,
      attached_kit_id: null,
      sent_at: daysAgoIso(7),
    },
    {
      topic_en: 'Holiday hours: closed Aug 15 (Independence Day)',
      topic_mr: 'सुट्टीचे तास: १५ ऑगस्ट (स्वातंत्र्य दिन) बंद',
      body_en: 'AMS will be closed Friday, August 15. We\'ll reopen Saturday morning at our usual 9am. For emergencies on the 15th, contact Dr Sagar directly at +91-9822012345.',
      body_mr: 'AMS शुक्रवार, १५ ऑगस्ट रोजी बंद राहील. आम्ही शनिवारी सकाळी आमच्या नेहमीच्या ९ वाजता पुन्हा उघडू. १५ तारखेला आपत्कालीन परिस्थितीसाठी, डॉ. सागर यांना थेट +91-9822012345 वर संपर्क करा.',
      audience_filter: {},
      audience_count: 198,
      attached_kit_id: null,
      sent_at: daysAgoIso(14),
    },
  ];

  for (const b of broadcasts) {
    const { error } = await supabase.from('broadcasts').insert({
      clinic_id: clinicId,
      vet_id: vetId,
      topic_en: b.topic_en,
      topic_mr: b.topic_mr,
      composed_message_text_en: b.body_en,
      composed_message_text_mr: b.body_mr,
      audience_filter: b.audience_filter,
      audience_count: b.audience_count,
      attached_kit_id: b.attached_kit_id,
      sent_at: b.sent_at,
    });
    if (error) throw new Error(`Broadcast: ${error.message}`);
    console.log(`  + broadcast: ${b.topic_en.slice(0, 50)}...`);
  }
}

function daysAgoIso(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}
