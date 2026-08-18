import "dotenv/config";
import { randomBytes } from "node:crypto";
import { createPrismaClient } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";

const prisma = createPrismaClient();

/**
 * Seed data is assembled from Dr. Goel's public hospital and directory profiles.
 * Treat every timing, fee and phone number as PROVISIONAL — confirm with the
 * doctor, then correct it in /admin rather than editing this file.
 */

const SETTINGS = {
  id: 1,
  doctorName: "Dr. Pawan Goel",
  qualifications: "MBBS, MD (Medicine), DM (Endocrinology)",
  headline: "Endocrinologist & Diabetes Specialist in Shalimar Bagh, Delhi",
  subheadline:
    "MD Medicine from AIIMS New Delhi · DM Endocrinology from SGPGI Lucknow",
  bioShort:
    "Consultant Endocrinologist with 8 years of experience in diabetes, thyroid, PCOS, obesity and hormonal disorders. Trained at Maulana Azad Medical College, AIIMS New Delhi and SGPGI Lucknow.",
  bioLong: `Dr. Pawan Goel is a Consultant Endocrinologist practising in North and West Delhi, with eight years of experience in the diagnosis and long-term management of hormonal and metabolic disorders.

He completed his MBBS at Maulana Azad Medical College, University of Delhi, followed by MD in Internal Medicine at the All India Institute of Medical Sciences (AIIMS), New Delhi, and DM in Endocrinology at the Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI), Lucknow — one of India's leading centres for endocrine care.

Before entering full-time clinical practice he served as Assistant Professor of Endocrinology at SGPGI Lucknow and at LLRM Medical College, Meerut, where he taught and supervised postgraduate trainees alongside his clinical work.

His practice covers Type 1 and Type 2 diabetes, thyroid disease, PCOS, obesity and weight management, metabolic bone disease, and pituitary and adrenal disorders. He works extensively with modern diabetes technology, including continuous glucose monitoring (CGM) and insulin pump therapy, and places particular emphasis on individualised treatment plans that combine medication with realistic lifestyle change.`,
  experienceYears: 8,
  registrationNo: null as string | null,
  primaryPhone: "+919999078196",
  whatsappNumber: "919999078196",
  email: "",
  announcement: null as string | null,
  announcementActive: false,
  metaTitle:
    "Dr. Pawan Goel — Endocrinologist & Diabetes Specialist in Shalimar Bagh, Delhi",
  metaDescription:
    "Consultant Endocrinologist in Delhi (MD AIIMS, DM SGPGI) treating diabetes, thyroid disorders, PCOS, obesity and hormonal problems. Consults in Shalimar Bagh, Punjabi Bagh and Bahadurgarh.",
};

const CREDENTIALS = [
  {
    kind: "degree",
    title: "DM — Endocrinology",
    institution: "Sanjay Gandhi Postgraduate Institute of Medical Sciences, Lucknow",
    period: "2023",
    detail:
      "Super-speciality training at one of India's foremost endocrinology departments.",
    sortOrder: 1,
  },
  {
    kind: "degree",
    title: "MD — Internal Medicine",
    institution: "All India Institute of Medical Sciences (AIIMS), New Delhi",
    period: "2020",
    detail: null,
    sortOrder: 2,
  },
  {
    kind: "degree",
    title: "MBBS",
    institution: "Maulana Azad Medical College, University of Delhi",
    period: "2016",
    detail: null,
    sortOrder: 3,
  },
  {
    kind: "position",
    title: "Consultant Endocrinologist",
    institution: "Max Super Speciality Hospital, Shalimar Bagh",
    period: "2025 – Present",
    detail: null,
    sortOrder: 1,
  },
  {
    kind: "position",
    title: "Assistant Professor — Endocrinology",
    institution: "LLRM Medical College, Meerut",
    period: "2024 – 2025",
    detail: null,
    sortOrder: 2,
  },
  {
    kind: "position",
    title: "Assistant Professor — Endocrinology",
    institution: "SGPGI, Lucknow",
    period: "2023 – 2024",
    detail: null,
    sortOrder: 3,
  },
  {
    kind: "position",
    title: "Senior Resident — Endocrinology",
    institution: "SGPGI, Lucknow",
    period: "2020 – 2023",
    detail: null,
    sortOrder: 4,
  },
];

type SeedLocation = {
  slug: string;
  name: string;
  kind: string;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  pincode: string | null;
  phone: string | null;
  fee: number | null;
  notes: string | null;
  bookingUrl: string | null;
  mapUrl: string | null;
  isPrimary: boolean;
  published: boolean;
  sortOrder: number;
  slots: { dayOfWeek: number; startTime: string; endTime: string }[];
};

const LOCATIONS: SeedLocation[] = [
  {
    slug: "shalimar-bagh-clinic",
    name: "Diabetes & Endocrine Clinic",
    kind: "clinic",
    addressLine: "AE-188, Shalimar Bagh",
    area: "Shalimar Bagh",
    city: "Delhi",
    state: "Delhi",
    pincode: "110088",
    phone: "+919999078196",
    fee: null,
    notes:
      "Dr. Goel's own clinic. Best place for follow-up visits, CGM reviews and insulin pump adjustment.",
    bookingUrl: null,
    mapUrl: "https://maps.app.goo.gl/vDhHecrmxcS5WNwVA",
    isPrimary: true,
    published: true,
    sortOrder: 1,
    // Monday to Saturday. Closed on Sundays.
    slots: [1, 2, 3, 4, 5, 6].map((d) => ({
      dayOfWeek: d,
      startTime: "17:00",
      endTime: "21:00",
    })),
  },
  {
    slug: "max-shalimar-bagh",
    name: "Max Super Speciality Hospital",
    kind: "hospital",
    addressLine: "FC-50, C & D Block, Shalimar Bagh",
    area: "Shalimar Bagh",
    city: "Delhi",
    state: "Delhi",
    pincode: "110088",
    phone: null,
    fee: null,
    notes: "Appointments are booked through Max Healthcare.",
    bookingUrl: "https://www.maxhealthcare.in/doctor/dr-pawan-goel",
    mapUrl: null,
    isPrimary: false,
    published: true,
    sortOrder: 2,
    slots: [1, 2, 3, 4, 5, 6].map((d) => ({
      dayOfWeek: d,
      startTime: "10:00",
      endTime: "12:00",
    })),
  },
  {
    slug: "maharaja-agrasen-punjabi-bagh",
    name: "Maharaja Agrasen Hospital",
    kind: "hospital",
    addressLine: "Road No. 41, West Punjabi Bagh",
    area: "Punjabi Bagh",
    city: "Delhi",
    state: "Delhi",
    pincode: "110026",
    phone: "01140777777",
    fee: 1000,
    notes: "Hospital reception also books on 9910489495 and 8130402916.",
    bookingUrl: "https://www.mahdelhi.org/en/doctors/endocrinology-302/",
    mapUrl: null,
    isPrimary: false,
    published: true,
    sortOrder: 3,
    slots: [2, 4, 6].map((d) => ({
      dayOfWeek: d,
      startTime: "14:00",
      endTime: "16:00",
    })),
  },
  {
    slug: "jj-institute-bahadurgarh",
    name: "JJ Institute of Medical Sciences",
    kind: "hospital",
    addressLine: "Main Delhi–Rohtak Road, MIE Bahadurgarh",
    area: "Bahadurgarh",
    city: "Bahadurgarh",
    state: "Haryana",
    pincode: "124507",
    phone: "+917056100100",
    fee: null,
    notes: null,
    bookingUrl: "https://www.jjmedicalinstitute.com/profile/dr-pawan",
    mapUrl: null,
    isPrimary: false,
    published: true,
    sortOrder: 4,
    slots: [{ dayOfWeek: 6, startTime: "16:00", endTime: "18:00" }],
  },
  {
    slug: "pentamed-model-town",
    name: "Pentamed Hospital",
    kind: "hospital",
    addressLine: "D-1, Model Town III",
    area: "Model Town",
    city: "Delhi",
    state: "Delhi",
    pincode: "110009",
    phone: null,
    fee: null,
    notes: "Timings not confirmed — hidden until verified.",
    bookingUrl: null,
    mapUrl: null,
    isPrimary: false,
    published: false,
    sortOrder: 5,
    slots: [],
  },
  {
    slug: "saroj-hospital-rohini",
    name: "Saroj Super Speciality Hospital",
    kind: "hospital",
    addressLine: "Sector 19, Rohini",
    area: "Rohini",
    city: "Delhi",
    state: "Delhi",
    pincode: "110085",
    phone: null,
    fee: null,
    notes: "Timings not confirmed — hidden until verified.",
    bookingUrl: null,
    mapUrl: null,
    isPrimary: false,
    published: false,
    sortOrder: 6,
    slots: [],
  },
];

const CONDITIONS = [
  {
    slug: "type-2-diabetes",
    name: "Type 2 Diabetes",
    summary:
      "Long-term blood sugar control with medication, diet and monitoring tailored to how you actually live.",
    featured: true,
    symptoms: [
      "Excessive thirst and frequent urination",
      "Unexplained weight loss or gain",
      "Persistent tiredness",
      "Slow-healing wounds or repeated infections",
      "Blurred vision",
      "Tingling or numbness in the feet",
    ].join("\n"),
    whenToSee: [
      "Your HbA1c is above target despite medication",
      "Blood sugars swing widely through the day",
      "You are on insulin and unsure about dosing",
      "You have been newly diagnosed and want a clear plan",
    ].join("\n"),
    body: `Type 2 diabetes is a long-term condition in which the body becomes resistant to insulin and gradually produces less of it. It develops quietly, and many people are diagnosed only after routine blood tests or once complications have begun.

## How it is assessed

Assessment usually begins with fasting and post-meal blood glucose, HbA1c, kidney and liver function, a lipid profile, and a check for early complications affecting the eyes, kidneys, nerves and feet. The aim is to build an accurate picture before deciding on treatment rather than starting medication blindly.

## Treatment approach

Treatment is individualised. Depending on your HbA1c, weight, kidney function, other illnesses and daily routine, this may involve oral medication, newer drug classes such as GLP-1 receptor agonists or SGLT2 inhibitors, or insulin. Structured dietary counselling and realistic activity targets are part of every plan.

For patients with variable readings, continuous glucose monitoring (CGM) can reveal patterns that occasional finger-prick tests miss — particularly overnight lows and post-meal spikes.

## Living with it

Type 2 diabetes is managed over decades, not weeks. Regular review of medication, annual complication screening and adjustments as circumstances change matter far more than any single consultation.`,
  },
  {
    slug: "type-1-diabetes",
    name: "Type 1 Diabetes",
    summary:
      "Insulin therapy, pump and CGM support for children, adolescents and adults with Type 1 diabetes.",
    featured: true,
    symptoms: [
      "Rapid, unexplained weight loss",
      "Extreme thirst and very frequent urination",
      "Severe tiredness and weakness",
      "Nausea, vomiting or abdominal pain",
      "Sweet or fruity-smelling breath",
    ].join("\n"),
    whenToSee: [
      "A child or young adult has been newly diagnosed",
      "You want to move from injections to an insulin pump",
      "Frequent hypoglycaemia is disrupting daily life",
      "You need help interpreting CGM data",
    ].join("\n"),
    body: `Type 1 diabetes is an autoimmune condition in which the pancreas stops producing insulin. It most often appears in childhood or early adulthood and requires insulin from the point of diagnosis.

## Getting the basics right

Good outcomes depend less on any single drug and more on getting the fundamentals right: correct insulin type and timing, accurate carbohydrate counting, dose adjustment for exercise and illness, and knowing how to handle a hypo confidently.

## Technology

Modern management options include continuous glucose monitoring and insulin pump therapy, which together can significantly reduce both hypoglycaemia and long-term variability. Dr. Goel works regularly with CGM data and pump settings, and helps families decide whether the added cost and complexity is worthwhile in their situation.

## Support for families

A new Type 1 diagnosis in a child is overwhelming. Consultations are structured to cover practical questions — school, sports, fasting, travel and sick-day rules — rather than numbers alone.`,
  },
  {
    slug: "thyroid-disorders",
    name: "Thyroid Disorders",
    summary:
      "Hypothyroidism, hyperthyroidism, goitre and thyroid nodules — accurate diagnosis and correct dosing.",
    featured: true,
    symptoms: [
      "Tiredness, weight gain and feeling cold (underactive)",
      "Palpitations, weight loss and heat intolerance (overactive)",
      "Swelling in the front of the neck",
      "Hair fall and dry skin",
      "Irregular periods",
      "Difficulty conceiving",
    ].join("\n"),
    whenToSee: [
      "Your TSH is abnormal on a routine test",
      "Symptoms persist despite taking thyroxine",
      "A thyroid nodule or swelling has been found",
      "You are pregnant or planning pregnancy with thyroid disease",
    ].join("\n"),
    body: `Thyroid disorders are among the most common endocrine problems in India, and among the most frequently mismanaged — usually through incorrect dosing, testing at the wrong time, or treating a borderline result that did not need treatment.

## Common presentations

**Hypothyroidism** (underactive) causes fatigue, weight gain, cold intolerance, dry skin and low mood. **Hyperthyroidism** (overactive) causes palpitations, weight loss, tremor, anxiety and heat intolerance. **Nodules and goitre** are often found incidentally and need assessment to determine whether they are harmless.

## Assessment

Testing typically includes TSH with free T4 and free T3 where relevant, thyroid antibodies when autoimmune disease is suspected, and ultrasound for any palpable swelling or nodule. Nodules with concerning features may need an FNAC biopsy.

## Subclinical thyroid disease

A mildly raised TSH with normal T4 is common and does not always need treatment. The decision depends on age, symptoms, antibody status, cholesterol, pregnancy plans and how far above range the value sits — which is exactly the kind of judgement a specialist review is for.

## Thyroid and pregnancy

Thyroid targets in pregnancy are tighter than at other times, and dose requirements usually rise. Women with known thyroid disease should be reviewed as soon as pregnancy is confirmed, ideally before conception.`,
  },
  {
    slug: "pcos",
    name: "PCOS (Polycystic Ovary Syndrome)",
    summary:
      "Irregular periods, unwanted hair growth, acne, weight gain and fertility concerns addressed together.",
    featured: true,
    symptoms: [
      "Irregular or absent periods",
      "Excess facial or body hair (hirsutism)",
      "Persistent acne",
      "Weight gain, especially around the abdomen",
      "Hair thinning on the scalp",
      "Difficulty conceiving",
    ].join("\n"),
    whenToSee: [
      "Your periods have been irregular for several months",
      "You have been told you have PCOS but given no plan",
      "You are trying to conceive",
      "Weight is rising despite dietary effort",
    ].join("\n"),
    body: `PCOS is a hormonal and metabolic condition affecting a large proportion of women of reproductive age. It is frequently diagnosed on an ultrasound alone, which is not sufficient — diagnosis requires a combination of clinical features, hormone testing and imaging, with other causes excluded.

## Why it needs an endocrinologist

PCOS is not only a gynaecological issue. Insulin resistance sits at the centre of it for most women, which is why it travels with weight gain, prediabetes, abnormal cholesterol and fatty liver. Treating the hormonal symptoms without addressing the metabolic side leaves half the problem in place.

## Treatment

Management depends entirely on what matters most to you at this stage of life — regularising periods, managing hirsutism and acne, protecting long-term metabolic health, or conceiving. Options range from lifestyle and weight interventions to metformin, hormonal treatment, anti-androgens and ovulation induction in coordination with a gynaecologist.

## The long view

PCOS is a lifelong condition whose presentation changes with age. Periodic review for blood sugar, blood pressure and lipids is worthwhile even during phases when symptoms are quiet.`,
  },
  {
    slug: "obesity-and-weight-management",
    name: "Obesity & Weight Management",
    summary:
      "Medically supervised weight management, including newer weight-loss medication where appropriate.",
    featured: true,
    symptoms: [
      "BMI above 25 with difficulty losing weight",
      "Weight gain despite diet and exercise",
      "Snoring or daytime sleepiness",
      "Joint pain and breathlessness on exertion",
      "Fatty liver on ultrasound",
    ].join("\n"),
    whenToSee: [
      "Repeated diet attempts have not worked",
      "Weight gain is affecting blood sugar or blood pressure",
      "You want to know whether weight-loss medication is suitable",
      "An underlying hormonal cause needs to be ruled out",
    ].join("\n"),
    body: `Weight gain is often treated as a matter of willpower. Medically, it is more useful to treat it as a condition with identifiable drivers — some hormonal, some metabolic, some related to medication, sleep or mental health.

## Ruling out treatable causes

Assessment first excludes contributors such as hypothyroidism, Cushing's syndrome, PCOS, and drugs known to cause weight gain, alongside screening for the consequences: prediabetes, fatty liver, sleep apnoea, abnormal lipids and high blood pressure.

## Treatment options

A structured plan combines a realistic and sustainable dietary approach, activity that fits your routine, and — where clinically indicated — pharmacological options including GLP-1 based therapy. These medicines are effective but are not appropriate for everyone, need monitoring, and work best alongside dietary change rather than instead of it.

## Honest expectations

Sustainable loss is gradual. The measure of success is not only the number on the scale but the improvement in blood sugar, blood pressure, lipids and liver health that accompanies it.`,
  },
  {
    slug: "osteoporosis-and-bone-health",
    name: "Osteoporosis & Metabolic Bone Disease",
    summary:
      "Bone density loss, vitamin D deficiency, calcium disorders and fracture prevention.",
    featured: false,
    symptoms: [
      "Fracture after a minor fall",
      "Loss of height or stooped posture",
      "Persistent back or bone pain",
      "Low vitamin D on testing",
      "Muscle weakness and cramps",
    ].join("\n"),
    whenToSee: [
      "A DEXA scan has shown low bone density",
      "You have had a fragility fracture",
      "You are post-menopausal and at risk",
      "You have been on steroids long-term",
    ].join("\n"),
    body: `Bone loss is silent until a fracture occurs. Because the first fracture substantially raises the risk of the next, identifying and treating osteoporosis early is one of the more clearly worthwhile interventions in endocrinology.

## Assessment

Evaluation includes a DEXA bone density scan, vitamin D and calcium levels, parathyroid hormone, kidney function, and where relevant a search for secondary causes such as hyperparathyroidism, thyroid excess, coeliac disease or long-term steroid use.

## Treatment

Treatment combines correction of vitamin D and calcium, weight-bearing activity, fall prevention, and bone-specific medication where the fracture risk justifies it. The choice and duration of medication depends on severity, age and kidney function, and is reviewed periodically.

## Vitamin D deficiency

Vitamin D deficiency is extremely common in urban India and is often over-treated with high-dose sachets without follow-up testing. Correct repletion followed by a sensible maintenance dose is more effective than repeated large doses.`,
  },
  {
    slug: "pituitary-disorders",
    name: "Pituitary Disorders",
    summary:
      "Prolactinoma, acromegaly, Cushing's disease and hormone deficiencies of the pituitary gland.",
    featured: false,
    symptoms: [
      "Milk discharge from the breast unrelated to childbirth",
      "Persistent headaches with visual disturbance",
      "Absent periods or loss of libido",
      "Increasing shoe, ring or hat size",
      "Unexplained fatigue and low blood pressure",
    ].join("\n"),
    whenToSee: [
      "An MRI has shown a pituitary lesion",
      "Prolactin levels are raised",
      "You have symptoms of hormone excess or deficiency",
      "You need follow-up after pituitary surgery",
    ].join("\n"),
    body: `The pituitary is a small gland at the base of the brain that governs most other hormone systems. Disorders can involve excess hormone production, deficiency, or the physical effect of a growing tumour pressing on nearby structures.

## Conditions managed

These include prolactinoma, acromegaly, Cushing's disease, non-functioning pituitary adenoma, hypopituitarism and diabetes insipidus.

## Assessment and treatment

Pituitary disease requires careful biochemical testing — often dynamic tests done under supervision — alongside dedicated pituitary MRI imaging and visual field assessment. Many pituitary tumours respond well to medication and do not need surgery; where surgery is required, care is coordinated with neurosurgery and continues long after the operation.

Dr. Goel's training at SGPGI Lucknow included substantial exposure to complex pituitary cases.`,
  },
  {
    slug: "adrenal-disorders",
    name: "Adrenal Disorders",
    summary:
      "Adrenal insufficiency, Cushing's syndrome, adrenal masses and hormone-related high blood pressure.",
    featured: false,
    symptoms: [
      "Persistent fatigue with low blood pressure",
      "Darkening of the skin",
      "Rapid weight gain around the trunk and face",
      "Purple stretch marks and easy bruising",
      "High blood pressure at a young age",
      "Episodes of palpitations, sweating and headache",
    ].join("\n"),
    whenToSee: [
      "An adrenal mass has been found incidentally on a scan",
      "Blood pressure is difficult to control on multiple drugs",
      "Cortisol levels are abnormal",
      "You are on long-term steroids and need review",
    ].join("\n"),
    body: `The adrenal glands produce cortisol, aldosterone and adrenaline. Both under- and over-production cause serious illness, and both are frequently missed because the symptoms overlap with common conditions.

## Conditions managed

These include Addison's disease and other forms of adrenal insufficiency, Cushing's syndrome, primary aldosteronism, phaeochromocytoma, congenital adrenal hyperplasia, and the assessment of adrenal masses found incidentally on imaging.

## Why specialist assessment matters

Adrenal testing is easy to get wrong — sample timing, medication interference and stress all affect results, and a misinterpreted cortisol can lead either to unnecessary surgery or to a missed diagnosis. Where an adrenal cause of high blood pressure is confirmed, treatment can sometimes resolve hypertension that has resisted several drugs.

Anyone on long-term steroid treatment should understand sick-day rules and carry appropriate identification.`,
  },
  {
    slug: "short-stature-and-growth",
    name: "Short Stature & Growth Disorders",
    summary:
      "Assessment of children who are not growing as expected, including growth hormone evaluation.",
    featured: false,
    symptoms: [
      "Height noticeably below peers of the same age",
      "Slowing growth rate over a year or more",
      "Delayed or absent pubertal changes",
      "Very early pubertal development",
      "Growing out of clothes far more slowly than expected",
    ].join("\n"),
    whenToSee: [
      "Your child has consistently been the shortest in class",
      "Growth has slowed noticeably",
      "Puberty has not started by the expected age",
      "Puberty has started unusually early",
    ].join("\n"),
    body: `Most short children are healthy and simply following a familial or constitutional pattern. A minority have a treatable cause, and distinguishing between the two is the purpose of assessment.

## What assessment involves

Accurate serial height measurement plotted on growth charts, mid-parental height calculation, bone age X-ray, thyroid function, coeliac screening, and — where indicated — growth hormone testing. Growth velocity over time is more informative than any single measurement.

## Treatable causes

These include growth hormone deficiency, hypothyroidism, coeliac disease, chronic illness, Turner syndrome in girls, and nutritional deficiency. Where growth hormone therapy is appropriate it is most effective when started before the growth plates begin to close, which is why early referral matters.

## Puberty

Delayed puberty and precocious (unusually early) puberty are both assessed and managed, with attention to the emotional impact on the child as well as the hormonal picture.`,
  },
  {
    slug: "mens-hormonal-health",
    name: "Men's Hormonal Health",
    summary:
      "Low testosterone, gynaecomastia, and hormonal contributors to fatigue and low libido.",
    featured: false,
    symptoms: [
      "Persistent fatigue and low mood",
      "Reduced libido or erectile difficulty",
      "Breast tissue enlargement (gynaecomastia)",
      "Loss of muscle mass",
      "Reduced facial or body hair",
      "Infertility",
    ].join("\n"),
    whenToSee: [
      "Testosterone has been reported as low",
      "Breast enlargement has developed",
      "Fertility testing has shown abnormal results",
      "You are considering testosterone therapy",
    ].join("\n"),
    body: `Male hormonal problems are under-investigated, partly because the symptoms — tiredness, low mood, reduced drive — are easy to attribute to stress or age.

## Assessment

Testosterone must be measured on a morning sample, and a single low reading should always be confirmed. Assessment also covers LH, FSH, prolactin, thyroid function and metabolic factors, since obesity, diabetes and sleep apnoea are common and reversible contributors to low testosterone.

## Testosterone therapy

Testosterone replacement is appropriate for genuine, confirmed deficiency with a clear cause — and inappropriate as a general tonic for tiredness or gym performance. It suppresses fertility, requires monitoring of haematocrit and prostate health, and is usually a long-term commitment. Where the underlying cause is obesity or untreated sleep apnoea, addressing that first often restores levels without hormone therapy.

## Gynaecomastia

Breast tissue enlargement in men can result from hormonal imbalance, medication, liver or thyroid disease, or occasionally a testicular or adrenal tumour, and warrants evaluation rather than reassurance alone.`,
  },
];

const SERVICES = [
  {
    slug: "continuous-glucose-monitoring",
    name: "Continuous Glucose Monitoring (CGM)",
    summary:
      "Sensor-based glucose tracking that reveals the patterns finger-prick testing misses.",
    body: `A CGM sensor worn on the arm records glucose continuously for up to 14 days, producing a full picture of how your levels behave overnight, after meals and during exercise.

It is particularly useful when HbA1c looks acceptable but you feel unwell, when hypoglycaemia is suspected at night, when insulin doses need fine-tuning, or in the first months after a Type 1 diagnosis.

Dr. Goel reviews the downloaded data with you and translates it into specific changes to medication, meal timing and dosing rather than simply handing over a report.`,
    sortOrder: 1,
  },
  {
    slug: "insulin-pump-therapy",
    name: "Insulin Pump Therapy",
    summary:
      "Assessment, initiation and ongoing optimisation of insulin pump treatment.",
    body: `An insulin pump delivers a continuous background insulin infusion with mealtime boluses, and can improve control for people who struggle with multiple daily injections or frequent hypoglycaemia.

Support covers deciding whether a pump is the right choice, setting basal rates and ratios, transitioning safely from injections, and reviewing settings as needs change. Pump therapy demands engagement from the patient, and the decision is made together rather than assumed.`,
    sortOrder: 2,
  },
  {
    slug: "diabetes-education-and-diet-counselling",
    name: "Diabetes Education & Diet Counselling",
    summary:
      "Practical, Indian-diet-based guidance on eating, activity and sick-day management.",
    body: `Generic diet sheets rarely survive contact with a real household. Counselling here starts from what you actually eat — roti, rice, regional cooking, festivals and fasting — and adjusts from there.

Sessions cover carbohydrate awareness, meal timing around medication, safe fasting during Navratri, Ramzan or Karva Chauth, foot care, and what to do on days when you are ill and unable to eat normally.`,
    sortOrder: 3,
  },
  {
    slug: "thyroid-nodule-evaluation",
    name: "Thyroid & Nodule Evaluation",
    summary:
      "Structured assessment of thyroid swellings, including ultrasound and FNAC referral.",
    body: `Thyroid nodules are common and the great majority are benign, but they need a structured assessment rather than either alarm or dismissal.

Evaluation covers clinical examination, thyroid function testing, ultrasound characterisation, and FNAC biopsy where the ultrasound features or size warrant it. Where results are benign, a sensible surveillance interval is agreed so that repeat scanning does not become endless.`,
    sortOrder: 4,
  },
];

const FAQS = [
  {
    question: "What should I bring to my first appointment?",
    answer:
      "Please bring all previous prescriptions, any blood test or scan reports you have (even old ones), a list of medicines you currently take including doses, and your glucose monitoring records if you check at home. Old reports are genuinely useful — they show how things have changed over time.",
    sortOrder: 1,
  },
  {
    question: "Do I need to come fasting?",
    answer:
      "Not for the consultation itself. If blood tests are likely to be needed, a fasting sample is often more useful, so an early appointment without breakfast can save a second visit. If you are unsure, please call ahead.",
    sortOrder: 2,
  },
  {
    question: "Which location should I choose?",
    answer:
      "For a first consultation, choose whichever location is most convenient for you. For ongoing follow-up, CGM review or insulin pump adjustment, the Shalimar Bagh clinic usually allows more time.",
    sortOrder: 3,
  },
  {
    question: "Is diabetes reversible?",
    answer:
      "Type 2 diabetes can sometimes go into remission, particularly when it is caught early and accompanied by substantial weight loss. That is a realistic goal for some patients and not for others, and it requires ongoing monitoring even when achieved. Type 1 diabetes always requires insulin. Be cautious of anyone promising a guaranteed cure.",
    sortOrder: 4,
  },
  {
    question: "Will I have to take thyroid medicine for life?",
    answer:
      "It depends on the cause. Autoimmune hypothyroidism usually requires lifelong thyroxine, while thyroid problems triggered by pregnancy, medication or a temporary inflammation may resolve. The dose often needs adjusting over time, so periodic testing matters either way.",
    sortOrder: 5,
  },
  {
    question: "How often will I need follow-up?",
    answer:
      "After starting or changing treatment, review is typically at 4 to 12 weeks. Once stable, most patients are seen every three to six months. Conditions such as pituitary or adrenal disease may need a different schedule.",
    sortOrder: 6,
  },
  {
    question: "Can I consult online?",
    answer:
      "Video consultation is suitable for follow-up, report review and dose adjustment. A first consultation, and any situation needing physical examination, is better done in person. Online consultations follow the Telemedicine Practice Guidelines, 2020.",
    sortOrder: 7,
  },
];

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@drpawangoel.in";

  // No hardcoded fallback: this repository is public, so a default password in
  // source would be a published credential for any deployment seeded without
  // setting ADMIN_PASSWORD. Generate one instead and print it once.
  const provided = process.env.ADMIN_PASSWORD;
  const password = provided || randomBytes(12).toString("base64url");

  if (await prisma.adminUser.findUnique({ where: { email } })) return;

  await prisma.adminUser.create({
    data: {
      email,
      name: "Site Administrator",
      passwordHash: await hashPassword(password),
    },
  });

  console.log(`\n  Admin login created:\n    ${email}\n    ${password}`);
  console.log(
    provided
      ? "  Change this password after first login.\n"
      : "  Randomly generated — copy it now, it is not stored anywhere else.\n",
  );
}

async function main() {
  const force =
    process.env.SEED_FORCE === "1" || process.argv.includes("--force");

  const [locationCount, conditionCount] = await Promise.all([
    prisma.location.count(),
    prisma.condition.count(),
  ]);

  // Re-running the seed would overwrite settings, locations, OPD timings and
  // page content with the unverified starter data. Once the database has real
  // content that must never happen by accident.
  if ((locationCount > 0 || conditionCount > 0) && !force) {
    console.log(
      "\n  Database already contains content — skipping the content seed.\n" +
        "  Existing settings, timings and pages have been left untouched.\n" +
        "  To deliberately overwrite everything with the starter data, run:\n" +
        "    SEED_FORCE=1 npm run db:seed\n",
    );
    await ensureAdminUser();
    await prisma.$disconnect();
    return;
  }

  if (force && (locationCount > 0 || conditionCount > 0)) {
    console.warn("\n  SEED_FORCE set — overwriting existing content.\n");
  }

  console.log("Seeding database…");

  await prisma.settings.upsert({
    where: { id: 1 },
    update: SETTINGS,
    create: SETTINGS,
  });

  await prisma.credential.deleteMany();
  await prisma.credential.createMany({ data: CREDENTIALS });

  for (const { slots, ...location } of LOCATIONS) {
    const saved = await prisma.location.upsert({
      where: { slug: location.slug },
      update: location,
      create: location,
    });
    await prisma.scheduleSlot.deleteMany({ where: { locationId: saved.id } });
    if (slots.length) {
      await prisma.scheduleSlot.createMany({
        data: slots.map((s) => ({ ...s, locationId: saved.id })),
      });
    }
  }

  for (const [index, condition] of CONDITIONS.entries()) {
    const data = {
      ...condition,
      sortOrder: index + 1,
      metaTitle: `${condition.name} Treatment in Delhi | Dr. Pawan Goel`,
      metaDescription: condition.summary,
    };
    await prisma.condition.upsert({
      where: { slug: condition.slug },
      update: data,
      create: data,
    });
  }

  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  const existingFaqs = await prisma.faq.count();
  if (existingFaqs === 0) await prisma.faq.createMany({ data: FAQS });

  await ensureAdminUser();

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
