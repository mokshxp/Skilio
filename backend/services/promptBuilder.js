const { ROLE_CONFIG } = require("../config/roleConfig");

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
Incorrect options must be things that a "weak" candidate would think are correct (common misconceptions).
A weak ${role} candidate should get 3/10. A strong one should get 10/10.

Respond ONLY with valid JSON in this exact structure:
[
  {
    "questionText": "...",
    "subject": "CN|DBMS|OS|OOP|SD",
    "topic": "...",
    "difficulty": "${difficulty}",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct_answer": "A",
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

Respond ONLY with valid JSON in this exact structure:
[
  {
    "questionText": "...",
    "subject": "System Design",
    "topic": "...",
    "difficulty": "${difficulty}",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct_answer": "A",
    "explanation": "..." 
  }
]
Do NOT include any text outside the JSON array.`;

    case "dsa":
      return `${roleContext}
Generate ONE complete DSA coding problem for a ${role} candidate.
Difficulty: ${difficulty}. Focus areas: ${config.dsaFocus.join(", ")}.

IMPORTANT: You MUST fill in EVERY field with real content. Do NOT use "..." placeholders.

Respond ONLY with this exact JSON object (no markdown, no explanation, no wrapper):
{
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "${difficulty}",
  "topic": "Arrays, HashMaps",
  "problemStatement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
  "examples": [
    { "id": 1, "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]." },
    { "id": 2, "input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]." }
  ],
  "constraints": "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9\\nOnly one valid answer exists.",
  "functionSignatures": {
    "python": "def solve(nums, target):\\n    # your code here\\n    pass",
    "javascript": "var solve = function(nums, target) {\\n    // your code here\\n};",
    "java": "class Solution {\\n    public int[] solve(int[] nums, int target) {\\n        // your code here\\n        return new int[]{};\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    vector<int> solve(vector<int>& nums, int target) {\\n        // your code here\\n        return {};\\n    }\\n};"
  },
  "test_cases": [
    { "id": 1, "input": "[2,7,11,15], 9", "expectedOutput": "[0,1]", "isVisible": true },
    { "id": 2, "input": "[3,2,4], 6", "expectedOutput": "[1,2]", "isVisible": true },
    { "id": 3, "input": "[3,3], 6", "expectedOutput": "[0,1]", "isVisible": false }
  ],
  "hints": ["Try using a hash map to store values you have seen so far.", "For each element, check if target minus that element exists in your map."],
  "timeComplexityExpected": "O(n)",
  "spaceComplexityExpected": "O(n)"
}

Replace the example above with a COMPLETELY DIFFERENT, ORIGINAL problem tailored for a ${role} role at ${difficulty} difficulty.
EVERY field must be fully filled with real, specific content following the same structure. The functionSignatures MUST have correct, runnable code stubs in all 4 languages.`;


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

    default:
      return `${roleContext}\nYou are a technical interviewer for ${role}. Ask a high-quality question.`;
  }
}

module.exports = { buildSystemPrompt };
