import React, { useState, useEffect, useRef } from 'react';
import {
  Landmark, Building2, Layers, Stethoscope, Flame, Award,
  XCircle, Timer, Home, DollarSign,
  Trophy, Skull, Sparkles, Zap, ShieldAlert, Inbox as InboxIcon,
  ListChecks, Calendar, HeartPulse, Coffee, Hourglass, MessageSquare,
  PlayCircle, RefreshCw, Gift, Briefcase,
} from 'lucide-react';

// ============================================================================
// CONSTANTS & MOCK DATA
// ============================================================================

const CULTURE_LABELS = {
  fintech: 'פינטק אגרסיבי',
  corporate: 'תאגיד גלובלי',
  saas: 'SaaS ארגוני בוגר',
  startup: 'סטארטאפ רפואי כאוטי',
};

const CULTURE_ICONS = {
  fintech: Landmark,
  corporate: Building2,
  saas: Layers,
  startup: Stethoscope,
};

// Real Israeli tech hubs & business parks (never real company/building names), weighted so
// Tel Aviv-area locations dominate like the real distribution, per
// https://www.dialog.co.il/new-world/trends/blogs/israeli-high-tech-location
// 'kind: park' entries are already a specific-enough real place name on their own;
// 'kind: city' entries get a fictional building/floor appended for flavor.
const REAL_PLACES = [
  { name: 'תל אביב', kind: 'city', weight: 20 },
  { name: 'קריית עתידים, תל אביב', kind: 'park', weight: 6 },
  { name: 'רמת החייל, תל אביב', kind: 'park', weight: 6 },
  { name: 'שדרות רוטשילד, תל אביב', kind: 'park', weight: 4 },
  { name: 'הרצליה פיתוח', kind: 'park', weight: 15 },
  { name: 'רעננה', kind: 'city', weight: 4 },
  { name: 'נתניה', kind: 'city', weight: 4 },
  { name: 'הוד השרון', kind: 'city', weight: 3 },
  { name: 'רמת גן', kind: 'city', weight: 3 },
  { name: 'בת ים', kind: 'city', weight: 2 },
  { name: 'גבעתיים', kind: 'city', weight: 2 },
  { name: 'ראש העין', kind: 'city', weight: 2 },
  { name: 'לוד', kind: 'city', weight: 2 },
  { name: 'שוהם', kind: 'city', weight: 2 },
  { name: 'חולון', kind: 'city', weight: 2 },
  { name: 'קריית אריה, פתח תקווה', kind: 'park', weight: 5 },
  { name: 'סגולה, פתח תקווה', kind: 'park', weight: 3 },
  { name: 'קריית מטלון, פתח תקווה', kind: 'park', weight: 3 },
  { name: 'פארק עופר לעסקים, פתח תקווה', kind: 'park', weight: 3 },
  { name: 'פארק מת"ם, חיפה', kind: 'park', weight: 4 },
  { name: 'חיפה', kind: 'city', weight: 2 },
  { name: 'כרמיאל', kind: 'city', weight: 2 },
  { name: 'פארק הייטק, יקנעם עילית', kind: 'park', weight: 3 },
  { name: 'רחובות', kind: 'city', weight: 2 },
  { name: 'יבנה', kind: 'city', weight: 2 },
  { name: 'עומר', kind: 'city', weight: 2 },
  { name: 'פארק הייטק, באר שבע', kind: 'park', weight: 3 },
  { name: 'קריית גת', kind: 'city', weight: 2 },
  { name: 'ירושלים', kind: 'city', weight: 2 },
];

// Fictional tower names (generic nature/founder themed) — never a real developer's brand.
const BUILDING_STEMS = [
  'מגדל אורנים', 'מגדל ורדים', 'מגדל הצפונים', 'מגדל המייסדים', 'מגדל קסטן',
  'מגדל הגפן', 'מגדל התכלת', 'מגדל הזית', 'מגדל האלון', 'מגדל השחר',
  'מגדל הברוש', 'מגדל הדקל',
];

function pickWeighted(rng, items) {
  const total = items.reduce((sum, it) => sum + it.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    if (r < it.weight) return it;
    r -= it.weight;
  }
  return items[items.length - 1];
}

// Deterministic PRNG (fixed seed) so the 120-company roster is varied but stable across loads.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FINTECH_STEMS = [
  'טוראס פייננס', 'קרדיטקס גלובל', 'וולטבנק דיגיטל', 'פינטרום קפיטל', 'זניט טרייד סיסטמס',
  'אורורה פיננסים גלובלי', 'נובהבנק דיגיטל', 'קוואנטום קפיטל מרקטס', 'סטרלינג ריסק אנליטיקס',
  'מרידיאן פיננס טק', 'אפקס טרייד סולושנס', 'הליוס בנקינג גרופ', 'פרוטיום קפיטל',
  'אטלס וולת׳ טכנולוגיות', 'ג׳נסיס פיננשיאל סיסטמס',
];
const FINTECH_ROLES = ['Senior Quant Engineer', 'Head of Risk Algorithms', 'Principal Trading Systems Architect', 'Senior Financial Data Engineer', 'Lead Fraud Detection Engineer'];
const FINTECH_DESCS = [
  'ענקית פינטק עם תרבות "זאבי וול-סטריט", בונוסים אגדיים ולוחות זמנים בלתי אפשריים.',
  'מודלים פיננסיים עתירי סיכון, שעות עבודה שלא נגמרות, ותביעה למחויבות מוחלטת.',
  'מערכות מסחר בזמן אמת, לחץ יומיומי אמיתי, אך שם מוכר ומכובד בשוק.',
  'צוות גיוס אגרסיבי, בונוסי חתימה נדיבים, ותרבות של "תמיד זמינים".',
  'אלגוריתמי מסחר בתדירות גבוהה תחת לחץ מתמיד להוכיח תוצאות רבעוניות.',
];

const CORPORATE_STEMS = [
  'מגה-סופט ישראל', 'אורביטל סיסטמס גלובל', 'טיטאן קלאוד קורפ׳', 'אינפיניטי טכנולוגיות',
  'קוואזר גלובל סופטוור', 'זניקס אנטרפרייז סולושנס', 'פולאריס דאטה סיסטמס', 'וורטקס קלאוד גלובל',
  'הורייזן טכנולוגיות בינלאומי', 'סטרטוספיר סופטוור', 'נקסוס אינטליג׳נס גלובל', 'אומניקורפ דיגיטל',
  'פרונטיר קומפיוט גלובל', 'סינרג׳י סיסטמס בינלאומי', 'יונייטד קלאוד אנטרפרייז',
];
const CORPORATE_ROLES = ['Principal Software Engineer', 'Staff AI Research Engineer', 'Principal Cloud Architect', 'Staff Machine Learning Engineer', 'Principal Platform Engineer'];
const CORPORATE_DESCS = [
  'חמישה שלבי ראיונות, שאלות אלגוריתמים קשות, ותהליכים ביורוקרטיים ארוכים - אך יציבות ונוצצת בקורות החיים.',
  'מחקר AI ברמה עולמית בתוך מכונה תאגידית ענקית עם תהליכי אישור אינסופיים.',
  'תשתיות ענן בקנה מידה עולמי, ריאיונות התנהגותיים ממוסגרים ונוקשים.',
  'צוותים גלובליים, תהליכי עבודה מתועדים לפרטי פרטים, וקידום איטי אך יציב.',
  'שם מוכר בעולם, פרויקטים בקנה מידה עצום, ותרבות ניהולית שמרנית.',
];

const SAAS_STEMS = [
  'פלואו-בייס SaaS פתרונות ארגוניים', 'נימבוס וורקספייס', 'קונטיניום B2B פלטפורמות', 'סטרימליין דאטה SaaS',
  'ברייטפאת׳ וורקפלואו', 'קלירדסק אנטרפרייז SaaS', 'גרידפוינט אנליטיקס', 'וורקבנץ׳ פתרונות ענן',
  'סימפלסטאק ארגוני', 'פיוז׳ן דאטה פלטפורמות', 'אפסטרים SaaS סולושנס', 'בלופרינט וורקספייס',
  'קלירליין ביזנס SaaS', 'נורת׳סטאר אנטרפרייז', 'סטדיפיי פתרונות ארגוניים',
];
const SAAS_ROLES = ['Senior Backend Engineer', 'Senior Full-Stack Engineer', 'Senior Data Engineer', 'Senior DevOps Engineer', 'Senior Product Engineer'];
const SAAS_DESCS = [
  'תרבות בוגרת עם תקשורת פתוחה, סטאק טכנולוגי מאוזן וגמישות היברידית אמיתית.',
  'עבודה מרחוק מלאה, קצב סביר, ותהליך גיוס שקוף וכן.',
  'פלטפורמת דאטה ארגונית יציבה עם ניהול בוגר ותהליכי עבודה ברורים.',
  'צמיחה יציבה ולא מסעירה, אך עם איזון בריא בין עבודה לחיים.',
  'לקוחות ארגוניים גדולים, מוצר בוגר, וצוות שמאמין בשקט התפעולי.',
];

const STARTUP_STEMS = [
  "ניורוג'ן הבריאות הדיגיטלית", 'ביומטריקס AI לאבס', 'וייטל-סקאן טכנולוגיות רפואיות', 'סינפסה AI רפואי',
  'הליקאל דיאגנוסטיקס', 'קרדיאק AI סטארטאפ', "ג'נום AI מעבדות", 'מדסקאן רובוטיקה',
  'פולסאר הבריאות הדיגיטלית', 'תרפיה AI לאבס', 'ויטליטי דיאגנוסטיקס חכמות', 'אונקוסקאן AI',
  'קוגניסקאן דיאגנוסטיקה', 'ביוסינת AI מעבדות', 'אקסון הבריאות הדיגיטלית',
];
const STARTUP_ROLES = ['Principal AI Architect', 'Founding ML Engineer', 'Lead Agentic Systems Engineer', 'Founding Backend Engineer', 'Principal Computer Vision Engineer'];
const STARTUP_DESCS = [
  'אתגרים טכנולוגיים מרתקים בקצה הידע של Agentic AI, אך הכל עלול להשתנות מחר בבוקר.',
  'צוות מייסדים קטן, אופציות נכבדות, וכאוס יומיומי מוחלט.',
  'בניית סוכני AI אוטונומיים למכשור רפואי - מרתק, לא יציב, ולא לחלשי לב.',
  'פיבוט אחרון קרה לפני חודש, וכנראה שיהיה עוד אחד בקרוב.',
  'מימון סבב הבא תלוי בדמו הבא - הלחץ האמיתי מתחיל כל בוקר מחדש.',
];

// Builds 2 companies per name-stem (different place/role/desc/stats each), so 15 stems -> 30 companies.
function buildArchetypeCompanies({ idPrefix, culture, stems, roles, descs, band, rng }) {
  const companies = [];
  stems.forEach((stem, i) => {
    let prevPlaceName = null;
    for (let k = 0; k < 2; k++) {
      // Avoid pairing the same stem with the same place twice (would produce two identically-named companies).
      let place = pickWeighted(rng, REAL_PLACES);
      for (let attempt = 0; attempt < 4 && place.name === prevPlaceName; attempt++) {
        place = pickWeighted(rng, REAL_PLACES);
      }
      prevPlaceName = place.name;

      let locationLabel;
      if (place.kind === 'park') {
        locationLabel = place.name;
      } else {
        const building = BUILDING_STEMS[Math.floor(rng() * BUILDING_STEMS.length)];
        const includeFloor = rng() < 0.6;
        const floor = 3 + Math.floor(rng() * 45);
        locationLabel = includeFloor ? `${building}, ${place.name}, קומה ${floor}` : `${building}, ${place.name}`;
      }

      const roleTitle = roles[Math.floor(rng() * roles.length)];
      const desc = descs[Math.floor(rng() * descs.length)];
      const techInterest = band.techInterestMin + Math.floor(rng() * (band.techInterestMax - band.techInterestMin + 1));
      const prestige = band.prestigeMin + Math.floor(rng() * (band.prestigeMax - band.prestigeMin + 1));
      const wfhDays = band.wfhMin + Math.floor(rng() * (band.wfhMax - band.wfhMin + 1));
      const optionGrants = band.optionsMin + Math.floor(rng() * (band.optionsMax - band.optionsMin + 1));
      const flexHours = band.flexMin + Math.floor(rng() * (band.flexMax - band.flexMin + 1));
      const stressPerStage = band.stressMin + Math.floor(rng() * (band.stressMax - band.stressMin + 1));
      const salaryMin = Math.round((band.salaryMinLow + rng() * (band.salaryMinHigh - band.salaryMinLow)) / 500) * 500;
      const salaryMax = Math.round((salaryMin + band.spreadLow + rng() * (band.spreadHigh - band.spreadLow)) / 500) * 500;
      companies.push({
        id: `${idPrefix}${i}${k}`, culture,
        name: `${stem} — ${locationLabel}`,
        roleTitle, salaryMin, salaryMax, techInterest, prestige, wfhDays, optionGrants, flexHours, stressPerStage, desc,
      });
    }
  });
  return companies;
}

const companyRng = mulberry32(1337);

const COMPANIES = [
  ...buildArchetypeCompanies({
    idPrefix: 'fin', culture: 'fintech', stems: FINTECH_STEMS, roles: FINTECH_ROLES, descs: FINTECH_DESCS, rng: companyRng,
    band: { techInterestMin: 4, techInterestMax: 6, prestigeMin: 4, prestigeMax: 5, wfhMin: 0, wfhMax: 1, optionsMin: 0, optionsMax: 2, flexMin: 0, flexMax: 1, stressMin: 14, stressMax: 19, salaryMinLow: 38000, salaryMinHigh: 46000, spreadLow: 20000, spreadHigh: 30000 },
  }),
  ...buildArchetypeCompanies({
    idPrefix: 'corp', culture: 'corporate', stems: CORPORATE_STEMS, roles: CORPORATE_ROLES, descs: CORPORATE_DESCS, rng: companyRng,
    band: { techInterestMin: 6, techInterestMax: 8, prestigeMin: 4, prestigeMax: 5, wfhMin: 1, wfhMax: 2, optionsMin: 1, optionsMax: 2, flexMin: 1, flexMax: 1, stressMin: 11, stressMax: 14, salaryMinLow: 32000, salaryMinHigh: 40000, spreadLow: 18000, spreadHigh: 24000 },
  }),
  ...buildArchetypeCompanies({
    idPrefix: 'saas', culture: 'saas', stems: SAAS_STEMS, roles: SAAS_ROLES, descs: SAAS_DESCS, rng: companyRng,
    band: { techInterestMin: 5, techInterestMax: 6, prestigeMin: 3, prestigeMax: 3, wfhMin: 3, wfhMax: 5, optionsMin: 1, optionsMax: 1, flexMin: 2, flexMax: 3, stressMin: 6, stressMax: 8, salaryMinLow: 25000, salaryMinHigh: 30000, spreadLow: 12000, spreadHigh: 16000 },
  }),
  ...buildArchetypeCompanies({
    idPrefix: 'start', culture: 'startup', stems: STARTUP_STEMS, roles: STARTUP_ROLES, descs: STARTUP_DESCS, rng: companyRng,
    band: { techInterestMin: 9, techInterestMax: 10, prestigeMin: 2, prestigeMax: 2, wfhMin: 2, wfhMax: 3, optionsMin: 2, optionsMax: 3, flexMin: 2, flexMax: 3, stressMin: 9, stressMax: 13, salaryMinLow: 22000, salaryMinHigh: 27000, spreadLow: 22000, spreadHigh: 27000 },
  }),
];

const QUESTION_BANK = [
  {
    id: 'q1', topic: 'Time Complexity',
    question: 'מהי סיבוכיות הזמן של חיפוש בעץ בינארי מאוזן (Balanced BST)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
  },
  {
    id: 'q2', topic: 'KV Cache',
    question: 'מהי המטרה העיקרית של KV Cache במודלי שפה טרנספורמריים בזמן הסקה (inference)?',
    options: [
      'לחסוך זיכרון על ידי מחיקת שכבות האטנשן',
      'לאחסן מפתחות וערכים שכבר חושבו כדי למנוע חישוב חוזר של האטנשן על כל הטוקנים הקודמים',
      'להצפין את הפלט של המודל למניעת דליפת מידע',
      'להחליף את מנגנון ה-Softmax בחישוב מהיר יותר',
    ],
    correctAnswer: 'לאחסן מפתחות וערכים שכבר חושבו כדי למנוע חישוב חוזר של האטנשן על כל הטוקנים הקודמים',
  },
  {
    id: 'q3', topic: 'Agentic AI',
    question: "כיצד סוכן AI אוטונומי (Agentic AI) שומר 'זיכרון' והקשר בין קריאות כלים (tool calls) מרובות במשימה ארוכה?",
    options: [
      'על ידי אימון מחדש של המודל בכל קריאה',
      'באמצעות ניהול מצב חיצוני (state) כמו scratchpad, זיכרון וקטורי או context object שמועבר בין הצעדים',
      'המודל זוכר הכל אוטומטית בזיכרון הפנימי שלו לצמיתות',
      'באמצעות שינוי משקלי הרשת (weights) בזמן ריצה',
    ],
    correctAnswer: 'באמצעות ניהול מצב חיצוני (state) כמו scratchpad, זיכרון וקטורי או context object שמועבר בין הצעדים',
  },
  {
    id: 'q4', topic: 'Big-O',
    question: 'איזו מהסיבוכיות הבאות גדלה הכי מהר עבור קלט גדול?',
    options: ['O(n log n)', 'O(2^n)', 'O(n^2)', 'O(n)'],
    correctAnswer: 'O(2^n)',
  },
  {
    id: 'q5', topic: 'LoRA',
    question: 'מהו היתרון המרכזי של שיטת LoRA (Low-Rank Adaptation) בכיוונון מודלים גדולים?',
    options: [
      'היא מחליפה לחלוטין את הצורך באימון מקדים (pretraining)',
      'היא מאמנת מטריצות דירוג-נמוך קטנות במקום את כל משקלי המודל, מה שחוסך משמעותית בזיכרון ובזמן חישוב',
      'היא מגדילה את גודל המודל כדי לשפר דיוק',
      'היא מבטלת לחלוטין את הצורך ב-GPU',
    ],
    correctAnswer: 'היא מאמנת מטריצות דירוג-נמוך קטנות במקום את כל משקלי המודל, מה שחוסך משמעותית בזיכרון ובזמן חישוב',
  },
  {
    id: 'q6', topic: 'RAG',
    question: 'מהו התפקיד המרכזי של רכיב ה-Retrieval במערכת RAG (Retrieval-Augmented Generation)?',
    options: [
      'לאמן את המודל מחדש על נתונים חדשים בכל שאילתה',
      'לשלוף מידע רלוונטי וטרי ממאגר חיצוני (כגון Vector DB) ולהזין אותו כהקשר למודל השפה',
      'לדחוס את משקלי המודל לקובץ קטן יותר',
      'להריץ בדיקות יחידה על קוד שנוצר',
    ],
    correctAnswer: 'לשלוף מידע רלוונטי וטרי ממאגר חיצוני (כגון Vector DB) ולהזין אותו כהקשר למודל השפה',
  },
  {
    id: 'q7', topic: 'Space Complexity',
    question: 'תוכנית שמשתמשת ברקורסיה עמוקה על קלט בגודל n, ללא זיכרון נוסף מעבר למחסנית הקריאות (call stack), נחשבת בעלת סיבוכיות מקום של:',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 'O(n)',
  },
  {
    id: 'q8', topic: 'Attention',
    question: 'מהי הבעיה המרכזית שמנגנון ה-Full Self-Attention הרגיל סובל ממנה עם הגדלת אורך הרצף (sequence length)?',
    options: [
      'סיבוכיות חישובית וזיכרון שגדלה ריבועית (O(n²)) עם אורך הרצף',
      'היא הופכת ליציבה מדי ולא לומדת דבר',
      'היא דורשת מספר אינסופי של שכבות',
      'היא לא תומכת בשפות שאינן אנגלית',
    ],
    correctAnswer: 'סיבוכיות חישובית וזיכרון שגדלה ריבועית (O(n²)) עם אורך הרצף',
  },
  {
    id: 'q9', topic: 'Time Complexity',
    question: 'מהי סיבוכיות הזמן הממוצעת של חיפוש בטבלת גיבוב (Hash Table) שמומשה היטב?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 'O(1)',
  },
  {
    id: 'q10', topic: 'Time Complexity',
    question: 'מהי סיבוכיות הזמן של מיזוג שתי רשימות ממוינות באורכים n ו-m לרשימה ממוינת אחת?',
    options: ['O(n+m)', 'O(n*m)', 'O(log(n+m))', 'O(n^2)'],
    correctAnswer: 'O(n+m)',
  },
  {
    id: 'q11', topic: 'Time Complexity',
    question: 'מהי סיבוכיות הזמן של גישה לאיבר לפי אינדקס במערך (array)?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 'O(1)',
  },
  {
    id: 'q12', topic: 'Time Complexity',
    question: 'מהי סיבוכיות הזמן של אלגוריתם חיפוש בינארי (Binary Search) על מערך ממוין באורך n?',
    options: ['O(log n)', 'O(n)', 'O(1)', 'O(n^2)'],
    correctAnswer: 'O(log n)',
  },
  {
    id: 'q13', topic: 'KV Cache',
    question: 'מה קורה לגודל ה-KV Cache ככל שאורך הרצף (context length) גדל במהלך ההסקה?',
    options: [
      'הוא גדל באופן ליניארי עם אורך הרצף, שכן כל טוקן נוסף מוסיף Key ו-Value שיש לאחסן',
      'הוא נשאר קבוע ללא תלות באורך הרצף',
      'הוא קטן ככל שיש יותר טוקנים בזכות דחיסה אוטומטית',
      'הוא תלוי רק בגודל אוצר המילים (vocabulary) של המודל',
    ],
    correctAnswer: 'הוא גדל באופן ליניארי עם אורך הרצף, שכן כל טוקן נוסף מוסיף Key ו-Value שיש לאחסן',
  },
  {
    id: 'q14', topic: 'KV Cache',
    question: 'מהי מטרת טכניקת Multi-Query Attention (MQA)?',
    options: [
      'לצמצם את גודל ה-KV Cache על ידי שיתוף אותם Key ו-Value בין כל ראשי האטנשן (heads)',
      'להוסיף עוד ראשי אטנשן כדי לשפר דיוק',
      'להחליף את מנגנון ה-Softmax בפונקציה מהירה יותר',
      'לאמן את המודל על שאילתות מרובות בו-זמנית',
    ],
    correctAnswer: 'לצמצם את גודל ה-KV Cache על ידי שיתוף אותם Key ו-Value בין כל ראשי האטנשן (heads)',
  },
  {
    id: 'q15', topic: 'KV Cache',
    question: 'מדוע quantization של ה-KV Cache (למשל ל-int8) שימושי בזמן הסקה (inference)?',
    options: [
      'מפחית את צריכת הזיכרון של הקאש ומאפשר רצפים ארוכים יותר או batch גדול יותר, במחיר קטן בדיוק',
      'מגדיל את דיוק התחזיות של המודל',
      'מבטל את הצורך בשמירת Value ומשאיר רק Key',
      'מאיץ את שלב האימון המקדים (pretraining) בלבד',
    ],
    correctAnswer: 'מפחית את צריכת הזיכרון של הקאש ומאפשר רצפים ארוכים יותר או batch גדול יותר, במחיר קטן בדיוק',
  },
  {
    id: 'q16', topic: 'KV Cache',
    question: 'מה ההבדל המרכזי בין שלב ה-Prefill לשלב ה-Decode בהסקת LLM?',
    options: [
      'ב-Prefill מעבדים את כל הפרומפט במקביל וממלאים את הקאש, ואילו ב-Decode מייצרים טוקן אחד בכל פעם תוך שימוש בקאש',
      'Prefill מתבצע רק פעם אחת בחיי המודל, בזמן האימון',
      'Decode הוא שלב שמתבצע לפני שהמשתמש שולח פרומפט',
      'אין הבדל מהותי, אלו שני שמות לאותו שלב',
    ],
    correctAnswer: 'ב-Prefill מעבדים את כל הפרומפט במקביל וממלאים את הקאש, ואילו ב-Decode מייצרים טוקן אחד בכל פעם תוך שימוש בקאש',
  },
  {
    id: 'q17', topic: 'Agentic AI',
    question: 'מהו ReAct (Reason + Act) בהקשר של סוכני AI?',
    options: [
      'תבנית שבה המודל מתחלף בין חשיבה מילולית (reasoning) לביצוע פעולות (tool calls), ומשתמש בתוצאה כדי להחליט על הצעד הבא',
      'שיטת אימון שמשלבת RL עם Supervised Learning',
      'ארכיטקטורת רשת נוירונים עם שני ראשי פלט',
      'פרוטוקול תקשורת בין שני סוכני AI שונים',
    ],
    correctAnswer: 'תבנית שבה המודל מתחלף בין חשיבה מילולית (reasoning) לביצוע פעולות (tool calls), ומשתמש בתוצאה כדי להחליט על הצעד הבא',
  },
  {
    id: 'q18', topic: 'Agentic AI',
    question: "מהי הבעיה המרכזית ב'תכנון ארוך טווח' (long-horizon planning) עבור סוכן אוטונומי?",
    options: [
      'שגיאות מצטברות (error accumulation) לאורך הצעדים עלולות להוביל לסטייה הולכת וגדלה מהמטרה המקורית',
      'הסוכן תמיד מסיים את המשימה מהר מדי',
      'אין דרך לתת לסוכן יותר מכלי אחד',
      'המודל שוכח את השפה שבה הוא מדבר',
    ],
    correctAnswer: 'שגיאות מצטברות (error accumulation) לאורך הצעדים עלולות להוביל לסטייה הולכת וגדלה מהמטרה המקורית',
  },
  {
    id: 'q19', topic: 'Agentic AI',
    question: 'מהו תפקידם של Function Calling / Tool Use במודלי שפה?',
    options: [
      'לאפשר למודל לבחור ולהפעיל פונקציות חיצוניות מוגדרות מראש (כגון חיפוש, חישוב, קריאה ל-API) כחלק מתהליך הפתרון',
      'להחליף את שכבת ה-Embedding של המודל',
      'לצמצם את גודל המודל על ידי מחיקת שכבות',
      'לאמן את המודל מחדש בכל שיחה',
    ],
    correctAnswer: 'לאפשר למודל לבחור ולהפעיל פונקציות חיצוניות מוגדרות מראש (כגון חיפוש, חישוב, קריאה ל-API) כחלק מתהליך הפתרון',
  },
  {
    id: 'q20', topic: 'Agentic AI',
    question: "מהי הסכנה המרכזית ב'הרעלת הקשר' (context poisoning) בסוכן עם זיכרון מתמשך?",
    options: [
      'מידע שגוי שנכנס לזיכרון הסוכן עלול להשפיע על כל ההחלטות העתידיות שמסתמכות על אותו הקשר',
      'הסוכן מפסיק לעבוד לחלוטין ברגע שיש טעות אחת',
      'זיכרון הסוכן מתאפס אוטומטית כל דקה',
      'המודל מתחיל לדבר בשפה אחרת',
    ],
    correctAnswer: 'מידע שגוי שנכנס לזיכרון הסוכן עלול להשפיע על כל ההחלטות העתידיות שמסתמכות על אותו הקשר',
  },
  {
    id: 'q21', topic: 'Big-O',
    question: 'מהי סיבוכיות הזמן הגרועה ביותר (worst case) של אלגוריתם Quicksort?',
    options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
    correctAnswer: 'O(n^2)',
  },
  {
    id: 'q22', topic: 'Big-O',
    question: "איזו מהסיבוכיות הבאות נחשבת 'פולינומיאלית' (polynomial)?",
    options: ['O(n^3)', 'O(2^n)', 'O(n!)', 'O(n^n)'],
    correctAnswer: 'O(n^3)',
  },
  {
    id: 'q23', topic: 'Big-O',
    question: 'מהי סיבוכיות הזמן של הכפלת שתי מטריצות בגודל n×n בשיטה הנאיבית?',
    options: ['O(n^3)', 'O(n^2)', 'O(n log n)', 'O(n)'],
    correctAnswer: 'O(n^3)',
  },
  {
    id: 'q24', topic: 'Big-O',
    question: 'מדוע בניתוח Big-O נהוג להתעלם ממקדמים קבועים, כמו לכתוב O(n) במקום O(2n+5)?',
    options: [
      'כי Big-O מתאר קצב גדילה אסימפטוטי עבור קלט גדול, ולא את הערך המדויק של מספר הפעולות',
      'כי מקדמים קבועים תמיד שווים ל-1 בפועל',
      'כי המחשב מתעלם מהם בזמן ריצה',
      'כי זה נכון רק לאלגוריתמים רקורסיביים',
    ],
    correctAnswer: 'כי Big-O מתאר קצב גדילה אסימפטוטי עבור קלט גדול, ולא את הערך המדויק של מספר הפעולות',
  },
  {
    id: 'q25', topic: 'LoRA',
    question: "מהו הפרמטר 'rank' (r) ב-LoRA קובע?",
    options: [
      'את הממד של מטריצות הדירוג-הנמוך, ולכן את כמות הפרמטרים הניתנים לאימון ואת כושר הביטוי של ההתאמה',
      'את מספר השכבות במודל הבסיסי',
      'את קצב הלמידה (learning rate) של האימון',
      'את גודל אוצר המילים של המודל',
    ],
    correctAnswer: 'את הממד של מטריצות הדירוג-הנמוך, ולכן את כמות הפרמטרים הניתנים לאימון ואת כושר הביטוי של ההתאמה',
  },
  {
    id: 'q26', topic: 'LoRA',
    question: 'מהו QLoRA?',
    options: [
      'שילוב של כימות (quantization) המודל הבסיסי ל-4 סיביות עם אימון LoRA, המאפשר כיוונון מודלים ענקיים על GPU יחיד',
      'גרסה מהירה יותר של LoRA שמדלגת על שכבת ה-Attention',
      'שיטה להריץ כמה מודלי LoRA שונים בו-זמנית על אותו קלט',
      'טכניקה להמרת מודל LoRA לפורמט ONNX',
    ],
    correctAnswer: 'שילוב של כימות (quantization) המודל הבסיסי ל-4 סיביות עם אימון LoRA, המאפשר כיוונון מודלים ענקיים על GPU יחיד',
  },
  {
    id: 'q27', topic: 'LoRA',
    question: 'מדוע ניתן "למזג" (merge) משקלי LoRA בחזרה למודל הבסיסי לאחר האימון?',
    options: [
      'כי LoRA מוסיפה עדכון ליניארי (ΔW=BA) שניתן לחבר ישירות למשקלים המקוריים W, ללא שינוי בארכיטקטורה או בזמן ההסקה',
      'כי המשקלים המקוריים נמחקים בזמן האימון',
      'כי חובה למזג לפני שניתן להשתמש במודל בכלל',
      'כי המיזוג מגדיל את מספר הפרמטרים הכולל של המודל',
    ],
    correctAnswer: 'כי LoRA מוסיפה עדכון ליניארי (ΔW=BA) שניתן לחבר ישירות למשקלים המקוריים W, ללא שינוי בארכיטקטורה או בזמן ההסקה',
  },
  {
    id: 'q28', topic: 'LoRA',
    question: 'מהו החיסרון המרכזי של Full Fine-Tuning לעומת LoRA במודלים גדולים?',
    options: [
      'דורש עדכון ואחסון של כל משקלי המודל, מה שצורך פי כמה יותר זיכרון וזמן חישוב',
      'הוא תמיד פחות מדויק מ-LoRA',
      'אי אפשר להשתמש בו כלל על GPU',
      'הוא דורש יותר נתוני אימון מ-LoRA באופן מובנה',
    ],
    correctAnswer: 'דורש עדכון ואחסון של כל משקלי המודל, מה שצורך פי כמה יותר זיכרון וזמן חישוב',
  },
  {
    id: 'q29', topic: 'RAG',
    question: 'מהו chunk (קטע) במערכת RAG טיפוסית?',
    options: [
      'יחידת טקסט קטנה וממוקדת ממסמך מקור, שעבורה מחושב embedding ואשר נשלפת בנפרד לפי רלוונטיות',
      'מסמך שלם שנשלף כמות שהוא בכל שאילתה',
      'שכבה ברשת הנוירונים של מודל ה-Retrieval',
      'קובץ קונפיגורציה שמגדיר את גודל המודל',
    ],
    correctAnswer: 'יחידת טקסט קטנה וממוקדת ממסמך מקור, שעבורה מחושב embedding ואשר נשלפת בנפרד לפי רלוונטיות',
  },
  {
    id: 'q30', topic: 'RAG',
    question: 'מדוע RAG עוזר להפחית הזיות (hallucinations) במודלי שפה?',
    options: [
      'כי המודל מקבל מידע עדכני ומבוסס-מקור כהקשר, במקום להסתמך רק על מה ש"שינן" בזמן האימון',
      'כי RAG מבטל לחלוטין את יכולת המודל לייצר טקסט חופשי',
      'כי RAG מגדיל את גודל המודל ומשפר בכך את הדיוק',
      'כי RAG מריץ את המודל פעמיים ובוחר בתשובה הקצרה יותר',
    ],
    correctAnswer: 'כי המודל מקבל מידע עדכני ומבוסס-מקור כהקשר, במקום להסתמך רק על מה ש"שינן" בזמן האימון',
  },
  {
    id: 'q31', topic: 'RAG',
    question: 'מהו re-ranking בפייפליין של RAG?',
    options: [
      'שלב נוסף שבו מודל ייעודי מדרג מחדש את המסמכים שנשלפו כדי לשפר את הרלוונטיות לפני שהם מוזנים למודל השפה',
      'תהליך שממיין את פלט המודל הסופי לפי אורך המשפט',
      'שכבה שמאמנת מחדש את ה-embeddings בכל שאילתה',
      'שיטה למחוק כפילויות ממסד הנתונים הווקטורי',
    ],
    correctAnswer: 'שלב נוסף שבו מודל ייעודי מדרג מחדש את המסמכים שנשלפו כדי לשפר את הרלוונטיות לפני שהם מוזנים למודל השפה',
  },
  {
    id: 'q32', topic: 'RAG',
    question: 'מהו החיסרון המרכזי של RAG לעומת כיוונון (fine-tuning) על ידע חדש?',
    options: [
      'RAG לא משנה את "הבנת" המודל את התחום, אלא רק מספק הקשר חיצוני - איכות התשובה תלויה מאוד באיכות השליפה',
      'RAG תמיד יקר יותר מאימון מודל מהתחלה',
      'RAG לא יכול לעבוד עם מודלים גדולים מ-1B פרמטרים',
      'RAG דורש לאמן מחדש את כל המודל בכל פעם שמוסיפים מסמך',
    ],
    correctAnswer: 'RAG לא משנה את "הבנת" המודל את התחום, אלא רק מספק הקשר חיצוני - איכות התשובה תלויה מאוד באיכות השליפה',
  },
  {
    id: 'q33', topic: 'Space Complexity',
    question: 'מהי סיבוכיות המקום הנוספת (extra space) של אלגוריתם Merge Sort הסטנדרטי?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 'O(n)',
  },
  {
    id: 'q34', topic: 'Space Complexity',
    question: 'מהי סיבוכיות המקום של חיפוש DFS רקורסיבי בעץ בעומק h?',
    options: ['O(h)', 'O(1)', 'O(n)', 'O(n^2)'],
    correctAnswer: 'O(h)',
  },
  {
    id: 'q35', topic: 'Space Complexity',
    question: 'מהו ההבדל בין סיבוכיות זמן לסיבוכיות מקום?',
    options: [
      'סיבוכיות זמן מודדת את מספר הפעולות שהאלגוריתם מבצע, וסיבוכיות מקום מודדת את כמות הזיכרון הנוסף שהוא צורך',
      'אין הבדל, אלו שני שמות לאותו מדד',
      'סיבוכיות מקום נמדדת רק במעבדים חלשים',
      'סיבוכיות זמן תמיד גבוהה יותר מסיבוכיות מקום',
    ],
    correctAnswer: 'סיבוכיות זמן מודדת את מספר הפעולות שהאלגוריתם מבצע, וסיבוכיות מקום מודדת את כמות הזיכרון הנוסף שהוא צורך',
  },
  {
    id: 'q36', topic: 'Space Complexity',
    question: 'מהי סיבוכיות המקום הנוספת של אלגוריתם מיון "במקום" (in-place) כמו Heapsort?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 'O(1)',
  },
  {
    id: 'q37', topic: 'Attention',
    question: 'מהו Sliding Window Attention?',
    options: [
      'מנגנון בו כל טוקן מתייחס רק לחלון מוגבל של טוקנים סמוכים, במקום לכל הרצף, כדי לחסוך בחישוב ובזיכרון',
      'שיטה להזיז את הפרומפט הלאה בכל צעד יצירה',
      'טכניקה לאמן את המודל על חלונות זמן שונים',
      'מנגנון שמונע מהמודל להתייחס לטוקן הראשון ברצף',
    ],
    correctAnswer: 'מנגנון בו כל טוקן מתייחס רק לחלון מוגבל של טוקנים סמוכים, במקום לכל הרצף, כדי לחסוך בחישוב ובזיכרון',
  },
  {
    id: 'q38', topic: 'Attention',
    question: 'מהי מטרתה של טכניקת FlashAttention?',
    options: [
      'לחשב אטנשן מדויק תוך ניצול יעיל יותר של זיכרון ה-GPU, מה שמאיץ משמעותית את החישוב ומפחית צריכת זיכרון',
      'להחליף את חישוב האטנשן בקירוב סטטיסטי לא מדויק',
      'לאמן את המודל מהר יותר על ידי הקטנת אוצר המילים',
      'למחוק את שכבות האטנשן שאינן בשימוש',
    ],
    correctAnswer: 'לחשב אטנשן מדויק תוך ניצול יעיל יותר של זיכרון ה-GPU, מה שמאיץ משמעותית את החישוב ומפחית צריכת זיכרון',
  },
  {
    id: 'q39', topic: 'Attention',
    question: 'מהו תפקידם של Query, Key ו-Value במנגנון האטנשן?',
    options: [
      'ה-Query מייצג "מה מחפשים", ה-Key מייצג "מה כל טוקן מציע", וה-Value הוא המידע שמוחזר בפועל לפי מידת ההתאמה',
      'שלושתם הם שמות שונים לאותה מטריצת משקלים',
      'Query ו-Key משמשים רק באימון, ו-Value רק בהסקה',
      'Value קובע את סדר הטוקנים ברצף',
    ],
    correctAnswer: 'ה-Query מייצג "מה מחפשים", ה-Key מייצג "מה כל טוקן מציע", וה-Value הוא המידע שמוחזר בפועל לפי מידת ההתאמה',
  },
  {
    id: 'q40', topic: 'Attention',
    question: 'מהי המטרה של Positional Encoding בטרנספורמר?',
    options: [
      'להזין למודל מידע על סדר הטוקנים ברצף, שכן מנגנון האטנשן עצמו אינו רגיש לסדר',
      'להקטין את מספר הפרמטרים הכולל של המודל',
      'למנוע מהמודל לגשת לטוקנים עתידיים בזמן אימון',
      'להצפין את הקלט מטעמי אבטחה',
    ],
    correctAnswer: 'להזין למודל מידע על סדר הטוקנים ברצף, שכן מנגנון האטנשן עצמו אינו רגיש לסדר',
  },
  {
    id: 'q41', topic: 'Data Structures',
    question: 'מהי התכונה המרכזית של מבנה נתונים מסוג Stack (מחסנית)?',
    options: [
      'LIFO - האיבר האחרון שנכנס הוא הראשון שיוצא',
      'FIFO - האיבר הראשון שנכנס הוא הראשון שיוצא',
      'כל האיברים יוצאים בו-זמנית',
      'הסדר תלוי בגודל האיבר',
    ],
    correctAnswer: 'LIFO - האיבר האחרון שנכנס הוא הראשון שיוצא',
  },
  {
    id: 'q42', topic: 'Data Structures',
    question: 'מהי התכונה המרכזית של מבנה נתונים מסוג Queue (תור)?',
    options: [
      'FIFO - האיבר הראשון שנכנס הוא הראשון שיוצא',
      'LIFO - האיבר האחרון שנכנס הוא הראשון שיוצא',
      'האיברים מסודרים לפי גודלם תמיד',
      'ניתן להוציא רק את האיבר האמצעי',
    ],
    correctAnswer: 'FIFO - האיבר הראשון שנכנס הוא הראשון שיוצא',
  },
  {
    id: 'q43', topic: 'Data Structures',
    question: 'מהו היתרון המרכזי של Linked List על פני Array בהוספת איבר באמצע הרשימה?',
    options: [
      'אין צורך להזיז איברים קיימים בזיכרון - מספיק לעדכן מצביעים (pointers)',
      'Linked List תמיד צורכת פחות זיכרון מ-Array',
      'ניתן לגשת לכל איבר ב-Linked List ב-O(1)',
      'Linked List תומכת רק במספרים שלמים',
    ],
    correctAnswer: 'אין צורך להזיז איברים קיימים בזיכרון - מספיק לעדכן מצביעים (pointers)',
  },
  {
    id: 'q44', topic: 'Data Structures',
    question: 'מהו Trie (עץ קידומות)?',
    options: [
      'מבנה נתונים עצי המאחסן מחרוזות כך שכל צומת מייצג תו, ומאפשר חיפוש וחיזוי קידומות (autocomplete) ביעילות',
      'סוג של טבלת גיבוב מיוחדת לטקסט',
      'מבנה נתונים לאחסון מספרים שלמים בלבד',
      'אלגוריתם למיון מחרוזות',
    ],
    correctAnswer: 'מבנה נתונים עצי המאחסן מחרוזות כך שכל צומת מייצג תו, ומאפשר חיפוש וחיזוי קידומות (autocomplete) ביעילות',
  },
  {
    id: 'q45', topic: 'Data Structures',
    question: 'מתי כדאי להעדיף Heap על פני מערך ממוין לצורך שליפת המינימום שוב ושוב תוך כדי הכנסות חדשות?',
    options: [
      'Heap שומר על O(log n) גם להכנסה וגם לשליפת הקיצון, בעוד מערך ממוין דורש O(n) להכנסה כדי לשמר את הסדר',
      'מערך ממוין תמיד מהיר יותר מ-Heap בכל תרחיש',
      'Heap לא תומך בהכנסת איברים חדשים כלל',
      'אין הבדל בין השניים מבחינת סיבוכיות',
    ],
    correctAnswer: 'Heap שומר על O(log n) גם להכנסה וגם לשליפת הקיצון, בעוד מערך ממוין דורש O(n) להכנסה כדי לשמר את הסדר',
  },
  {
    id: 'q46', topic: 'Sorting',
    question: 'איזה מהאלגוריתמים הבאים הוא "יציב" (stable) מטבעו, כלומר שומר על הסדר היחסי של איברים שווים?',
    options: ['Merge Sort', 'Quicksort', 'Heapsort', 'Selection Sort'],
    correctAnswer: 'Merge Sort',
  },
  {
    id: 'q47', topic: 'Sorting',
    question: 'מהי סיבוכיות הזמן הטובה ביותר האפשרית למיון מבוסס-השוואות (comparison-based sort) במקרה הכללי?',
    options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(1)'],
    correctAnswer: 'O(n log n)',
  },
  {
    id: 'q48', topic: 'Sorting',
    question: 'מתי משתלם להשתמש ב-Counting Sort במקום מיון מבוסס-השוואות?',
    options: [
      'כאשר טווח הערכים (k) קטן יחסית לגודל הקלט (n), כך שניתן להשיג סיבוכיות ליניארית O(n+k)',
      'כאשר הקלט מכיל רק מחרוזות ולא מספרים',
      'כאשר יש צורך למיין לפי מספר קריטריונים בו-זמנית',
      'כאשר הזיכרון הפנוי מוגבל מאוד',
    ],
    correctAnswer: 'כאשר טווח הערכים (k) קטן יחסית לגודל הקלט (n), כך שניתן להשיג סיבוכיות ליניארית O(n+k)',
  },
  {
    id: 'q49', topic: 'Sorting',
    question: 'מהו העיקרון מאחורי אלגוריתם Quicksort?',
    options: [
      'בחירת איבר ציר (pivot), חלוקת המערך לאיברים קטנים/גדולים ממנו, ומיון רקורסיבי של כל חלק',
      'מיזוג זוגות של איברים סמוכים שוב ושוב עד שהמערך ממוין',
      'בניית ערימה (heap) והוצאת האיבר המקסימלי שוב ושוב',
      'ספירת מספר המופעים של כל ערך והרכבת המערך לפי הספירה',
    ],
    correctAnswer: 'בחירת איבר ציר (pivot), חלוקת המערך לאיברים קטנים/גדולים ממנו, ומיון רקורסיבי של כל חלק',
  },
  {
    id: 'q50', topic: 'Sorting',
    question: 'למה Bubble Sort נחשב לא יעיל למערכים גדולים?',
    options: [
      'סיבוכיות הזמן שלו היא O(n^2) גם במקרה הממוצע, בגלל החלפות חוזרות של איברים סמוכים',
      'הוא לא יכול למיין מספרים שליליים',
      'הוא דורש זיכרון נוסף בגודל O(n^2)',
      'הוא לא יציב (unstable)',
    ],
    correctAnswer: 'סיבוכיות הזמן שלו היא O(n^2) גם במקרה הממוצע, בגלל החלפות חוזרות של איברים סמוכים',
  },
  {
    id: 'q51', topic: 'Databases',
    question: "מהי התכונה 'Atomicity' מתוך עקרונות ACID?",
    options: [
      'טרנזקציה מתבצעת במלואה או לא מתבצעת כלל - אין מצב ביניים חלקי',
      'כל הנתונים חייבים להיות זהים בכל רגע נתון בכל העותקים',
      'כל טרנזקציה חייבת להסתיים תוך פחות משנייה',
      'המשתמש חייב לאשר כל שינוי בנתונים ידנית',
    ],
    correctAnswer: 'טרנזקציה מתבצעת במלואה או לא מתבצעת כלל - אין מצב ביניים חלקי',
  },
  {
    id: 'q52', topic: 'Databases',
    question: 'מתי כדאי להעדיף מסד נתונים NoSQL מסוג מסמכים (Document DB) על פני רלציוני?',
    options: [
      'כאשר הסכימה משתנה בתדירות גבוהה או שהנתונים מתאימים למבנה מסמך היררכי, ולא נדרשות טרנזקציות מורכבות בין טבלאות',
      'כאשר נדרשת תמיכה מלאה ב-JOIN מורכבים בין עשרות טבלאות',
      'כאשר יש צורך בעקביות חזקה (strong consistency) בכל מחיר',
      'כאשר כל הנתונים הם מספרים שלמים בלבד',
    ],
    correctAnswer: 'כאשר הסכימה משתנה בתדירות גבוהה או שהנתונים מתאימים למבנה מסמך היררכי, ולא נדרשות טרנזקציות מורכבות בין טבלאות',
  },
  {
    id: 'q53', topic: 'Databases',
    question: 'מהו אינדקס (Index) במסד נתונים, ומדוע הוא מאיץ שאילתות?',
    options: [
      'מבנה נתונים נוסף (בדרך כלל עץ מאוזן) שממפה ערכי עמודה למיקום השורות, ומאפשר חיפוש מהיר בלי לסרוק את כל הטבלה',
      'עותק מלא של הטבלה שנשמר לגיבוי בלבד',
      'רכיב שמצפין את הנתונים הרגישים בטבלה',
      'תהליך שמוחק שורות כפולות אוטומטית',
    ],
    correctAnswer: 'מבנה נתונים נוסף (בדרך כלל עץ מאוזן) שממפה ערכי עמודה למיקום השורות, ומאפשר חיפוש מהיר בלי לסרוק את כל הטבלה',
  },
  {
    id: 'q54', topic: 'Databases',
    question: 'מהי הבעיה שפתרון Sharding נועד לפתור?',
    options: [
      'פיצול מסד נתונים גדול למספר מכונות (shards) כדי להתמודד עם נפח נתונים או עומס שחורג מיכולת מכונה בודדת',
      'הצפנת הנתונים בזמן מנוחה (at rest)',
      'מניעת כפילות נתונים בין טבלאות',
      'שיפור קריאות הקוד של שאילתות SQL',
    ],
    correctAnswer: 'פיצול מסד נתונים גדול למספר מכונות (shards) כדי להתמודד עם נפח נתונים או עומס שחורג מיכולת מכונה בודדת',
  },
  {
    id: 'q55', topic: 'Databases',
    question: 'מהו ההבדל המרכזי בין Replication ל-Sharding?',
    options: [
      'Replication משכפל את אותם הנתונים למספר מכונות לצורך זמינות וקריאה מהירה, בעוד Sharding מפצל נתונים שונים בין מכונות שונות לצורך קנה מידה',
      'שני המונחים מתארים בדיוק אותו מנגנון',
      'Sharding משמש רק לגיבויים, ו-Replication רק לביצועים',
      'Replication אפשרי רק במסדי נתונים רלציוניים',
    ],
    correctAnswer: 'Replication משכפל את אותם הנתונים למספר מכונות לצורך זמינות וקריאה מהירה, בעוד Sharding מפצל נתונים שונים בין מכונות שונות לצורך קנה מידה',
  },
  {
    id: 'q56', topic: 'Caching',
    question: 'מהי מדיניות הפינוי LRU (Least Recently Used) במטמון?',
    options: [
      'מפנה מהמטמון את הפריט שלא נעשה בו שימוש הכי הרבה זמן, בהנחה שסביר שלא ישמש שוב בקרוב',
      'מפנה תמיד את הפריט הגדול ביותר בגודלו',
      'מפנה פריטים לפי סדר אקראי',
      'מפנה את כל המטמון ברגע שהוא מתמלא ב-50%',
    ],
    correctAnswer: 'מפנה מהמטמון את הפריט שלא נעשה בו שימוש הכי הרבה זמן, בהנחה שסביר שלא ישמש שוב בקרוב',
  },
  {
    id: 'q57', topic: 'Caching',
    question: "מהי הבעיה של 'Cache Stampede'?",
    options: [
      'כשמטמון פג בו-זמנית עבור מפתח פופולרי, בקשות רבות מגיעות במקביל למקור הנתונים ועלולות להעמיס עליו יתר על המידה',
      'כשיש יותר מדי מפתחות שונים במטמון בו-זמנית',
      'כשהמטמון מחזיר תמיד את אותה תשובה לכל השאילתות',
      'כשלקוח מנסה לקרוא ולכתוב לאותו מפתח בו-זמנית',
    ],
    correctAnswer: 'כשמטמון פג בו-זמנית עבור מפתח פופולרי, בקשות רבות מגיעות במקביל למקור הנתונים ועלולות להעמיס עליו יתר על המידה',
  },
  {
    id: 'q58', topic: 'Caching',
    question: 'מהו Write-Through Cache?',
    options: [
      'מדיניות שבה כל כתיבה נכתבת גם למטמון וגם למקור הנתונים בו-זמנית, מה שמבטיח עקביות במחיר Latency גבוה יותר בכתיבה',
      'מדיניות שבה כותבים רק למטמון ולעולם לא למקור הנתונים',
      'מדיניות שמוחקת את המטמון כולו בכל כתיבה',
      'מדיניות שמאפשרת כתיבה רק פעם ביום',
    ],
    correctAnswer: 'מדיניות שבה כל כתיבה נכתבת גם למטמון וגם למקור הנתונים בו-זמנית, מה שמבטיח עקביות במחיר Latency גבוה יותר בכתיבה',
  },
  {
    id: 'q59', topic: 'Caching',
    question: 'מהו ההבדל בין Cache Hit ל-Cache Miss?',
    options: [
      'Cache Hit הוא כשהמידע המבוקש נמצא במטמון, ו-Cache Miss הוא כשצריך לפנות למקור המקורי כי המידע לא נמצא',
      'Cache Hit קורה רק בכתיבה, ו-Cache Miss רק בקריאה',
      'שני המונחים מתארים את אותו מצב בדיוק',
      'Cache Miss קורה רק כשהמטמון מלא לגמרי',
    ],
    correctAnswer: 'Cache Hit הוא כשהמידע המבוקש נמצא במטמון, ו-Cache Miss הוא כשצריך לפנות למקור המקורי כי המידע לא נמצא',
  },
  {
    id: 'q60', topic: 'Caching',
    question: 'מתי שימושי להשתמש ב-CDN (Content Delivery Network)?',
    options: [
      'כאשר רוצים להגיש תוכן סטטי (תמונות, קבצים) למשתמשים גלובליים במהירות, על ידי שמירת עותקים קרובים גיאוגרפית אליהם',
      'כאשר רוצים להצפין תעבורה בין שני שרתי בסיס נתונים',
      'כאשר צריך להריץ קוד צד-שרת דינמי בלבד',
      'כאשר רוצים למנוע לחלוטין שימוש בזיכרון מטמון',
    ],
    correctAnswer: 'כאשר רוצים להגיש תוכן סטטי (תמונות, קבצים) למשתמשים גלובליים במהירות, על ידי שמירת עותקים קרובים גיאוגרפית אליהם',
  },
  {
    id: 'q61', topic: 'Distributed Systems',
    question: 'מהו משפט CAP?',
    options: [
      'במערכת מבוזרת עם חלוקת רשת (Partition), אי אפשר להבטיח בו-זמנית גם Consistency וגם Availability מלאים',
      'כל מערכת מבוזרת חייבת לוותר על אבטחה לטובת ביצועים',
      'מערכת מבוזרת חייבת לרוץ על לפחות 3 מכונות',
      'עקביות וזמינות תמיד ניתנות להשגה יחד ללא פשרה',
    ],
    correctAnswer: 'במערכת מבוזרת עם חלוקת רשת (Partition), אי אפשר להבטיח בו-זמנית גם Consistency וגם Availability מלאים',
  },
  {
    id: 'q62', topic: 'Distributed Systems',
    question: "מהי המשמעות של 'Eventual Consistency'?",
    options: [
      'לאחר זמן מה ללא עדכונים חדשים, כל העותקים במערכת יתכנסו לאותו ערך, אך לא מובטחת עקביות מיידית',
      'המערכת עקבית תמיד ומיידית, ללא יוצא מן הכלל',
      'הנתונים נמחקים אוטומטית אחרי זמן קצוב',
      'רק שרת אחד יכול לעדכן נתונים בכל זמן נתון',
    ],
    correctAnswer: 'לאחר זמן מה ללא עדכונים חדשים, כל העותקים במערכת יתכנסו לאותו ערך, אך לא מובטחת עקביות מיידית',
  },
  {
    id: 'q63', topic: 'Distributed Systems',
    question: 'מהו תפקידו של Load Balancer במערכת מבוזרת?',
    options: [
      'לחלק בקשות נכנסות בין מספר שרתים כדי למנוע עומס יתר על שרת בודד ולשפר זמינות',
      'להצפין את כל התעבורה בין שרתים',
      'לאחסן עותק גיבוי של מסד הנתונים',
      'להריץ בדיקות אבטחה על כל בקשה נכנסת',
    ],
    correctAnswer: 'לחלק בקשות נכנסות בין מספר שרתים כדי למנוע עומס יתר על שרת בודד ולשפר זמינות',
  },
  {
    id: 'q64', topic: 'Distributed Systems',
    question: 'מהי הבעיה שפותר Circuit Breaker Pattern?',
    options: [
      'מונע כשל מדורג (cascading failure) על ידי "ניתוק" זמני של קריאות לשירות שכושל שוב ושוב, עד שהוא מתאושש',
      'מבטיח שכל בקשה תקבל תשובה תוך פחות ממילישנייה',
      'מצפין את התקשורת בין מיקרו-שירותים',
      'מחליף אוטומטית שרת שנפל בשרת גיבוי זהה',
    ],
    correctAnswer: 'מונע כשל מדורג (cascading failure) על ידי "ניתוק" זמני של קריאות לשירות שכושל שוב ושוב, עד שהוא מתאושש',
  },
  {
    id: 'q65', topic: 'Distributed Systems',
    question: 'מהי המשמעות של Idempotency בקריאות API, ולמה היא חשובה במערכות מבוזרות?',
    options: [
      'פעולה שביצוע חוזר שלה נותן תוצאה זהה לביצוע יחיד - חשוב כדי לאפשר ניסיונות חוזרים (retries) בטוחים במקרה של תקלת רשת',
      'פעולה שאסור לבצע יותר מפעם אחת בשום מקרה',
      'פעולה שמתבצעת רק על שרת אחד ספציפי',
      'פעולה שמחזירה תמיד קוד שגיאה 500',
    ],
    correctAnswer: 'פעולה שביצוע חוזר שלה נותן תוצאה זהה לביצוע יחיד - חשוב כדי לאפשר ניסיונות חוזרים (retries) בטוחים במקרה של תקלת רשת',
  },
  {
    id: 'q66', topic: 'Concurrency',
    question: 'מהו Race Condition?',
    options: [
      'מצב בו התוצאה של קוד תלויה בתזמון היחסי של מספר תהליכים/threads שרצים במקביל וניגשים למשאב משותף',
      'מצב בו תהליך אחד רץ מהר יותר מכל השאר תמיד',
      'שיטת תזמון שמעדיפה תהליכים קצרים על ארוכים',
      'באג שגורם לתהליך להיתקע לצמיתות',
    ],
    correctAnswer: 'מצב בו התוצאה של קוד תלויה בתזמון היחסי של מספר תהליכים/threads שרצים במקביל וניגשים למשאב משותף',
  },
  {
    id: 'q67', topic: 'Concurrency',
    question: 'מהו Deadlock?',
    options: [
      'מצב בו שני תהליכים או יותר נעולים זה על זה, כל אחד ממתין למשאב שמוחזק על ידי האחר, ואף אחד לא יכול להתקדם',
      'מצב בו תהליך אחד צורך את כל זיכרון המערכת',
      'מצב בו תהליך מסתיים מוקדם מדי בגלל שגיאה',
      'שיטת סנכרון שמבטלת את הצורך במנעולים',
    ],
    correctAnswer: 'מצב בו שני תהליכים או יותר נעולים זה על זה, כל אחד ממתין למשאב שמוחזק על ידי האחר, ואף אחד לא יכול להתקדם',
  },
  {
    id: 'q68', topic: 'Concurrency',
    question: 'מהי מטרתו של Mutex (מנעול הדדי)?',
    options: [
      'להבטיח שרק thread אחד בכל רגע נתון יכול לגשת לקטע קוד קריטי או משאב משותף',
      'להריץ מספר threads בו-זמנית על אותו משאב',
      'להאיץ את ביצוע הקוד על ידי דילוג על בדיקות',
      'לתזמן threads לפי סדר ההגעה בלבד',
    ],
    correctAnswer: 'להבטיח שרק thread אחד בכל רגע נתון יכול לגשת לקטע קוד קריטי או משאב משותף',
  },
  {
    id: 'q69', topic: 'Concurrency',
    question: 'מה ההבדל בין Concurrency ל-Parallelism?',
    options: [
      'Concurrency היא ניהול מספר משימות שמתקדמות יחד לאורך זמן, בעוד Parallelism הוא ביצוע ממשי של מספר משימות במקביל, בדרך כלל על מספר ליבות',
      'שני המונחים זהים לחלוטין ואין ביניהם הבדל',
      'Parallelism אפשרי רק בשפת תכנות אחת ספציפית',
      'Concurrency דורשת תמיד יותר ליבות מ-Parallelism',
    ],
    correctAnswer: 'Concurrency היא ניהול מספר משימות שמתקדמות יחד לאורך זמן, בעוד Parallelism הוא ביצוע ממשי של מספר משימות במקביל, בדרך כלל על מספר ליבות',
  },
  {
    id: 'q70', topic: 'Concurrency',
    question: 'מהי הבעיה שפותר Semaphore בעל ערך גדול מ-1?',
    options: [
      'מגביל את מספר ה-threads שיכולים לגשת בו-זמנית למשאב מוגבל (למשל pool של חיבורים), ולא רק thread אחד כמו ב-Mutex',
      'מבטל לחלוטין את הצורך בסנכרון בין threads',
      'מאפשר לתהליך אחד לרוץ על מספר מעבדים בו-זמנית',
      'מוחק אוטומטית threads שנתקעו',
    ],
    correctAnswer: 'מגביל את מספר ה-threads שיכולים לגשת בו-זמנית למשאב מוגבל (למשל pool של חיבורים), ולא רק thread אחד כמו ב-Mutex',
  },
  {
    id: 'q71', topic: 'Networking',
    question: 'מהו ההבדל המרכזי בין TCP ל-UDP?',
    options: [
      'TCP מבטיח מסירה אמינה וסדורה של נתונים עם handshake ובקרת שגיאות, בעוד UDP שולח חבילות ללא ערבות למסירה או לסדר, במחיר latency נמוך יותר',
      'UDP תמיד מהיר יותר כי הוא מבטיח מסירה כפולה',
      'TCP משמש רק לדוא"ל, ו-UDP רק לגלישה באינטרנט',
      'אין הבדל מעשי בין השניים כיום',
    ],
    correctAnswer: 'TCP מבטיח מסירה אמינה וסדורה של נתונים עם handshake ובקרת שגיאות, בעוד UDP שולח חבילות ללא ערבות למסירה או לסדר, במחיר latency נמוך יותר',
  },
  {
    id: 'q72', topic: 'Networking',
    question: 'מה משמעות קוד התגובה HTTP 429?',
    options: [
      'יותר מדי בקשות (Too Many Requests) - הלקוח חרג ממגבלת הקצב (rate limit) שהוגדרה על ידי השרת',
      'השרת נתקל בשגיאה פנימית בלתי צפויה',
      'הדף המבוקש לא נמצא בשרת',
      'הבקשה הצליחה במלואה',
    ],
    correctAnswer: 'יותר מדי בקשות (Too Many Requests) - הלקוח חרג ממגבלת הקצב (rate limit) שהוגדרה על ידי השרת',
  },
  {
    id: 'q73', topic: 'Networking',
    question: 'מהו תפקידו של DNS?',
    options: [
      'לתרגם שמות domain קריאים לבני אדם לכתובות IP שהמחשבים משתמשים בהן לתקשורת ברשת',
      'להצפין תעבורה בין דפדפן לשרת',
      'לדחוס קבצים לפני שליחתם ברשת',
      'לנהל הרשאות משתמשים באתר',
    ],
    correctAnswer: 'לתרגם שמות domain קריאים לבני אדם לכתובות IP שהמחשבים משתמשים בהן לתקשורת ברשת',
  },
  {
    id: 'q74', topic: 'Networking',
    question: 'מהי המטרה של TLS/SSL בתקשורת רשת?',
    options: [
      'להצפין את התקשורת בין לקוח לשרת ולוודא את זהות הצד השני, כדי למנוע האזנה או זיוף',
      'להאיץ את מהירות התעבורה על ידי דחיסת נתונים',
      'לתרגם כתובות IP לשמות domain',
      'לנהל את מאזן העומסים בין שרתים',
    ],
    correctAnswer: 'להצפין את התקשורת בין לקוח לשרת ולוודא את זהות הצד השני, כדי למנוע האזנה או זיוף',
  },
  {
    id: 'q75', topic: 'Networking',
    question: 'מהו WebSocket, ובמה הוא שונה מ-HTTP רגיל?',
    options: [
      'פרוטוקול שמאפשר ערוץ תקשורת דו-כיווני מתמשך בין לקוח לשרת, בניגוד ל-HTTP שהוא לרוב מבוסס בקשה-תגובה בודדת',
      'גרסה מוצפנת יותר של HTTP בלבד',
      'פרוטוקול שמחליף לחלוטין את TCP',
      'שיטה לשלוח קבצים גדולים בלבד ברשת',
    ],
    correctAnswer: 'פרוטוקול שמאפשר ערוץ תקשורת דו-כיווני מתמשך בין לקוח לשרת, בניגוד ל-HTTP שהוא לרוב מבוסס בקשה-תגובה בודדת',
  },
  {
    id: 'q76', topic: 'Security',
    question: 'מהי התקפת SQL Injection?',
    options: [
      'הזרקת קוד SQL זדוני דרך קלט משתמש שלא עבר סניטציה, כדי לגרום למסד הנתונים להריץ פקודות לא מכוונות',
      'התקפה שמנתקת את החיבור לאינטרנט של השרת',
      'ניסיון לנחש סיסמה על ידי ניסוי כל הצירופים האפשריים',
      'שיבוש תעבורת רשת על ידי הצפת בקשות',
    ],
    correctAnswer: 'הזרקת קוד SQL זדוני דרך קלט משתמש שלא עבר סניטציה, כדי לגרום למסד הנתונים להריץ פקודות לא מכוונות',
  },
  {
    id: 'q77', topic: 'Security',
    question: 'מהי המטרה של Hashing סיסמאות לפני אחסון במסד נתונים?',
    options: [
      'לאחסן ערך חד-כיווני שאי אפשר לשחזר ממנו את הסיסמה המקורית בקלות, כך שגם אם מסד הנתונים דלף הסיסמאות לא נחשפות ישירות',
      'לחסוך מקום אחסון על ידי קיצור הסיסמה',
      'לאפשר למשתמש לשחזר את הסיסמה המקורית בקלות במקרה הצורך',
      'להאיץ את תהליך ההתחברות למערכת',
    ],
    correctAnswer: 'לאחסן ערך חד-כיווני שאי אפשר לשחזר ממנו את הסיסמה המקורית בקלות, כך שגם אם מסד הנתונים דלף הסיסמאות לא נחשפות ישירות',
  },
  {
    id: 'q78', topic: 'Security',
    question: 'מהי המטרה של CORS (Cross-Origin Resource Sharing)?',
    options: [
      'לאפשר לשרת לקבוע במפורש אילו domains אחרים מורשים לבצע בקשות דפדפן אליו, כהגנה מפני שימוש זדוני חוצה-מקורות',
      'להצפין את כל הבקשות שמגיעות מדומיין חיצוני',
      'לחסום לחלוטין כל בקשה שמגיעה מדומיין אחר',
      'לאפשר לאתר אחד לגשת לקבצי המערכת של אתר אחר',
    ],
    correctAnswer: 'לאפשר לשרת לקבוע במפורש אילו domains אחרים מורשים לבצע בקשות דפדפן אליו, כהגנה מפני שימוש זדוני חוצה-מקורות',
  },
  {
    id: 'q79', topic: 'Security',
    question: 'מהי התקפת XSS (Cross-Site Scripting)?',
    options: [
      'הזרקת קוד JavaScript זדוני לדף אינטרנט שמוצג למשתמשים אחרים, בדרך כלל דרך קלט שלא עבר סניטציה',
      'ניסיון לפרוץ לשרת דרך יציאת (port) לא מאובטחת',
      'התקפה שמצפינה קבצים ודורשת כופר לשחרורם',
      'שיבוש ה-DNS כדי להפנות משתמשים לאתר מזויף',
    ],
    correctAnswer: 'הזרקת קוד JavaScript זדוני לדף אינטרנט שמוצג למשתמשים אחרים, בדרך כלל דרך קלט שלא עבר סניטציה',
  },
  {
    id: 'q80', topic: 'Security',
    question: "מהו העיקרון של 'Least Privilege' באבטחת מידע?",
    options: [
      'לתת לכל משתמש/רכיב רק את ההרשאות המינימליות הנדרשות לו לביצוע תפקידו, ולא יותר מכך',
      'לתת לכל המשתמשים הרשאות מנהל (admin) כברירת מחדל',
      'להעניק הרשאות זמניות שפגות תוך שנייה אחת',
      'לאפשר גישה חופשית לכל המידע לכל עובד בארגון',
    ],
    correctAnswer: "לתת לכל משתמש/רכיב רק את ההרשאות המינימליות הנדרשות לו לביצוע תפקידו, ולא יותר מכך",
  },
];

const ARCHITECTURE_PAIRS = [
  { id: 'a1', bottleneck: 'עומס קריאה חוזרת על מסד הנתונים הראשי', component: 'Redis Cache' },
  { id: 'a2', bottleneck: 'זרימת אירועים בזמן אמת בנפח עצום עם דרישת Latency נמוכה', component: 'Kafka' },
  { id: 'a3', bottleneck: 'כיוונון מודל ענק על GPU יחיד עם זיכרון מוגבל', component: 'LoRA' },
  { id: 'a4', bottleneck: 'חיפוש סמנטי מהיר על מיליוני embeddings', component: 'Vector DB' },
  { id: 'a5', bottleneck: 'תעבורה גולשת בלתי צפויה שדורשת קנה מידה אוטומטי', component: 'Kubernetes HPA' },
  { id: 'a6', bottleneck: 'כשל מדורג משירות downstream שנופל', component: 'Circuit Breaker' },
  { id: 'a7', bottleneck: 'זמן טעינה גבוה למשתמשים גלובליים בגלל נכסים סטטיים', component: 'CDN' },
  { id: 'a8', bottleneck: 'נקודת כשל יחידה בשרת החזית', component: 'Load Balancer' },
  { id: 'a9', bottleneck: 'חיפוש טקסט חופשי מהיר במיליוני מסמכים', component: 'Elasticsearch' },
  { id: 'a10', bottleneck: 'צורך בתור הודעות אמין בין שירותים א-סינכרוניים', component: 'RabbitMQ' },
  { id: 'a11', bottleneck: "over-fetching של נתונים מ-REST API נוקשה", component: 'GraphQL' },
  { id: 'a12', bottleneck: 'עומס קריאה גבוה שפוגע בביצועי כתיבה במסד הנתונים', component: 'Read Replica' },
  { id: 'a13', bottleneck: 'נפח נתונים שחורג מיכולת האחסון של מכונה בודדת', component: 'Database Sharding' },
  { id: 'a14', bottleneck: 'ניהול מבוזר של אימות והרשאות בין עשרות מיקרו-שירותים', component: 'API Gateway' },
  { id: 'a15', bottleneck: 'צורך בעדכונים בזמן אמת ללקוח בלי polling מתמיד', component: 'WebSockets' },
  { id: 'a16', bottleneck: 'שכפול קבצים זהים שתופס מקום אחסון מיותר', component: 'Content-Addressable Storage' },
  { id: 'a17', bottleneck: 'בדיקה מהירה אם ערך בטוח לא קיים במאגר ענק', component: 'Bloom Filter' },
  { id: 'a18', bottleneck: 'הוספת או הסרת שרתים מערבבת לגמרי מפתחות במטמון מבוזר', component: 'Consistent Hashing' },
  { id: 'a19', bottleneck: 'הצפה של בקשות מלקוח בודד שפוגעת בכל שאר המשתמשים', component: 'Rate Limiter' },
  { id: 'a20', bottleneck: 'כפילות בעיבוד תשלום עקב ניסיון חוזר (retry) של הלקוח', component: 'Idempotency Key' },
  { id: 'a21', bottleneck: 'טרנזקציה מבוזרת שחוצה מספר מיקרו-שירותים שונים', component: 'Saga Pattern' },
  { id: 'a22', bottleneck: 'צורך בשחזור מדויק של היסטוריית שינויים במערכת', component: 'Event Sourcing' },
  { id: 'a23', bottleneck: 'עומס שונה מאוד בין קריאה לכתיבה באותה מערכת', component: 'CQRS' },
  { id: 'a24', bottleneck: 'צורך להימנע מהשבתה בזמן פריסת גרסה חדשה', component: 'Blue-Green Deployment' },
  { id: 'a25', bottleneck: 'סיכון בפריסת גרסה חדשה לכל המשתמשים בבת אחת', component: 'Canary Release' },
  { id: 'a26', bottleneck: 'צורך להפעיל או לכבות פיצ׳ר בלי לפרוס קוד מחדש', component: 'Feature Flag' },
  { id: 'a27', bottleneck: 'ניהול תעבורה ואבטחה עקבי בין עשרות מיקרו-שירותים', component: 'Service Mesh' },
  { id: 'a28', bottleneck: 'מספר instances מנסים לעדכן משאב משותף בו-זמנית', component: 'Distributed Lock' },
  { id: 'a29', bottleneck: 'סכנת איבוד נתונים במקרה של קריסת שרת מסד הנתונים', component: 'Write-Ahead Log' },
  { id: 'a30', bottleneck: 'מודל גדול מדי להרצה במכשיר קצה עם משאבים מוגבלים', component: 'Quantization' },
  { id: 'a31', bottleneck: 'צורך במודל קטן ומהיר שמחקה מודל ענק ואיטי', component: 'Knowledge Distillation' },
  { id: 'a32', bottleneck: 'איכות פלט נמוכה מדי כשמפענחים טקסט greedy צעד-צעד', component: 'Beam Search' },
  { id: 'a33', bottleneck: 'חיפוש דמיון איטי מדי במרחב embeddings ענק', component: 'Approximate Nearest Neighbor (ANN)' },
  { id: 'a34', bottleneck: 'צורך במודל שפה שיבצע פעולות אמיתיות בעולם החיצוני', component: 'Function Calling' },
  { id: 'a35', bottleneck: 'פלט לא בטוח או לא תקני ממודל שפה גנרטיבי', component: 'Guardrails / Output Validation' },
  { id: 'a36', bottleneck: 'עלות וזמן תגובה גבוהים בגלל פרומפטים חוזרים וארוכים', component: 'Prompt Caching' },
  { id: 'a37', bottleneck: 'מודל שמייצר עובדות שגויות על ידע עדכני שהוא לא מכיר', component: 'Retrieval-Augmented Generation' },
  { id: 'a38', bottleneck: 'צורך ללכוד סוגי קשרים שונים בין טוקנים בו-זמנית', component: 'Multi-Head Attention' },
  { id: 'a39', bottleneck: 'ניצול לא יעיל של GPU כשמגיעות בקשות הסקה בודדות', component: 'Batching' },
  { id: 'a40', bottleneck: 'עומס צפוי מראש בשעות קבועות שדורש הכנה ולא רק תגובה', component: 'Predictive Autoscaling (Scheduled Scaling)' },
  { id: 'a41', bottleneck: 'יצירת חיבור חדש למסד הנתונים בכל בקשה שמאטה את המערכת', component: 'Database Connection Pool' },
  { id: 'a42', bottleneck: 'שאילתת אגרגציה כבדה שרצה שוב ושוב על אותם נתונים', component: 'Materialized View' },
  { id: 'a43', bottleneck: 'JOIN יקר מדי בין טבלאות גדולות בזמן אמת', component: 'Denormalization' },
  { id: 'a44', bottleneck: 'התנגשויות נדירות בעדכון בו-זמנית של אותה רשומה', component: 'Optimistic Locking' },
  { id: 'a45', bottleneck: 'צורך להבטיח בלעדיות מוחלטת על משאב קריטי בזמן עדכון', component: 'Pessimistic Locking' },
  { id: 'a46', bottleneck: 'הודעות שנכשלות שוב ושוב ותוקעות את התור כולו', component: 'Dead Letter Queue' },
  { id: 'a47', bottleneck: 'צרכן איטי יותר מהיצרן שגורם לעומס יתר בתור ההודעות', component: 'Backpressure' },
  { id: 'a48', bottleneck: 'צורך לשמור מצב session על אותו שרת ספציפי', component: 'Sticky Sessions' },
  { id: 'a49', bottleneck: 'שרת שקרס אך עדיין מקבל תעבורה מה-Load Balancer', component: 'Health Check Endpoint' },
  { id: 'a50', bottleneck: 'חוסר ודאות כיצד המערכת מתנהגת בזמן כשל אמיתי', component: 'Chaos Engineering' },
  { id: 'a51', bottleneck: 'קושי לאתר את מקור התקלה בשרשרת מיקרו-שירותים ארוכה', component: 'Observability / Distributed Tracing' },
  { id: 'a52', bottleneck: 'לוגים מפוזרים על עשרות שרתים שקשה לחפש בהם', component: 'Log Aggregation' },
  { id: 'a53', bottleneck: 'חוסר עקביות בין features בזמן אימון ובזמן הסקה', component: 'Feature Store' },
  { id: 'a54', bottleneck: 'צורך למדוד השפעת שינוי על התנהגות משתמשים אמיתית', component: 'A/B Testing Framework' },
  { id: 'a55', bottleneck: 'איחסון נתונים גולמיים בכמויות עצומות ומגוון פורמטים', component: 'Data Lake' },
  { id: 'a56', bottleneck: 'נתונים גולמיים ממקורות שונים שדורשים ניקוי ואיחוד', component: 'ETL Pipeline' },
  { id: 'a57', bottleneck: 'איחסון יעיל של מיליארדי embeddings בזיכרון מוגבל', component: 'Vector Quantization for Embeddings' },
  { id: 'a58', bottleneck: 'צורך לעקוב אילו גרסאות מודל בשימוש בפרודקשן', component: 'Model Versioning Registry' },
  { id: 'a59', bottleneck: 'צורך לבדוק מודל חדש על תעבורה אמיתית בלי להשפיע על משתמשים', component: 'Shadow Deployment' },
  { id: 'a60', bottleneck: 'הסקה איטית מדי במודלי שפה גדולים', component: 'Speculative Decoding' },
  { id: 'a61', bottleneck: 'צורך בקיבולת מודל גדולה בלי לשלם מלוא עלות החישוב על כל טוקן', component: 'Mixture of Experts (MoE)' },
  { id: 'a62', bottleneck: 'רצפים ארוכים מדי בגלל פיצול לא יעיל של טקסט לטוקנים', component: 'Tokenizer Optimization' },
  { id: 'a63', bottleneck: 'חוסר בזיכרון GPU בזמן אימון רשת עמוקה', component: 'Gradient Checkpointing' },
  { id: 'a64', bottleneck: 'אימון איטי מדי עקב שימוש בדיוק מספרי מיותר', component: 'Mixed Precision Training' },
  { id: 'a65', bottleneck: 'אימון מודל על מערך נתונים עצום שלא נכנס למכונה אחת', component: 'Data Parallelism' },
  { id: 'a66', bottleneck: 'מודל שגדול מדי להיכנס לזיכרון GPU יחיד', component: 'Model Parallelism' },
  { id: 'a67', bottleneck: 'כפילות מיותרת של מצב האופטימייזר בין GPUs מרובים', component: 'Zero Redundancy Optimizer (ZeRO)' },
  { id: 'a68', bottleneck: 'צורך להתאים אוטומטית את מספר מכונות ה-VM לעומס משתנה', component: 'Autoscaling Group' },
  { id: 'a69', bottleneck: 'צורך לשרת משתמשים גלובליים עם Latency נמוך', component: 'Multi-Region Deployment' },
  { id: 'a70', bottleneck: 'צורך במעבר אוטומטי לאתר גיבוי במקרה של תקלה אזורית', component: 'DNS Failover' },
  { id: 'a71', bottleneck: 'איחסון כמויות עצומות של קבצים לא מובנים בעלות נמוכה', component: 'Object Storage (S3-like)' },
  { id: 'a72', bottleneck: 'עלות גבוהה לאחסון נתונים ישנים שכמעט ולא נגישים', component: 'Cold Storage Tiering' },
  { id: 'a73', bottleneck: 'צורך בשחזור מהיר של מסד נתונים לנקודת זמן מסוימת', component: 'Snapshot Backup' },
  { id: 'a74', bottleneck: 'סיכון גניבת זהות מסיסמה חשופה בלבד', component: 'Multi-Factor Authentication' },
  { id: 'a75', bottleneck: 'צורך לתת גישה מוגבלת בזמן לצד שלישי בלי לחשוף סיסמה', component: 'OAuth2 / Token-Based Auth' },
  { id: 'a76', bottleneck: 'הגנה מפני התקפות נפוצות כמו SQL Injection ו-XSS', component: 'Web Application Firewall (WAF)' },
  { id: 'a77', bottleneck: 'מפתחות API ואישורים רגישים המפוזרים בקוד המקור', component: 'Secrets Manager' },
  { id: 'a78', bottleneck: 'צורך לוודא זהות הדדית בין שני שירותים פנימיים', component: 'mTLS (Mutual TLS)' },
  { id: 'a79', bottleneck: 'סחף קונפיגורציה (config drift) בין שרתים שהוגדרו ידנית', component: 'Immutable Infrastructure' },
  { id: 'a80', bottleneck: 'צורך בשחזור סביבה זהה ואמינה שוב ושוב מאפס', component: 'Infrastructure as Code' },
];

const BEHAVIORAL_QUESTIONS = [
  {
    id: 'b1',
    prompt: 'המראיין/ת מביט/ה בך ישר בעיניים: "ספר לי, מה החולשה הגדולה ביותר שלך?"',
    options: [
      { key: 'A', text: '"אני פרפקציוניסט/ית מדי, פשוט אכפת לי יותר מדי מאיכות."' },
      { key: 'B', text: '"לפעמים אני נותן/ת לרגשות להוביל כשאני נתקל/ת בלחץ לא מבוסס על עובדות."' },
      { key: 'C', text: '"אני מתמקד/ת לעומק בהנדסת המערכת, ולעיתים דורש/ת יישור קו ברור לפני שאני מתחיל/ה לבצע."' },
    ],
  },
  {
    id: 'b2',
    prompt: 'המראיין/ת נשען/ת אחורה: "ספר/י לי על הכישלון הכי גדול שלך בקריירה, ואיך התמודדת."',
    options: [
      { key: 'A', text: '"מעולם לא באמת נכשלתי בגדול, תמיד הצלחתי למצוא פתרון בזמן."' },
      { key: 'B', text: '"פעם דחפתי פיצ\'ר לפרודקשן בלי מספיק טסטים כי הרגשתי לחץ להוכיח את עצמי, וזה קרס. למדתי לעצור ולבקש עזרה כשמשהו לא מרגיש בטוח."' },
      { key: 'C', text: '"זיהיתי כשל בארכיטקטורה לפני שהגיע לפרודקשן, תיעדתי אותו ובניתי תהליך בדיקה שמנע הישנות."' },
    ],
  },
  {
    id: 'b3',
    prompt: 'המראיין/ת: "למה אתה/את רוצה לעזוב את מקום העבודה הנוכחי?"',
    options: [
      { key: 'A', text: '"פשוט מחפש/ת אתגר חדש."' },
      { key: 'B', text: '"הרגשתי שהמנהל שלי לא סמך עליי מספיק כדי לתת לי אחריות אמיתית, וזה שחק אותי לאורך זמן."' },
      { key: 'C', text: '"אני מחפש/ת סביבה שבה אוכל להוביל פרויקטים גדולים יותר ולהתפתח בכיוון ארכיטקטוני."' },
    ],
  },
  {
    id: 'b4',
    prompt: 'המראיין/ת: "איפה אתה/את רואה את עצמך בעוד חמש שנים?"',
    options: [
      { key: 'A', text: '"בתפקידך."' },
      { key: 'B', text: '"האמת שאני לא תמיד יודע/ת בוודאות, ולפעמים זה מלחיץ אותי לא לדעת בדיוק לאן אני הולך/ת."' },
      { key: 'C', text: '"בתפקיד טכני בכיר יותר, עם אחריות רחבה יותר על החלטות ארכיטקטורה."' },
    ],
  },
  {
    id: 'b5',
    prompt: 'המראיין/ת: "ספר/י לי על קונפליקט עם עמית לעבודה."',
    options: [
      { key: 'A', text: '"אף פעם לא היה לי קונפליקט עם אף אחד."' },
      { key: 'B', text: '"פעם התעצבנתי מאוד על עמית וזה יצא לי בטון לא הוגן בפגישה, ואחר כך התנצלתי."' },
      { key: 'C', text: '"חלקנו דעה מקצועית שונה, אז קבענו פגישה ממוקדת והגענו לפתרון מוסכם מבוסס נתונים."' },
    ],
  },
  {
    id: 'b6',
    prompt: 'המראיין/ת: "למה שנעסיק אותך ולא מועמד אחר?"',
    options: [
      { key: 'A', text: '"כי אני הכי טוב/ה בתחום."' },
      { key: 'B', text: '"האמת שאני לא בטוח/ה שאני הכי טוב/ה, אבל אני עובד/ת קשה ולומד/ת מהר."' },
      { key: 'C', text: '"בגלל השילוב הספציפי של ניסיון טכני וסקרנות שמתאים בול לאתגרים שתיארתם."' },
    ],
  },
  {
    id: 'b7',
    prompt: 'המראיין/ת: "מה מרגיז אותך אצל מנהלים?"',
    options: [
      { key: 'A', text: '"כלום, אני תמיד מסתדר/ת עם כולם."' },
      { key: 'B', text: '"לפעמים אני נעשה/ית תוקפני/ת כשמנהל לא מסביר את ה-\'למה\' מאחורי החלטה."' },
      { key: 'C', text: '"חוסר שקיפות לגבי סדרי עדיפויות, כי זה מקשה עליי לתעדף נכון את העבודה שלי."' },
    ],
  },
  {
    id: 'b8',
    prompt: 'המראיין/ת: "תאר/י מצב בו נכשלת בעמידה בלוח זמנים."',
    options: [
      { key: 'A', text: '"זה אף פעם לא קורה לי, אני תמיד עומד/ת בלוחות זמנים."' },
      { key: 'B', text: '"פעם הערכתי משימה בחסר כי רציתי להרשים, ובסוף נאלצתי להתנצל ולבקש הארכה ברגע האחרון."' },
      { key: 'C', text: '"זיהיתי מוקדם שהלו"ז בסיכון, עדכנתי את הצוות מיד והצענו יחד תוכנית חלופית."' },
    ],
  },
  {
    id: 'b9',
    prompt: 'המראיין/ת: "איך אתה/את מתמודד/ת עם ביקורת?"',
    options: [
      { key: 'A', text: '"אני אף פעם לא נעלב/ת מביקורת, זה פשוט לא משפיע עליי."' },
      { key: 'B', text: '"בהתחלה אני נוטה להתגונן פנימית, ולוקח לי כמה דקות לעכל את זה לפני שאני מגיב/ה בונה."' },
      { key: 'C', text: '"אני מקשיב/ה, שואל/ת שאלות הבהרה, ומנסה למצוא את הפעולה הקונקרטית שנובעת מהביקורת."' },
    ],
  },
  {
    id: 'b10',
    prompt: 'המראיין/ת: "ספר/י לי על פעם שלא הסכמת עם ההנהלה."',
    options: [
      { key: 'A', text: '"אני תמיד מסכים/ה עם ההנהלה, זה התפקיד שלי."' },
      { key: 'B', text: '"התנגדתי בחריפות להחלטה מול כולם בפגישה, וזה לא התקבל טוב - למדתי לעשות את זה בפרטיות."' },
      { key: 'C', text: '"העליתי את החששות שלי בפגישת אחד-על-אחד עם נתונים תומכים, וההחלטה הסופית עודכנה בהתאם."' },
    ],
  },
  {
    id: 'b11',
    prompt: 'המראיין/ת: "מה הציפיות שלך משכר ותנאים?"',
    options: [
      { key: 'A', text: '"כמה שיותר, אני שווה את זה."' },
      { key: 'B', text: '"האמת שקצת קשה לי לדבר על מספרים, אני לא אוהב/ת משא ומתן."' },
      { key: 'C', text: '"טווח מבוסס שוק בהתאם לניסיון שלי, עם דגש על גמישות ותנאים נלווים."' },
    ],
  },
  {
    id: 'b12',
    prompt: 'המראיין/ת: "איך אתה/את מתמודד/ת עם עומס עבודה גבוה?"',
    options: [
      { key: 'A', text: '"אני פשוט עובד/ת יותר שעות, זה לא בעיה בשבילי."' },
      { key: 'B', text: '"לפעמים אני נלחץ/ת ומתקשה לתעדף, וזה גורם לי לעבוד על הכל בבת אחת בלי סדר."' },
      { key: 'C', text: '"אני מתעדף/ת לפי דחיפות והשפעה, ומתקשר/ת מוקדם אם משהו לא ריאלי בלו"ז."' },
    ],
  },
  {
    id: 'b13',
    prompt: 'המראיין/ת: "ספר/י לי על טעות מקצועית שעשית."',
    options: [
      { key: 'A', text: '"אני לא ממש עושה טעויות, אני מדויק/ת מאוד."' },
      { key: 'B', text: '"מחקתי בטעות נתונים בפרודקשן כי לא הייתי מרוכז/ת, וזה גרם לבהלה גדולה בצוות."' },
      { key: 'C', text: '"פרסתי שינוי בלי בדיקת רגרסיה מלאה, זיהיתי את זה מהר והוספתי תהליך בדיקה שמנע הישנות."' },
    ],
  },
  {
    id: 'b14',
    prompt: 'המראיין/ת: "למה יש פער בקורות החיים שלך?"',
    options: [
      { key: 'A', text: '"זה לא ממש עניינכם."' },
      { key: 'B', text: '"עברתי תקופה קשה מבחינה אישית ולקחתי הפסקה כדי להתאושש."' },
      { key: 'C', text: '"ניצלתי את הזמן ללמידה ממוקדת של טכנולוגיות חדשות ולפרויקטים אישיים."' },
    ],
  },
  {
    id: 'b15',
    prompt: 'המראיין/ת: "איך אתה/את מקבל/ת החלטות תחת אי-ודאות?"',
    options: [
      { key: 'A', text: '"תמיד יש לי תשובה ברורה, אני לא מתלבט/ת."' },
      { key: 'B', text: '"אני נוטה להיתקע ולחשוב יותר מדי לפני שאני מחליט/ה, וזה לפעמים מעכב אותי."' },
      { key: 'C', text: '"אני אוסף/ת כמה שיותר מידע זמין, קובע/ת נקודת זמן להחלטה, ובוחר/ת את האופציה הכי פחות הפיכה."' },
    ],
  },
  {
    id: 'b16',
    prompt: 'המראיין/ת: "מה היית עושה אם עמית לצוות לא מושך את משקלו?"',
    options: [
      { key: 'A', text: '"הייתי פשוט מתעלם/ת מזה, זה לא העניין שלי."' },
      { key: 'B', text: '"פעם זה כל כך הרגיז אותי שהתפרצתי עליו/ה מול כולם."' },
      { key: 'C', text: '"הייתי מדבר/ת איתו/ה בפרטיות כדי להבין את הסיבה, ומעלה את זה למנהל אם זה נמשך."' },
    ],
  },
  {
    id: 'b17',
    prompt: 'המראיין/ת: "מהי החוזקה הגדולה ביותר שלך?"',
    options: [
      { key: 'A', text: '"אני מושלם/ת בכל מה שאני עושה."' },
      { key: 'B', text: '"קשה לי לזהות חוזקות שלי, אני תמיד מתמקד/ת יותר במה שצריך לשפר."' },
      { key: 'C', text: '"יכולת לפרק בעיות מורכבות לצעדים ברורים ולתקשר אותם לצוות בצורה פשוטה."' },
    ],
  },
  {
    id: 'b18',
    prompt: 'המראיין/ת: "איך תגיב/י אם תגלה/י שהמוצר שאתה בונה בעייתי אתית?"',
    options: [
      { key: 'A', text: '"לא באמת מעניין אותי, זה לא התפקיד שלי לשפוט."' },
      { key: 'B', text: '"כנראה שהייתי מתלבט/ת המון ומתקשה להחליט אם לדבר על זה בגלוי."' },
      { key: 'C', text: '"הייתי מעלה את זה בפורום המתאים בארגון, ואם לא היה פתרון - שוקל/ת ברצינות לעזוב."' },
    ],
  },
  {
    id: 'b19',
    prompt: 'המראיין/ת: "מהו סגנון הניהול העצמי שלך?"',
    options: [
      { key: 'A', text: '"אני לא צריך/ה ניהול בכלל, אני עובד/ת הכי טוב לבד."' },
      { key: 'B', text: '"אני נוטה לדחות משימות פחות מעניינות עד הרגע האחרון."' },
      { key: 'C', text: '"אני קובע/ת סדר עדיפויות שבועי ובודק/ת התקדמות מול עצמי כל יום."' },
    ],
  },
  {
    id: 'b20',
    prompt: 'המראיין/ת: "למה לקח לך הרבה זמן למצוא עבודה חדשה?"',
    options: [
      { key: 'A', text: '"לא ממש חיפשתי ברצינות עד עכשיו."' },
      { key: 'B', text: '"האמת שקיבלתי הרבה דחיות וזה ממש פגע בביטחון העצמי שלי."' },
      { key: 'C', text: '"הייתי סלקטיבי/ת מאוד כי חיפשתי התאמה מדויקת מבחינת תפקיד ותרבות ארגונית."' },
    ],
  },
];

const FLAVOR_EVENTS = [
  { title: 'לילה טוב של שינה', body: 'הצלחת להתנתק לרגע מהמסכים. הגוף מודה לך.', stressDelta: -5 },
  { title: 'עדכון לינקדאין מציק', body: 'מישהו מהאוניברסיטה "שמח לשתף" שהתקבל לחברת חלומות.', stressDelta: 4 },
  { title: 'באג ישן צף מחדש', body: 'קוד legacy שכתבת לפני שנתיים החליט להתעורר בדיוק עכשיו.', stressDelta: 3 },
  { title: 'שיחת עידוד מחבר', body: 'חבר טוב התקשר רק כדי לשאול מה שלומך. זה עזר יותר משיערת.', stressDelta: -4 },
  { title: 'תור ארוך בבנק', body: 'בזבזת שעה בתור לבנק במקום להתכונן לראיון הבא.', stressDelta: 2 },
];

// Fires after a stretch of silence with no invites/progress/offers — a little wave of self-doubt.
const SELF_DOUBT_MESSAGES = [
  { title: 'מחשבה בשלוש לפנות בוקר', body: 'אף אחד לא עונה כבר כמה ימים. אולי אני פשוט לא מספיק טוב/ה בשביל השוק הזה?', stressDelta: 6 },
  { title: 'עוד יום שקט', body: 'בדקתי את התיבה בפעם העשירית היום. שום דבר. אולי הבעיה אצלי?', stressDelta: 5 },
  { title: 'עריכה מחדש של קורות החיים', body: 'שכתבתי את הפתיח בפעם השלישית השבוע. זה עוזר, או שאני רק מנסה להרגיש שליטה?', stressDelta: 4 },
  { title: 'שתיקה מהעבר השני', body: 'לא קיבלת שום עדכון כבר תקופה. השוק קשה, או שזה משהו אצלי?', stressDelta: 6 },
];

// ============================================================================
// HELPERS
// ============================================================================

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const formatILS = (n) => `${n.toLocaleString('he-IL')} ₪`;

const LEADERBOARD_NAME_KEY = 'contractHunter.leaderboardName';
function getSavedLeaderboardName() {
  try {
    return localStorage.getItem(LEADERBOARD_NAME_KEY) || '';
  } catch {
    return '';
  }
}
function saveLeaderboardName(name) {
  try {
    localStorage.setItem(LEADERBOARD_NAME_KEY, name);
  } catch {
    // localStorage unavailable (private mode, etc.) — not critical, just skip persisting.
  }
}

function pickTwoQuestions() {
  return shuffle(QUESTION_BANK).slice(0, 2).map((q) => ({ ...q, options: shuffle(q.options) }));
}
function pickPuzzlePairs(count) {
  return shuffle(ARCHITECTURE_PAIRS).slice(0, count);
}

function generateOffer(company, ego) {
  const egoFactor = 0.3 + (clamp(ego, 0, 100) / 100) * 0.7;
  const salary = Math.round((company.salaryMin + (company.salaryMax - company.salaryMin) * egoFactor) / 500) * 500;
  const signBonus = company.culture === 'fintech' ? Math.round(salary * 0.5)
    : company.culture === 'corporate' ? Math.round(salary * 0.25) : 0;
  const durationMs = company.culture === 'fintech' ? 22000
    : company.culture === 'startup' ? 55000
    : company.culture === 'corporate' ? 85000 : 130000;
  return {
    role: company.roleTitle,
    salary,
    signBonus,
    perks: { wfhDays: company.wfhDays, optionGrants: company.optionGrants, flexHours: company.flexHours },
    createdAt: Date.now(),
    expiresAt: Date.now() + durationMs,
    duration: durationMs,
    isUltimatum: company.culture === 'fintech',
  };
}

function stressForOutcome(company, passed) {
  const base = company.stressPerStage;
  const variance = company.culture === 'startup' ? Math.floor(Math.random() * 7) - 3 : 0;
  const delta = passed ? Math.round(base * 0.4) + variance : base + variance;
  return Math.max(2, delta);
}

function gradeFor(score) {
  if (score >= 85) return { letter: 'S', color: 'text-yellow-400' };
  if (score >= 70) return { letter: 'A', color: 'text-green-400' };
  if (score >= 55) return { letter: 'B', color: 'text-blue-400' };
  if (score >= 40) return { letter: 'C', color: 'text-orange-400' };
  return { letter: 'D', color: 'text-red-500' };
}

// ============================================================================
// SMALL PRESENTATIONAL PIECES
// ============================================================================

function StatPill({ icon: Icon, label, value, barColor, barPct }) {
  return (
    <div className="flex flex-col gap-1 bg-gray-900/70 border border-gray-800 rounded-xl px-4 py-2 min-w-[130px]">
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-100">{value}</div>
      {barPct !== undefined && (
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${clamp(barPct, 0, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

function StageDots({ stage, failedAt }) {
  const labels = ['סינון טכני', 'ארכיטקטורה', 'התנהגותי'];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => {
        let color = 'bg-gray-700';
        if (failedAt !== undefined && failedAt !== null && i === failedAt) color = 'bg-red-500';
        else if (failedAt === null && i < 3 && stage > i) color = 'bg-green-500';
        else if (i < stage) color = 'bg-green-500';
        else if (i === stage) color = 'bg-blue-500 animate-pulse';
        return <div key={l} title={l} className={`w-2.5 h-2.5 rounded-full ${color}`} />;
      })}
    </div>
  );
}

function ScoreBar({ label, value, icon: Icon }) {
  const grade = gradeFor(value);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Icon size={16} />
          <span>{label}</span>
        </div>
        <span dir="ltr" className={`font-bold ${grade.color}`}>{value}/100</span>
      </div>
      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className="h-full rounded-full bg-gradient-to-l from-blue-500 via-red-500 to-yellow-400 transition-all duration-1000"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// INTERVIEW MODAL
// ============================================================================

function InterviewModal({ company, stage, onComplete }) {
  const [questions] = useState(() => pickTwoQuestions());
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lockedAnswer, setLockedAnswer] = useState(null);

  const [puzzlePairs] = useState(() => pickPuzzlePairs(4));
  const [rightItems] = useState(() => shuffle(puzzlePairs.map((p) => p.component)));
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState(null);

  const [behavioralQ] = useState(() => BEHAVIORAL_QUESTIONS[Math.floor(Math.random() * BEHAVIORAL_QUESTIONS.length)]);

  const accumEgo = useRef(0);
  const accumStress = useRef(0);
  const finished = useRef(false);

  const Icon = CULTURE_ICONS[company.culture];

  function finish(passed, rejectionNote) {
    if (finished.current) return;
    finished.current = true;
    onComplete(company, stage, {
      passed,
      egoDelta: accumEgo.current,
      stressDelta: accumStress.current,
      rejectionNote,
    });
  }

  // Stage 0: technical quiz timer
  useEffect(() => {
    if (stage !== 0 || finished.current) return;
    if (timeLeft <= 0) {
      handleAnswerStage1(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((tl) => tl - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timeLeft, qIdx]);

  function handleAnswerStage1(option) {
    if (lockedAnswer !== null || finished.current) return;
    setLockedAnswer(option);
    const isCorrect = option === questions[qIdx].correctAnswer;
    if (!isCorrect) {
      accumStress.current += stressForOutcome(company, false);
      setTimeout(() => finish(false, 'לא עברת את שלב הסינון הטכני — התשובות לא היו מדויקות מספיק.'), 500);
      return;
    }
    accumEgo.current += 4;
    setTimeout(() => {
      if (qIdx === 0) {
        setQIdx(1);
        setTimeLeft(15);
        setLockedAnswer(null);
      } else {
        finish(true, null);
      }
    }, 500);
  }

  function handleSelectRight(comp) {
    if (selectedLeft == null || finished.current) return;
    const pair = puzzlePairs.find((p) => p.id === selectedLeft);
    if (pair.component === comp) {
      const nextMatched = [...matchedIds, pair.id];
      setMatchedIds(nextMatched);
      accumEgo.current += 3;
      setSelectedLeft(null);
      if (nextMatched.length === puzzlePairs.length) {
        setTimeout(() => finish(true, null), 400);
      }
    } else {
      const nm = mistakes + 1;
      setMistakes(nm);
      accumStress.current += 5;
      setShake(comp);
      setTimeout(() => setShake(null), 400);
      setSelectedLeft(null);
      if (nm >= 3) {
        setTimeout(() => finish(false, 'לא הצלחת למפות נכון את רכיבי הארכיטקטורה לצווארי הבקבוק.'), 400);
      }
    }
  }

  function chooseBehavioral(key) {
    if (finished.current) return;
    if (key === 'A') {
      accumStress.current += 8;
      accumEgo.current -= 5;
      finish(false, 'התשובה נשמעה כמו קלישאה מוכנה מראש — לא השארת רושם אותנטי.');
      return;
    }
    if (key === 'C') {
      accumEgo.current += 5;
      accumStress.current += 2;
      finish(true, null);
      return;
    }
    const cultureFriendly = company.culture === 'saas' || company.culture === 'startup';
    if (cultureFriendly) {
      accumEgo.current += 15;
      accumStress.current += 2;
      finish(true, null);
    } else {
      accumEgo.current -= 8;
      accumStress.current += 10;
      finish(false, 'התשובה הכנה מדי לא התקבלה היטב בתרבות הארגונית הנוקשה של החברה.');
    }
  }

  const currentQuestion = questions[qIdx];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="bg-gray-950 border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={22} className="text-blue-400" />
            <div>
              <div className="font-bold text-gray-100">{company.name}</div>
              <div className="text-xs text-gray-500">{company.roleTitle}</div>
            </div>
          </div>
          <StageDots stage={stage} failedAt={null} />
        </div>

        <div className="p-6">
          {stage === 0 && currentQuestion && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-blue-400 font-semibold">שלב 1: סינון טכני (<span dir="ltr">{qIdx + 1}/2</span>) — {currentQuestion.topic}</span>
                <div className="flex items-center gap-1 text-red-400 font-mono text-sm">
                  <Timer size={14} />
                  <span>{timeLeft}s</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${(timeLeft / 15) * 100}%` }} />
              </div>
              <p className="text-gray-100 mb-4 leading-relaxed">{currentQuestion.question}</p>
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((opt) => {
                  let cls = 'border-gray-700 hover:border-blue-500 hover:bg-gray-800';
                  if (lockedAnswer !== null) {
                    if (opt === currentQuestion.correctAnswer) cls = 'border-green-500 bg-green-950';
                    else if (opt === lockedAnswer) cls = 'border-red-500 bg-red-950';
                    else cls = 'border-gray-800 opacity-50';
                  }
                  return (
                    <button
                      key={opt}
                      disabled={lockedAnswer !== null}
                      onClick={() => handleAnswerStage1(opt)}
                      className={`text-right border rounded-lg px-4 py-2.5 text-sm transition-colors ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {stage === 1 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-blue-400 font-semibold">שלב 2: ארכיטקטורת מערכת</span>
                <span className="text-xs text-gray-500">טעויות: <span dir="ltr">{mistakes}/3</span></span>
              </div>
              <p className="text-gray-400 text-sm mb-4">התאם/י כל צוואר בקבוק לרכיב הארכיטקטורה הנכון עבורו.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  {puzzlePairs.map((p) => {
                    const isMatched = matchedIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        disabled={isMatched}
                        onClick={() => setSelectedLeft(p.id)}
                        className={`text-right text-xs border rounded-lg px-3 py-2 transition-colors ${
                          isMatched ? 'border-green-600 bg-green-950 text-green-400'
                          : selectedLeft === p.id ? 'border-blue-500 bg-blue-950'
                          : 'border-gray-700 hover:border-blue-500'
                        }`}
                      >
                        {p.bottleneck}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2">
                  {rightItems.map((comp) => {
                    const isMatched = puzzlePairs.some((p) => matchedIds.includes(p.id) && p.component === comp);
                    return (
                      <button
                        key={comp}
                        disabled={isMatched}
                        onClick={() => handleSelectRight(comp)}
                        className={`text-xs border rounded-lg px-3 py-2 font-mono transition-all ${
                          isMatched ? 'border-green-600 bg-green-950 text-green-400'
                          : shake === comp ? 'border-red-500 bg-red-950 animate-bounce'
                          : 'border-gray-700 hover:border-blue-500'
                        }`}
                      >
                        {comp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {stage === 2 && (
            <div>
              <span className="text-xs text-blue-400 font-semibold">שלב 3: ראיון בכיר / התנהגותי</span>
              <div className="flex items-start gap-2 mt-3 mb-4 bg-gray-800/50 rounded-lg p-3">
                <MessageSquare size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-gray-200 text-sm leading-relaxed">{behavioralQ.prompt}</p>
              </div>
              <div className="flex flex-col gap-2">
                {behavioralQ.options.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => chooseBehavioral(o.key)}
                    className="text-right border border-gray-700 hover:border-blue-500 hover:bg-gray-800 rounded-lg px-4 py-2.5 text-sm transition-colors"
                  >
                    {o.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INBOX MESSAGE CARD
// ============================================================================

function MessageCard({ message, company, onStartInterview, onAccept, now, interviewLocked, highlighted }) {
  const domId = `msg-${message.id}`;
  const highlightCls = highlighted ? ' ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-950' : '';

  if (message.type === 'invite') {
    const Icon = CULTURE_ICONS[company.culture];
    return (
      <div id={domId} className={`border border-blue-900 bg-blue-950/20 rounded-xl p-4 shrink-0${highlightCls}`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon size={16} className="text-blue-400" />
          <span className="font-bold text-gray-100 text-sm">{message.title}</span>
        </div>
        <p className="text-gray-400 text-xs mb-3 leading-relaxed">{message.body}</p>
        <button
          disabled={interviewLocked}
          onClick={() => onStartInterview(company)}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-2 transition-colors"
        >
          התחל ראיון
        </button>
      </div>
    );
  }

  if (message.type === 'stage_invite') {
    const Icon = CULTURE_ICONS[company.culture];
    return (
      <div id={domId} className={`border border-blue-900 bg-blue-950/20 rounded-xl p-4 shrink-0${highlightCls}`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon size={16} className="text-blue-400" />
          <span className="font-bold text-gray-100 text-sm">{message.title}</span>
        </div>
        <p className="text-gray-400 text-xs mb-3 leading-relaxed">{message.body}</p>
        <button
          disabled={interviewLocked}
          onClick={() => onStartInterview(company, message.stage)}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-2 transition-colors"
        >
          המשך לשלב הבא
        </button>
      </div>
    );
  }

  if (message.type === 'rejection') {
    return (
      <div id={domId} className={`border border-gray-800 bg-gray-900/40 rounded-xl p-4 opacity-80 shrink-0${highlightCls}`}>
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={16} className="text-red-500" />
          <span className="font-bold text-gray-300 text-sm">{message.title}</span>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">{message.body}</p>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div id={domId} className={`border border-gray-800 bg-gray-900/30 rounded-xl p-4 shrink-0${highlightCls}`}>
        <div className="flex items-center gap-2 mb-1">
          <Coffee size={16} className="text-gray-500" />
          <span className="font-bold text-gray-400 text-sm">{message.title}</span>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">{message.body}</p>
      </div>
    );
  }

  if (message.type === 'offer') {
    const offer = message.offer;
    const withdrawn = message.status === 'withdrawn';
    const pct = clamp(((offer.expiresAt - now) / offer.duration) * 100, 0, 100);
    return (
      <div id={domId} className={`border-2 rounded-xl p-4 shrink-0${highlightCls} ${withdrawn ? 'border-gray-800 bg-gray-900/40 opacity-60' : 'border-red-700 bg-red-950/20 shadow-lg shadow-red-950/30'}`}>
        {offer.isUltimatum && !withdrawn && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 mb-2 animate-pulse">
            <Zap size={12} /> אולטימטום 48 שעות!
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={16} className="text-yellow-400" />
          <span className="font-bold text-gray-100 text-sm">{message.title}</span>
        </div>
        <div className="text-xs text-gray-300 space-y-1 mb-3">
          <div className="flex items-center gap-1.5"><Briefcase size={12} className="text-gray-500" /> תפקיד: {offer.role}</div>
          <div className="flex items-center gap-1.5"><DollarSign size={12} className="text-gray-500" /> שכר: {formatILS(offer.salary)} ברוטו לחודש{offer.signBonus > 0 && ` + בונוס חתימה ${formatILS(offer.signBonus)}`}</div>
          <div className="flex items-center gap-1.5"><Home size={12} className="text-gray-500" /> {offer.perks.wfhDays} ימי עבודה מהבית, {offer.perks.optionGrants} רמת אופציות, גמישות שעות: <span dir="ltr">{offer.perks.flexHours}/3</span></div>
        </div>
        {!withdrawn ? (
          <>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full transition-all duration-200 ${pct < 25 ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
            </div>
            <button
              onClick={() => onAccept(message)}
              className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg py-2 transition-colors"
            >
              קבל הצעה (ACCEPT)
            </button>
          </>
        ) : (
          <div className="text-center text-xs text-gray-500 font-semibold py-2">ההצעה פגה ⌛</div>
        )}
      </div>
    );
  }

  return null;
}

function LeaderboardList({ entries, loading }) {
  if (loading) return <p className="text-sm text-gray-500 py-2">טוען...</p>;
  if (!entries) return null;
  if (entries.length === 0) return <p className="text-sm text-gray-500 py-2">עדיין אין ניקוד בלוח התהילה — היה/י הראשון/ה!</p>;
  return (
    <div className="max-h-56 overflow-y-auto flex flex-col gap-1">
      {entries.map((e, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm py-2 border-b border-gray-900">
          <span className="text-gray-600 w-6 shrink-0">{idx + 1}.</span>
          <span className="text-gray-200 flex-1 truncate">{e.name}</span>
          <span className="text-gray-500 flex-1 truncate">{e.company}</span>
          <span dir="ltr" className="text-yellow-400 font-bold text-base shrink-0">{e.score}</span>
        </div>
      ))}
    </div>
  );
}

function AboutModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-xs w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <ShieldAlert size={32} className="mx-auto text-red-500 mb-3" />
        <h3 className="font-bold text-gray-100 mb-1">צייד החוזים</h3>
        <p className="text-sm text-gray-400 mb-3">Created by Yotam Abramson</p>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">זהו משחק בלבד. שמות החברות דמיוניים וקשר בינם למציאות מקרי בהחלט.</p>
        <p className="text-xs text-gray-600" dir="ltr">build {typeof __BUILD_SHA__ !== 'undefined' ? __BUILD_SHA__ : 'dev'}</p>
        <button onClick={onClose} className="mt-4 text-xs text-blue-400 hover:underline">
          סגור
        </button>
      </div>
    </div>
  );
}

function PlayCountLine({ count }) {
  if (!count) return null;
  return (
    <p className="text-center text-[11px] text-gray-600 mt-2">
      <span dir="ltr">{count.toLocaleString('he-IL')}</span> ציידים כבר יצאו לדרך
    </p>
  );
}

// ============================================================================
// END SCREEN
// ============================================================================

function EndScreen({
  result, onRestart, onGoHome,
  leaderboardName, onNameChange, submitStatus, submitRank, submitImproved, submitBestScore, onSubmitScore,
  showLeaderboard, onToggleLeaderboard, leaderboardEntries, leaderboardLoading, playCount,
}) {
  if (result.type === 'burnout') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-gray-900 border border-red-900 rounded-2xl p-8 text-center">
          <Skull size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">קריסה מקצועית — שחיקה מוחלטת</h2>
          <p className="text-gray-400 mb-6">רמת הלחץ הגיעה ל-100%. הגוף והנפש אמרו "לא" ביום {result.finalDay}. הציד נגמר.</p>
          <button onClick={onRestart} className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg px-6 py-3 flex items-center gap-2 mx-auto">
            <RefreshCw size={16} /> נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (result.type === 'timeout') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
          <Hourglass size={48} className="mx-auto text-orange-400 mb-4" />
          <h2 className="text-2xl font-bold text-orange-300 mb-2">פג תוקף הציד</h2>
          <p className="text-gray-400 mb-6">יום 180 הגיע ואף חוזה לא נחתם. השוק לא עוצר לאף אחד.</p>
          <button onClick={onRestart} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-6 py-3 flex items-center gap-2 mx-auto">
            <RefreshCw size={16} /> נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // accepted
  const { company, offer, finalStress, finalDay } = result;
  const jobSatisfaction = clamp(Math.round(company.techInterest * 10), 0, 100);
  const walletPrestige = clamp(Math.round((offer.salary / 72000) * 70 + company.prestige * 6), 0, 100);
  const sanityQoL = clamp(Math.round((100 - finalStress) * 0.5 + company.wfhDays * 8 + company.flexHours * 6), 0, 100);
  const rawOverall = Math.round((jobSatisfaction + walletPrestige + sanityQoL) / 3);
  // Linear time-hunting penalty: a bad job after ~30 days, a good job after ~90 days,
  // and a dream job after the full 180 days all net out to roughly the same weighted score.
  const TIME_PENALTY_PER_DAY = 0.4;
  const timePenalty = Math.round(finalDay * TIME_PENALTY_PER_DAY);
  const overall = clamp(rawOverall - timePenalty, 0, 100);
  const grade = gradeFor(overall);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-gray-900 border border-gray-700 rounded-2xl p-8">
        <div className="text-center mb-6">
          <Trophy size={48} className="mx-auto text-yellow-400 mb-3" />
          <h2 className="text-2xl font-bold text-gray-100 mb-1">חוזה נחתם!</h2>
          <p className="text-gray-400 text-sm">{company.name} · {offer.role}</p>
        </div>

        <div className="bg-gray-950 rounded-xl p-5 mb-6 border border-gray-800">
          <h3 className="text-sm font-bold text-gray-400 mb-4">דו"ח הערכת ביצועים</h3>
          <ScoreBar label="מדד עניין וסיפוק מקצועי" value={jobSatisfaction} icon={Sparkles} />
          <ScoreBar label="מדד שכר ויוקרה" value={walletPrestige} icon={DollarSign} />
          <ScoreBar label="מדד שפיות ואיכות חיים" value={sanityQoL} icon={HeartPulse} />
          <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
            <span>קנס על משך החיפוש (<span dir="ltr">{finalDay}</span> ימים)</span>
            <span className="text-red-400 font-semibold">−{timePenalty}</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-4 border-t border-gray-800">
            <span className="text-gray-300 font-semibold">ציון כולל</span>
            <span className={`text-3xl font-extrabold ${grade.color}`}>{grade.letter} · {overall}</span>
          </div>
        </div>

        <div className="bg-gray-950 rounded-xl p-5 mb-6 border border-gray-800">
          <h3 className="text-base font-bold text-gray-400 mb-3 flex items-center gap-2">
            <Award size={18} className="text-yellow-400" /> לוח התהילה
          </h3>
          {submitStatus === 'submitted' ? (
            submitImproved ? (
              <p className="text-sm text-green-400 mb-1">
                נשלח בהצלחה!{submitRank ? ` דורגת במקום ${submitRank}.` : ''}
              </p>
            ) : (
              <p className="text-sm text-orange-400 mb-1">
                השיא הקודם שלך ({submitBestScore}) גבוה יותר ונשמר.{submitRank ? ` עדיין מדורג/ת במקום ${submitRank}.` : ''}
              </p>
            )
          ) : (
            <div className="flex gap-2 mb-1">
              <input
                value={leaderboardName}
                onChange={(e) => onNameChange(e.target.value)}
                maxLength={20}
                placeholder="השם שלך"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600"
              />
              <button
                disabled={!leaderboardName.trim() || submitStatus === 'submitting'}
                onClick={() => onSubmitScore({
                  company: company.name, role: offer.role, score: overall,
                  jobSatisfaction, walletPrestige, sanityQoL, day: finalDay,
                })}
                className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 transition-colors shrink-0"
              >
                {submitStatus === 'submitting' ? 'שולח...' : 'שלח ציון'}
              </button>
            </div>
          )}
          {submitStatus === 'error' && <p className="text-xs text-red-400 mb-1">השליחה נכשלה - נסה/י שוב מאוחר יותר.</p>}

          <button onClick={onToggleLeaderboard} className="text-xs text-blue-400 hover:underline mt-2">
            {showLeaderboard ? 'הסתר לוח תהילה' : 'הצג לוח תהילה'}
          </button>
          {showLeaderboard && (
            <div className="mt-2 pt-2 border-t border-gray-800">
              <LeaderboardList entries={leaderboardEntries} loading={leaderboardLoading} />
              <PlayCountLine count={playCount} />
            </div>
          )}
        </div>

        <button onClick={onGoHome} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-6 py-3 flex items-center justify-center gap-2">
          <Home size={16} /> עמוד הבית
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContractHunterGame() {
  const [started, setStarted] = useState(false);
  const [day, setDay] = useState(1);
  const [stress, setStress] = useState(10);
  const [ego, setEgo] = useState(0);
  const [inbox, setInbox] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [activeInterview, setActiveInterview] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [highlightId, setHighlightId] = useState(null);

  const [leaderboardName, setLeaderboardName] = useState(getSavedLeaderboardName);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | submitting | submitted | error
  const [submitRank, setSubmitRank] = useState(null);
  const [submitImproved, setSubmitImproved] = useState(true);
  const [submitBestScore, setSubmitBestScore] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [playCount, setPlayCount] = useState(null);

  const contactedRef = useRef(new Set());
  // Queue of delayed inbox arrivals: { id, dueDay, companyId, kind: 'stage_invite' | 'offer', stage, egoAtPass }
  const pendingArrivalsRef = useRef([]);
  // Tracks job-search silence, to trigger the self-doubt flavor message during dry spells.
  const lastArrivalDayRef = useRef(1);
  const lastSelfDoubtDayRef = useRef(0);

  const offersCount = inbox.filter((m) => m.type === 'offer' && m.status === 'active').length;

  function resetGameState() {
    contactedRef.current = new Set();
    pendingArrivalsRef.current = [];
    lastArrivalDayRef.current = 1;
    lastSelfDoubtDayRef.current = 0;
    setDay(1);
    setStress(10);
    setEgo(0);
    setInbox([{ id: uid('msg'), day: 1, type: 'system', title: 'ברוכ/ה הבא/ה לציד', body: 'תיבת הדואר שלך תתמלא בהצעות מגייסים. נהל/י את הזמן, השמור/י על שפיות, וחתמ/י על החוזה הטוב ביותר לפני שיגמר הזמן.' }]);
    setPipeline({});
    setActiveInterview(null);
    setGameOver(null);
    setNow(Date.now());
    setLeaderboardName(getSavedLeaderboardName());
    setSubmitStatus('idle');
    setSubmitRank(null);
    setSubmitImproved(true);
    setSubmitBestScore(null);
  }

  function resetGame() {
    resetGameState();
    setStarted(true);
    trackPlay();
  }

  function trackPlay() {
    fetch('/api/track-play', { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.playCount) setPlayCount(data.playCount); })
      .catch(() => {});
  }

  function goHome() {
    resetGameState();
    setStarted(false);
  }

  async function loadLeaderboard() {
    setLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      setLeaderboardEntries(data.entries ?? []);
      setPlayCount(data.playCount ?? null);
    } catch {
      setLeaderboardEntries([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  // Leaderboard is always visible on the start screen, so fetch it as soon as we land there.
  useEffect(() => {
    if (!started) loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  function toggleLeaderboard() {
    setShowLeaderboard((s) => {
      const next = !s;
      if (next) loadLeaderboard();
      return next;
    });
  }

  async function submitScore(payload) {
    setSubmitStatus('submitting');
    try {
      const res = await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: leaderboardName.trim(), ...payload }),
      });
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      setSubmitRank(data.rank ?? null);
      setSubmitImproved(data.improved !== false);
      setSubmitBestScore(data.bestScore ?? null);
      setSubmitStatus('submitted');
      saveLeaderboardName(leaderboardName.trim());
      setShowLeaderboard(true);
      loadLeaderboard(); // refresh the displayed list so an overridden score shows immediately
    } catch {
      setSubmitStatus('error');
    }
  }

  // Day loop — 1 day every 4 seconds
  useEffect(() => {
    if (!started || gameOver) return;
    const iv = setInterval(() => {
      setDay((d) => Math.min(d + 1, 180));
    }, 4000);
    return () => clearInterval(iv);
  }, [started, gameOver]);

  // Real-time clock for offer countdowns
  useEffect(() => {
    if (!started || gameOver) return;
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, [started, gameOver]);

  // Daily events: spawn invites / flavor
  useEffect(() => {
    if (!started || gameOver || day === 1) return;
    const available = COMPANIES.filter((c) => !contactedRef.current.has(c.id));
    // Dense enough that invites keep showing up throughout the 180-day hunt; if the RNG
    // goes cold, the first contact is force-delivered so the player is never left waiting long.
    const noContactYet = contactedRef.current.size === 0;
    const forceFirstContact = noContactYet && day >= 4;
    if (available.length > 0 && (forceFirstContact || Math.random() < 0.3)) {
      const company = available[Math.floor(Math.random() * available.length)];
      contactedRef.current.add(company.id);
      lastArrivalDayRef.current = day;
      setPipeline((prev) => ({ ...prev, [company.id]: { status: 'invited', stage: 0, arrivedDay: day, updatedAt: Date.now() } }));
      setInbox((prev) => [
        {
          id: uid('msg'), day, type: 'invite', companyId: company.id,
          title: `פנייה מגייס/ת: ${company.name}`,
          body: `שלום! מצאנו את הפרופיל שלך והוא מתאים בול לתפקיד ${company.roleTitle}. ${company.desc}`,
        },
        ...prev,
      ]);
    }
    if (Math.random() < 0.18) {
      const ev = FLAVOR_EVENTS[Math.floor(Math.random() * FLAVOR_EVENTS.length)];
      setStress((s) => clamp(s + ev.stressDelta, 0, 100));
      setInbox((prev) => [{ id: uid('msg'), day, type: 'system', title: ev.title, body: ev.body }, ...prev]);
    }

    // Deliver any delayed stage-invites / offers whose arrival day has come.
    const due = pendingArrivalsRef.current.filter((p) => p.dueDay <= day);
    if (due.length > 0) {
      pendingArrivalsRef.current = pendingArrivalsRef.current.filter((p) => p.dueDay > day);
      due.forEach((item) => {
        const company = COMPANIES.find((c) => c.id === item.companyId);
        if (!company) return;
        lastArrivalDayRef.current = day;
        if (item.kind === 'stage_invite') {
          const stageNames = ['סינון טכני', 'ארכיטקטורת מערכת', 'ראיון בכיר / התנהגותי'];
          setPipeline((prev) => ({ ...prev, [company.id]: { status: 'stage_ready', stage: item.stage, arrivedDay: day, updatedAt: Date.now() } }));
          setInbox((prev) => [
            {
              id: uid('msg'), day, type: 'stage_invite', companyId: company.id, stage: item.stage,
              title: `${company.name}: התקדמת לשלב הבא בתהליך!`,
              body: `עברת בהצלחה את השלב הקודם. השלב הבא הוא: ${stageNames[item.stage]}.`,
            },
            ...prev,
          ]);
        } else if (item.kind === 'offer') {
          setPipeline((prev) => ({ ...prev, [company.id]: { status: 'passed', stage: 3, updatedAt: Date.now() } }));
          const offer = generateOffer(company, item.egoAtPass);
          setInbox((prev) => [
            { id: uid('msg'), day, type: 'offer', companyId: company.id, title: `הצעת עבודה רשמית מ-${company.name}!`, offer, status: 'active' },
            ...prev,
          ]);
        }
      });
    }

    // Dry spell of a week or more with no invites/progress/offers: a wave of self-doubt.
    const DRY_SPELL_DAYS = 7;
    if (day - lastArrivalDayRef.current >= DRY_SPELL_DAYS && day - lastSelfDoubtDayRef.current >= DRY_SPELL_DAYS) {
      lastSelfDoubtDayRef.current = day;
      const msg = SELF_DOUBT_MESSAGES[Math.floor(Math.random() * SELF_DOUBT_MESSAGES.length)];
      setStress((s) => clamp(s + msg.stressDelta, 0, 100));
      setInbox((prev) => [{ id: uid('msg'), day, type: 'system', title: msg.title, body: msg.body }, ...prev]);
    }

    // Auto-reject: ghosting a company's invite/next-stage mail for 14+ days (during the
    // first 3 interview stages only — the final offer has its own ultimatum timer instead).
    const AUTO_REJECT_DAYS = 28;
    Object.entries(pipeline).forEach(([companyId, entry]) => {
      const waitingOnPlayer = entry.status === 'invited' || entry.status === 'stage_ready';
      if (!waitingOnPlayer || entry.arrivedDay === undefined) return;
      if (day - entry.arrivedDay < AUTO_REJECT_DAYS) return;
      const company = COMPANIES.find((c) => c.id === companyId);
      if (!company) return;
      lastArrivalDayRef.current = day;
      setPipeline((prev) => ({ ...prev, [companyId]: { status: 'rejected', stage: entry.stage, updatedAt: Date.now() } }));
      setInbox((prev) => [
        {
          id: uid('msg'), day, type: 'rejection', companyId,
          title: `תשובה מ-${company.name}`,
          body: 'לא הגבת לפנייה בזמן, והחברה החליטה להמשיך הלאה עם מועמדים אחרים.',
        },
        ...prev.filter((m) => !((m.type === 'invite' || m.type === 'stage_invite') && m.companyId === companyId)),
      ]);
      setStress((s) => clamp(s + 4, 0, 100));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  // Timeout game over
  useEffect(() => {
    if (started && !gameOver && day >= 180) {
      setGameOver({ type: 'timeout', finalDay: day });
    }
  }, [day, started, gameOver]);

  // Burnout game over
  useEffect(() => {
    if (started && !gameOver && stress >= 100) {
      setGameOver({ type: 'burnout', finalDay: day });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stress]);

  // Expire offers whose ultimatum ran out
  useEffect(() => {
    setInbox((prev) => {
      let changed = false;
      const next = prev.map((m) => {
        if (m.type === 'offer' && m.status === 'active' && m.offer.expiresAt <= now) {
          changed = true;
          return { ...m, status: 'withdrawn' };
        }
        return m;
      });
      return changed ? next : prev;
    });
  }, [now]);

  function startInterview(company, stage = 0) {
    if (activeInterview || gameOver) return;
    setPipeline((prev) => ({ ...prev, [company.id]: { status: 'in_progress', stage, updatedAt: Date.now() } }));
    setInbox((prev) => prev.filter((m) => !((m.type === 'invite' || m.type === 'stage_invite') && m.companyId === company.id)));
    setActiveInterview({ company, stage });
  }

  function handleInterviewComplete(company, stage, result) {
    setActiveInterview(null);
    const newStress = clamp(stress + result.stressDelta, 0, 100);
    setStress(newStress);
    const newEgo = clamp(ego + (result.egoDelta || 0), 0, 100);
    setEgo(newEgo);

    if (!result.passed) {
      lastArrivalDayRef.current = day;
      setPipeline((prev) => ({ ...prev, [company.id]: { status: 'rejected', stage, updatedAt: Date.now() } }));
      setInbox((prev) => [
        { id: uid('msg'), day, type: 'rejection', companyId: company.id, title: `תשובה מ-${company.name}`, body: result.rejectionNote || 'לצערנו החלטנו להמשיך עם מועמדים אחרים בשלב זה.' },
        ...prev,
      ]);
      return;
    }

    // Passed this stage — the next step (next stage invite, or the final offer) arrives
    // as a separate mail after a short delay, instead of continuing in the same modal.
    const delay = 1 + Math.floor(Math.random() * 2); // 1-2 days
    if (stage < 2) {
      setPipeline((prev) => ({ ...prev, [company.id]: { status: 'awaiting_stage', stage: stage + 1, updatedAt: Date.now() } }));
      pendingArrivalsRef.current.push({ id: uid('pend'), dueDay: day + delay, companyId: company.id, kind: 'stage_invite', stage: stage + 1 });
    } else {
      setPipeline((prev) => ({ ...prev, [company.id]: { status: 'awaiting_offer', stage: 3, updatedAt: Date.now() } }));
      pendingArrivalsRef.current.push({ id: uid('pend'), dueDay: day + delay, companyId: company.id, kind: 'offer', egoAtPass: newEgo });
    }
  }

  function acceptOffer(message) {
    const company = COMPANIES.find((c) => c.id === message.companyId);
    setGameOver({ type: 'accepted', company, offer: message.offer, finalStress: stress, finalDay: day });
  }

  function scrollToCompanyMail(companyId) {
    const latest = inbox.find((m) => m.companyId === companyId);
    if (!latest) return;
    const el = document.getElementById(`msg-${latest.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(latest.id);
    setTimeout(() => setHighlightId((h) => (h === latest.id ? null : h)), 1500);
  }

  if (!started) {
    return (
      <>
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-600/10 border border-red-800 rounded-2xl p-4">
                <ShieldAlert size={48} className="text-red-500" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold mb-2">צייד החוזים</h1>
            <p className="text-gray-400 mb-1">The Contract Hunter</p>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              180 יום. 120 חברות. תיבת דואר עמוסה בגייסים. ראיונות טכניים, פאזלים ארכיטקטוניים ומלכודות התנהגותיות.
              נהל/י את הלחץ, בנה/י אגו, וחתמ/י על ההצעה הטובה ביותר — לפני שהזמן, או העצבים, ייגמרו.
            </p>
            <button
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl px-8 py-3 flex items-center gap-2 mx-auto text-lg"
            >
              <PlayCircle size={20} /> התחל משחק
            </button>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Award size={18} className="text-yellow-400" /> לוח התהילה
            </h3>
            <LeaderboardList entries={leaderboardEntries} loading={leaderboardLoading} />
            <PlayCountLine count={playCount} />
          </div>
        </div>
      </div>
      <button onClick={() => setShowAbout(true)} className="fixed bottom-2 inset-x-0 mx-auto w-fit text-[11px] text-gray-400 hover:text-gray-200 transition-colors z-40">
        אודות
      </button>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      </>
    );
  }

  if (gameOver) {
    return (
      <>
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 font-sans">
        <EndScreen
          result={gameOver} onRestart={resetGame} onGoHome={goHome}
          leaderboardName={leaderboardName} onNameChange={setLeaderboardName}
          submitStatus={submitStatus} submitRank={submitRank} submitImproved={submitImproved} submitBestScore={submitBestScore} onSubmitScore={submitScore}
          showLeaderboard={showLeaderboard} onToggleLeaderboard={toggleLeaderboard}
          leaderboardEntries={leaderboardEntries} leaderboardLoading={leaderboardLoading} playCount={playCount}
        />
      </div>
      <button onClick={() => setShowAbout(true)} className="fixed bottom-2 inset-x-0 mx-auto w-fit text-[11px] text-gray-400 hover:text-gray-200 transition-colors z-40">
        אודות
      </button>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      </>
    );
  }

  // Relevancy sort: anything still alive (not rejected) before dead ends, and within each
  // group the furthest-along companies (higher stage) first, since they're most urgent.
  // A just-changed entry (e.g. a fresh rejection) gets a brief recency boost so it doesn't
  // instantly vanish to the bottom — it lingers near the top for a few seconds first.
  const RECENT_UPDATE_MS = 6000;
  const pipelineEntries = Object.entries(pipeline)
    .filter(([, v]) => v.status !== 'none')
    .sort(([, a], [, b]) => {
      const aRecent = now - (a.updatedAt || 0) < RECENT_UPDATE_MS;
      const bRecent = now - (b.updatedAt || 0) < RECENT_UPDATE_MS;
      if (aRecent !== bRecent) return aRecent ? -1 : 1;
      if (aRecent && bRecent) return (b.updatedAt || 0) - (a.updatedAt || 0);
      const aDead = a.status === 'rejected';
      const bDead = b.status === 'rejected';
      if (aDead !== bDead) return aDead ? 1 : -1;
      return (b.stage || 0) - (a.stage || 0);
    });

  return (
    <>
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/10 border border-red-800 rounded-xl p-2">
              <ShieldAlert size={26} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold leading-tight">צייד החוזים</h1>
              <p className="text-xs text-gray-500">The Contract Hunter</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatPill icon={Calendar} label="יום" value={<span dir="ltr">{day} / 180</span>} barColor="bg-blue-500" barPct={(day / 180) * 100} />
            <StatPill icon={Flame} label="לחץ" value={`${stress}%`} barColor={stress > 70 ? 'bg-red-500' : stress > 40 ? 'bg-orange-400' : 'bg-green-500'} barPct={stress} />
            <StatPill icon={Award} label="אגו / מוניטין" value={ego} barColor="bg-purple-500" barPct={ego} />
            <StatPill icon={Gift} label="הצעות בתיבה" value={offersCount} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3 text-gray-300 font-bold">
              <InboxIcon size={18} /> תיבת דואר נכנס
            </div>
            <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pl-1">
              {inbox.length === 0 && <p className="text-gray-600 text-sm">התיבה ריקה כרגע...</p>}
              {inbox.map((m) => (
                <MessageCard
                  key={m.id}
                  message={m}
                  company={COMPANIES.find((c) => c.id === m.companyId)}
                  onStartInterview={startInterview}
                  onAccept={acceptOffer}
                  now={now}
                  interviewLocked={!!activeInterview}
                  highlighted={m.id === highlightId}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-300 font-bold">
              <ListChecks size={18} /> פייפליין ראיונות
            </div>
            <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
              {pipelineEntries.length === 0 && <p className="text-gray-600 text-sm">אין חברות בתהליך עדיין.</p>}
              {pipelineEntries.map(([companyId, entry]) => {
                const company = COMPANIES.find((c) => c.id === companyId);
                if (!company) return null;
                const statusLabel = {
                  invited: 'ממתין לתחילת ראיון',
                  in_progress: 'בתהליך ראיונות',
                  awaiting_stage: 'ממתין לעדכון מהחברה',
                  stage_ready: 'התקדמות חדשה בתיבה!',
                  awaiting_offer: 'ממתין להצעה רשמית',
                  passed: 'הצעה נשלחה',
                  rejected: 'נדחה',
                }[entry.status];
                const statusColor = {
                  invited: 'text-blue-400',
                  in_progress: 'text-yellow-400',
                  awaiting_stage: 'text-gray-400',
                  stage_ready: 'text-cyan-400',
                  awaiting_offer: 'text-gray-400',
                  passed: 'text-green-400',
                  rejected: 'text-red-500',
                }[entry.status];
                return (
                  <div
                    key={companyId}
                    onClick={() => scrollToCompanyMail(companyId)}
                    className="border border-gray-800 bg-gray-900/50 rounded-lg p-3 shrink-0 cursor-pointer hover:border-blue-600 hover:bg-gray-900/80 transition-colors"
                  >
                    <div className="text-xs font-semibold text-gray-200 truncate mb-1">{company.name}</div>
                    <div className={`text-[11px] mb-2 ${statusColor}`}>{statusLabel}</div>
                    <StageDots stage={entry.status === 'passed' ? 3 : entry.stage || 0} failedAt={entry.status === 'rejected' ? entry.stage : null} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {activeInterview && !gameOver && (
        <InterviewModal company={activeInterview.company} stage={activeInterview.stage} onComplete={handleInterviewComplete} />
      )}
    </div>
    <button onClick={() => setShowAbout(true)} className="fixed bottom-2 inset-x-0 mx-auto w-fit text-[11px] text-gray-400 hover:text-gray-200 transition-colors z-40">
      אודות
    </button>
    {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
