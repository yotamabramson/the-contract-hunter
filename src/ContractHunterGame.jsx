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

const COMPANIES = [
  // --- THE OVERBEARING FINTECH (Azrieli Sarona Tower) ---
  { id: 'fin1', culture: 'fintech', name: 'טוראס פייננס — מגדל עזריאל שרונה, קומה 54', roleTitle: 'Senior Quant Engineer', salaryMin: 42000, salaryMax: 68000, techInterest: 5, prestige: 5, wfhDays: 1, optionGrants: 1, flexHours: 1, stressPerStage: 16, desc: 'ענקית פינטק עם תרבות "זאבי וול-סטריט", בונוסים אגדיים ולוחות זמנים בלתי אפשריים.' },
  { id: 'fin2', culture: 'fintech', name: 'קרדיטקס גלובל — מגדל עזריאל שרונה, קומה 61', roleTitle: 'Head of Risk Algorithms', salaryMin: 45000, salaryMax: 72000, techInterest: 4, prestige: 5, wfhDays: 0, optionGrants: 2, flexHours: 0, stressPerStage: 18, desc: 'מודלים פיננסיים עתירי סיכון, שעות עבודה שלא נגמרות, ותביעה למחויבות מוחלטת.' },
  { id: 'fin3', culture: 'fintech', name: 'וולטבנק דיגיטל — מגדל עזריאל שרונה, קומה 48', roleTitle: 'Principal Trading Systems Architect', salaryMin: 40000, salaryMax: 65000, techInterest: 6, prestige: 4, wfhDays: 1, optionGrants: 1, flexHours: 1, stressPerStage: 15, desc: 'מערכות מסחר בזמן אמת, לחץ יומיומי אמיתי, אך שם מוכר ומכובד בשוק.' },

  // --- THE GLOBAL CORPORATE TECH GIANT ---
  { id: 'corp1', culture: 'corporate', name: 'מגה-סופט ישראל (מטה עולמי)', roleTitle: 'Principal Software Engineer', salaryMin: 35000, salaryMax: 55000, techInterest: 7, prestige: 5, wfhDays: 2, optionGrants: 2, flexHours: 1, stressPerStage: 12, desc: 'חמישה שלבי ראיונות, שאלות אלגוריתמים קשות, ותהליכים ביורוקרטיים ארוכים - אך יציבות ונוצצת בקורות החיים.' },
  { id: 'corp2', culture: 'corporate', name: 'אורביטל סיסטמס גלובל', roleTitle: 'Staff AI Research Engineer', salaryMin: 38000, salaryMax: 58000, techInterest: 8, prestige: 5, wfhDays: 2, optionGrants: 2, flexHours: 1, stressPerStage: 13, desc: 'מחקר AI ברמה עולמית בתוך מכונה תאגידית ענקית עם תהליכי אישור אינסופיים.' },
  { id: 'corp3', culture: 'corporate', name: 'טיטאן קלאוד קורפ׳', roleTitle: 'Principal Cloud Architect', salaryMin: 36000, salaryMax: 56000, techInterest: 6, prestige: 4, wfhDays: 2, optionGrants: 1, flexHours: 1, stressPerStage: 12, desc: 'תשתיות ענן בקנה מידה עולמי, ריאיונות התנהגותיים ממוסגרים ונוקשים.' },

  // --- THE MATURE B2B SAAS ENTERPRISE ---
  { id: 'saas1', culture: 'saas', name: 'פלואו-בייס SaaS פתרונות ארגוניים', roleTitle: 'Senior Backend Engineer', salaryMin: 28000, salaryMax: 42000, techInterest: 6, prestige: 3, wfhDays: 4, optionGrants: 1, flexHours: 3, stressPerStage: 7, desc: 'תרבות בוגרת עם תקשורת פתוחה, סטאק טכנולוגי מאוזן וגמישות היברידית אמיתית.' },
  { id: 'saas2', culture: 'saas', name: 'נימבוס וורקספייס בע״מ', roleTitle: 'Senior Full-Stack Engineer', salaryMin: 27000, salaryMax: 40000, techInterest: 5, prestige: 3, wfhDays: 5, optionGrants: 1, flexHours: 3, stressPerStage: 6, desc: 'עבודה מרחוק מלאה, קצב סביר, ותהליך גיוס שקוף וכן.' },
  { id: 'saas3', culture: 'saas', name: 'קונטיניום B2B פלטפורמות', roleTitle: 'Senior Data Engineer', salaryMin: 29000, salaryMax: 44000, techInterest: 6, prestige: 3, wfhDays: 3, optionGrants: 1, flexHours: 2, stressPerStage: 7, desc: 'פלטפורמת דאטה ארגונית יציבה עם ניהול בוגר ותהליכי עבודה ברורים.' },

  // --- THE CHAOTIC MEDICAL-TECH STARTUP ---
  { id: 'start1', culture: 'startup', name: "ניורוג'ן הבריאות הדיגיטלית", roleTitle: 'Principal AI Architect', salaryMin: 25000, salaryMax: 50000, techInterest: 10, prestige: 2, wfhDays: 2, optionGrants: 3, flexHours: 3, stressPerStage: 11, desc: 'אתגרים טכנולוגיים מרתקים בקצה הידע של Agentic AI, אך הכל עלול להשתנות מחר בבוקר.' },
  { id: 'start2', culture: 'startup', name: 'ביומטריקס AI לאבס', roleTitle: 'Founding ML Engineer', salaryMin: 24000, salaryMax: 48000, techInterest: 9, prestige: 2, wfhDays: 3, optionGrants: 3, flexHours: 3, stressPerStage: 10, desc: 'צוות מייסדים קטן, אופציות נכבדות, וכאוס יומיומי מוחלט.' },
  { id: 'start3', culture: 'startup', name: 'וייטל-סקאן טכנולוגיות רפואיות', roleTitle: 'Lead Agentic Systems Engineer', salaryMin: 26000, salaryMax: 52000, techInterest: 10, prestige: 2, wfhDays: 2, optionGrants: 2, flexHours: 2, stressPerStage: 12, desc: 'בניית סוכני AI אוטונומיים למכשור רפואי - מרתק, לא יציב, ולא לחלשי לב.' },
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
];

const ARCHITECTURE_PAIRS = [
  { id: 'a1', bottleneck: 'עומס קריאה גבוה על מסד הנתונים הראשי', component: 'Redis Cache' },
  { id: 'a2', bottleneck: 'זרימת אירועים בזמן אמת בנפח עצום עם דרישת Latency נמוכה', component: 'Kafka' },
  { id: 'a3', bottleneck: 'כיוונון מודל ענק על GPU יחיד עם זיכרון מוגבל', component: 'LoRA' },
  { id: 'a4', bottleneck: 'חיפוש סמנטי מהיר על מיליוני embeddings', component: 'Vector DB' },
  { id: 'a5', bottleneck: 'תעבורה גולשת בלתי צפויה שדורשת קנה מידה אוטומטי', component: 'Kubernetes HPA' },
  { id: 'a6', bottleneck: 'כשל מדורג משירות downstream שנופל', component: 'Circuit Breaker' },
  { id: 'a7', bottleneck: 'זמן טעינה גבוה למשתמשים גלובליים בגלל נכסים סטטיים', component: 'CDN' },
  { id: 'a8', bottleneck: 'נקודת כשל יחידה בשרת החזית', component: 'Load Balancer' },
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
];

const FLAVOR_EVENTS = [
  { title: 'לילה טוב של שינה', body: 'הצלחת להתנתק לרגע מהמסכים. הגוף מודה לך.', stressDelta: -5 },
  { title: 'עדכון לינקדאין מציק', body: 'מישהו מהאוניברסיטה "שמח לשתף" שהתקבל לחברת חלומות.', stressDelta: 4 },
  { title: 'באג ישן צף מחדש', body: 'קוד legacy שכתבת לפני שנתיים החליט להתעורר בדיוק עכשיו.', stressDelta: 3 },
  { title: 'שיחת עידוד מחבר', body: 'חבר טוב התקשר רק כדי לשאול מה שלומך. זה עזר יותר משיערת.', stressDelta: -4 },
  { title: 'תור ארוך בבנק', body: 'בזבזת שעה בתור לבנק במקום להתכונן לראיון הבא.', stressDelta: 2 },
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

function InterviewModal({ company, onComplete }) {
  const [stage, setStage] = useState(0);
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

  function finish(passed, stageFailedAt, rejectionNote) {
    if (finished.current) return;
    finished.current = true;
    onComplete(company, {
      passed,
      stageFailedAt,
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
      setTimeout(() => finish(false, 0, 'לא עברת את שלב הסינון הטכני — התשובות לא היו מדויקות מספיק.'), 500);
      return;
    }
    accumEgo.current += 4;
    setTimeout(() => {
      if (qIdx === 0) {
        setQIdx(1);
        setTimeLeft(15);
        setLockedAnswer(null);
      } else {
        setStage(1);
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
        setTimeout(() => setStage(2), 400);
      }
    } else {
      const nm = mistakes + 1;
      setMistakes(nm);
      accumStress.current += 5;
      setShake(comp);
      setTimeout(() => setShake(null), 400);
      setSelectedLeft(null);
      if (nm >= 3) {
        setTimeout(() => finish(false, 1, 'לא הצלחת למפות נכון את רכיבי הארכיטקטורה לצווארי הבקבוק.'), 400);
      }
    }
  }

  function chooseBehavioral(key) {
    if (finished.current) return;
    if (key === 'A') {
      accumStress.current += 8;
      accumEgo.current -= 5;
      finish(false, 2, 'התשובה נשמעה כמו קלישאה מוכנה מראש — לא השארת רושם אותנטי.');
      return;
    }
    if (key === 'C') {
      accumEgo.current += 5;
      accumStress.current += 2;
      finish(true, null, null);
      return;
    }
    const cultureFriendly = company.culture === 'saas' || company.culture === 'startup';
    if (cultureFriendly) {
      accumEgo.current += 15;
      accumStress.current += 2;
      finish(true, null, null);
    } else {
      accumEgo.current -= 8;
      accumStress.current += 10;
      finish(false, 2, 'התשובה הכנה מדי לא התקבלה היטב בתרבות הארגונית הנוקשה של החברה.');
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

function MessageCard({ message, company, onStartInterview, onAccept, now, interviewLocked }) {
  if (message.type === 'invite') {
    const Icon = CULTURE_ICONS[company.culture];
    return (
      <div className="border border-blue-900 bg-blue-950/20 rounded-xl p-4 shrink-0">
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

  if (message.type === 'rejection') {
    return (
      <div className="border border-gray-800 bg-gray-900/40 rounded-xl p-4 opacity-80 shrink-0">
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
      <div className="border border-gray-800 bg-gray-900/30 rounded-xl p-4 shrink-0">
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
      <div className={`border-2 rounded-xl p-4 shrink-0 ${withdrawn ? 'border-gray-800 bg-gray-900/40 opacity-60' : 'border-red-700 bg-red-950/20 shadow-lg shadow-red-950/30'}`}>
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

// ============================================================================
// END SCREEN
// ============================================================================

function EndScreen({ result, onRestart }) {
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
          <p className="text-gray-400 mb-6">יום 30 הגיע ואף חוזה לא נחתם. השוק לא עוצר לאף אחד.</p>
          <button onClick={onRestart} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-6 py-3 flex items-center gap-2 mx-auto">
            <RefreshCw size={16} /> נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // accepted
  const { company, offer, finalStress } = result;
  const jobSatisfaction = clamp(Math.round(company.techInterest * 10), 0, 100);
  const walletPrestige = clamp(Math.round((offer.salary / 72000) * 70 + company.prestige * 6), 0, 100);
  const sanityQoL = clamp(Math.round((100 - finalStress) * 0.5 + company.wfhDays * 8 + company.flexHours * 6), 0, 100);
  const overall = Math.round((jobSatisfaction + walletPrestige + sanityQoL) / 3);
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
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800">
            <span className="text-gray-300 font-semibold">ציון כולל</span>
            <span className={`text-3xl font-extrabold ${grade.color}`}>{grade.letter} · {overall}</span>
          </div>
        </div>

        <button onClick={onRestart} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-6 py-3 flex items-center justify-center gap-2">
          <RefreshCw size={16} /> ציד חדש
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

  const contactedRef = useRef(new Set());

  const offersCount = inbox.filter((m) => m.type === 'offer' && m.status === 'active').length;

  function resetGame() {
    contactedRef.current = new Set();
    setDay(1);
    setStress(10);
    setEgo(0);
    setInbox([{ id: uid('msg'), day: 1, type: 'system', title: 'ברוכ/ה הבא/ה לציד', body: 'תיבת הדואר שלך תתמלא בהצעות מגייסים. נהל/י את הזמן, השמור/י על שפיות, וחתמ/י על החוזה הטוב ביותר לפני שיגמר הזמן.' }]);
    setPipeline({});
    setActiveInterview(null);
    setGameOver(null);
    setNow(Date.now());
    setStarted(true);
  }

  // Day loop — 1 day every 4 seconds
  useEffect(() => {
    if (!started || gameOver) return;
    const iv = setInterval(() => {
      setDay((d) => Math.min(d + 1, 30));
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
    if (available.length > 0 && Math.random() < 0.55) {
      const company = available[Math.floor(Math.random() * available.length)];
      contactedRef.current.add(company.id);
      setPipeline((prev) => ({ ...prev, [company.id]: { status: 'invited', stage: 0 } }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  // Timeout game over
  useEffect(() => {
    if (started && !gameOver && day >= 30) {
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

  function startInterview(company) {
    if (activeInterview || gameOver) return;
    setPipeline((prev) => ({ ...prev, [company.id]: { status: 'in_progress', stage: 0 } }));
    setInbox((prev) => prev.filter((m) => !(m.type === 'invite' && m.companyId === company.id)));
    setActiveInterview(company);
  }

  function handleInterviewComplete(company, result) {
    setActiveInterview(null);
    const newStress = clamp(stress + result.stressDelta, 0, 100);
    setStress(newStress);

    if (result.passed) {
      const newEgo = clamp(ego + result.egoDelta, 0, 100);
      setEgo(newEgo);
      setPipeline((prev) => ({ ...prev, [company.id]: { status: 'passed', stage: 3 } }));
      const offer = generateOffer(company, newEgo);
      setInbox((prev) => [
        { id: uid('msg'), day, type: 'offer', companyId: company.id, title: `הצעת עבודה רשמית מ-${company.name}!`, offer, status: 'active' },
        ...prev,
      ]);
    } else {
      setEgo((e) => clamp(e + (result.egoDelta || 0), 0, 100));
      setPipeline((prev) => ({ ...prev, [company.id]: { status: 'rejected', stage: result.stageFailedAt } }));
      setInbox((prev) => [
        { id: uid('msg'), day, type: 'rejection', companyId: company.id, title: `תשובה מ-${company.name}`, body: result.rejectionNote || 'לצערנו החלטנו להמשיך עם מועמדים אחרים בשלב זה.' },
        ...prev,
      ]);
    }
  }

  function acceptOffer(message) {
    const company = COMPANIES.find((c) => c.id === message.companyId);
    setGameOver({ type: 'accepted', company, offer: message.offer, finalStress: stress, finalDay: day });
  }

  if (!started) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600/10 border border-red-800 rounded-2xl p-4">
              <ShieldAlert size={48} className="text-red-500" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-2">צייד החוזים</h1>
          <p className="text-gray-400 mb-1">The Contract Hunter</p>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            30 יום. 12 חברות. תיבת דואר עמוסה בגייסים. ראיונות טכניים, פאזלים ארכיטקטוניים ומלכודות התנהגותיות.
            נהל/י את הלחץ, בנה/י אגו, וחתמ/י על ההצעה הטובה ביותר — לפני שהזמן, או העצבים, ייגמרו.
          </p>
          <button
            onClick={resetGame}
            className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl px-8 py-3 flex items-center gap-2 mx-auto text-lg"
          >
            <PlayCircle size={20} /> התחל ציד
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 font-sans">
        <EndScreen result={gameOver} onRestart={resetGame} />
      </div>
    );
  }

  const pipelineEntries = Object.entries(pipeline).filter(([, v]) => v.status !== 'none');

  return (
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
            <StatPill icon={Calendar} label="יום" value={<span dir="ltr">{day} / 30</span>} barColor="bg-blue-500" barPct={(day / 30) * 100} />
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
                  passed: 'הצעה נשלחה',
                  rejected: 'נדחה',
                }[entry.status];
                const statusColor = {
                  invited: 'text-blue-400',
                  in_progress: 'text-yellow-400',
                  passed: 'text-green-400',
                  rejected: 'text-red-500',
                }[entry.status];
                return (
                  <div key={companyId} className="border border-gray-800 bg-gray-900/50 rounded-lg p-3 shrink-0">
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
        <InterviewModal company={activeInterview} onComplete={handleInterviewComplete} />
      )}
    </div>
  );
}
