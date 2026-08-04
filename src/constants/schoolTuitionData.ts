export interface SchoolBoard {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  slug: string;
  classNumber: number;
}

export interface SubjectSpec {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  translations: Record<string, { name: string; description: string }>;
}

export const SCHOOL_BOARDS: SchoolBoard[] = [
  { id: "board-cbse", name: "CBSE", slug: "cbse", description: "Central Board of Secondary Education curriculum." },
  { id: "board-icse", name: "ICSE", slug: "icse", description: "Indian Certificate of Secondary Education curriculum." },
  { id: "board-state", name: "State Board", slug: "state-board", description: "Standard state board secondary learning curriculum." },
];

export const SCHOOL_CLASSES: SchoolClass[] = Array.from({ length: 12 }, (_, i) => ({
  id: `class-${i + 1}`,
  name: `Class ${i + 1}`,
  slug: `class-${i + 1}`,
  classNumber: i + 1,
}));

export const SCHOOL_SUBJECTS: SubjectSpec[] = [
  {
    id: "sub-math",
    name: "Mathematics",
    slug: "mathematics",
    description: "Build a strong foundation in algebra, calculus, geometry, and arithmetic.",
    icon: "Calculator",
    translations: {
      en: { name: "Mathematics", description: "Build a strong foundation in algebra, calculus, geometry, and arithmetic." },
      hi: { name: "गणित", description: "बीजगणित, कलन, ज्यामिति और अंकगणित में एक मजबूत आधार बनाएं।" },
      es: { name: "Matemáticas", description: "Construya una base sólida en álgebra, cálculo, geometría y aritmética." }
    }
  },
  {
    id: "sub-science",
    name: "Science",
    slug: "science",
    description: "Explore the laws of nature, environmental science, and basic physics/chemistry.",
    icon: "Flask",
    translations: {
      en: { name: "Science", description: "Explore the laws of nature, environmental science, and basic physics/chemistry." },
      hi: { name: "विज्ञान", description: "प्रकृति के नियमों, पर्यावरण विज्ञान और बुनियादी भौतिकी/रसायन विज्ञान का अन्वेषण करें।" },
      es: { name: "Ciencia", description: "Explore las leyes de la naturaleza, las ciencias ambientales y la física/química básica." }
    }
  },
  {
    id: "sub-physics",
    name: "Physics",
    slug: "physics",
    description: "Advanced mechanics, thermodynamics, light, waves, and electromagnetism.",
    icon: "Atom",
    translations: {
      en: { name: "Physics", description: "Advanced mechanics, thermodynamics, light, waves, and electromagnetism." },
      hi: { name: "भौतिक विज्ञान", description: "उन्नत यांत्रिकी, ऊष्मागतिकी, प्रकाश, तरंगें और विद्युत चुंबकत्व।" },
      es: { name: "Física", description: "Mecánica avanzada, termodinámica, luz, ondas y electromagnetismo." }
    }
  },
  {
    id: "sub-chemistry",
    name: "Chemistry",
    slug: "chemistry",
    description: "Organic, inorganic, physical chemistry, periodic equations, and molecular reactions.",
    icon: "Beaker",
    translations: {
      en: { name: "Chemistry", description: "Organic, inorganic, physical chemistry, periodic equations, and molecular reactions." },
      hi: { name: "रसायन विज्ञान", description: "कार्बनिक, अकार्बनिक, भौतिक रसायन विज्ञान, आवधिक समीकरण और आणविक प्रतिक्रियाएं।" },
      es: { name: "Química", description: "Química orgánica, inorgánica, física, ecuaciones periódicas y reacciones moleculares." }
    }
  },
  {
    id: "sub-biology",
    name: "Biology",
    slug: "biology",
    description: "Human anatomy, botany, zoology, plant physiology, and cellular genetics.",
    icon: "Dna",
    translations: {
      en: { name: "Biology", description: "Human anatomy, botany, zoology, plant physiology, and cellular genetics." },
      hi: { name: "जीव विज्ञान", description: "मानव शरीर रचना विज्ञान, वनस्पति विज्ञान, प्राणीशास्त्र, पादप शरीर क्रिया विज्ञान और कोशिकीय आनुवंशिकी।" },
      es: { name: "Biología", description: "Anatomía humana, botánica, zoología, fisiología vegetal y genética celular." }
    }
  },
  {
    id: "sub-english",
    name: "English",
    slug: "english",
    description: "Grammar, literature, comprehension, writing skills, and verbal vocabulary.",
    icon: "Book",
    translations: {
      en: { name: "English", description: "Grammar, literature, comprehension, writing skills, and verbal vocabulary." },
      hi: { name: "अंग्रेजी", description: "व्याकरण, साहित्य, समझ, लेखन कौशल और मौखिक शब्दावली।" },
      es: { name: "Inglés", description: "Gramática, literatura, comprensión, habilidades de escritura y vocabulario verbal." }
    }
  },
  {
    id: "sub-computer",
    name: "Computer Science",
    slug: "computer-science",
    description: "Learn programming basics, python, java, algorithms, and computational thinking.",
    icon: "Laptop",
    translations: {
      en: { name: "Computer Science", description: "Learn programming basics, python, java, algorithms, and computational thinking." },
      hi: { name: "कंप्यूटर विज्ञान", description: "प्रोग्रामिंग मूल बातें, पायथन, जावा, एल्गोरिदम और कम्प्यूटेशनल सोच सीखें।" },
      es: { name: "Informática", description: "Aprenda conceptos básicos de programación, Python, Java, algoritmos y pensamiento computacional." }
    }
  }
];

export interface MockScheduleEvent {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  type: "live_class" | "doubt_session" | "office_hours";
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
}

export interface MockAssessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  type: "homework" | "assignment" | "test" | "quiz";
  dueDate: string;
  maxMarks: number;
  status: "pending" | "submitted" | "graded";
  score?: number;
}

export interface MockAttendanceRecord {
  id: string;
  entityTitle: string;
  entityType: "live_class" | "doubt_session";
  status: "Present" | "Absent" | "Excused";
  date: string;
}

// Seed Mock Tuition courses curriculum chapters
export const MOCK_CURRICULUM = {
  chapters: [
    {
      id: "ch-1",
      title: "Chapter 1: Real Numbers & Linear Equations",
      description: "Fundamental theorems of arithmetic, irrational numbers, and graphical solutions.",
      lessons: [
        { id: "les-1-1", title: "Lesson 1.1: Euclid's Division Lemma & Real Numbers", duration: "18 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
        { id: "les-1-2", title: "Lesson 1.2: Rational and Irrational Proof Analysis", duration: "22 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }
      ]
    },
    {
      id: "ch-2",
      title: "Chapter 2: Quadratic Equations & Polynomials",
      description: "Finding roots using factorization and quadratic formulas.",
      lessons: [
        { id: "les-2-1", title: "Lesson 2.1: Intro to Quadratic Equations", duration: "25 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
        { id: "les-2-2", title: "Lesson 2.2: Solving Roots via Factorization", duration: "30 mins", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }
      ]
    }
  ]
};

// Seed schedules and assessments data
export const MOCK_SCHEDULES: MockScheduleEvent[] = [
  {
    id: "sched-1",
    courseId: "c-tuition-math",
    courseTitle: "Class 10 CBSE Mathematics",
    title: "Live Chapter Review: Real Numbers",
    description: "Deep dive into irrational proofs and rational decimals expansions.",
    type: "live_class",
    scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Tomorrow
    durationMinutes: 60,
    meetingLink: "https://meet.google.com/abc-defg-hij"
  },
  {
    id: "sched-2",
    courseId: "c-tuition-math",
    courseTitle: "Class 10 CBSE Mathematics",
    title: "1-on-1 Math Doubt Clearing Session",
    description: "Ask queries related to homework assignments and weekly tests.",
    type: "doubt_session",
    scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    durationMinutes: 45,
    meetingLink: "https://meet.google.com/xyz-pdqr-lmn"
  }
];

export const MOCK_ASSESSMENTS: MockAssessment[] = [
  {
    id: "ass-1",
    courseId: "c-tuition-math",
    courseTitle: "Class 10 CBSE Mathematics",
    title: "Homework 1: Quadratic Equations Problems",
    description: "Solve problems 1 to 15 from Chapter 2 and upload scanned copy of your notebook.",
    type: "homework",
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    maxMarks: 50,
    status: "pending"
  },
  {
    id: "ass-2",
    courseId: "c-tuition-math",
    courseTitle: "Class 10 CBSE Mathematics",
    title: "Weekly Test 1: Real Numbers Decimals",
    description: "Online test containing 20 multiple choice questions with countdown timer.",
    type: "test",
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    maxMarks: 30,
    status: "pending"
  },
  {
    id: "ass-3",
    courseId: "c-tuition-math",
    courseTitle: "Class 10 CBSE Mathematics",
    title: "Assignment 1: Polynomial Coefficients Proof",
    description: "Write structural proof verifying relation of coefficients with roots.",
    type: "assignment",
    dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    maxMarks: 100,
    status: "graded",
    score: 92
  }
];

export const MOCK_ATTENDANCE: MockAttendanceRecord[] = [
  { id: "att-1", entityTitle: "Live Chapter Review: Real Numbers", entityType: "live_class", status: "Present", date: "2026-07-28" },
  { id: "att-2", entityTitle: "1-on-1 Math Doubt Clearing Session", entityType: "doubt_session", status: "Present", date: "2026-07-25" },
  { id: "att-3", entityTitle: "Live Chapter 1 Introduction Class", entityType: "live_class", status: "Absent", date: "2026-07-20" }
];
