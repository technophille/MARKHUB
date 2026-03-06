const dbRoleDef = {
  "role_id": "role_ai_eng",
  "role_name": "AI Engineer",
  "dimensions": {
    "core_languages": { "weight": 0.35, "skills": ["Python", "SQL", "C++"] },
    "frameworks": { "weight": 0.30, "skills": ["PyTorch", "TensorFlow", "LangChain", "HuggingFace"] },
    "infrastructure": { "weight": 0.25, "skills": ["Docker", "Kubernetes", "AWS SageMaker", "CUDA"] },
    "soft_skills": { "weight": 0.10, "skills": ["Research Synthesis", "System Design", "Communication"] }
  }
};

const aliases = {
  "tf": "TensorFlow",
  "k8s": "Kubernetes",
  "aws": "Amazon Web Services",
  "gcp": "Google Cloud Platform",
  "js": "JavaScript",
  "ts": "TypeScript",
  "reactjs": "React",
  "vuejs": "Vue",
  "k8": "Kubernetes",
  "postgres": "PostgreSQL",
  "mongo": "MongoDB",
  "llms": "Large Language Models"
};

// Extractor Output Mock (From "Python, SQL, Basic HTML")
const extractedUserSkills = ["Python", "SQL", "HTML"];

function runGapAnalysis(userSkills, dbRoleDef, aliases) {
    // Step 1 & 2: Normalize and Alias
    const normalize = (s) => aliases[s.toLowerCase().trim()]?.toLowerCase() || s.toLowerCase().trim();
    const cleanUserSkills = new Set(userSkills.map(normalize));
    
    // Step 3: Fast Check (Exact/Alias), Fallback to Fuzzy Jaccard
    function jaccardSimilarity(str1, str2) {
        const set1 = new Set(str1.split('')), set2 = new Set(str2.split(''));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    let finalScore = 0;
    const missing = [];
    const matched = [];

    // Step 4 & 5: Subtraction and Priority Scoring
    for (const [dimKey, dimData] of Object.entries(dbRoleDef.dimensions)) {
        let dimMatches = 0;
        for (const reqSkill of dimData.skills) {
            const cleanReq = normalize(reqSkill);
            
            // Exact match or fuzzy > 0.8
            const hasMatch = Array.from(cleanUserSkills).some(uSkill => 
                uSkill === cleanReq || jaccardSimilarity(uSkill, cleanReq) > 0.8
            );

            if (hasMatch) {
                matched.push(reqSkill);
                dimMatches++;
            } else {
                missing.push({ skill: reqSkill, dimension: dimKey, weight: dimData.weight });
            }
        }
        // Score = (Matches / Total in Dim) * DimWeight
        finalScore += (dimMatches / dimData.skills.length) * dimData.weight;
    }

    // Sort missing by weight (priority)
    missing.sort((a,b) => b.weight - a.weight);

    // Format output
    let status = "MAJOR_GAPS";
    let scoreInt = Math.round(finalScore * 100);
    if (scoreInt > 85) status = "ENTRY_READY";
    else if (scoreInt >= 50) status = "UPSKILL_REQUIRED";

    return {
        report_id: "gap_req_example_01",
        role_targeted: dbRoleDef.role_name,
        readiness_metrics: {
            score: scoreInt,
            status: status
        },
        matched_skills: matched,
        actionable_gaps: {
            critical: missing.filter(m => m.weight >= 0.25).map(m => m.skill),
            secondary: missing.filter(m => m.weight < 0.25).map(m => m.skill)
        }
    };
}

const report = runGapAnalysis(extractedUserSkills, dbRoleDef, aliases);
console.log(JSON.stringify(report, null, 2));
