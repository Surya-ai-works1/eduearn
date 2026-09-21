-- ==============================================================================
-- 🚀 EDUEARN V1 INITIAL MARKETPLACE COURSES SEED MIGRATION
-- Created: 2026-09-16
-- Non-Destructive, Idempotent Seed Migration for public.courses
-- ==============================================================================

DO $$
DECLARE
    v_tutor_id UUID;
BEGIN
    -- 1. Try to find an existing legitimate tutor profile
    SELECT id INTO v_tutor_id FROM public.profiles WHERE role = 'tutor' LIMIT 1;

    -- 2. If no legitimate tutor profile exists, log notice and exit safely.
    -- A student/admin/auth user must NEVER be silently assigned as tutor.
    IF v_tutor_id IS NULL THEN
        RAISE NOTICE 'No legitimate tutor profile found. Skipping marketplace course seed insertion.';
        RETURN;
    END IF;

    -- --------------------------------------------------------------------------
    -- 1. TECHNOLOGY & PROGRAMMING COURSES
    -- --------------------------------------------------------------------------
    INSERT INTO public.courses (
        id, tutor_id, title, subtitle, description, category, subcategory, level, 
        price, base_price, selling_price, product_type, delivery_type, status, approval_status, duration
    ) VALUES
    (
        'a1111111-1111-4111-a111-111111111101'::uuid, v_tutor_id,
        'C Programming Fundamentals', 'Master C syntax, pointers, memory allocation, and OS primitives.',
        'Comprehensive C programming masterclass for engineering students and computer science beginners.',
        'Technology & Programming', 'Programming Languages', 'Beginner',
        1299, 1499, 1299, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '12 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111102'::uuid, v_tutor_id,
        'Python Programming Masterclass', 'From zero to advanced object-oriented Python, file I/O, and modules.',
        'Learn Python 3 for scripting, web development, automation, and data analysis.',
        'Technology & Programming', 'Programming Languages', 'All Levels',
        1399, 1699, 1399, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '16 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111103'::uuid, v_tutor_id,
        'Java Core & OOP Engineering', 'Master Core Java, Multithreading, JVM Architecture, and Collections.',
        'Production Java development course covering object-oriented design and enterprise fundamentals.',
        'Technology & Programming', 'Programming Languages', 'Intermediate',
        1799, 1999, 1799, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '18 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111104'::uuid, v_tutor_id,
        'Modern JavaScript ES6+', 'Async/Await, Closures, DOM Manipulation, and Functional JS.',
        'Deep dive into JavaScript engines, event loops, promises, and modern ES2024 features.',
        'Technology & Programming', 'Programming Languages', 'All Levels',
        1799, 1999, 1799, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '14 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111105'::uuid, v_tutor_id,
        'React & Next.js Web Engineering', 'Build fast, accessible, server-rendered React applications.',
        'Learn React hooks, state management, Server Components, and Next.js App Router.',
        'Technology & Programming', 'Web Development', 'Intermediate',
        1899, 2199, 1899, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '20 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111106'::uuid, v_tutor_id,
        'SQL & Relational Database Engineering', 'Master PostgreSQL queries, indexes, transactions, and schema design.',
        'Comprehensive relational database course covering SQL queries, joins, triggers, and optimization.',
        'Technology & Programming', 'Databases', 'Beginner',
        1399, 1699, 1399, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '12 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111107'::uuid, v_tutor_id,
        'Data Structures & Algorithms (DSA)', 'Arrays, Trees, Graphs, Dynamic Programming, and LeetCode Problem Solving.',
        'Prepare for technical interviews with rigorous coverage of data structures and algorithmic complexity.',
        'Technology & Programming', 'Programming Languages', 'Intermediate',
        2499, 2999, 2499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '24 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111108'::uuid, v_tutor_id,
        'Full Stack Development Bootcamp', 'HTML/CSS to React, Node.js, Express, and Database integration.',
        'End-to-end web engineering bootcamp building production web applications.',
        'Technology & Programming', 'Web Development', 'All Levels',
        6499, 7999, 6499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '40 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111109'::uuid, v_tutor_id,
        'Ethical Hacking & Cyber Security', 'Network scanning, vulnerability assessment, and web security fundamentals.',
        'Practical cybersecurity training covering ethical hacking tools, OWASP Top 10, and defense tactics.',
        'Technology & Programming', 'Cyber Security', 'Intermediate',
        2999, 3499, 2999, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '16 hours'
    ),

    -- --------------------------------------------------------------------------
    -- 2. AI & DATA SCIENCE COURSES
    -- --------------------------------------------------------------------------
    (
        'a1111111-1111-4111-a111-111111111110'::uuid, v_tutor_id,
        'Data Science & Python Analytics', 'Pandas, NumPy, Matplotlib, and Exploratory Data Analysis.',
        'Master data manipulation, statistical modeling, and data visualization using Python.',
        'AI & Data Science', 'Data Science', 'Beginner',
        6499, 7499, 6499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '30 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111111'::uuid, v_tutor_id,
        'Data Analytics & Business Intelligence', 'SQL, Excel dashboards, Tableau, and PowerBI analytics.',
        'Practical data analytics training for business decision making and reporting dashboards.',
        'AI & Data Science', 'Data Science', 'Beginner',
        4999, 5999, 4999, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '22 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111112'::uuid, v_tutor_id,
        'Machine Learning Specialization', 'Regression, Classification, Clustering, Scikit-Learn & Model Evaluation.',
        'In-depth machine learning training covering supervised and unsupervised learning algorithms.',
        'AI & Data Science', 'Machine Learning', 'Intermediate',
        7499, 8999, 7499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '32 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111113'::uuid, v_tutor_id,
        'AI/ML Engineering & PyTorch', 'Deep Learning Neural Networks, PyTorch, and Model Deployment.',
        'Advanced AI engineering course covering deep learning, CNNs, Transformers, and MLOps.',
        'AI & Data Science', 'Machine Learning', 'Advanced',
        8999, 10499, 8999, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '36 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111114'::uuid, v_tutor_id,
        'Generative AI & LLM Architecture', 'Prompt Engineering, RAG Pipelines, Vector Databases, and LangChain.',
        'Build production GenAI applications using Large Language Models, embeddings, and vector stores.',
        'AI & Data Science', 'Generative AI', 'Intermediate',
        8499, 9999, 8499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '28 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111115'::uuid, v_tutor_id,
        'Agentic AI & Multi-Agent Systems', 'Autonomous AI Agents, Tool Calling, CrewAI, and LangGraph Workflows.',
        'Design and deploy autonomous AI agents capable of multi-step reasoning and automated task execution.',
        'AI & Data Science', 'Generative AI', 'Advanced',
        11499, 13499, 11499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '32 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111116'::uuid, v_tutor_id,
        'ChatGPT Prompt Engineering Coach', 'Advanced prompting techniques, zero-shot, few-shot, and workflow automation.',
        'Master AI communication, custom GPT creation, and workplace productivity acceleration.',
        'AI & Data Science', 'Generative AI', 'Beginner',
        1499, 1799, 1499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '10 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111117'::uuid, v_tutor_id,
        'Claude AI & Reasoning Workflows', 'Leverage Claude for coding, long-context reasoning, and technical analysis.',
        'Practical guide to applying Anthropic Claude models for software design and data synthesis.',
        'AI & Data Science', 'Generative AI', 'All Levels',
        1499, 1799, 1499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '10 hours'
    ),

    -- --------------------------------------------------------------------------
    -- 3. ACADEMIC EDUCATION COURSES
    -- --------------------------------------------------------------------------
    (
        'a1111111-1111-4111-a111-111111111118'::uuid, v_tutor_id,
        'Mathematics Fundamentals & Problem Solving', 'Algebra, Calculus, Trigonometry, and Competitive Exam Prep.',
        'Step-by-step mathematical problem solving for secondary and higher secondary students.',
        'Academic Education', 'School Subjects', 'All Levels',
        999, 1299, 999, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '15 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111119'::uuid, v_tutor_id,
        'Physics Principles & Lab Experiments', 'Mechanics, Electromagnetism, Optics, and Modern Physics.',
        'Conceptual and numerical physics masterclass tailored for school curriculum and entrance exams.',
        'Academic Education', 'School Subjects', 'All Levels',
        999, 1299, 999, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '15 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111120'::uuid, v_tutor_id,
        'Chemistry Reactions & Lab Essentials', 'Organic, Inorganic, and Physical Chemistry fundamentals.',
        'Master chemical equations, periodic trends, and reaction mechanisms with practical guidance.',
        'Academic Education', 'School Subjects', 'All Levels',
        999, 1299, 999, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '15 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111121'::uuid, v_tutor_id,
        'Biology & Life Sciences Masterclass', 'Cell Biology, Genetics, Human Physiology, and Plant Biology.',
        'Comprehensive biology course covering foundational concepts and board exam prep.',
        'Academic Education', 'School Subjects', 'All Levels',
        999, 1299, 999, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '15 hours'
    ),

    -- --------------------------------------------------------------------------
    -- 4. CREATIVE ARTS & MEDIA COURSES
    -- --------------------------------------------------------------------------
    (
        'a1111111-1111-4111-a111-111111111122'::uuid, v_tutor_id,
        'Pencil Sketching & Drawing Essentials', 'Perspective, Shading, Anatomical Drawing, and Composition.',
        'Learn foundational sketching and drawing techniques from professional artists.',
        'Creative Arts & Design', 'Visual Arts', 'Beginner',
        799, 999, 799, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '10 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111123'::uuid, v_tutor_id,
        'DSLR Photography Masterclass', 'Exposure Triangle, Framing, Lighting Control, and Photo Editing.',
        'Master manual camera settings, portrait photography, and digital post-processing.',
        'Photography & Media', 'Photography', 'All Levels',
        1199, 1499, 1199, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '12 hours'
    ),
    (
        'a1111111-1111-4111-a111-111111111124'::uuid, v_tutor_id,
        'Video Editing & Post-Production', 'Premiere Pro, Timeline Editing, Color Grading, and Audio Mix.',
        'Professional video editing course for YouTube creators, documentary editors, and social media producers.',
        'Video Editing & Animation', 'Video Editing', 'All Levels',
        1499, 1799, 1499, 'INDIVIDUAL_COURSE', 'LIVE', 'published', 'approved', '14 hours'
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'EduEarn initial marketplace courses seeded successfully.';
END $$;
