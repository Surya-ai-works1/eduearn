import { slugify } from "../utils/slugify";
import { MarketplaceService, SEED_CATEGORIES } from "../features/payments/services/marketplaceService";
import { getCourseThumbnail } from "../lib/courseThumbnailRegistry";

// ==========================================
// 1. DATA MODELS & STRUCTURES
// ==========================================

export const SUBJECTS_MAP = {
  academics: {
    name: "Academic Education",
    subjects: [
      { id: "biology", name: "Biology", fee: "₹700–₹800/month" },
      { id: "computer-science", name: "Computer Science", fee: "₹700–₹800/month" },
      { id: "english", name: "English", fee: "₹600–₹800/month" },
      { id: "economics", name: "Economics", fee: "₹700–₹800/month" },
      { id: "commerce", name: "Commerce", fee: "₹700–₹800/month" },
      { id: "accountancy", name: "Accountancy", fee: "₹700–₹800/month" },
      { id: "mathematics", name: "Mathematics", fee: "₹700–₹800/month" },
      { id: "physics", name: "Physics", fee: "₹700–₹800/month" },
      { id: "chemistry", name: "Chemistry", fee: "₹700–₹800/month" },
      { id: "class-1", name: "Class 1", fee: "₹500–₹600/month", package: "₹1500/month" },
      { id: "class-2", name: "Class 2", fee: "₹500–₹600/month", package: "₹1500/month" },
      { id: "class-3", name: "Class 3", fee: "₹500–₹600/month", package: "₹1500/month" },
      { id: "class-4", name: "Class 4", fee: "₹500–₹600/month", package: "₹1500/month" },
      { id: "class-5", name: "Class 5", fee: "₹500–₹600/month", package: "₹1500/month" },
      { id: "class-6", name: "Class 6", fee: "₹600–₹700/month", package: "₹1600/month" },
      { id: "class-7", name: "Class 7", fee: "₹600–₹700/month", package: "₹1600/month" },
      { id: "class-8", name: "Class 8", fee: "₹600–₹700/month", package: "₹1600/month" },
      { id: "class-9", name: "Class 9", fee: "₹700–₹800/month", package: "₹1700/month" },
      { id: "class-10", name: "Class 10", fee: "₹700–₹800/month", package: "₹1700/month" },
      { id: "class-11-mpc", name: "Class 11 MPC", fee: "₹800/month", package: "₹1800/month" },
      { id: "class-11-bipc", name: "Class 11 BiPC", fee: "₹800/month", package: "₹1800/month" },
      { id: "class-11-commerce", name: "Class 11 Commerce", fee: "₹800/month", package: "₹1800/month" },
      { id: "class-12-mpc", name: "Class 12 MPC", fee: "₹800/month", package: "₹1800/month" },
      { id: "class-12-bipc", name: "Class 12 BiPC", fee: "₹800/month", package: "₹1800/month" },
      { id: "class-12-commerce", name: "Class 12 Commerce", fee: "₹800/month", package: "₹1800/month" },
      { id: "jee-main", name: "JEE Main", fee: "₹800–₹1000/month" },
      { id: "jee-advanced", name: "JEE Advanced", fee: "₹800–₹1000/month" },
      { id: "neet", name: "NEET", fee: "₹800–₹1000/month" },
      { id: "cuet", name: "CUET", fee: "₹800–₹1000/month" },
      { id: "upsc", name: "UPSC", fee: "₹800–₹1000/month" },
      { id: "ssc", name: "SSC", fee: "₹800–₹1000/month" },
      { id: "banking", name: "Banking", fee: "₹800–₹1000/month" },
      { id: "railways", name: "Railways", fee: "₹800–₹1000/month" },
      { id: "hindi", name: "Hindi", fee: "₹600–₹800/month" },
      { id: "telugu", name: "Telugu", fee: "₹600–₹800/month" },
      { id: "tamil", name: "Tamil", fee: "₹600–₹800/month" },
      { id: "kannada", name: "Kannada", fee: "₹600–₹800/month" },
      { id: "french", name: "French", fee: "₹600–₹800/month" },
      { id: "german", name: "German", fee: "₹600–₹800/month" },
      { id: "japanese", name: "Japanese", fee: "₹600–₹800/month" }
    ]
  },
  skills: {
    name: "Skills & Extracurriculars",
    subjects: [
      { id: "web-development", name: "Web Development", fee: "₹800–₹1200/month" },
      { id: "python", name: "Python", fee: "₹800–₹1200/month" },
      { id: "java", name: "Java", fee: "₹800–₹1200/month" },
      { id: "c-plus-plus", name: "C++", fee: "₹800–₹1200/month" },
      { id: "javascript", name: "JavaScript", fee: "₹800–₹1200/month" },
      { id: "react", name: "React", fee: "₹800–₹1200/month" },
      { id: "next-js", name: "Next.js", fee: "₹800–₹1200/month" },
      { id: "node-js", name: "Node.js", fee: "₹800–₹1200/month" },
      { id: "ai-ml", name: "AI & Machine Learning", fee: "₹800–₹1200/month" },
      { id: "drawing", name: "Drawing", fee: "₹600–₹800/month" },
      { id: "painting", name: "Painting", fee: "₹600–₹800/month" },
      { id: "sketching", name: "Sketching", fee: "₹600–₹800/month" },
      { id: "crafts", name: "Crafts", fee: "₹600–₹800/month" },
      { id: "keyboard", name: "Keyboard", fee: "₹700–₹1000/month" },
      { id: "guitar", name: "Guitar", fee: "₹700–₹1000/month" },
      { id: "piano", name: "Piano", fee: "₹700–₹1000/month" },
      { id: "violin", name: "Violin", fee: "₹700–₹1000/month" },
      { id: "flute", name: "Flute", fee: "₹700–₹1000/month" },
      { id: "singing", name: "Singing", fee: "₹700–₹1000/month" },
      { id: "kuchipudi", name: "Kuchipudi", fee: "₹700–₹1000/month" },
      { id: "bharatanatyam", name: "Bharatanatyam", fee: "₹700–₹1000/month" },
      { id: "hip-hop", name: "Hip-Hop", fee: "₹700–₹1000/month" },
      { id: "western", name: "Western", fee: "₹700–₹1000/month" },
      { id: "classical", name: "Classical", fee: "₹700–₹1000/month" },
      { id: "photography", name: "Photography", fee: "₹700–₹1000/month" },
      { id: "videography", name: "Videography", fee: "₹700–₹1000/month" },
      { id: "public-speaking", name: "Public Speaking", fee: "₹600–₹800/month" },
      { id: "chess", name: "Chess", fee: "₹600–₹800/month" },
      { id: "yoga", name: "Yoga", fee: "₹600–₹800/month" },
      { id: "fitness", name: "Fitness", fee: "₹600–₹800/month" },
      { id: "cooking", name: "Cooking", fee: "₹600–₹800/month" },
      { id: "baking", name: "Baking", fee: "₹600–₹800/month" },
      { id: "entrepreneurship", name: "Entrepreneurship", fee: "₹800–₹1200/month" }
    ]
  },
  ai: {
    name: "AI & Innovation",
    subjects: [
      { id: "chatgpt", name: "ChatGPT", fee: "₹1000–₹1500/month" },
      { id: "gemini", name: "Gemini", fee: "₹1000–₹1500/month" },
      { id: "claude", name: "Claude", fee: "₹1000–₹1500/month" },
      { id: "cursor-ai", name: "Cursor AI", fee: "₹1000–₹1500/month" },
      { id: "deep-learning", name: "Deep Learning", fee: "₹1000–₹1500/month" },
      { id: "computer-vision", name: "Computer Vision", fee: "₹1000–₹1500/month" },
      { id: "nlp", name: "NLP", fee: "₹1000–₹1500/month" },
      { id: "arduino", name: "Arduino", fee: "₹1000–₹1200/month" },
      { id: "iot", name: "IoT", fee: "₹1000–₹1200/month" },
      { id: "drone-technology", name: "Drone Technology", fee: "₹1000–₹1200/month" }
    ]
  }
};

// Flattened subjects helper for easy mapping
export const ALL_SUBJECTS = (() => {
  const subjects: Array<{ id: string; name: string; category: string; categoryName: string; fee?: string; package?: string }> = [];
  SEED_CATEGORIES.forEach(cat => {
    cat.subcategories.forEach(sub => {
      sub.skills.forEach(skill => {
        subjects.push({
          id: skill.id,
          name: skill.name,
          category: cat.id,
          categoryName: cat.name,
          fee: "₹700–₹1000/month"
        });
      });
    });
  });
  return subjects;
})();

export const MOCK_CATEGORIES = SEED_CATEGORIES.map(c => ({
  id: c.id,
  name: c.name,
  type: c.id,
  count: c.subcategories.reduce((acc, sub) => acc + sub.skills.length, 0)
}));

const TUTOR_NAMES = [
  "Aarav Sharma", "Priya Patel", "Rohan Das", "Sneha Iyer", "Amit Verma",
  "Neha Reddy", "Vikram Singh", "Karan Malhotra", "Anjali Deshmukh", "Rahul Bose",
  "Sophia Miller", "David Miller", "Sarah Collins", "Alex Peterson", "Meera Nair",
  "Jessica Davis", "Rahul Verma", "Ananya Rao", "Divya Reddy", "Rohan Sen",
  "Kabir Mehta", "Aditi Rao", "Ishaan Roy", "Tanvi Joshi", "Meera Sen",
  "Emily Jenkins", "David Wilson", "Jessica Taylor", "James Bennett", "Robert Jenkins",
  "Peter Sterling", "Clara Kent", "Thomas Bennett", "Stephen Rogers", "Natalie Roman",
  "Wendy Maxwell", "Alan Barry", "Henry Jordan", "Arthur Collins", "Diana Carter",
  "Selene Carter", "Harleen Quin", "Ridhima Sen", "Arjun Nair", "Tanya Goel",
  "Amit Verma", "Neha Reddy", "Ananya Rao", "Vikram Singh", "Sophia Miller"
];

const LANGUAGES_POOL = [
  ["English", "Hindi"],
  ["English", "Telugu"],
  ["English", "Hindi", "Telugu"],
  ["English", "Tamil"],
  ["English", "Kannada"],
  ["English", "French"],
  ["English", "German"],
  ["English", "Japanese"]
];

const TIMINGS_POOL = [
  ["Mon, Wed, Fri 4:00 PM - 6:00 PM", "Sat 10:00 AM - 1:00 PM"],
  ["Tue, Thu 5:00 PM - 7:00 PM", "Sun 11:00 AM - 1:00 PM"],
  ["Mon-Fri 6:00 PM - 8:00 PM"],
  ["Sat-Sun 9:00 AM - 12:00 PM"],
  ["Mon, Tue, Wed 3:30 PM - 5:00 PM"]
];

const REVIEW_COMMENTS = [
  "This course was exceptionally clear! The tutor explained difficult concepts very simply.",
  "Outstanding teaching! I loved the practical assignments and prompt feedback.",
  "Very helpful for my exam preparation. Highly recommended to other students.",
  "Amazing experience! Learnt coding from scratch and built 3 projects.",
  "The live sessions were interactive and engaging. Truly worth the cost.",
  "Highly structured curriculum. The notes provided were concise and easy to read.",
  "The tutor was extremely patient and resolved all my doubts on the discussion board.",
  "Perfect chess strategies explained! Already seeing improvements in my rating.",
  "Great design guidelines. Figma tips were incredibly time-saving.",
  "Loved the coding assignments! The difficulty levels were well balanced.",
  "Best class ever! I learned playing acoustic guitar songs in just 4 weeks.",
  "Very engaging course on AI prompting. Gemini examples were super practical."
];

// ==========================================
// 2. PROGRAMMATIC GENERATORS
// ==========================================

// Generate 50 Tutors
const TUITION_TUTOR_SPECS = [
  { subjects: ["Mathematics", "Science"], ids: ["mathematics", "science"], levels: ["Primary (Class 1–5)", "Middle School (Class 6–8)", "Secondary (Class 9–10)"], pkg: "₹1700/month" },
  { subjects: ["Science", "Biology"], ids: ["science", "biology"], levels: ["Middle School (Class 6–8)", "Secondary (Class 9–10)"], pkg: "₹1700/month" },
  { subjects: ["Mathematics", "English"], ids: ["mathematics", "english"], levels: ["Primary (Class 1–5)", "Middle School (Class 6–8)"], pkg: "₹1600/month" },
  { subjects: ["English", "Hindi"], ids: ["english", "hindi"], levels: ["Primary (Class 1–5)"], pkg: "₹1500/month" },
  { subjects: ["Physics", "Chemistry"], ids: ["physics", "chemistry"], levels: ["Secondary (Class 9–10)"], pkg: "₹1700/month" },
  { subjects: ["Mathematics", "Computer Science"], ids: ["mathematics", "computer-science"], levels: ["Middle School (Class 6–8)", "Secondary (Class 9–10)"], pkg: "₹1700/month" },
  { subjects: ["Social Studies", "English"], ids: ["social-studies", "english"], levels: ["Middle School (Class 6–8)"], pkg: "₹1600/month" },
  { subjects: ["Hindi", "Sanskrit"], ids: ["hindi", "sanskrit"], levels: ["Primary (Class 1–5)", "Middle School (Class 6–8)"], pkg: "₹1600/month" },
  { subjects: ["Science", "Mathematics"], ids: ["science", "mathematics"], levels: ["Primary (Class 1–5)"], pkg: "₹1500/month" },
  { subjects: ["English", "General Knowledge"], ids: ["english", "general-knowledge"], levels: ["Primary (Class 1–5)"], pkg: "₹1500/month" },
  { subjects: ["Mathematics", "Science"], ids: ["mathematics", "science"], levels: ["Secondary (Class 9–10)"], pkg: "₹1700/month" },
  { subjects: ["Physics", "Chemistry"], ids: ["physics", "chemistry"], levels: ["Secondary (Class 9–10)"], pkg: "₹1700/month" },
  { subjects: ["Biology", "Science"], ids: ["biology", "science"], levels: ["Middle School (Class 6–8)"], pkg: "₹1600/month" },
  { subjects: ["English", "Social Studies"], ids: ["english", "social-studies"], levels: ["Primary (Class 1–5)", "Middle School (Class 6–8)"], pkg: "₹1600/month" },
  { subjects: ["Computer Science", "Mathematics"], ids: ["computer-science", "mathematics"], levels: ["Middle School (Class 6–8)", "Secondary (Class 9–10)"], pkg: "₹1700/month" }
];

export const MOCK_TUTORS = TUTOR_NAMES.map((name, idx) => {
  const ratings = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
  let rating = ratings[idx % ratings.length];
  
  // Assign subjects to this tutor
  const subjectIndex1 = (idx * 3) % ALL_SUBJECTS.length;
  const subjectIndex2 = (idx * 3 + 1) % ALL_SUBJECTS.length;
  
  const tutorSubjects = [
    ALL_SUBJECTS[subjectIndex1],
    ALL_SUBJECTS[subjectIndex2]
  ];
  
  let subjectsTaughtNames = tutorSubjects.map(s => s.name);
  let subjectsTaughtIds = tutorSubjects.map(s => s.id);
  
  // Determine pricing based on subjects taught
  const primarySubject = tutorSubjects[0];
  const singleSubjectFee = primarySubject.fee;
  
  // Determine packages and class levels
  let classLevels = ["All Levels"];
  let allSubjectsPackage = "N/A";
  let interestedInTuition = false;
  
  if (idx < 15) {
    const spec = TUITION_TUTOR_SPECS[idx];
    subjectsTaughtNames = spec.subjects;
    subjectsTaughtIds = spec.ids;
    classLevels = spec.levels;
    allSubjectsPackage = spec.pkg;
    interestedInTuition = true;
    
    // Set realistic rating and experience
    rating = [4.7, 4.8, 4.9, 5.0][idx % 4];
  } else {
    if (primarySubject.category === "academics") {
      if (primarySubject.id.includes("class-1") || primarySubject.id.includes("class-2") || primarySubject.id.includes("class-3") || primarySubject.id.includes("class-4") || primarySubject.id.includes("class-5")) {
        classLevels = ["Primary (Class 1–5)"];
        allSubjectsPackage = "₹1500/month";
      } else if (primarySubject.id.includes("class-6") || primarySubject.id.includes("class-7") || primarySubject.id.includes("class-8")) {
        classLevels = ["Middle School (Class 6–8)"];
        allSubjectsPackage = "₹1600/month";
      } else if (primarySubject.id.includes("class-9") || primarySubject.id.includes("class-10")) {
        classLevels = ["Secondary (Class 9–10)"];
        allSubjectsPackage = "₹1700/month";
      } else if (primarySubject.id.includes("class-11") || primarySubject.id.includes("class-12")) {
        classLevels = ["Senior Secondary (Class 11-12)"];
        allSubjectsPackage = "₹1800/month";
      } else if (["jee-main", "jee-advanced", "neet", "cuet", "upsc", "ssc", "banking", "railways"].includes(primarySubject.id)) {
        classLevels = ["Competitive Exams"];
        allSubjectsPackage = "N/A";
      } else {
        classLevels = ["High School"];
        allSubjectsPackage = "N/A";
      }
    } else if (primarySubject.category === "skills") {
      classLevels = ["Extracurricular", "Skill Training"];
      allSubjectsPackage = "N/A";
    } else {
      classLevels = ["Innovation Hub", "Advanced AI"];
      allSubjectsPackage = "N/A";
    }
  }

  const languages = LANGUAGES_POOL[idx % LANGUAGES_POOL.length];
  const availableTimings = TIMINGS_POOL[idx % TIMINGS_POOL.length];
  const experience = idx < 15 ? `${3 + (idx % 6)} Years` : `${2 + (idx % 4)} Years`;

  return {
    id: `tutor-${idx + 1}`,
    fullName: name,
    email: `${slugify(name)}@eduearn.com`,
    avatar: `/images/tutors/tutor-${(idx % 4) + 1}.jpg`,
    bio: `Passionate tutor specializing in ${subjectsTaughtNames.join(" and ")}. Committed to professional education, mentorship, and building dynamic workflows.`,
    verificationStatus: idx % 3 === 0 ? "ai_verified" : "pending",
    aiAssessmentScore: 85 + (idx % 15),
    expertise: subjectsTaughtNames,
    subjectsTaught: subjectsTaughtNames,
    subjectsTaughtIds,
    classLevels,
    singleSubjectFee,
    allSubjectsPackage,
    languages,
    experience,
    rating,
    totalStudents: idx < 15 ? 40 + idx * 9 : 32 + (idx * 7),
    totalCourses: 2,
    approvalStatus: "published",
    availableTimings,
    earnings: 6000 + (idx * 1400),
    interestedInTuition,
    createdAt: new Date(Date.now() - 3600000 * 24 * idx).toISOString(),
  };
});

// Generate 100 Courses
export const MOCK_COURSES = Array.from({ length: 100 }).map((_, idx) => {
  // Cycle through all defined subjects
  const subjectObj = ALL_SUBJECTS[idx % ALL_SUBJECTS.length];
  
  // Pick a tutor by index
  const tutorIdx = (idx * 2) % MOCK_TUTORS.length;
  const tutor = MOCK_TUTORS[tutorIdx];
  
  const levels = ["beginner", "intermediate", "advanced", "all_levels"];
  const level = levels[idx % levels.length];
  
  const rating = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0][idx % 6];
  const courseId = `course-${idx + 1}`;
  let title = `Masterclass: ${subjectObj.name} Training`;
  if (subjectObj.id === "biology") title = "Biology Training";
  else if (subjectObj.id === "computer-science") title = "Computer Science Training";
  else if (subjectObj.id === "english") title = "Fluent English Speaking";
  else if (subjectObj.id === "economics") title = "Economics Training";
  else if (subjectObj.id === "commerce") title = "Commerce Training";
  else if (subjectObj.id === "accountancy") title = "Accountancy Training";
  else if (subjectObj.id === "python") title = "Python Programming Masterclass";
  else if (subjectObj.id === "keyboard") title = "Keyboard Beginner Essentials";
  else if (subjectObj.id === "photography") title = "DSLR Photography Masterclass";
  else if (subjectObj.id === "kuchipudi") title = "Kuchipudi Classical Dance";
  else if (subjectObj.id === "cooking") title = "Cooking Essentials & Recipes";
  else if (subjectObj.id === "chess") title = "Chess Tactics & Strategy";
  else if (subjectObj.id === "chatgpt") title = "AI Prompt Engineering Coach";
  else if (subjectObj.id === "drawing") title = "Pencil Sketching & Drawing";
  else if (subjectObj.id === "music") title = "Introduction to Music Theory";
  else if (subjectObj.id === "entrepreneurship") title = "Entrepreneurship Bootcamp";
  
  const thumbnail = getCourseThumbnail({
    subjectId: subjectObj.id,
    subjectName: subjectObj.name,
    category: subjectObj.category,
    categoryId: subjectObj.category,
    title,
  });
  
  // Fee mapping to numbers for price-filters
  let price = 500;
  if (subjectObj.fee && subjectObj.fee.includes("₹800")) price = 800;
  if (subjectObj.fee && subjectObj.fee.includes("₹1000")) price = 1000;
  if (subjectObj.fee && subjectObj.fee.includes("₹1200")) price = 1200;
  if (subjectObj.fee && subjectObj.fee.includes("₹1500")) price = 1500;

  const isFeaturedSubject = ["biology", "computer-science", "english", "commerce", "accountancy"].includes(subjectObj.id);

  const supportsProjects = ["programming", "ai-data-science", "creative-arts-design", "video-editing-animation", "photography-media"].includes(subjectObj.category);

  const curriculum = [
    {
      id: "curriculum-1",
      trigger: `Module 1: Introduction to ${subjectObj.name} (3 lessons • 45m)`,
      lessons: [
        { title: `1.1 Baseline terms and tools for ${subjectObj.name}`, duration: "15 mins", isPreview: true },
        { title: `1.2 Core concepts and architecture of ${subjectObj.name}`, duration: "20 mins", isPreview: false },
        { title: `1.3 Homework: Sandbox setup exercises`, type: "Assignment" }
      ]
    },
    {
      id: "curriculum-2",
      trigger: `Module 2: Practical Implementation (4 lessons • 1h 30m)`,
      lessons: [
        { title: `2.1 Detailed walkthrough of ${subjectObj.name}`, duration: "25 mins", isPreview: true },
        { title: `2.2 Hands-on practice session`, duration: "35 mins", isPreview: false },
        { title: `2.3 Conceptual quiz checkpoint`, type: "Quiz", questionCount: 5 }
      ]
    },
    {
      id: "curriculum-3",
      trigger: `Module 3: Advanced Optimization (3 lessons • 1h 10m)`,
      lessons: [
        { title: `3.1 Performance diagnostics and review`, duration: "25 mins", isPreview: false },
        { title: `3.2 Refactoring best practices`, duration: "30 mins", isPreview: false }
      ]
    },
    {
      id: "curriculum-4",
      trigger: supportsProjects
        ? `Module 4: Graduation Project & doubt clearance (2 lessons • 40m)`
        : `Module 4: Final Assessment & doubt clearance (2 lessons • 40m)`,
      lessons: [
        { 
          title: supportsProjects
            ? `4.1 Capstone Project: Build listed application portfolio`
            : `4.1 Final Exam: Comprehensive ${subjectObj.name} Evaluation`,
          type: supportsProjects ? "Project" : "Exam"
        },
        { title: `4.2 Live screen share clearance call Q&A`, type: "Live Session" }
      ]
    }
  ];

  const faqs = [
    {
      id: "course-faq-1",
      trigger: `Are the live screen-share clearances recorded?`,
      content: `Yes! Every live doubt session for ${subjectObj.name} is recorded and uploaded to the curriculum library within 2 hours of completion.`
    },
    {
      id: "course-faq-2",
      trigger: `What prior qualifications are needed?`,
      content: `None! This course is structured for all levels. Unit 1 covers installation steps and definitions from scratch.`
    }
  ];

  const roadmap = {
    title: `${subjectObj.name} Guided Pathway`,
    steps: [
      `Introduction to ${subjectObj.name}`,
      `Practical Implementation`,
      `Advanced Refactoring & Final Project`
    ],
    project: supportsProjects ? `Capstone Project: Build listed application portfolio` : `Final ${subjectObj.name} Assessment`
  };

  return {
    id: courseId,
    tutorId: tutor.id,
    tutorName: tutor.fullName,
    tutorAvatar: tutor.avatar,
    categoryId: subjectObj.category, // academics, skills, ai
    category: subjectObj.categoryName,
    subjectId: subjectObj.id,
    subjectName: subjectObj.name,
    title,
    description: `A comprehensive guide to learning ${subjectObj.name}. In this class you will review live examples, execute assignments, practice with our tutor, download exclusive notes, and receive a certificate.`,
    thumbnail,
    image: thumbnail,
    imageSrc: thumbnail,
    price,
    level,
    language: tutor.languages[0] || "English",
    duration: `${8 + (idx % 10)} hours`,
    lessonsCount: 12 + (idx % 15),
    status: "published",
    rating: isFeaturedSubject ? 4.9 : rating,
    studentsCount: isFeaturedSubject ? 240 + (idx * 5) : 20 + (idx * 5),
    createdAt: new Date(Date.now() - 3600000 * 24 * idx).toISOString(),
    supportsProjects,
    curriculum,
    faqs,
    roadmap,
  };
});

// Generate 500 Reviews
export const MOCK_REVIEWS = Array.from({ length: 500 }).map((_, idx) => {
  const courseIdx = idx % MOCK_COURSES.length;
  const course = MOCK_COURSES[courseIdx];
  
  const studentNames = [
    "Rahul Verma", "Sneha Roy", "Vikram Singh", "Anisha Rao", "Sameer Sen",
    "Divya Nair", "Kunal Ghosh", "Priti Hegde", "Arjun Nair", "Meera Iyer",
    "John Doe", "Jane Smith", "Bob Jones", "Alice Green", "Charlie Brown"
  ];
  const studentName = studentNames[idx % studentNames.length];
  
  const ratings = [4, 5, 5, 4, 5];
  const rating = ratings[idx % ratings.length];
  
  return {
    id: `review-${idx + 1}`,
    courseId: course.id,
    courseName: course.title,
    learnerId: `learner-${(idx % 15) + 1}`,
    authorName: studentName,
    rating,
    comment: REVIEW_COMMENTS[idx % REVIEW_COMMENTS.length],
    createdAt: new Date(Date.now() - 3600000 * idx).toISOString(),
  };
});

// Generate 30 Testimonials
export const MOCK_TESTIMONIALS = Array.from({ length: 30 }).map((_, idx) => {
  const relation = idx % 3 === 0 ? "Parent" : idx % 3 === 1 ? "Learner" : "Tutor";
  const name = TUTOR_NAMES[(idx * 2) % TUTOR_NAMES.length];
  
  const text = relation === "Parent" 
    ? `EduEarn has been a blessing. My daughter learned coding from a college student who was extremely friendly and relatable. Her school grades improved significantly!`
    : relation === "Tutor"
    ? `As an engineering student, teaching Python on EduEarn allowed me to pay my college fees while helping kids learn computational thinking. It's a wonderful circle.`
    : `I took the Chess Masterclass. The verified tutor explained endgames much better than boring textbook apps. I won my school tournament last week!`;
 
  return {
    id: `testimonial-${idx + 1}`,
    name,
    role: relation,
    text,
    avatar: relation === "Tutor" 
      ? `/images/tutors/tutor-${(idx % 4) + 1}.jpg` 
      : `/images/students/student-${(idx % 2) + 1}.jpg`,
  };
});

// Generate 20 Blog Posts
export const MOCK_BLOGS = Array.from({ length: 20 }).map((_, idx) => {
  const titles = [
    "Why Expert-Led Learning is the Future of Education",
    "Top 5 Programming Languages to Learn in 2026",
    "How Young Tutors Are Redefining Classroom Dynamics",
    "Mastering UI/UX: Figma Tips for Beginners",
    "Unlocking the Power of Prompt Engineering on Gemini",
    "A Parent's Guide to Choosing Professional Mentorship",
    "The Financial Literacy Every Indian College Student Needs",
    "How to Balance College Classes and Part-Time Tutoring",
    "5 Easy Steps to Improve Your Chess Endgame Strategies",
    "Acoustic Guitar vs Electric: Which Should You Learn First?"
  ];
  
  const title = titles[idx % titles.length] + (idx >= titles.length ? " (Pt. 2)" : "");
  
  return {
    id: `blog-${idx + 1}`,
    title,
    slug: slugify(title),
    category: idx % 2 === 0 ? "Education" : "Skills",
    content: "Tutoring by experienced practitioners breaks down traditional classroom barriers. In this article, we explore how verified tutors become excellent educators and how structured guidance accelerates learning progress.",
    author: TUTOR_NAMES[idx % TUTOR_NAMES.length],
    authorRole: "Verified Tutor",
    publishedAt: new Date(Date.now() - 3600000 * 24 * idx).toISOString(),
    thumbnail: idx % 2 === 0 ? "/images/courses/academic-education.webp" : "/images/courses/technology-programming.webp",
  };
});

// Structured Learning Paths
export const MOCK_LEARNING_PATHS = [
  {
    id: "path-1",
    title: "Full-Stack Web Developer Path",
    description: "Go from absolute beginner to building production-ready web apps.",
    coursesCount: 4,
    estimatedWeeks: 12,
    category: "programming",
  },
  {
    id: "path-2",
    title: "AI Prompt Specialist Path",
    description: "Learn Prompt Engineering, LLM integrations, and build AI agents.",
    coursesCount: 3,
    estimatedWeeks: 8,
    category: "ai-prompting",
  },
  {
    id: "path-3",
    title: "Creative Arts Master Path",
    description: "Master Graphic Design, Photography, and color grading workflows.",
    coursesCount: 3,
    estimatedWeeks: 10,
    category: "design",
  },
];

// FAQS
export const MOCK_FAQS = [
  {
    id: "faq-1",
    question: "Who can register as a tutor on EduEarn?",
    answer: "During our initial launch phase, tutor applications are open to school and college students, and young professionals aged 16–24. They must pass our AI Tutor Assessment to be verified.",
  },
  {
    id: "faq-2",
    question: "Who can join as a learner?",
    answer: "Anyone! There is absolutely no age restriction for learners. Kids, parents, college students, housewives, and working professionals are all welcome to learn on EduEarn.",
  },
  {
    id: "faq-3",
    question: "What is an AI-Verified Tutor?",
    answer: "Every tutor completes an AI assessment testing their subject knowledge, communication, and teaching style. Successful tutors receive an AI Verified Badge which is displayed on their profile.",
  },
  {
    id: "faq-4",
    question: "How do payouts work for verified tutors?",
    answer: "Students earn directly from course enrollments and live sessions. EduEarn retains a small commission, and the remaining balance is instantly credited to the tutor's wallet, withdrawable to UPI/Bank accounts.",
  },
];

// Pricing Plans
export const MOCK_PRICING_PLANS = [
  {
    name: "Academic Courses",
    price: 499,
    features: [
      "Access to all recorded video lessons",
      "Downloadable notes and study sheets",
      "Chapter-wise quizzes",
      "Doubt clearing discussion board",
      "Verified course certificate",
    ],
  },
  {
    name: "Practical Skills Bundle",
    price: 999,
    features: [
      "Everything in Academic Courses",
      "Practical project reviews by tutor",
      "Access to live group doubt sessions",
      "Discord student community access",
      "Lifetime course updates",
    ],
  },
  {
    name: "AI & Innovation Masterclass",
    price: 1999,
    features: [
      "Everything in Skills Bundle",
      "Priority 1-on-1 tutor feedback",
      "Interactive code/design review sessions",
      "Gemini API mock keys & resources",
      "Mock portfolio review",
    ],
  },
];
