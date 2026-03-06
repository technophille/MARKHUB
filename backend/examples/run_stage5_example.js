/**
 * Stage 5: Career Roadmap Generator (Simulation)
 * 
 * This script simulates the backend logic of turning a Stage 4 Gap Report
 * into a structured, phase-based Roadmap with Course Links and Portfolio Projects.
 */

// --- 1. MOCK INPUTS (From Stage 4 Gap Report) ---
const userProfile = {
    target_role: "AI Engineer",
    matched_skills: ["Python", "SQL", "HTML"],
    actionable_gaps: {
        critical: ["PyTorch", "TensorFlow", "Docker", "Kubernetes"],
        secondary: ["System Design", "C++", "Communication"]
    },
    weekly_hours: 15
};

// --- 2. STATIC DATABASE MOCKS ---
const courseCatalog = [
    { skill: "Python", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", hours: 40 },
    { skill: "PyTorch", platform: "fast.ai", url: "https://course.fast.ai/", hours: 70 },
    { skill: "TensorFlow", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/tensorflow-in-practice", hours: 60 },
    { skill: "Docker", platform: "freeCodeCamp", url: "https://youtu.be/3c-iBn73dDE", hours: 10 },
    { skill: "Kubernetes", platform: "Coursera", url: "https://www.coursera.org/learn/google-kubernetes-engine", hours: 25 },
    { skill: "System Design", platform: "Educative.io", url: "https://www.educative.io/courses/grokking-modern-system-design-interview", hours: 30 },
    { skill: "C++", platform: "Udemy", url: "https://www.udemy.com/course/free-learn-c-tutorial-beginners/", hours: 40 }
];

// Dependency Rules (Key must be learned before Value)
const DAG_RULES = {
    "Python": ["PyTorch", "TensorFlow", "System Design"],
    "Docker": ["Kubernetes"]
};

// --- 3. ROADMAP ENGINE LOGIC ---
function generateRoadmap(profile, catalog) {
    console.log(`\n--- MARKHUB AI ROADMAP GENERATOR ---`);
    console.log(`Targeting: ${profile.target_role} | Capacity: ${profile.weekly_hours} hrs/week\n`);

    // Combine critical & secondary gaps to process
    const allGaps = [...profile.actionable_gaps.critical, ...profile.actionable_gaps.secondary];

    // Hardcoded LLM Phase Simulation (usually outputted by P5-A)
    const phases = {
        "Phase 1: Foundations": [],
        "Phase 2: Core Competencies": [],
        "Phase 3: Advanced Architectures": [],
        "Phase 4: Capstone & Portfolio": []
    };

    // Very simple DAG sorting simulator into phases
    allGaps.forEach(skill => {
        // Find course logic
        const course = catalog.find(c => c.skill === skill) || {
            platform: "YouTube Search",
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`,
            hours: 20
        };

        const moduleData = {
            topic: skill,
            course_link: course.url,
            platform: course.platform,
            estimated_hours: course.hours,
            weeks_to_complete: Math.ceil(course.hours / profile.weekly_hours)
        };

        // Simplified Phase routing
        if (["C++"].includes(skill)) {
            phases["Phase 1: Foundations"].push(moduleData);
        } else if (["PyTorch", "TensorFlow"].includes(skill)) {
            phases["Phase 2: Core Competencies"].push(moduleData);
        } else if (["Docker", "Kubernetes", "System Design"].includes(skill)) {
            phases["Phase 3: Advanced Architectures"].push(moduleData);
        } else {
            // Soft skills or uncategorized go to capstone/soft skills block
            phases["Phase 4: Capstone & Portfolio"].push(moduleData);
        }
    });

    // Simulated LLM Portfolio Generator (P5-C)
    const portfolioProjects = [
        {
            name: "Sentiment Analysis API",
            tech_stack: ["Python", "FastAPI", "TensorFlow"],
            description: "A production-ready NLP endpoint deployed via Docker."
        },
        {
            name: "AI Chatbot with RAG",
            tech_stack: ["PyTorch", "System Design", "Kubernetes"],
            description: "A scalable Retrieval-Augmented Generation system architected for high traffic."
        }
    ];

    // Calculate total duration
    let totalWeeks = 0;
    Object.values(phases).forEach(phase => {
        phase.forEach(mod => totalWeeks += mod.weeks_to_complete);
    });

    // Build final output contract
    const outputJSON = {
        roadmap_id: "rm_10293_ai_eng",
        role: profile.target_role,
        total_duration_weeks: totalWeeks + 4, // Adding 4 weeks for project building
        curriculum: phases,
        capstone_projects: portfolioProjects
    };

    return outputJSON;
}

// --- 4. EXECUTION ---
const finalRoadmap = generateRoadmap(userProfile, courseCatalog);
console.log(JSON.stringify(finalRoadmap, null, 2));
