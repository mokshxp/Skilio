const { callNvidia } = require("./ai");

const APTITUDE_CATEGORIES = [
  { id: "alphabet_series", label: "Alphabet Series & Sequence" },
  { id: "coding_decoding",  label: "Coding-Decoding" },
  { id: "ages",             label: "Ages" },
  { id: "partnership",      label: "Partnership" },
  { id: "number_series",    label: "Number Series" },
];

async function generateAptitudeQuestions(difficulty) {
  const results = [];
  
  // Batch 1: run first 2 in parallel
  console.log('🚀 Starting Batch 1 (Aptitude)...');
  const batch1 = await Promise.all([
    generateCategoryQuestions(APTITUDE_CATEGORIES[0], 1,  difficulty),
    generateCategoryQuestions(APTITUDE_CATEGORIES[1], 5,  difficulty),
  ]);
  results.push(...batch1);

  // Small gap between batches to allow AI providers to breathe
  await new Promise(r => setTimeout(r, 1000));

  // Batch 2: run next 2 in parallel  
  console.log('🚀 Starting Batch 2 (Aptitude)...');
  const batch2 = await Promise.all([
    generateCategoryQuestions(APTITUDE_CATEGORIES[2], 9,  difficulty),
    generateCategoryQuestions(APTITUDE_CATEGORIES[3], 13, difficulty),
  ]);
  results.push(...batch2);

  await new Promise(r => setTimeout(r, 1000));

  // Batch 3: last one
  console.log('🚀 Starting Batch 3 (Aptitude)...');
  const batch3 = await generateCategoryQuestions(APTITUDE_CATEGORIES[4], 17, difficulty);
  results.push(batch3);

  // Flatten all 5 batches into one array of 20
  return results.flat();
}

function buildCategoryPrompt(category, startId, difficulty) {
  return `
You are an aptitude test engine for a campus placement drive.
Generate exactly 4 MCQ questions for the category: ${category.label}

MANDATORY SELF-CHECK BEFORE OUTPUT:
For EVERY question you generate, you MUST:
1. Solve the problem step by step yourself
2. Find the correct numerical/logical answer
3. Identify which option (a/b/c/d) contains that answer
4. Set "correct" to THAT option letter
5. Write the explanation showing the working that arrives at the SAME answer as "correct"
6. Double-check: does your explanation's final answer match the option labeled "correct"?
7. If they don't match — fix it before outputting

EXAMPLE OF WRONG OUTPUT (never do this):
{
  "question": "3:5:7 ratio, sum=45, what is B's age?",
  "options": { "a": "10", "b": "15", "c": "20", "d": "25" },
  "correct": "c",  ← WRONG: 5x=15 not 20
  "explanation": "B's age = 5*3 = 15 years"  ← contradicts correct field
}

EXAMPLE OF CORRECT OUTPUT:
{
  "question": "3:5:7 ratio, sum=45, what is B's age?",
  "options": { "a": "10", "b": "15", "c": "20", "d": "25" },
  "correct": "b",  ← CORRECT: matches explanation
  "explanation": "15x=45, x=3. B's age = 5x = 5*3 = 15 years"
}

Category rules:
${getCategoryRules(category.id)}

Difficulty: ${difficulty} — ${getDifficultyStyle(difficulty)}

CRITICAL RANDOMIZATION: Distribute correct answers across a, b, c, d — NOT always the same letter.

Respond ONLY with a valid JSON array of exactly 4 questions:
[
  {
    "id": ${startId},
    "category": "${category.id}",
    "categoryLabel": "${category.label}",
    "question": "...",
    "options": { "a": "...", "b": "...", "c": "...", "d": "..." },
    "correct": "b",
    "explanation": "Step by step working arriving at the same answer as correct field"
  }
]
No text outside the JSON array.`;
}

async function generateCategoryQuestions(category, startId, difficulty) {
  const prompt = buildCategoryPrompt(category, startId, difficulty);

  // ✅ Try Groq FIRST — it's faster and free
  try {
    const result = await callGroq(prompt);
    if (Array.isArray(result) && result.length > 0) {
      console.log(`✅ Groq succeeded for ${category.label} — ${result.length} questions`);
      return result;
    }
  } catch (groqErr) {
    console.warn(`⚠️ Groq failed for ${category.label}: ${groqErr.message}`);
  }

  // Fallback to NVIDIA if Groq fails
  try {
    const response = await callNvidia({
      systemInstruction: prompt,
      userContent: "Generate exactly 4 questions. Give me only the raw JSON array.",
      maxTokens: 1200,
      temperature: 0.7,
      expectJSON: true,
      rawObject: false,
      timeoutMs: 20000,
    });
    
    // Handle all possible response shapes
    let result;
    if (Array.isArray(response)) {
      result = response;
    } else if (response?.questions && Array.isArray(response.questions)) {
      result = response.questions;
    } else if (response && typeof response === 'object') {
      result = [response]; // single object fallback
    } else {
      result = [];
    }

    console.log(`✅ NVIDIA fallback succeeded for ${category.label} — ${result.length} questions`);
    return result;
  } catch (nvidiaErr) {
    console.error(`❌ Both APIs failed for ${category.label}: ${nvidiaErr.message}`);
    return [];
  }
}

async function callGroq(prompt) {
  console.log(`🔄 Calling Groq fallback...`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // free, same model as NVIDIA
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Generate now." }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: "json_object" }, // guarantees valid JSON
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error((data.error && data.error.message) || response.statusText);
    }
    
    const raw = data.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.questions || [];
  } finally {
    clearTimeout(timer);
  }
}

function getCategoryRules(categoryId) {
  const rules = {
    alphabet_series: "Letter pattern completion — find the missing term in a sequence. Example: BFH, EJL, HNP, ?",
    coding_decoding:  "Cipher/substitution patterns — if CAT = 3120, what is DOG? Use letter position, reversal, or shift patterns.",
    ages:             "Age calculation word problems with ratios and time shifts. Example: A father is 3x older than his son...",
    partnership:      "Profit sharing based on capital investment and time duration. Use ratio arithmetic.",
    number_series:    "Arithmetic, geometric, or mixed number pattern completion. Example: 2, 6, 12, 20, ?",
  };
  return rules[categoryId] || "Generate standard aptitude questions.";
}

function getDifficultyStyle(difficulty) {
  const styles = {
    beginner:     "straightforward single-step problems",
    intermediate: "2-3 step reasoning required",
    advanced:     "complex multi-step with tricky distractors",
    expert:       "competitive exam level difficulty",
  };
  return styles[difficulty?.toLowerCase()] || styles.intermediate;
}

module.exports = { generateAptitudeQuestions };
