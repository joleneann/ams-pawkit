import { supabase } from './client';

/**
 * 3 educational Health Kits per Patch 9 (locked May 4):
 * - Title + key_points + body + warning_signs + escalation, all bilingual EN+MR
 * - public_slug for shareable URL
 * - cover_image_url null (optional per Patch 9)
 */
export async function seedHealthKits(clinicId: string, vetId: string): Promise<string[]> {
  const kits = [
    {
      slug: 'summer-dog-care',
      title_en: 'How to care for your dog in the summer',
      title_mr: 'उन्हाळ्यात तुमच्या कुत्र्याची काळजी कशी घ्यावी',
      key_points_en: [
        'Provide unlimited fresh water; change it twice daily',
        'Protect their paws; asphalt above 50°C burns paw pads in seconds',
        'NEVER leave them in a parked car, even with windows cracked',
        'Walk before 7 am or after 7 pm only',
        'Recognise heat stroke: excessive panting, drooling, vomiting, collapse',
      ],
      key_points_mr: [
        'सतत ताजे पाणी द्या. दिवसातून दोनदा बदला.',
        'त्यांच्या पंजांचे संरक्षण करा. डांबरी रस्ता ५०°C वर पंजे जाळतो.',
        'कधीही पार्क केलेल्या कारमध्ये सोडू नका, खिडक्या उघड्या असल्या तरी',
        'फक्त सकाळी ७ च्या आधी किंवा संध्याकाळी ७ नंतर फिरायला घेऊन जा',
        'उष्माघात ओळखा: जास्त धाप लागणे, लाळ गळणे, उलटी, बेहोशी',
      ],
      body_en: `Pune summers regularly cross 40°C. Dogs cool themselves by panting, which becomes inadequate above 35°C. Heat stroke can develop within minutes and is fatal in 50% of cases without intervention.

The basics: keep water cold and accessible everywhere your dog spends time. Frozen treats (yogurt + fruit cubes) are excellent. A wet towel under their belly during the hottest part of the day helps.

Pavement test: place the back of your hand on the road for 7 seconds. If you can't hold it there, your dog can't walk on it. Grass-only routes during peak summer.

For more on hydration and heat safety, see [VCA Hospitals: Heat Stroke in Dogs](https://vcahospitals.com/know-your-pet/heat-stroke-in-dogs).`,
      body_mr: `पुण्यात उन्हाळ्यात तापमान ४०°C च्या वर जाते. कुत्रे धाप लागून स्वतःला थंड करतात, जे ३५°C च्या वर अपुरे ठरते. उष्माघात काही मिनिटांत होऊ शकतो आणि उपचार न मिळाल्यास ५०% प्रकरणांत जीव जातो.

मूलभूत गोष्टी: तुमच्या कुत्र्याच्या सर्व ठिकाणी थंड पाणी ठेवा. गोठलेले स्नॅक्स (दही + फळांचे तुकडे) उत्तम आहेत. दिवसाच्या सर्वात गरम काळात पोटाखाली ओले टॉवेल मदत करते.

रस्ता तपासणी: तुमच्या हाताचा मागचा भाग रस्त्यावर ७ सेकंद ठेवा. जर तुम्ही तो ठेवू शकत नसाल, तर तुमचा कुत्रा त्यावर चालू शकत नाही. उन्हाळ्याच्या सर्वोच्च काळात फक्त गवतावरून चाला.`,
      warning_signs_en: 'Excessive panting that doesn\'t slow with rest. Thick drool. Vomiting. Bright red gums. Stumbling or collapse. Body temperature above 39.5°C measured rectally.',
      warning_signs_mr: 'विश्रांती घेऊनही न थांबणारी जास्त धाप. जाड लाळ. उलटी. लाल हिरड्या. अडखळणे किंवा पडणे. गुदद्वारातून मोजलेले शरीराचे तापमान ३९.५°C च्या वर.',
      escalation_en: 'If rectal temperature exceeds 39.5°C OR your dog cannot stand, this is an emergency. Call AMS immediately at +91-2026123456. While en route, wet your dog with cool (NOT cold) water and run AC at full blast.',
      escalation_mr: 'जर गुदद्वारातील तापमान ३९.५°C च्या वर असेल किंवा तुमचा कुत्रा उभा राहू शकत नसेल, तर ही आपत्कालीन परिस्थिती आहे. AMS ला लगेच +91-2026123456 वर कॉल करा. वाटेत, तुमच्या कुत्र्याला थंड (बर्फासारख्या नाही) पाण्याने भिजवा आणि AC फुल चालू ठेवा.',
    },
    {
      slug: 'monsoon-tick-prevention',
      title_en: 'Monsoon tick prevention basics',
      title_mr: 'पावसाळ्यात गोचिडांपासून संरक्षण',
      key_points_en: [
        'Apply spot-on preventive (Frontline / NexGard) the first week of June',
        'Check your pet daily: between toes, in ears, around the neck and tail',
        'Vacuum your home twice a week, focusing on pet bedding',
        'Wash all bedding in hot water weekly',
        'Mow tall grass in your yard short; ticks live in grass blades',
      ],
      key_points_mr: [
        'जूनच्या पहिल्या आठवड्यात स्पॉट-ऑन प्रतिबंधक (Frontline / NexGard) लावा',
        'दररोज तुमच्या पाळीव प्राण्याची तपासणी करा: बोटांमध्ये, कानात, मानेभोवती आणि शेपटीभोवती',
        'आठवड्यातून दोनदा घर साफ करा, पाळीव प्राण्याच्या बेडिंगवर लक्ष द्या',
        'सर्व बेडिंग आठवड्यातून एकदा गरम पाण्याने धुवा',
        'अंगणातले उंच गवत कापा. गोचिड गवताच्या पात्यांमध्ये राहतात.',
      ],
      body_en: `Pune's monsoon (June through September) is peak tick season. Tick-borne diseases (ehrlichiosis, babesiosis, anaplasmosis) cause anaemia, lethargy, joint pain, and can be fatal if untreated.

Prevention is far easier than treatment. Combine three layers: a spot-on preventive applied monthly, daily physical checks, and environmental control (clean bedding, short grass, vacuumed floors).

When you find a tick, remove it with fine-tipped tweezers as close to the skin as possible. Pull straight up, no twisting. Save the tick in a sealed bag if your pet shows any symptoms within 4 weeks.

Reference: [WSAVA Vector-borne Disease Guidelines](https://wsava.org/global-guidelines/vector-borne-disease-guidelines/).`,
      body_mr: `पुण्याचा पावसाळा (जून ते सप्टेंबर) हा गोचिडांचा सर्वोच्च हंगाम आहे. गोचिडांनी पसरणारे आजार (एर्लिकिओसिस, बेबेसिओसिस, अनाप्लाझ्मोसिस) रक्तक्षय, थकवा, सांधेदुखी आणि उपचार न केल्यास जीवघेणे ठरू शकतात.

प्रतिबंध हा उपचारापेक्षा खूप सोपा आहे. तीन स्तर एकत्र करा: मासिक स्पॉट-ऑन प्रतिबंधक, दररोज शारीरिक तपासणी, आणि पर्यावरणीय नियंत्रण (स्वच्छ बेडिंग, लहान गवत, साफ केलेले मजले).

जेव्हा तुम्हाला गोचिड सापडेल, तेव्हा बारीक टोकाच्या चिमटीने त्वचेच्या जवळून काढा. सरळ वर खेचा. पिळू नका.`,
      warning_signs_en: 'Persistent lethargy. Loss of appetite for more than 24 hours. Pale gums. Limping that moves between legs. Fever (rectal temp above 39.2°C). Tiny red dots (petechiae) on the gums or belly.',
      warning_signs_mr: 'सततचा थकवा. २४ तासांपेक्षा जास्त भूक न लागणे. फिकट हिरड्या. एका पायातून दुसऱ्या पायात बदलणारे लंगडणे. ताप (गुदद्वारातील तापमान ३९.२°C च्या वर). हिरड्या किंवा पोटावर लहान लाल ठिपके.',
      escalation_en: 'If your pet shows any combination of fever + lethargy + pale gums within 4 weeks of a tick exposure, come in for blood work. Tick-borne diseases respond well to early antibiotics; late diagnosis means slower recovery.',
      escalation_mr: 'गोचिड एक्सपोजरच्या ४ आठवड्यांच्या आत तुमच्या पाळीव प्राण्याला ताप + थकवा + फिकट हिरड्या यांचे कोणतेही संयोजन दिसले, तर रक्त तपासणीसाठी या. गोचिड-जनित आजार लवकर अँटिबायोटिक्सना चांगला प्रतिसाद देतात.',
    },
    {
      slug: 'puppy-vaccination-schedule',
      title_en: 'Vaccination schedule for your puppy',
      title_mr: 'तुमच्या पिल्लाचे लसीकरण वेळापत्रक',
      key_points_en: [
        '6 weeks: first DHPPi (distemper / hepatitis / parvo / parainfluenza)',
        '9 weeks: DHPPi booster + Leptospirosis',
        '12 weeks: DHPPi final + Rabies',
        '16 weeks: DHPPi annual booster begins',
        'Annually thereafter: DHPPi+L + Rabies for life',
      ],
      key_points_mr: [
        '६ आठवडे: पहिले DHPPi (डिस्टेंपर / हेपेटायटिस / पार्व्हो / पॅराइन्फ्लुएंझा)',
        '९ आठवडे: DHPPi बूस्टर + लेप्टोस्पायरोसिस',
        '१२ आठवडे: DHPPi अंतिम + रेबीज',
        '१६ आठवडे: DHPPi वार्षिक बूस्टर सुरू',
        'त्यानंतर वार्षिक: DHPPi+L + रेबीज आयुष्यभरासाठी',
      ],
      body_en: `Puppies receive maternal antibodies that protect them for the first 6-8 weeks. As those antibodies wane, the puppy becomes vulnerable, which is why the vaccination series starts around 6 weeks and continues through 16 weeks.

Skipping or delaying any dose leaves a window where the puppy is unprotected. Parvovirus alone has a 90% mortality rate in unvaccinated puppies. The series cost (~₹3,500 across all visits) is dramatically lower than treating any one of these diseases.

Bring your vaccination card to every visit. We'll add stickers from each batch, which lets you track expiration and serves as proof for boarding/grooming/travel.

For the science behind core vs non-core vaccines, see [WSAVA Vaccination Guidelines](https://wsava.org/global-guidelines/vaccination-guidelines/).`,
      body_mr: `पिल्लांना त्यांच्या आईकडून अँटिबॉडीज मिळतात जे त्यांना पहिल्या ६-८ आठवड्यांसाठी संरक्षण देतात. जसे ते अँटिबॉडीज कमी होतात, पिल्लू असुरक्षित होते. म्हणूनच लसीकरण मालिका ६ आठवड्यांत सुरू होते आणि १६ आठवड्यांपर्यंत चालते.

कोणताही डोस वगळणे किंवा उशीर करणे म्हणजे पिल्लू असुरक्षित राहण्याची एक खिडकी सोडणे. एकट्या पार्व्होव्हायरसमध्ये लस न दिलेल्या पिल्लांमध्ये ९०% मृत्यू दर आहे.

प्रत्येक भेटीला तुमचे लसीकरण कार्ड आणा.`,
      warning_signs_en: 'After any vaccination: mild lethargy or low-grade fever for 24 hours is normal. Watch for: facial swelling, hives, vomiting, or difficulty breathing. These indicate an allergic reaction and need immediate care.',
      warning_signs_mr: 'कोणत्याही लसीनंतर: २४ तास सौम्य थकवा किंवा कमी ताप सामान्य आहे. लक्ष ठेवा: चेहऱ्यावर सूज, अंगावर पुरळ, उलटी, किंवा श्वास घेण्यास त्रास. हे अॅलर्जी दर्शवतात आणि लगेच उपचार आवश्यक आहेत.',
      escalation_en: 'If your puppy shows facial swelling, hives, repeated vomiting, or difficulty breathing within 4 hours of a vaccine, call AMS immediately at +91-2026123456. Also call if fever persists above 39.5°C beyond 24 hours after a vaccination.',
      escalation_mr: 'जर तुमच्या पिल्लाला लसीच्या ४ तासांच्या आत चेहऱ्यावर सूज, पुरळ, वारंवार उलट्या, किंवा श्वासोच्छवासाचा त्रास दिसला, तर AMS ला +91-2026123456 वर लगेच कॉल करा. लसीकरणानंतर २४ तासांपेक्षा जास्त ३९.५°C च्या वर ताप राहिल्यास देखील कॉल करा.',
    },
  ];

  const insertedKitIds: string[] = [];
  for (const kit of kits) {
    const { data, error } = await supabase
      .from('health_kits')
      .insert({
        clinic_id: clinicId,
        vet_id: vetId,
        cover_image_url: null,
        title_en: kit.title_en,
        title_mr: kit.title_mr,
        key_points_en: kit.key_points_en,
        key_points_mr: kit.key_points_mr,
        body_en: kit.body_en,
        body_mr: kit.body_mr,
        warning_signs_en: kit.warning_signs_en,
        warning_signs_mr: kit.warning_signs_mr,
        escalation_en: kit.escalation_en,
        escalation_mr: kit.escalation_mr,
        public_slug: kit.slug,
        published: true,
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`Kit ${kit.slug}: ${error?.message}`);
    insertedKitIds.push(data.id);
    console.log(`  + kit: ${kit.title_en}`);
  }
  return insertedKitIds;
}
