const { ROLE_CONFIG, APTITUDE_CONFIG } = require("../config/roleConfig");

/**
 * Builds a highly-targeted AI system prompt based on role-specific DNA.
 * 
 * @param {string} roundType - The type of interview (mcq_core, mcq_system, dsa, behavioral)
 * @param {string} role - The target role (e.g., 'ML Engineer', 'Frontend Engineer')
 * @param {string} difficulty - The interview difficulty level (beginner, intermediate, advanced, expert)
 * @param {object} resumeContext - Object containing summary and skills from the candidate's resume
 * @returns {string} The complete system instruction for the AI model
 */
function buildSystemPrompt(roundType, role, difficulty, resumeContext = {}) {
  // Normalize and find the correct role configuration, defaulting to 'Backend Engineer' or 'Full Stack Engineer'
  const normalizedRole = Object.keys(ROLE_CONFIG).find(
    k => k.toLowerCase() === (role || "").toString().toLowerCase()
  );
  const config = ROLE_CONFIG[normalizedRole] || ROLE_CONFIG["Full Stack Engineer"] || ROLE_CONFIG["Backend Engineer"];

  const safeSkills = (resumeContext.skills || []).join(", ") || "Not specified";
  const safeSummary = resumeContext.summary || "Not provided";

  const roleContext = `
You are conducting a REAL ${role} interview at a top-tier tech company (Google, Netflix, Amazon, Meta).
Context: ${config.realWorldContext}

Candidate Profile:
- Target Role: ${role}
- Experience Level: ${difficulty}
- Resume Summary: ${safeSummary}
- Key Skills: ${safeSkills}

CRITICAL: Every question must be directly relevant to the ${role} role. 
Do NOT ask generic CS questions. Ask what a real ${role} interviewer at a top-tier firm would ask.
  `;

  switch (roundType) {
    case "mcq_core":
      return `${roleContext}
Generate exactly 10 elite MCQ questions specifically for a ${role} candidate.
Focus on these topics: ${config.coreTopics.join(", ")}.
Difficulty: ${difficulty}.
Each question must have exactly 4 options (A, B, C, D) with highly plausible distractors.
Incorrect options must be things that a "weak" candidate would think are correct.

CRITICAL RANDOMIZATION RULE: The correct answer MUST be distributed randomly across A, B, C, and D.
Do NOT make A the correct answer more than 3 times out of 10.
Aim for this distribution across 10 questions: ~2-3 questions with A correct, ~2-3 with B, ~2-3 with C, ~2-3 with D.
Shuffle the options so the correct answer appears in different positions each time.

Respond ONLY with valid JSON in this exact structure:
[
  {
    "questionText": "...",
    "subject": "CN|DBMS|OS|OOP|SD",
    "topic": "...",
    "difficulty": "${difficulty}",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct_answer": "B",
    "explanation": "..." 
  }
]
Do NOT include any text outside the JSON array.`;

    case "mcq_system":
      return `${roleContext}
Generate exactly 10 elite system design MCQ questions for a ${role} candidate.
Focus on these topics: ${config.systemDesignTopics.join(", ")}.
These should test architectural thinking, trade-offs, and scalability, not just memorization.
Difficulty: ${difficulty}.

CRITICAL RANDOMIZATION RULE: The correct answer MUST be distributed randomly across A, B, C, and D.
Do NOT make A the correct answer more than 3 times out of 10.
Distribute correct answers evenly: roughly 25% each for A, B, C, D across all questions.
Shuffle the options so the correct answer lands in a different position each question.

Respond ONLY with valid JSON in this exact structure:
[
  {
    "questionText": "...",
    "subject": "System Design",
    "topic": "...",
    "difficulty": "${difficulty}",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct_answer": "C",
    "explanation": "..." 
  }
]
Do NOT include any text outside the JSON array.`;

    case "dsa":
      const leetcodeStyle = {
        beginner: { label: "Easy", style: "straightforward single data structure, one loop, obvious approach" },
        intermediate: { label: "Medium", style: "requires 2 data structures or non-obvious optimization, like two-pointer or sliding window" },
        advanced: { label: "Hard", style: "requires advanced algorithms like DP, graphs, or segment trees" },
        expert: { label: "Hard", style: "multi-concept combination, competitive programming level" },
      };
      const level = leetcodeStyle[difficulty?.toLowerCase()] || leetcodeStyle.intermediate;

      return `${roleContext}
Generate ONE complete LeetCode-style DSA problem for a ${role} candidate.
LeetCode Difficulty: ${level.label}
Problem style: ${level.style}
Role-specific focus: ${config.dsaFocus.join(", ")}

STRICT RULES:
1. The problem must be a CLASSIC algorithmic challenge — arrays, strings, trees, graphs, DP, etc.
2. It must NOT mention concurrency, OOP patterns, or system design concepts.
3. It must have a clean, self-contained problem statement like LeetCode.
4. Function stubs must be EMPTY — no implementation logic, no pre-written helper classes.
5. The title must be a short noun phrase like "Two Sum", "Valid Parentheses", "Merge Intervals".
6. Difficulty MUST match: ${level.label} means ${level.style}.

Respond ONLY with this exact JSON (no markdown, no explanation):
{
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "${level.label}",
  "topic": "Arrays, Hash Map",
  "problemStatement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  "examples": [
    { "id": 1, "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]." },
    { "id": 2, "input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "nums[1] + nums[2] = 2 + 4 = 6, so we return [1, 2]." }
  ],
  "constraints": "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9\\nOnly one valid answer exists.",
  "functionSignatures": {
    "python": "def twoSum(nums, target):\\n    # Write your solution here\\n    pass",
    "javascript": "var twoSum = function(nums, target) {\\n    // Write your solution here\\n};",
    "java": "class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        // Write your solution here\\n        return new int[]{};\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        // Write your solution here\\n        return {};\\n    }\\n};"
  },
  "test_cases": [
    { "id": 1, "input": "[2,7,11,15], 9", "expectedOutput": "[0,1]", "isVisible": true },
    { "id": 2, "input": "[3,2,4], 6", "expectedOutput": "[1,2]", "isVisible": true },
    { "id": 3, "input": "[3,3], 6", "expectedOutput": "[0,1]", "isVisible": false }
  ],
  "hints": [
    "Think about what data structure allows O(1) lookups.",
    "For each element, can you check if its complement already exists?"
  ],
  "timeComplexityExpected": "O(n)",
  "spaceComplexityExpected": "O(n)"
}

IMPORTANT: Replace the Two Sum example with a COMPLETELY DIFFERENT original problem.
The functionSignatures must have EMPTY stubs only — no implementation code whatsoever.
The problem must be ${level.label} difficulty — ${level.style}.`;


    case "behavioral":
      const behavioralFocus = config.behavioralFocus.join(", ");
      return `${roleContext}
Generate exactly 5 premium behavioral interview questions specifically for a ${role}.
Focus areas based on Role DNA:
${behavioralFocus}

Questions must be specific to ${role} day-to-day challenges and compatible with the STAR method (Situation, Task, Action, Result).
Avoid generic HR questions. Make them feel like a real ${role} panel interview.

Respond ONLY with valid JSON in this exact structure:
[
  {
    "questionText": "...",
    "topic": "...",
    "followUp": "A probing follow-up question based on the STAR method to dig deeper."
  }
]
No markdown formatting outside the JSON array.`;

    case "aptitude":
      return `
You are an aptitude test engine for a technical campus placement drive.
Candidate Role: ${role} | Difficulty: ${difficulty}

Generate exactly 20 MCQ aptitude questions — 4 questions from each of these 5 categories:
1. Alphabet Series & Sequence — letter pattern completion, find the missing term
2. Coding-Decoding — cipher/substitution patterns like "if CAT = 3120, what is DOG?"
3. Ages — age calculation word problems with ratios and time shifts
4. Partnership — profit sharing based on capital investment and time duration
5. Number Series — arithmetic, geometric, or mixed number pattern completion

Rules:
- Each question must have exactly 4 options (a, b, c, d)
- Include ONE correct answer per question
- Include a short explanation (1-2 sentences) for the correct answer
- Difficulty: ${difficulty} — ${
  difficulty === "Beginner" ? "straightforward single-step problems" :
  difficulty === "Intermediate" ? "2-3 step reasoning required" :
  "complex multi-step problems with tricky distractors"
}
- Questions must be solvable without a calculator
- Do NOT repeat question types within the same category

CRITICAL RANDOMIZATION RULE: The correct answer MUST be distributed randomly across a, b, c, and d.
Do NOT default to "a" as the correct answer. 
Out of 20 questions, each letter should appear as the correct answer roughly 5 times.
Physically place the correct answer in different option slots — don't just relabel it.

Respond ONLY with valid JSON:
{
  "questions": [
    {
      "id": 1,
      "category": "alphabet_series",
      "categoryLabel": "Alphabet Series",
      "question": "BFH, EJL, HNP, ?",
      "options": {
        "a": "JQS",
        "b": "LSU",
        "c": "KRT",
        "d": "KRS"
      },
      "correct": "c",
      "explanation": "Each group moves +3, +4 letters forward. H+3=K, N+4=R, P+4=T → KRT"
    }
  ]
}
Do NOT include any text outside the JSON object.`;

    default:
      return `${roleContext}\nYou are a technical interviewer for ${role}. Ask a high-quality question.`;
  }
}

module.exports = { buildSystemPrompt };
