export interface CareerPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  level: string;
  salaryRange: string;
  growth: string;
  demand: string;
  prerequisites: string;
  involves: string;
  whyCompaniesHire: string[];
  suitableFor: string[];
  readinessChecklist: string[];
  skills: { category: string; list: string[] }[];
  tools: string[];
  projects: {
    title: string;
    desc: string;
    difficulty: string;
    skills: string[];
    portfolioValue: string;
    recruiterValue: string;
  }[];
  roadmap: string[];
  opportunities: string[];
  salaryInsights: {
    entry: string;
    mid: string;
    senior: string;
  };
  recommendedKeywords: string[];
  bundle: {
    title: string;
    courses: string[];
    price: number;
    originalPrice: number;
  };
  faq: { q: string; a: string }[];
  relatedPaths: { id: string; title: string }[];
}

export const CAREER_PATHS: Record<string, CareerPath> = {
  
  "ai-engineer": {
    id: "ai-engineer",
    title: "AI Engineer",
    description: "Master Prompt Engineering, fine-tune models, and build LLM-driven agents.",
    duration: "8 Weeks",
    difficulty: "advanced",
    level: "Advanced",
    salaryRange: "₹8L - ₹24L/yr",
    growth: "+45% YoY Demand",
    demand: "9.8/10 Critical Demand",
    prerequisites: "Basic Python programming recommended, but logical reasoning is the only strict requirement.",
    involves: "AI Engineers design, develop, and integrate intelligent systems driven by Large Language Models (LLMs). This role involves orchestrating Retrieval-Augmented Generation (RAG) vector databases, fine-tuning model architectures, and building production-ready autonomous agents capable of handling complex tool-use workflows across modern business software integrations.",
    whyCompaniesHire: [
      "To automate repetitive operations and support desk tickets using AI Agents",
      "To build proprietary knowledge graphs with Retrieval-Augmented Generation (RAG)",
      "To customize and integrate Gemini and OpenAI APIs into core SaaS products",
      "To drive digital transformation, reducing operating costs while boosting output quality"
    ],
    suitableFor: [
      "Software Developers looking to specialize in generative AI",
      "College Students & Fresh Graduates aiming for cutting-edge roles",
      "Data Analysts transitioning to agentic systems engineering",
      "Working Professionals wanting to future-proof their skillsets"
    ],
    readinessChecklist: [
      "Python Scripting Fundamentals",
      "Prompt Patterns & System Prompting",
      "Vector Embeddings & Semantic Search",
      "Multi-Agent Graph Orchestration",
      "Deployment & API Optimization"
    ],
    skills: [
      { category: "Programming", list: ["Python", "TypeScript", "JSON Schema Output Tuning"] },
      { category: "AI & Prompting", list: ["Prompt Engineering Patterns", "System Prompts Design", "Model Parameter Tuning"] },
      { category: "Databases & RAG", list: ["Pinecone DB", "Supabase Vector", "Semantic Chunking"] },
      { category: "Agentic Workflows", list: ["LangChain", "LangGraph State Management", "Tool Use Orchestration"] },
      { category: "Backend", list: ["FastAPI", "ExpressJS", "RESTful Routing"] },
      { category: "Deployment", list: ["Docker", "Vercel Serverless", "Docker Containers"] },
      { category: "Soft Skills", list: ["System Architecture Design", "Technical Communication", "Agile AI Planning"] }
    ],
    tools: ["Python", "VS Code", "Git", "GitHub", "React", "FastAPI", "Docker", "Supabase", "PostgreSQL", "Gemini", "OpenAI", "LangChain", "LangGraph", "Vercel"],
    projects: [
      {
        title: "Enterprise AI Customer Assistant",
        desc: "Build a highly responsive chatbot with structured JSON responses and automated vector context retrieval.",
        difficulty: "Intermediate",
        skills: ["Gemini API", "JSON Schema", "React"],
        portfolioValue: "High - Demonstrates core LLM integration capabilities",
        recruiterValue: "Critical for modern support engineering roles"
      },
      {
        title: "Semantic Document Analyzer & Screener",
        desc: "Implement a vector-based parser that scans PDF archives and calculates compatibility matching scores.",
        difficulty: "Intermediate",
        skills: ["Pinecone DB", "NodeJS", "PDF Parsing"],
        portfolioValue: "High - Practical corporate recruitment automation utility",
        recruiterValue: "Validates backend pipeline and embedding management"
      },
      {
        title: "Multi-Agent Support Desk Assistant",
        desc: "Orchestrate dual agents that collaborate to evaluate tickets, draft responses, and call webhooks.",
        difficulty: "Advanced",
        skills: ["LangGraph", "FastAPI", "Webhooks"],
        portfolioValue: "Very High - Showcases state-of-the-art multi-agent collaboration patterns",
        recruiterValue: "Exceptional proof of production-grade agentic knowledge"
      }
    ],
    roadmap: [
      "Python Basics & API Fetching",
      "Prompt Engineering Patterns",
      "Vector DB Setup & Querying",
      "Implementing Retrieval-Augmented Generation (RAG)",
      "Orchestrating Agentic Workflows with LangGraph",
      "Deploying AI APIs to Vercel/Docker",
      "System Optimization & Interview Prep"
    ],
    opportunities: [
      "AI Engineer",
      "Machine Learning Engineer",
      "LLM Specialist",
      "Prompt Engineer",
      "AI Automation Architect"
    ],
    salaryInsights: {
      entry: "₹6,00,000 - ₹9,00,000 / year",
      mid: "₹12,00,000 - ₹18,00,000 / year",
      senior: "₹20,00,000 - ₹35,00,000+ / year"
    },
    recommendedKeywords: ["AI", "Gemini", "Prompt", "LLM", "Vector", "Agentic"],
    bundle: {
      title: "Complete AI Engineer Career Track Bundle",
      courses: [
        "Mastering Gemini API & Prompt Patterns",
        "Orchestrating Agents with LangChain & LangGraph",
        "Deploying RAG Pipelines with Supabase Vector"
      ],
      price: 5999,
      originalPrice: 12999
    },
    faq: [
      {
        q: "Is prior machine learning knowledge required?",
        a: "No, this pathway focuses on AI Engineering and LLM integration, meaning you will use existing models via API and orchestrate them. Standard web development experience is helpful."
      },
      {
        q: "Can complete beginners join?",
        a: "Yes, our recommended learning sequence starts with core Python programming before advancing to LLMs."
      },
      {
        q: "Will I receive verifiable certificates?",
        a: "Yes, you will earn an AI Prompt Specialist Certificate upon completing the courses and capstone projects."
      },
      {
        q: "Do I get live mentor support?",
        a: "Yes, our bundle includes access to weekly live doubt-clearing mentor sessions."
      }
    ],
    relatedPaths: [
      { id: "full-stack-developer", title: "Full Stack Developer" },
      { id: "ui-ux-designer", title: "UI/UX Designer" }
    ]
  },
  "full-stack-developer": {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    description: "Go from HTML basics to building complex cloud-deployed React/Node applications.",
    duration: "12 Weeks",
    difficulty: "intermediate",
    level: "Intermediate",
    salaryRange: "₹6L - ₹18L/yr",
    growth: "+32% YoY Demand",
    demand: "9.2/10 High Demand",
    prerequisites: "No programming experience required. We start from absolute scratch.",
    involves: "Full Stack Developers construct both the user-facing interfaces and backend infrastructure of web applications. This covers layout styling, responsive frameworks, server-side route systems, database relationship schemas, and cloud deployment operations.",
    whyCompaniesHire: [
      "To build responsive and secure web applications end-to-end",
      "To optimize database performance and API latency times",
      "To launch features quickly without relying on separate frontend/backend teams",
      "To design scalable SaaS cloud infrastructures"
    ],
    suitableFor: [
      "College Students seeking real-world software engineering skills",
      "Career Switchers wanting to break into the tech sector",
      "Frontend Developers aiming to learn backend database design",
      "Entrepreneurs looking to prototype their own SaaS products"
    ],
    readinessChecklist: [
      "HTML5 & CSS3 Web Layouts",
      "JavaScript & ES6+ Functions",
      "React Components & Hooks",
      "Express Restful Routing",
      "SQL Database Relations"
    ],
    skills: [
      { category: "Programming", list: ["HTML5", "CSS3", "JavaScript ES6+", "TypeScript"] },
      { category: "Frontend", list: ["ReactJS", "Next.js App Router", "Tailwind CSS"] },
      { category: "Backend", list: ["Node.js", "Express", "Prisma ORM"] },
      { category: "Databases", list: ["PostgreSQL", "SQL Relations"] },
      { category: "Deployment", list: ["Vercel", "Render", "GitHub Actions"] },
      { category: "Soft Skills", list: ["Debugging Heuristics", "Git Version Control", "Agile Scrum Workflows"] }
    ],
    tools: ["HTML5", "CSS3", "Git", "GitHub", "React", "Next.js", "Node.js", "Express", "PostgreSQL", "Vercel"],
    projects: [
      {
        title: "SaaS Subscription E-Commerce",
        desc: "Create a fully functional storefront with cart state, filtering, and mock checkout gates.",
        difficulty: "Intermediate",
        skills: ["React", "Tailwind CSS"],
        portfolioValue: "High - Demonstrates frontend state management",
        recruiterValue: "Validates complex state handling capabilities"
      },
      {
        title: "RESTful Database API",
        desc: "Construct a secure REST API with user authorization, password hashing, and structured PostgreSQL queries.",
        difficulty: "Intermediate",
        skills: ["Node.js", "Express", "PostgreSQL"],
        portfolioValue: "High - Practical database governance implementation",
        recruiterValue: "Verifies backend architecture and database security"
      }
    ],
    roadmap: [
      "Web Layout Basics (HTML/CSS)",
      "JavaScript & DOM Manipulation",
      "React Framework Core Concepts",
      "Backend API Setup with Node & Express",
      "Database Schema Design",
      "Securing APIs and Session tokens",
      "Deploying SaaS apps"
    ],
    opportunities: [
      "Frontend Developer",
      "Backend Engineer",
      "Full Stack Web Developer",
      "SaaS Developer"
    ],
    salaryInsights: {
      entry: "₹4,0,000 - ₹6,50,000 / year",
      mid: "₹8,00,000 - ₹13,00,000 / year",
      senior: "₹15,00,000 - ₹24,00,000+ / year"
    },
    recommendedKeywords: ["React", "Node", "Full Stack", "Web Development", "Database"],
    bundle: {
      title: "Full-Stack Web Developer Career Bundle",
      courses: [
        "Advanced Web App Structures",
        "SaaS Product Infrastructure"
      ],
      price: 4999,
      originalPrice: 9999
    },
    faq: [
      {
        q: "What programming languages are taught?",
        a: "The curriculum centers on JavaScript and TypeScript, applying them to both browser logic and server routing."
      },
      {
        q: "Is there a certificate?",
        a: "Yes, you receive a Full Stack Professional Developer Certificate on graduating all modules."
      }
    ],
    relatedPaths: [
      { id: "ai-engineer", title: "AI Engineer" },
      { id: "ui-ux-designer", title: "UI/UX Designer" }
    ]
  },
  "ui-ux-designer": {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    description: "Master typography, layout grids, wireframes, prototypes, and Figma Design Systems.",
    duration: "10 Weeks",
    difficulty: "beginner",
    level: "Beginner",
    salaryRange: "₹5L - ₹15L/yr",
    growth: "+28% YoY Demand",
    demand: "8.9/10 Stable Demand",
    prerequisites: "No coding or design background required. We start with visual heuristics.",
    involves: "UI/UX Designers define user journeys, test visual accessibility layouts, wireframe interface states, and construct scalable design systems in Figma.",
    whyCompaniesHire: [
      "To build intuitive products that reduce user drop-off rates",
      "To standardise visual design systems for rapid frontend implementation",
      "To conduct usability audits and identify interface bottlenecks",
      "To align visual layouts with brand values"
    ],
    suitableFor: [
      "Creatives and graphic artists wanting to break into tech",
      "Product Managers looking to prototype layout ideas themselves",
      "Frontend Developers aiming to improve their visual layouts and design sense"
    ],
    readinessChecklist: [
      "Figma Tooling & Auto-Layout",
      "Visual Hierarchy & Typography",
      "User Research & Journey Mapping",
      "Scalable Component Design Systems",
      "Usability Prototyping & Hand-off"
    ],
    skills: [
      { category: "UX Design", list: ["User Interviews", "Persona Mapping", "Information Architecture", "Wireframing"] },
      { category: "UI Design", list: ["Figma Systems", "Color & Typography Theory", "Visual Grids", "Responsive Design"] },
      { category: "Prototyping", list: ["Micro-Animations", "Interactive States", "Auto-Layout", "User Flows"] },
      { category: "Soft Skills", list: ["User Empathy", "Presentation & Feedback Pitching", "Developer Collaboration"] }
    ],
    tools: ["Figma", "Adobe Illustrator", "Prototyping Tools", "Wireframes Canvas"],
    projects: [
      {
        title: "Fintech Mobile Wallet App Design",
        desc: "Design clean layouts mapping transaction flows, balance charts, and wallet state changes.",
        difficulty: "Beginner",
        skills: ["Figma Components", "Visual Grids"],
        portfolioValue: "Medium - Core UI layout representation",
        recruiterValue: "Validates visual design capabilities"
      },
      {
        title: "SaaS Autolayout Design System",
        desc: "Construct variants, color variables, autolayout buttons, and responsive input fields.",
        difficulty: "Intermediate",
        skills: ["Auto-Layout", "Figma Variables"],
        portfolioValue: "High - Critical asset showcase for UI designers",
        recruiterValue: "Confirms technical Figma layout knowledge"
      }
    ],
    roadmap: [
      "User Experience & Auditing Theory",
      "Figma Workspace Foundations",
      "Component Variants & Autolayouts",
      "Visual Hierarchy & Dark Mode setups",
      "Usability testing interviews",
      "Portfolio preparation"
    ],
    opportunities: [
      "UI Designer",
      "UX Researcher",
      "Product Designer",
      "Interaction Designer"
    ],
    salaryInsights: {
      entry: "₹3,50,000 - ₹5,00,000 / year",
      mid: "₹7,00,000 - ₹11,00,000 / year",
      senior: "₹13,00,000 - ₹22,00,000 / year"
    },
    recommendedKeywords: ["Design", "Figma", "UI", "UX", "Product"],
    bundle: {
      title: "Complete Figma UI/UX Design System Bundle",
      courses: [
        "Figma Advanced Layout Systems",
        "Visual Interaction design"
      ],
      price: 3999,
      originalPrice: 8999
    },
    faq: [
      {
        q: "Is drawing or coding required?",
        a: "No coding is required. Drawing is not necessary; we focus on vector shapes, layout grids, and visual heuristics in Figma."
      }
    ],
    relatedPaths: [
      { id: "full-stack-developer", title: "Full Stack Developer" },
      { id: "ai-engineer", title: "AI Engineer" }
    ]
  }
};

export function getFallbackCareerPath(id: string): CareerPath {
  const cleanId = id.toLowerCase().replace(/\s+/g, "-");
  
  // Return matched pathway or generate a fallback one dynamically to prevent crashes
  if (CAREER_PATHS[cleanId]) return CAREER_PATHS[cleanId];
  
  const cleanTitle = id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    id: cleanId,
    title: cleanTitle,
    description: `Guided learning roadmap and syllabus details to become a certified ${cleanTitle} professional.`,
    duration: "10 Weeks",
    difficulty: "beginner",
    level: "Beginner",
    salaryRange: "₹4L - ₹12L/yr",
    growth: "+20% YoY Demand",
    demand: "8.0/10 Demand",
    prerequisites: "No programming experience required.",
    involves: `A structured discovery path detailing tools, projects, and career guidelines for ${cleanTitle}.`,
    whyCompaniesHire: [
      `To automate operations and drive digital value using ${cleanTitle} methods`,
      `To launch features quickly and optimize output metrics`
    ],
    suitableFor: ["Students & Fresh Graduates", "Switchers wanting a pathway details map"],
    readinessChecklist: ["Core Theory Basics", "Tooling Foundations", "Problem Solving"],
    skills: [{ category: "Core Fundamentals", list: [cleanTitle, "Methodologies", "Industry Standards"] }],
    tools: ["VS Code", "GitHub"],
    projects: [
      {
        title: "Portfolio Project",
        desc: `Build a comprehensive graduation project showcasing ${cleanTitle} skills.`,
        difficulty: "Beginner",
        skills: ["Core Methods"],
        portfolioValue: "High",
        recruiterValue: "Validates core capabilities"
      }
    ],
    roadmap: ["Core theory modules", "Interactive exercises", "Portfolio Capstone"],
    opportunities: [`${cleanTitle} Practitioner`, `Junior ${cleanTitle}`],
    salaryInsights: {
      entry: "₹3,00,000 - ₹4,50,000 / year",
      mid: "₹6,00,000 - ₹9,50,000 / year",
      senior: "₹11,00,000 - ₹18,00,000 / year"
    },
    recommendedKeywords: [cleanTitle],
    bundle: {
      title: `${cleanTitle} Starter Bundle`,
      courses: ["Introduction to Foundations"],
      price: 2999,
      originalPrice: 5999
    },
    faq: [{ q: "Are there certificates?", a: "Yes, verified certificates are issued upon successfully passing all graduation checks." }],
    relatedPaths: [
      { id: "ai-engineer", title: "AI Engineer" },
      { id: "full-stack-developer", title: "Full Stack Developer" }
    ]
  };
}
