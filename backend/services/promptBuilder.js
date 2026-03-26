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
Generate a unique DSA coding problem that a ${role} would realistically solve. 
This should feel like a real-world problem a ${role} might encounter, not a generic, disconnected whiteboard puzzle.

Preferred role DNA focus areas for this problem: ${config.dsaFocus.join(", ")}.
Difficulty Level: ${difficulty}.

Required Output Format: Return ONLY a raw JSON object. NO preamble, NO markdown code blocks.
{
  "title": "Problem Title",
  "slug": "problem-slug",
  "difficulty": "${difficulty}",
  "topic": "Main Topic",
  "problemStatement": "Clear, detailed markdown problem statement...",
  "examples": [
    { "id": 1, "input": "...", "output": "...", "explanation": "..." }
  ],
  "constraints": "Markdown list of constraints...",
  "functionSignatures": {
    "python": "def solve(self, ...):\\n    ",
    "javascript": "var solve = function(...) {\\n    \\n};",
    "java": "public class Solution {\\n    public ... solve(...) {\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    ... solve(...) {\\n    }\\n};"
  },
  "test_cases": [
    { "id": 1, "input": "...", "expectedOutput": "...", "isVisible": true },
    { "id": 2, "input": "...", "expectedOutput": "...", "isVisible": false }
  ],
  "hints": ["Subtle hint 1", "Deeper hint 2"],
  "timeComplexityExpected": "O(...)",
  "spaceComplexityExpected": "O(...)"
}
Rule: Output ONLY the raw JSON object starting with { and ending with }.`;

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
