export interface SkillItem {
  id: string;
  name: string;
  isFeatured: boolean;
  isHidden: boolean;
  orderIndex: number;
}

export interface SubCategoryItem {
  name: string;
  skills: SkillItem[];
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  status: "Enabled" | "Disabled";
  subcategories: SubCategoryItem[];
  minPrice?: number;
  recommendedPrice?: number;
  maxPrice?: number;
  platformCommission?: number;
  defaultDiscount?: number;
}

const LOCAL_STORAGE_KEY = "eduearn_marketplace_categories";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[&\s]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Initial seed data with all 14 categories, subcategories, and skills
export const SEED_CATEGORIES: MarketplaceCategory[] = [
  {
    id: "academics",
    name: "Academic Education",
    status: "Enabled",
    subcategories: [
      {
        name: "School Subjects",
        skills: [
          { id: "mathematics", name: "Mathematics", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "physics", name: "Physics", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "chemistry", name: "Chemistry", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "biology", name: "Biology", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "computer-science", name: "Computer Science", isFeatured: true, isHidden: false, orderIndex: 4 },
          { id: "english", name: "English", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "telugu", name: "Telugu", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "hindi", name: "Hindi", isFeatured: false, isHidden: false, orderIndex: 7 },
          { id: "social-studies", name: "Social Studies", isFeatured: false, isHidden: false, orderIndex: 8 },
          { id: "commerce", name: "Commerce", isFeatured: false, isHidden: false, orderIndex: 10 },
          { id: "accountancy", name: "Accountancy", isFeatured: false, isHidden: false, orderIndex: 11 }
        ]
      },
      {
        name: "Primary & Middle School",
        skills: [
          { id: "class-1", name: "Class 1", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "class-2", name: "Class 2", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "class-3", name: "Class 3", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "class-4", name: "Class 4", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "class-5", name: "Class 5", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "class-6", name: "Class 6", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "class-7", name: "Class 7", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "class-8", name: "Class 8", isFeatured: false, isHidden: false, orderIndex: 7 }
        ]
      },
      {
        name: "Secondary",
        skills: [
          { id: "class-9", name: "Class 9", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "class-10", name: "Class 10", isFeatured: false, isHidden: false, orderIndex: 1 }
        ]
      },
      {
        name: "Higher Secondary",
        skills: [
          { id: "class-11-mpc", name: "Class 11 MPC", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "class-11-bipc", name: "Class 11 BiPC", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "class-11-commerce", name: "Class 11 Commerce", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "class-12-mpc", name: "Class 12 MPC", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "class-12-bipc", name: "Class 12 BiPC", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "class-12-commerce", name: "Class 12 Commerce", isFeatured: false, isHidden: false, orderIndex: 5 }
        ]
      },
      {
        name: "Competitive Exams",
        skills: [
          { id: "jee-main", name: "JEE Main", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "jee-advanced", name: "JEE Advanced", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "neet", name: "NEET", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "upsc", name: "UPSC", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "cuet", name: "CUET", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "ssc", name: "SSC", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "banking", name: "Banking", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "railway", name: "Railway", isFeatured: false, isHidden: false, orderIndex: 7 },
          { id: "cat", name: "CAT", isFeatured: false, isHidden: false, orderIndex: 8 },
          { id: "gate", name: "GATE", isFeatured: false, isHidden: false, orderIndex: 9 },
          { id: "gre", name: "GRE", isFeatured: false, isHidden: false, orderIndex: 10 },
          { id: "ielts", name: "IELTS", isFeatured: false, isHidden: false, orderIndex: 11 },
          { id: "toefl", name: "TOEFL", isFeatured: false, isHidden: false, orderIndex: 12 }
        ]
      }
    ]
  },
  {
    id: "technology-programming",
    name: "Technology & Programming",
    status: "Enabled",
    subcategories: [
      {
        name: "Programming Languages",
        skills: [
          { id: "python", name: "Python", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "java", name: "Java", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "javascript", name: "JavaScript", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "typescript", name: "TypeScript", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "c", name: "C", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "c-plus-plus", name: "C++", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "c-sharp", name: "C#", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "php", name: "PHP", isFeatured: false, isHidden: false, orderIndex: 7 },
          { id: "go", name: "Go", isFeatured: false, isHidden: false, orderIndex: 8 },
          { id: "rust", name: "Rust", isFeatured: false, isHidden: false, orderIndex: 9 },
          { id: "swift", name: "Swift", isFeatured: false, isHidden: false, orderIndex: 10 },
          { id: "kotlin", name: "Kotlin", isFeatured: false, isHidden: false, orderIndex: 11 }
        ]
      },
      {
        name: "Web Development",
        skills: [
          { id: "html", name: "HTML", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "css", name: "CSS", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "react", name: "React", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "next-js", name: "Next.js", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "angular", name: "Angular", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "vue", name: "Vue", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "node-js", name: "Node.js", isFeatured: true, isHidden: false, orderIndex: 6 },
          { id: "express", name: "Express", isFeatured: false, isHidden: false, orderIndex: 7 }
        ]
      },
      {
        name: "Mobile Development",
        skills: [
          { id: "flutter", name: "Flutter", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "react-native", name: "React Native", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "android", name: "Android", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "ios", name: "iOS", isFeatured: false, isHidden: false, orderIndex: 3 }
        ]
      },
      {
        name: "Databases",
        skills: [
          { id: "mysql", name: "MySQL", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "postgresql", name: "PostgreSQL", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "mongodb", name: "MongoDB", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "supabase", name: "Supabase", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "firebase", name: "Firebase", isFeatured: false, isHidden: false, orderIndex: 4 }
        ]
      },
      {
        name: "Cloud",
        skills: [
          { id: "aws", name: "AWS", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "azure", name: "Azure", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "docker", name: "Docker", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "kubernetes", name: "Kubernetes", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "linux", name: "Linux", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "ci-cd", name: "CI/CD", isFeatured: false, isHidden: false, orderIndex: 5 }
        ]
      }
    ]
  },
  {
    id: "ai-data-science",
    name: "AI & Data Science",
    status: "Enabled",
    subcategories: [
      {
        name: "AI Tools",
        skills: [
          { id: "chatgpt", name: "ChatGPT", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "gemini", name: "Gemini", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "claude", name: "Claude", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "cursor-ai", name: "Cursor AI", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "github-copilot", name: "GitHub Copilot", isFeatured: false, isHidden: false, orderIndex: 4 }
        ]
      },
      {
        name: "Prompt Engineering",
        skills: [
          { id: "langchain", name: "LangChain", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "langgraph", name: "LangGraph", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "crewai", name: "CrewAI", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "rag", name: "RAG", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "prompt-engineering", name: "Prompt Engineering", isFeatured: true, isHidden: false, orderIndex: 4 }
        ]
      },
      {
        name: "Machine Learning",
        skills: [
          { id: "machine-learning", name: "Machine Learning", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "deep-learning", name: "Deep Learning", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "nlp", name: "NLP", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "computer-vision", name: "Computer Vision", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "reinforcement-learning", name: "Reinforcement Learning", isFeatured: false, isHidden: false, orderIndex: 4 }
        ]
      },
      {
        name: "Data Science",
        skills: [
          { id: "pandas", name: "Pandas", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "numpy", name: "NumPy", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "matplotlib", name: "Matplotlib", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "power-bi", name: "Power BI", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "tableau", name: "Tableau", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "excel-analytics", name: "Excel Analytics", isFeatured: true, isHidden: false, orderIndex: 5 }
        ]
      }
    ]
  },
  {
    id: "engineering-electronics",
    name: "Engineering & Electronics",
    status: "Enabled",
    subcategories: [
      {
        name: "Electronics & Communication (ECE)",
        skills: [
          { id: "embedded-systems", name: "Embedded Systems", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "iot", name: "IoT", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "robotics", name: "Robotics", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "vlsi", name: "VLSI", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "wireless-5g", name: "Wireless / 5G", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "automotive-embedded", name: "Automotive Embedded", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "dsp-audio", name: "DSP / Audio", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "edge-ai", name: "Edge AI", isFeatured: false, isHidden: false, orderIndex: 7 }
        ]
      },
      {
        name: "Electrical & Electronics (EEE)",
        skills: [
          { id: "power-systems", name: "Power Systems", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "electrical-machines", name: "Electrical Machines", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "power-electronics", name: "Power Electronics", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "renewable-energy", name: "Renewable Energy", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "ev-bms", name: "EV & BMS", isFeatured: true, isHidden: false, orderIndex: 4 },
          { id: "plc-scada", name: "PLC / SCADA", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "industrial-automation", name: "Industrial Automation", isFeatured: false, isHidden: false, orderIndex: 6 }
        ]
      }
    ]
  },
  {
    id: "creative-arts-design",
    name: "Creative Arts & Design",
    status: "Enabled",
    subcategories: [
      {
        name: "Drawing & Painting",
        skills: [
          { id: "drawing", name: "Drawing", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "painting", name: "Painting", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "sketching", name: "Sketching", isFeatured: false, isHidden: false, orderIndex: 2 }
        ]
      },
      {
        name: "Crafts",
        skills: [
          { id: "origami", name: "Origami", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "crafts", name: "Crafts", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "resin-art", name: "Resin Art", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "clay-art", name: "Clay Art", isFeatured: false, isHidden: false, orderIndex: 3 }
        ]
      },
      {
        name: "Graphic Design",
        skills: [
          { id: "canva", name: "Canva", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "photoshop", name: "Photoshop", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "illustrator", name: "Illustrator", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "logo-design", name: "Logo Design", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "poster-design", name: "Poster Design", isFeatured: false, isHidden: false, orderIndex: 4 }
        ]
      },
      {
        name: "UI/UX",
        skills: [
          { id: "figma", name: "Figma", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "adobe-xd", name: "Adobe XD", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "wireframing", name: "Wireframing", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "design-systems", name: "Design Systems", isFeatured: false, isHidden: false, orderIndex: 3 }
        ]
      }
    ]
  },
  {
    id: "video-editing-animation",
    name: "Video Editing & Animation",
    status: "Enabled",
    subcategories: [
      {
        name: "Video Editing Software",
        skills: [
          { id: "adobe-premiere-pro", name: "Adobe Premiere Pro", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "davinci-resolve", name: "DaVinci Resolve", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "capcut", name: "CapCut", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "vn", name: "VN", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "filmora", name: "Filmora", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "final-cut", name: "Final Cut", isFeatured: false, isHidden: false, orderIndex: 5 }
        ]
      },
      {
        name: "Animation & VFX",
        skills: [
          { id: "after-effects", name: "After Effects", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "motion-graphics", name: "Motion Graphics", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "2d-animation", name: "2D Animation", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "3d-animation", name: "3D Animation", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "blender", name: "Blender", isFeatured: true, isHidden: false, orderIndex: 4 },
          { id: "maya", name: "Maya", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "cinema4d", name: "Cinema4D", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "vfx", name: "VFX", isFeatured: false, isHidden: false, orderIndex: 7 }
        ]
      },
      {
        name: "Content Formats",
        skills: [
          { id: "youtube-editing", name: "YouTube Editing", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "instagram-reels", name: "Instagram Reels", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "podcast-editing", name: "Podcast Editing", isFeatured: false, isHidden: false, orderIndex: 2 }
        ]
      }
    ]
  },
  {
    id: "photography-media",
    name: "Photography & Media",
    status: "Enabled",
    subcategories: [
      {
        name: "Genres",
        skills: [
          { id: "mobile-photography", name: "Mobile Photography", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "dslr", name: "DSLR", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "portrait-photography", name: "Portrait Photography", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "product-photography", name: "Product Photography", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "wildlife-photography", name: "Wildlife Photography", isFeatured: false, isHidden: false, orderIndex: 4 }
        ]
      },
      {
        name: "Cinematography & Editing",
        skills: [
          { id: "cinematography", name: "Cinematography", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "lightroom", name: "Lightroom", isFeatured: false, isHidden: false, orderIndex: 1 }
        ]
      }
    ]
  },
  {
    id: "music",
    name: "Music",
    status: "Enabled",
    subcategories: [
      {
        name: "Instruments",
        skills: [
          { id: "keyboard", name: "Keyboard", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "piano", name: "Piano", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "guitar", name: "Guitar", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "violin", name: "Violin", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "flute", name: "Flute", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "drums", name: "Drums", isFeatured: false, isHidden: false, orderIndex: 5 }
        ]
      },
      {
        name: "Vocal & Theory",
        skills: [
          { id: "singing", name: "Singing", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "carnatic", name: "Carnatic", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "western-music", name: "Western Music", isFeatured: false, isHidden: false, orderIndex: 2 }
        ]
      },
      {
        name: "Production & Tech",
        skills: [
          { id: "music-production", name: "Music Production", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "dj-basics", name: "DJ Basics", isFeatured: false, isHidden: false, orderIndex: 1 }
        ]
      }
    ]
  },
  {
    id: "dance",
    name: "Dance",
    status: "Enabled",
    subcategories: [
      {
        name: "Classical",
        skills: [
          { id: "kuchipudi", name: "Kuchipudi", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "bharatanatyam", name: "Bharatanatyam", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "kathak", name: "Kathak", isFeatured: false, isHidden: false, orderIndex: 2 }
        ]
      },
      {
        name: "Modern",
        skills: [
          { id: "hip-hop", name: "Hip-Hop", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "contemporary", name: "Contemporary", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "western", name: "Western", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "freestyle", name: "Freestyle", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "salsa", name: "Salsa", isFeatured: true, isHidden: false, orderIndex: 4 }
        ]
      }
    ]
  },
  {
    id: "sports-fitness",
    name: "Sports & Fitness",
    status: "Enabled",
    subcategories: [
      {
        name: "Indoor Sports",
        skills: [
          { id: "chess", name: "Chess", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "carrom", name: "Carrom", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "table-tennis", name: "Table Tennis", isFeatured: false, isHidden: false, orderIndex: 2 }
        ]
      },
      {
        name: "Outdoor Sports",
        skills: [
          { id: "cricket", name: "Cricket", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "football", name: "Football", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "basketball", name: "Basketball", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "volleyball", name: "Volleyball", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "badminton", name: "Badminton", isFeatured: true, isHidden: false, orderIndex: 4 },
          { id: "tennis", name: "Tennis", isFeatured: false, isHidden: false, orderIndex: 5 }
        ]
      },
      {
        name: "Martial Arts",
        skills: [
          { id: "karate", name: "Karate", isFeatured: false, isHidden: false, orderIndex: 0 },
          { id: "taekwondo", name: "Taekwondo", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "boxing", name: "Boxing", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "self-defense", name: "Self Defense", isFeatured: true, isHidden: false, orderIndex: 3 }
        ]
      },
      {
        name: "Fitness",
        skills: [
          { id: "yoga", name: "Yoga", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "meditation", name: "Meditation", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "cardio", name: "Cardio", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "strength-training", name: "Strength Training", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "home-workout", name: "Home Workout", isFeatured: false, isHidden: false, orderIndex: 4 }
        ]
      }
    ]
  },
  {
    id: "cooking-lifestyle",
    name: "Cooking & Lifestyle",
    status: "Enabled",
    subcategories: [
      {
        name: "Cooking",
        skills: [
          { id: "cooking", name: "Cooking", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "baking", name: "Baking", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "cake-decoration", name: "Cake Decoration", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "healthy-recipes", name: "Healthy Recipes", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "nutrition", name: "Nutrition", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "meal-planning", name: "Meal Planning", isFeatured: false, isHidden: false, orderIndex: 5 }
        ]
      }
    ]
  },
  {
    id: "business-entrepreneurship",
    name: "Business & Entrepreneurship",
    status: "Enabled",
    subcategories: [
      {
        name: "Business & Finance",
        skills: [
          { id: "entrepreneurship", name: "Entrepreneurship", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "startup", name: "Startup", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "accounting", name: "Accounting", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "personal-finance", name: "Personal Finance", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "investing", name: "Investing", isFeatured: true, isHidden: false, orderIndex: 4 },
          { id: "stock-market", name: "Stock Market", isFeatured: true, isHidden: false, orderIndex: 5 },
          { id: "freelancing", name: "Freelancing", isFeatured: false, isHidden: false, orderIndex: 6 }
        ]
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing",
    status: "Enabled",
    subcategories: [
      {
        name: "Marketing Channels",
        skills: [
          { id: "seo", name: "SEO", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "google-ads", name: "Google Ads", isFeatured: false, isHidden: false, orderIndex: 1 },
          { id: "facebook-ads", name: "Facebook Ads", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "affiliate-marketing", name: "Affiliate Marketing", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "email-marketing", name: "Email Marketing", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "content-marketing", name: "Content Marketing", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "digital-marketing", name: "Digital Marketing", isFeatured: true, isHidden: false, orderIndex: 6 }
        ]
      }
    ]
  },
  {
    id: "communication",
    name: "Communication",
    status: "Enabled",
    subcategories: [
      {
        name: "Soft Skills",
        skills: [
          { id: "spoken-english", name: "Spoken English", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "public-speaking", name: "Public Speaking", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "debate", name: "Debate", isFeatured: false, isHidden: false, orderIndex: 2 },
          { id: "leadership", name: "Leadership", isFeatured: true, isHidden: false, orderIndex: 3 },
          { id: "storytelling", name: "Storytelling", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "interview-skills", name: "Interview Skills", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "personality-development", name: "Personality Development", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "anchoring", name: "Anchoring", isFeatured: false, isHidden: false, orderIndex: 7 }
        ]
      }
    ]
  },
  {
    id: "languages",
    name: "Languages",
    status: "Enabled",
    subcategories: [
      {
        name: "Spoken Languages",
        skills: [
          { id: "english", name: "English", isFeatured: true, isHidden: false, orderIndex: 0 },
          { id: "hindi", name: "Hindi", isFeatured: true, isHidden: false, orderIndex: 1 },
          { id: "telugu", name: "Telugu", isFeatured: true, isHidden: false, orderIndex: 2 },
          { id: "tamil", name: "Tamil", isFeatured: false, isHidden: false, orderIndex: 3 },
          { id: "kannada", name: "Kannada", isFeatured: false, isHidden: false, orderIndex: 4 },
          { id: "malayalam", name: "Malayalam", isFeatured: false, isHidden: false, orderIndex: 5 },
          { id: "french", name: "French", isFeatured: false, isHidden: false, orderIndex: 6 },
          { id: "german", name: "German", isFeatured: false, isHidden: false, orderIndex: 7 },
          { id: "japanese", name: "Japanese", isFeatured: false, isHidden: false, orderIndex: 8 },
          { id: "korean", name: "Korean", isFeatured: false, isHidden: false, orderIndex: 9 },
          { id: "spanish", name: "Spanish", isFeatured: false, isHidden: false, orderIndex: 10 }
        ]
      }
    ]
  }
];

export interface CategoryPricingRule {
  minPrice: number;
  recommendedPrice: number;
  maxPrice: number;
  platformCommission: number;
  defaultDiscount: number;
}

export function getDefaultPricingRule(categoryNameOrId: string): CategoryPricingRule {
  const normId = (categoryNameOrId || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const match = SEED_CATEGORIES.find((c: any) =>
    c.id === normId ||
    c.name.toLowerCase() === categoryNameOrId.toLowerCase() ||
    c.id === categoryNameOrId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );
  if (match) {
    return {
      minPrice: match.minPrice ?? 500,
      recommendedPrice: match.recommendedPrice ?? 999,
      maxPrice: match.maxPrice ?? 25000,
      platformCommission: match.platformCommission ?? 15,
      defaultDiscount: match.defaultDiscount ?? 0
    };
  }

  const norm = (categoryNameOrId || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("programming") || norm.includes("technology") || norm.includes("coding") || norm.includes("webdevelopment")) {
    return { minPrice: 1500, recommendedPrice: 1800, maxPrice: 25000, platformCommission: 16.67, defaultDiscount: 10 };
  }
  if (norm.includes("business") || norm.includes("marketing") || norm.includes("finance")) {
    return { minPrice: 1000, recommendedPrice: 1400, maxPrice: 20000, platformCommission: 14.28, defaultDiscount: 10 };
  }
  if (norm.includes("music") || norm.includes("dance")) {
    return { minPrice: 1200, recommendedPrice: 1999, maxPrice: 15000, platformCommission: 15, defaultDiscount: 15 };
  }
  if (norm.includes("creative") || norm.includes("design") || norm.includes("video") || norm.includes("art")) {
    return { minPrice: 800, recommendedPrice: 1200, maxPrice: 15000, platformCommission: 16.67, defaultDiscount: 10 };
  }
  if (norm.includes("science") || norm.includes("math") || norm.includes("academic") || norm.includes("school") || norm.includes("education")) {
    return { minPrice: 600, recommendedPrice: 900, maxPrice: 10000, platformCommission: 11.11, defaultDiscount: 0 };
  }
  return { minPrice: 500, recommendedPrice: 700, maxPrice: 8000, platformCommission: 14.28, defaultDiscount: 0 };
}

export const MarketplaceService = {
  getCategories(): MarketplaceCategory[] {
    let raw: MarketplaceCategory[] = SEED_CATEGORIES;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          raw = JSON.parse(cached);
          // Legacy alias migration: map legacy 'engineering' ID to canonical 'engineering-electronics'
          raw = raw.map((c: any) => {
            if (c.id === "engineering") {
              const engSeed = SEED_CATEGORIES.find(sc => sc.id === "engineering-electronics");
              return { ...c, id: "engineering-electronics", name: "Engineering & Electronics", subcategories: engSeed?.subcategories || c.subcategories };
            }
            return c;
          });
          const hasEngineering = raw.some((c: any) => c.id === "engineering-electronics");
          if (!hasEngineering) {
            const aiIdx = raw.findIndex((c: any) => c.id === "ai-data-science");
            const engCategory = SEED_CATEGORIES.find(c => c.id === "engineering-electronics");
            if (engCategory) {
              if (aiIdx !== -1) {
                raw.splice(aiIdx + 1, 0, engCategory);
              } else {
                raw.push(engCategory);
              }
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(raw));
            }
          }
        } catch {
          raw = SEED_CATEGORIES;
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_CATEGORIES));
      }

      // Authoritative Supabase background sync trigger
      const win = window as any;
      if (!win.__eduearn_synced_pricing) {
        win.__eduearn_synced_pricing = true;
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { BusinessRulesDb } = require("../../../lib/businessRulesDb");
          BusinessRulesDb.getCategoryRules().then((rules: any[]) => {
            const currentCached = localStorage.getItem(LOCAL_STORAGE_KEY);
            const list = currentCached ? JSON.parse(currentCached) : SEED_CATEGORIES;
            const updated = list.map((c: any) => {
              const rule = rules.find(r => r.id === c.id || r.name.toLowerCase() === c.name.toLowerCase());
              if (rule) {
                return {
                  ...c,
                  status: rule.status === "Active" ? "Enabled" : "Disabled",
                  minPrice: rule.minPrice,
                  recommendedPrice: rule.recommendedSellingPrice,
                  maxPrice: rule.maxPrice,
                  platformCommission: rule.platformCommission,
                  defaultDiscount: rule.defaultDiscount
                };
              }
              return c;
            });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            window.dispatchEvent(new Event("storage"));
          }).catch(console.error);
        } catch (err) {
          console.error("Async pull from Supabase failed:", err);
        }
      }
    }
    
    // Inject default pricing rules if missing
    return raw.map(c => {
      const defaults = getDefaultPricingRule(c.name || c.id);
      return {
        ...c,
        minPrice: c.minPrice ?? defaults.minPrice,
        recommendedPrice: c.recommendedPrice ?? defaults.recommendedPrice,
        maxPrice: c.maxPrice ?? defaults.maxPrice,
        platformCommission: c.platformCommission ?? defaults.platformCommission,
        defaultDiscount: c.defaultDiscount ?? defaults.defaultDiscount
      };
    });
  },

  saveCategories(categories: MarketplaceCategory[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    
    // Broadcast change to other windows/tabs
    window.dispatchEvent(new Event("storage"));

    // Push to Supabase asynchronously in the background
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BusinessRulesDb } = require("../../../lib/businessRulesDb");
      BusinessRulesDb.getCategoryRules().then((rules: any[]) => {
        const updatedRules = categories.map(c => {
          const existing = rules.find(r => r.id === c.id);
          const tutorBaseEarning = existing?.tutorBaseEarning ?? (c.recommendedPrice ? Math.round(c.recommendedPrice * 0.8) : 1500);
          const discountFunding = existing?.discountFunding ?? "Platform-funded";
          return {
            id: c.id,
            name: c.name,
            status: c.status === "Enabled" ? "Active" : "Inactive",
            tutorBaseEarning,
            recommendedSellingPrice: c.recommendedPrice ?? 1800,
            minPrice: c.minPrice ?? 1500,
            maxPrice: c.maxPrice ?? 25000,
            platformCommission: c.platformCommission ?? 16.67,
            defaultDiscount: c.defaultDiscount ?? 10,
            discountFunding
          };
        });
        BusinessRulesDb.saveCategoryRules(updatedRules).catch(console.error);
      }).catch(console.error);
    } catch (err) {
      console.error("Async push to Supabase failed:", err);
    }
  },

  // Category Actions
  addCategory(name: string): void {
    const list = this.getCategories();
    const id = slugify(name);
    if (list.some(c => c.id === id)) return;
    list.push({
      id,
      name,
      status: "Enabled",
      subcategories: []
    });
    this.saveCategories(list);
  },

  deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(list);
  },

  renameCategory(id: string, newName: string): void {
    const list = this.getCategories().map(c => {
      if (c.id === id) {
        return { ...c, name: newName };
      }
      return c;
    });
    this.saveCategories(list);
  },

  toggleCategory(id: string, enabled: boolean): void {
    const list = this.getCategories().map(c => {
      if (c.id === id) {
        return { ...c, status: enabled ? "Enabled" : "Disabled" } as MarketplaceCategory;
      }
      return c;
    });
    this.saveCategories(list);
  },

  // Subcategory Actions
  addSubcategory(categoryId: string, subcatName: string): void {
    const list = this.getCategories().map(c => {
      if (c.id === categoryId) {
        if (c.subcategories.some(s => s.name.toLowerCase() === subcatName.toLowerCase())) {
          return c;
        }
        return {
          ...c,
          subcategories: [...c.subcategories, { name: subcatName, skills: [] }]
        };
      }
      return c;
    });
    this.saveCategories(list);
  },

  deleteSubcategory(categoryId: string, subcatName: string): void {
    const list = this.getCategories().map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.filter(s => s.name !== subcatName)
        };
      }
      return c;
    });
    this.saveCategories(list);
  },

  // Skill Actions
  addSkill(categoryId: string, subcatName: string, skillName: string): void {
    const list = this.getCategories().map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.name === subcatName) {
              const skillId = slugify(skillName);
              if (s.skills.some(sk => sk.id === skillId)) return s;
              return {
                ...s,
                skills: [
                  ...s.skills,
                  {
                    id: skillId,
                    name: skillName,
                    isFeatured: false,
                    isHidden: false,
                    orderIndex: s.skills.length
                  }
                ]
              };
            }
            return s;
          })
        };
      }
      return c;
    });
    this.saveCategories(list);
  },

  deleteSkill(categoryId: string, subcatName: string, skillId: string): void {
    const list = this.getCategories().map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.name === subcatName) {
              return {
                ...s,
                skills: s.skills.filter(sk => sk.id !== skillId)
              };
            }
            return s;
          })
        };
      }
      return c;
    });
    this.saveCategories(list);
  },

  moveSkill(skillId: string, fromCatId: string, fromSubcatName: string, toCatId: string, toSubcatName: string): void {
    const list = this.getCategories();
    let skillToMove: SkillItem | null = null;

    // Find and remove skill
    const updatedList = list.map(c => {
      if (c.id === fromCatId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.name === fromSubcatName) {
              const found = s.skills.find(sk => sk.id === skillId);
              if (found) skillToMove = found;
              return {
                ...s,
                skills: s.skills.filter(sk => sk.id !== skillId)
              };
            }
            return s;
          })
        };
      }
      return c;
    });

    if (!skillToMove) return;

    // Add to new category/subcategory
    const finalList = updatedList.map(c => {
      if (c.id === toCatId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.name === toSubcatName) {
              if (s.skills.some(sk => sk.id === skillId)) return s;
              return {
                ...s,
                skills: [...s.skills, { ...skillToMove!, orderIndex: s.skills.length }]
              };
            }
            return s;
          })
        };
      }
      return c;
    });

    this.saveCategories(finalList);
  },

  toggleSkillFeatured(categoryId: string, subcatName: string, skillId: string, featured: boolean): void {
    const list = this.getCategories().map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.name === subcatName) {
              return {
                ...s,
                skills: s.skills.map(sk => {
                  if (sk.id === skillId) {
                    return { ...sk, isFeatured: featured };
                  }
                  return sk;
                })
              };
            }
            return s;
          })
        };
      }
      return c;
    });
    this.saveCategories(list);
  },

  toggleSkillHidden(categoryId: string, subcatName: string, skillId: string, hidden: boolean): void {
    const list = this.getCategories().map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.name === subcatName) {
              return {
                ...s,
                skills: s.skills.map(sk => {
                  if (sk.id === skillId) {
                    return { ...sk, isHidden: hidden };
                  }
                  return sk;
                })
              };
            }
            return s;
          })
        };
      }
      return c;
    });
    this.saveCategories(list);
  },

  reorderSkills(categoryId: string, subcatName: string, skillIds: string[]): void {
    const list = this.getCategories().map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.name === subcatName) {
              const reordered = skillIds.map((id, index) => {
                const existing = s.skills.find(sk => sk.id === id);
                return {
                  ...(existing || { id, name: id, isFeatured: false, isHidden: false }),
                  orderIndex: index
                };
              });
              return { ...s, skills: reordered };
            }
            return s;
          })
        };
      }
      return c;
    });
    this.saveCategories(list);
  },

  // Flattened mapping to match ALL_SUBJECTS format
  getAllSubjects(): Array<{ id: string; name: string; category: string; categoryName: string; fee?: string; package?: string }> {
    const categories = this.getCategories();
    const subjects: Array<{ id: string; name: string; category: string; categoryName: string; fee?: string; package?: string }> = [];
    
    categories.forEach(cat => {
      if (cat.status === "Disabled") return;
      cat.subcategories.forEach(sub => {
        sub.skills.forEach(skill => {
          if (skill.isHidden) return;
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
  },

  // --- MASTER DATA CRUD METHODS ---
  getLanguages(): string[] {
    if (typeof window === "undefined") return ["English", "Hindi", "Telugu", "Tamil", "Spanish", "French"];
    const saved = localStorage.getItem("eduearn_languages");
    return saved ? JSON.parse(saved) : ["English", "Hindi", "Telugu", "Tamil", "Spanish", "French"];
  },
  saveLanguages(langs: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_languages", JSON.stringify(langs));
    window.dispatchEvent(new Event("storage"));
  },

  getLevels(): string[] {
    if (typeof window === "undefined") return ["Beginner", "Intermediate", "Advanced", "All Levels"];
    const saved = localStorage.getItem("eduearn_levels");
    return saved ? JSON.parse(saved) : ["Beginner", "Intermediate", "Advanced", "All Levels"];
  },
  saveLevels(levels: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_levels", JSON.stringify(levels));
    window.dispatchEvent(new Event("storage"));
  },

  getCourseTags(): string[] {
    if (typeof window === "undefined") return ["Trending", "Best Seller", "New", "Hot", "Free", "SaaS"];
    const saved = localStorage.getItem("eduearn_course_tags");
    return saved ? JSON.parse(saved) : ["Trending", "Best Seller", "New", "Hot", "Free", "SaaS"];
  },
  saveCourseTags(tags: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_course_tags", JSON.stringify(tags));
    window.dispatchEvent(new Event("storage"));
  },

  getDifficulties(): string[] {
    if (typeof window === "undefined") return ["Easy", "Medium", "Hard"];
    const saved = localStorage.getItem("eduearn_difficulties");
    return saved ? JSON.parse(saved) : ["Easy", "Medium", "Hard"];
  },
  saveDifficulties(diffs: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_difficulties", JSON.stringify(diffs));
    window.dispatchEvent(new Event("storage"));
  },

  getCertificates(): string[] {
    if (typeof window === "undefined") return ["Completion Certificate", "Professional Certificate", "Skill Badge", "Verifiable Blockchain Certificate"];
    const saved = localStorage.getItem("eduearn_certificates");
    return saved ? JSON.parse(saved) : ["Completion Certificate", "Professional Certificate", "Skill Badge", "Verifiable Blockchain Certificate"];
  },
  saveCertificates(certs: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_certificates", JSON.stringify(certs));
    window.dispatchEvent(new Event("storage"));
  },

  getCourseTypes(): string[] {
    if (typeof window === "undefined") return ["Recorded Course", "Cohort Based", "Bootcamp", "Self-Paced"];
    const saved = localStorage.getItem("eduearn_course_types");
    return saved ? JSON.parse(saved) : ["Recorded Course", "Cohort Based", "Bootcamp", "Self-Paced"];
  },
  saveCourseTypes(types: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_course_types", JSON.stringify(types));
    window.dispatchEvent(new Event("storage"));
  },

  getLiveClassTypes(): string[] {
    if (typeof window === "undefined") return ["Q&A Session", "Mentorship", "Doubt Clearing", "Masterclass", "Live Lecture"];
    const saved = localStorage.getItem("eduearn_live_class_types");
    return saved ? JSON.parse(saved) : ["Q&A Session", "Mentorship", "Doubt Clearing", "Masterclass", "Live Lecture"];
  },
  saveLiveClassTypes(types: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_live_class_types", JSON.stringify(types));
    window.dispatchEvent(new Event("storage"));
  },

  // ─── MANAGED PLATFORM ALLOCATION ENGINE ──────────────────────────────────────
  getTutorAllocationConfig(tutorId: string) {
    if (typeof window === "undefined") return { batchSize: 25, maxCapacity: 25, currentStudents: 0, status: "Approved", payoutShare: 70 };
    const saved = localStorage.getItem(`eduearn_tutor_allocation_${tutorId}`);
    if (saved) return JSON.parse(saved);
    return {
      batchSize: 25,
      maxCapacity: 25,
      currentStudents: 14,
      status: "Approved",
      rating: 4.9,
      attendance: 98,
      completionRate: 94,
      retentionRate: 96,
      complaintRatio: 0,
      payoutShare: 70,
    };
  },

  calculateCapacityUpgrade(tutorId: string, stats: { rating: number; attendance: number; completionRate: number; retentionRate: number; complaintRatio: number }): number {
    let capacity = 25;
    if (stats.rating >= 4.5 && stats.attendance >= 90 && stats.completionRate >= 80 && stats.complaintRatio === 0) capacity = 30;
    if (stats.rating >= 4.7 && stats.attendance >= 95 && stats.completionRate >= 88 && stats.retentionRate >= 90) capacity = 35;
    if (stats.rating >= 4.8 && stats.attendance >= 97 && stats.completionRate >= 92 && stats.retentionRate >= 92) capacity = 40;
    if (stats.rating >= 4.9 && stats.attendance >= 98 && stats.completionRate >= 95 && stats.retentionRate >= 95) capacity = 45;
    if (stats.rating >= 4.95 && stats.attendance >= 99 && stats.completionRate >= 98 && stats.retentionRate >= 98) capacity = 50;

    if (typeof window !== "undefined") {
      const existing = this.getTutorAllocationConfig(tutorId);
      const updated = { ...existing, maxCapacity: capacity };
      localStorage.setItem(`eduearn_tutor_allocation_${tutorId}`, JSON.stringify(updated));
    }
    return capacity;
  }
};

export interface EcosystemEnrollment {
  id: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  status: "Waiting for Batch Assignment" | "Tutor Assigned" | "Batch Assigned" | "Schedule Generated";
  tutorName?: string;
  meetingLink?: string;
  backupMeetingLink?: string;
  attendancePercent: number;
  progressPercent: number;
  grade?: string;
  payoutStatus?: "Pending" | "Released";
}

export interface EcosystemAssignment {
  id: string;
  title: string;
  courseTitle: string;
  studentName: string;
  status: "Pending" | "Submitted" | "Graded";
  grade?: string;
  feedback?: string;
  prompt?: string;
}

export interface EcosystemSession {
  id: string;
  courseTitle: string;
  tutorName: string;
  dateTime: string;
  meetingLink: string;
}

export const EcosystemSync = {
  getEnrollments(): EcosystemEnrollment[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_eco_enrollments");
    if (saved) return JSON.parse(saved);
    const defaults: EcosystemEnrollment[] = [
      {
        id: "eco-enr-1",
        studentName: "Rahul Verma",
        courseId: "course-python",
        courseTitle: "Python Programming Masterclass",
        status: "Schedule Generated",
        tutorName: "Rahul Sharma",
        meetingLink: "https://meet.google.com/eduearn-primary-class",
        backupMeetingLink: "https://zoom.us/j/9876543210",
        attendancePercent: 95,
        progressPercent: 90,
        payoutStatus: "Pending"
      }
    ];
    localStorage.setItem("eduearn_eco_enrollments", JSON.stringify(defaults));
    return defaults;
  },

  saveEnrollments(list: EcosystemEnrollment[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_eco_enrollments", JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
  },

  getAssignments(): EcosystemAssignment[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_eco_assignments");
    if (saved) return JSON.parse(saved);
    const defaults: EcosystemAssignment[] = [
      {
        id: "eco-asg-1",
        title: "Build a Web Crawler",
        courseTitle: "Python Programming Masterclass",
        studentName: "Rahul Verma",
        status: "Submitted",
        prompt: "Write a crawler that fetches headings from a news website."
      }
    ];
    localStorage.setItem("eduearn_eco_assignments", JSON.stringify(defaults));
    return defaults;
  },

  saveAssignments(list: EcosystemAssignment[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_eco_assignments", JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
  },

  getSessions(): EcosystemSession[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_eco_sessions");
    if (saved) return JSON.parse(saved);
    const defaults: EcosystemSession[] = [
      {
        id: "eco-ses-1",
        courseTitle: "Python Programming Masterclass",
        tutorName: "Rahul Sharma",
        dateTime: "Every Mon, Wed @ 6:00 PM",
        meetingLink: "https://meet.google.com/eduearn-primary-class"
      }
    ];
    localStorage.setItem("eduearn_eco_sessions", JSON.stringify(defaults));
    return defaults;
  },

  saveSessions(list: EcosystemSession[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_eco_sessions", JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
  },

  enrollStudent(studentName: string, courseId: string, courseTitle: string) {
    const list = this.getEnrollments();
    const newEnr: EcosystemEnrollment = {
      id: `eco-enr-${Math.floor(Math.random() * 100000)}`,
      studentName,
      courseId,
      courseTitle,
      status: "Waiting for Batch Assignment",
      attendancePercent: 100,
      progressPercent: 0,
      payoutStatus: "Pending"
    };

    // Smart Allocation Engine assigns verified tutor Rahul Sharma
    newEnr.tutorName = "Rahul Sharma";
    newEnr.status = "Tutor Assigned";
    newEnr.meetingLink = "https://meet.google.com/eduearn-primary-class";
    newEnr.backupMeetingLink = "https://zoom.us/j/9876543210";
    newEnr.status = "Schedule Generated";

    list.push(newEnr);
    this.saveEnrollments(list);

    // Create corresponding sessions
    const sessions = this.getSessions();
    sessions.push({
      id: `eco-ses-${Math.floor(Math.random() * 100000)}`,
      courseTitle,
      tutorName: "Rahul Sharma",
      dateTime: "Every Mon, Wed @ 6:00 PM",
      meetingLink: "https://meet.google.com/eduearn-primary-class"
    });
    this.saveSessions(sessions);
  },

  markAttendance(enrollmentId: string, present: boolean) {
    const list = this.getEnrollments();
    const item = list.find(e => e.id === enrollmentId);
    if (item) {
      item.attendancePercent = present ? Math.min(100, item.attendancePercent + 5) : Math.max(0, item.attendancePercent - 10);
      this.saveEnrollments(list);
    }
  },

  submitAssignment(assignmentId: string, studentName: string) {
    const list = this.getAssignments();
    const item = list.find(a => a.id === assignmentId);
    if (item) {
      item.status = "Submitted";
      this.saveAssignments(list);
    }
  },

  gradeAssignment(assignmentId: string, grade: string, feedback: string) {
    const list = this.getAssignments();
    const item = list.find(a => a.id === assignmentId);
    if (item) {
      item.status = "Graded";
      item.grade = grade;
      item.feedback = feedback;
      this.saveAssignments(list);

      // Recalculate progress in enrollment
      const enrollments = this.getEnrollments();
      const enr = enrollments.find(e => e.courseTitle === item.courseTitle && e.studentName === item.studentName);
      if (enr) {
        enr.progressPercent = Math.min(100, enr.progressPercent + 10);
        this.saveEnrollments(enrollments);
      }
    }
  },

  changeBatchSchedule(sessionId: string, newDateTime: string) {
    const list = this.getSessions();
    const item = list.find(s => s.id === sessionId);
    if (item) {
      item.dateTime = newDateTime;
      this.saveSessions(list);
    }
  },

  completeBatch(enrollmentId: string) {
    const list = this.getEnrollments();
    const item = list.find(e => e.id === enrollmentId);
    if (item) {
      item.progressPercent = 100;
      item.payoutStatus = "Released";
      this.saveEnrollments(list);
    }
  }
};
