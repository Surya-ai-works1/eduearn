export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
}

export interface MegaMenuItem {
  title: string;
  href: string;
  category: string;
  subject: string;
}

export interface MegaMenuSubCategory {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuCategory {
  id: string;
  title: string;
  subcategories: MegaMenuSubCategory[];
  items: MegaMenuItem[]; // Flat list for backward compatibility & mobile view
}

export const navigationConfig = {
  mainNav: [
    { title: "Courses", href: "/courses" },
    { title: "Tutors", href: "/tutors" },
    { title: "Live Classes", href: "/live-classes" },
    { title: "AI Features", href: "/ai-assistant" },
    { title: "Become a Tutor", href: "/tutor/onboarding" },
  ] as NavItem[],
  
  categoriesMenu: [
    {
      id: "academics",
      title: "Academic Education",
      subcategories: [
        {
          title: "School Subjects",
          items: [
            { title: "Mathematics", href: "/courses?category=academics&subject=mathematics", category: "academics", subject: "mathematics" },
            { title: "Physics", href: "/courses?category=academics&subject=physics", category: "academics", subject: "physics" },
            { title: "Chemistry", href: "/courses?category=academics&subject=chemistry", category: "academics", subject: "chemistry" },
            { title: "Computer Science", href: "/courses?category=academics&subject=computer-science", category: "academics", subject: "computer-science" },
          ],
        },
        {
          title: "Primary & Middle",
          items: [
            { title: "Class 1", href: "/courses?category=academics&subject=class-1", category: "academics", subject: "class-1" },
            { title: "Class 2", href: "/courses?category=academics&subject=class-2", category: "academics", subject: "class-2" },
            { title: "Class 3", href: "/courses?category=academics&subject=class-3", category: "academics", subject: "class-3" },
            { title: "Class 4", href: "/courses?category=academics&subject=class-4", category: "academics", subject: "class-4" },
            { title: "Class 5", href: "/courses?category=academics&subject=class-5", category: "academics", subject: "class-5" },
            { title: "Class 6", href: "/courses?category=academics&subject=class-6", category: "academics", subject: "class-6" },
            { title: "Class 7", href: "/courses?category=academics&subject=class-7", category: "academics", subject: "class-7" },
            { title: "Class 8", href: "/courses?category=academics&subject=class-8", category: "academics", subject: "class-8" },
          ],
        },
        {
          title: "Secondary & Sr. Secondary",
          items: [
            { title: "Class 9", href: "/courses?category=academics&subject=class-9", category: "academics", subject: "class-9" },
            { title: "Class 10", href: "/courses?category=academics&subject=class-10", category: "academics", subject: "class-10" },
            { title: "Class 11 MPC", href: "/courses?category=academics&subject=class-11-mpc", category: "academics", subject: "class-11-mpc" },
            { title: "Class 11 BiPC", href: "/courses?category=academics&subject=class-11-bipc", category: "academics", subject: "class-11-bipc" },
            { title: "Class 11 Commerce", href: "/courses?category=academics&subject=class-11-commerce", category: "academics", subject: "class-11-commerce" },
            { title: "Class 12 MPC", href: "/courses?category=academics&subject=class-12-mpc", category: "academics", subject: "class-12-mpc" },
            { title: "Class 12 BiPC", href: "/courses?category=academics&subject=class-12-bipc", category: "academics", subject: "class-12-bipc" },
            { title: "Class 12 Commerce", href: "/courses?category=academics&subject=class-12-commerce", category: "academics", subject: "class-12-commerce" },
          ],
        },
        {
          title: "Competitive Exams",
          items: [
            { title: "JEE Main", href: "/courses?category=academics&subject=jee-main", category: "academics", subject: "jee-main" },
            { title: "JEE Advanced", href: "/courses?category=academics&subject=jee-advanced", category: "academics", subject: "jee-advanced" },
            { title: "NEET", href: "/courses?category=academics&subject=neet", category: "academics", subject: "neet" },
            { title: "CUET", href: "/courses?category=academics&subject=cuet", category: "academics", subject: "cuet" },
            { title: "UPSC", href: "/courses?category=academics&subject=upsc", category: "academics", subject: "upsc" },
            { title: "SSC", href: "/courses?category=academics&subject=ssc", category: "academics", subject: "ssc" },
            { title: "Banking", href: "/courses?category=academics&subject=banking", category: "academics", subject: "banking" },
            { title: "Railways", href: "/courses?category=academics&subject=railways", category: "academics", subject: "railways" },
          ],
        },
        {
          title: "Languages",
          items: [
            { title: "English", href: "/courses?category=academics&subject=english", category: "academics", subject: "english" },
            { title: "Hindi", href: "/courses?category=academics&subject=hindi", category: "academics", subject: "hindi" },
            { title: "Telugu", href: "/courses?category=academics&subject=telugu", category: "academics", subject: "telugu" },
            { title: "Tamil", href: "/courses?category=academics&subject=tamil", category: "academics", subject: "tamil" },
            { title: "Kannada", href: "/courses?category=academics&subject=kannada", category: "academics", subject: "kannada" },
            { title: "French", href: "/courses?category=academics&subject=french", category: "academics", subject: "french" },
            { title: "German", href: "/courses?category=academics&subject=german", category: "academics", subject: "german" },
            { title: "Japanese", href: "/courses?category=academics&subject=japanese", category: "academics", subject: "japanese" },
          ],
        },
      ],
      items: [
        { title: "Mathematics", href: "/courses?category=academics&subject=mathematics", category: "academics", subject: "mathematics" },
        { title: "Physics", href: "/courses?category=academics&subject=physics", category: "academics", subject: "physics" },
        { title: "Chemistry", href: "/courses?category=academics&subject=chemistry", category: "academics", subject: "chemistry" },
        { title: "Computer Science", href: "/courses?category=academics&subject=computer-science", category: "academics", subject: "computer-science" },
      ],
    },
    {
      id: "skills",
      title: "Skills & Extracurriculars",
      subcategories: [
        {
          title: "Programming & Coding",
          items: [
            { title: "Web Development", href: "/courses?category=skills&subject=web-development", category: "skills", subject: "web-development" },
            { title: "Python", href: "/courses?category=skills&subject=python", category: "skills", subject: "python" },
            { title: "Java", href: "/courses?category=skills&subject=java", category: "skills", subject: "java" },
            { title: "C++", href: "/courses?category=skills&subject=c-plus-plus", category: "skills", subject: "c-plus-plus" },
            { title: "JavaScript", href: "/courses?category=skills&subject=javascript", category: "skills", subject: "javascript" },
            { title: "React", href: "/courses?category=skills&subject=react", category: "skills", subject: "react" },
            { title: "Next.js", href: "/courses?category=skills&subject=next-js", category: "skills", subject: "next-js" },
            { title: "Node.js", href: "/courses?category=skills&subject=node-js", category: "skills", subject: "node-js" },
            { title: "AI & Machine Learning", href: "/courses?category=skills&subject=ai-ml", category: "skills", subject: "ai-ml" },
          ],
        },
        {
          title: "Creative",
          items: [
            { title: "Drawing", href: "/courses?category=skills&subject=drawing", category: "skills", subject: "drawing" },
            { title: "Painting", href: "/courses?category=skills&subject=painting", category: "skills", subject: "painting" },
            { title: "Sketching", href: "/courses?category=skills&subject=sketching", category: "skills", subject: "sketching" },
            { title: "Crafts", href: "/courses?category=skills&subject=crafts", category: "skills", subject: "crafts" },
          ],
        },
        {
          title: "Music",
          items: [
            { title: "Keyboard", href: "/courses?category=skills&subject=keyboard", category: "skills", subject: "keyboard" },
            { title: "Guitar", href: "/courses?category=skills&subject=guitar", category: "skills", subject: "guitar" },
            { title: "Piano", href: "/courses?category=skills&subject=piano", category: "skills", subject: "piano" },
            { title: "Violin", href: "/courses?category=skills&subject=violin", category: "skills", subject: "violin" },
            { title: "Flute", href: "/courses?category=skills&subject=flute", category: "skills", subject: "flute" },
            { title: "Singing", href: "/courses?category=skills&subject=singing", category: "skills", subject: "singing" },
          ],
        },
        {
          title: "Dance",
          items: [
            { title: "Kuchipudi", href: "/courses?category=skills&subject=kuchipudi", category: "skills", subject: "kuchipudi" },
            { title: "Bharatanatyam", href: "/courses?category=skills&subject=bharatanatyam", category: "skills", subject: "bharatanatyam" },
            { title: "Hip-Hop", href: "/courses?category=skills&subject=hip-hop", category: "skills", subject: "hip-hop" },
            { title: "Western", href: "/courses?category=skills&subject=western", category: "skills", subject: "western" },
            { title: "Classical", href: "/courses?category=skills&subject=classical", category: "skills", subject: "classical" },
          ],
        },
        {
          title: "Lifestyle & Fitness",
          items: [
            { title: "Photography", href: "/courses?category=skills&subject=photography", category: "skills", subject: "photography" },
            { title: "Videography", href: "/courses?category=skills&subject=videography", category: "skills", subject: "videography" },
            { title: "Public Speaking", href: "/courses?category=skills&subject=public-speaking", category: "skills", subject: "public-speaking" },
            { title: "Chess", href: "/courses?category=skills&subject=chess", category: "skills", subject: "chess" },
            { title: "Yoga", href: "/courses?category=skills&subject=yoga", category: "skills", subject: "yoga" },
            { title: "Fitness", href: "/courses?category=skills&subject=fitness", category: "skills", subject: "fitness" },
            { title: "Cooking", href: "/courses?category=skills&subject=cooking", category: "skills", subject: "cooking" },
            { title: "Baking", href: "/courses?category=skills&subject=baking", category: "skills", subject: "baking" },
          ],
        },
      ],
      items: [
        { title: "Programming", href: "/courses?category=skills&subject=programming", category: "skills", subject: "programming" },
        { title: "UI/UX Design", href: "/courses?category=skills&subject=ui-ux", category: "skills", subject: "ui-ux" },
        { title: "Music", href: "/courses?category=skills&subject=music", category: "skills", subject: "music" },
        { title: "Chess", href: "/courses?category=skills&subject=chess", category: "skills", subject: "chess" },
        { title: "Photography", href: "/courses?category=skills&subject=photography", category: "skills", subject: "photography" },
      ],
    },
    {
      id: "ai",
      title: "AI & Innovation",
      subcategories: [
        {
          title: "AI Prompt Engineering",
          items: [
            { title: "ChatGPT", href: "/courses?category=ai&subject=chatgpt", category: "ai", subject: "chatgpt" },
            { title: "Gemini", href: "/courses?category=ai&subject=gemini", category: "ai", subject: "gemini" },
            { title: "Claude", href: "/courses?category=ai&subject=claude", category: "ai", subject: "claude" },
            { title: "Cursor AI", href: "/courses?category=ai&subject=cursor-ai", category: "ai", subject: "cursor-ai" },
          ],
        },
        {
          title: "Machine Learning & Data",
          items: [
            { title: "Deep Learning", href: "/courses?category=ai&subject=deep-learning", category: "ai", subject: "deep-learning" },
            { title: "Computer Vision", href: "/courses?category=ai&subject=computer-vision", category: "ai", subject: "computer-vision" },
            { title: "NLP", href: "/courses?category=ai&subject=nlp", category: "ai", subject: "nlp" },
          ],
        },
        {
          title: "Robotics & Hardware",
          items: [
            { title: "Arduino", href: "/courses?category=ai&subject=arduino", category: "ai", subject: "arduino" },
            { title: "IoT", href: "/courses?category=ai&subject=iot", category: "ai", subject: "iot" },
            { title: "Drone Technology", href: "/courses?category=ai&subject=drone-technology", category: "ai", subject: "drone-technology" },
          ],
        },
      ],
      items: [
        { title: "AI Prompt Engineering", href: "/courses?category=ai&subject=prompt-engineering", category: "ai", subject: "prompt-engineering" },
        { title: "Machine Learning", href: "/courses?category=ai&subject=machine-learning", category: "ai", subject: "machine-learning" },
        { title: "Robotics", href: "/courses?category=ai&subject=robotics", category: "ai", subject: "robotics" },
      ],
    },
  ] as MegaMenuCategory[],

  footerNav: {
    company: [
      { title: "About Us", href: "/about" },
      { title: "Careers", href: "/careers" },
      { title: "Contact", href: "/contact" },
      { title: "Press Kit", href: "/press" },
    ],
    courses: [
      { title: "Academic Courses", href: "/courses?category=academics" },
      { title: "Skills Courses", href: "/courses?category=skills" },
      { title: "AI Verified Tutors", href: "/tutors" },
      { title: "Recorded Lessons", href: "/courses" },
    ],
    support: [
      { title: "Help Center", href: "/help" },
      { title: "Community Forum", href: "/forum" },
      { title: "Tutor Support", href: "/tutor-support" },
      { title: "Safety Guidelines", href: "/safety" },
    ],
    legal: [
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Cookie Settings", href: "/cookies" },
      { title: "Refund Policy", href: "/refunds" },
    ],
  },
};
