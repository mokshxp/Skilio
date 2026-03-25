const axios = require("axios");
const {
  generateMCQBatch,
  generateDSAProblemBatch,
  generateHRBatch,
  evaluateHRAnswer,
  evaluateCode
} = require("../services/ai");
const supabase = require("../config/db");
const { apiLogger, securityLogger } = require("../services/logger");
const subscriptionService = require("../services/subscriptionService");

// Helper: get structured resume data
async function getResumeData(userId, resumeId) {
  if (!resumeId) return null;
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("id, primary_role, skills, experience_years, summary")
      .eq("user_id", userId)
      .eq("id", resumeId)
      .maybeSingle(); // maybeSingle is safer than single() for non-existent rows
    if (error) console.error("[getResumeData] Error:", error);
    return data || null;
  } catch (err) {
    console.error("[getResumeData] Exception:", err);
    return null;
  }
}

// ──────────────────────────────────────────────────
//  V2 — Start Interview
//  POST /api/interview/start
// ──────────────────────────────────────────────────
// ── Helper: Sanitize UUID ──────────────────────────────────────
function sanitizeUUID(value) {
  if (!value) return null;
  if (typeof value !== 'string') return null;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value.trim())) return null;
  
  return value.trim();
}

// ── Helper: Sanitize Question with fallbacks ────────────────────
function sanitizeQuestion(aiQuestion, roundNumber, defaultDifficulty = 'intermediate') {
  return {
    interview_id: aiQuestion.interview_id,
    round_number: roundNumber,
    question_type: aiQuestion.round_type || aiQuestion.question_type || 'mcq',
    question_text: aiQuestion.questionText 
      || aiQuestion.question_text 
      || aiQuestion.question 
      || 'Question text missing',
    subject: aiQuestion.subject || aiQuestion.topic || 'CS',
    topic: aiQuestion.topic || aiQuestion.subject || 'General',
    difficulty: (aiQuestion.difficulty || defaultDifficulty).toLowerCase().trim(),
    options: aiQuestion.options || {},
    correct_answer: aiQuestion.correctAnswer || aiQuestion.correct_answer || 'A',
    explanation: aiQuestion.explanation || aiQuestion.explanation_text || ''
  };
}

// ── Main Start Interview Controller ──────────────────────────
exports.startInterview = async (req, res) => {
  const log = (step, data) => {
    const msg = `[Interview Start] ${step} ${data ? JSON.stringify(data) : ''}`;
    apiLogger.info(msg);
    console.log(msg);
  };

  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authData?.userId;
    log('1. Auth check', { userId: userId ? 'found' : 'MISSING' });

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No userId found' });
    }

    // ── SUBSCRIPTION GATING ── 
    const canStart = await subscriptionService.checkCanStartInterview(userId);
    if (!canStart.allowed) {
      return res.status(403).json({ 
        error: "Quota Exceeded", 
        message: canStart.reason,
        upgradeRequired: canStart.upgradeRequired 
      });
    }

    const body = req.body || {};
    log('2. Raw body received', body);

    const roundType = (body.round || body.roundType || 'mixed').toLowerCase().trim();
    const canAccessRound = await subscriptionService.canAccessRoundType(userId, roundType);
    if (!canAccessRound) {
       return res.status(403).json({ 
         error: "Feature Locked", 
         message: `${roundType.toUpperCase()} rounds require a Pro plan subscription.`,
         upgradeRequired: 'pro'
       });
    }

    // FIX A: Handle alias fields (role/targetRole, round/roundType)
    const targetRole = (body.role || body.targetRole || 'Software Engineer').trim();
    // roundType already declared above for subscription check
    const difficulty = (body.difficulty || 'intermediate').toLowerCase().trim();
    const totalRounds = Number(body.totalRounds || body.total_rounds) || 5;
    const resumeId = sanitizeUUID(body.resumeId);

    log('3. Sanitized values', { resumeId, difficulty, roundType, targetRole, totalRounds });

    const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    const validRoundTypes = ['technical', 'coding', 'behavioural', 'mixed'];

    if (!validDifficulties.includes(difficulty)) {
      log('4. VALIDATION FAILED (difficulty)', difficulty);
      return res.status(400).json({ error: `Invalid difficulty: "${difficulty}". Must be one of: ${validDifficulties.join(', ')}` });
    }
    if (!validRoundTypes.includes(roundType)) {
      log('4. VALIDATION FAILED (roundType)', roundType);
      return res.status(400).json({ error: `Invalid roundType: "${roundType}". Must be one of: ${validRoundTypes.join(', ')}` });
    }

    // 5. Fetch resume context (optional)
    let resumeContext = null;
    let resumeData = null;
    if (resumeId) {
      log('5. Fetching resume...', { resumeId });
      resumeData = await getResumeData(userId, resumeId);
      if (resumeData) {
        resumeContext = {
          summary: resumeData.summary,
          skills: resumeData.skills,
          role: resumeData.primary_role,
          experience: resumeData.experience_years
        };
        log('5. Resume found', { role: resumeData.primary_role });
      } else {
        log('5. Resume not found or error (continuing without it)');
      }
    }

    // 6. Create interview record
    log('6. Inserting interview row...');
    const interviewData = {
      user_id: userId,
      resume_id: resumeId, // null or valid UUID
      target_role: targetRole,
      difficulty: difficulty,
      type: roundType,
      status: "active",
      current_round: 1,
      total_rounds: totalRounds,
      resume_context: resumeContext
    };

    const { data: interview, error: intErr } = await supabase
      .from("interviews")
      .insert(interviewData)
      .select("id, target_role, difficulty, type, total_rounds, current_round")
      .single();

    if (intErr) {
      console.error('[DATABASE ERROR] Start Interview Insert Failed:', intErr);
      log('6. INTERVIEW INSERT FAILED', {
        message: intErr.message,
        code: intErr.code,
        details: intErr.details,
        hint: intErr.hint,
        data: interviewData
      });
      return res.status(400).json({ 
        error: "Database failed to create session", 
        message: intErr.message,
        code: intErr.code,
        details: intErr.details
      });
    }
    log('6. Interview created', { id: interview.id });

    // 7. Generate questions via AI
    log('7. Generating questions via AI...');
    let questions;
    try {
      questions = await generateMCQBatch({
        targetRole,
        skills: resumeData?.skills || [],
        experienceYears: resumeData?.experience_years || 0,
        difficulty,
        roundNumber: 1
      });
      log('7. AI questions generated', { count: questions?.length });
    } catch (aiError) {
      log('7. AI GENERATION FAILED', aiError.message);
      await supabase.from("interviews").delete().eq("id", interview.id);
      return res.status(500).json({ error: "AI failed to generate question array", detail: aiError.message });
    }

    // FIX 4: Normalize to array (Handled in generateMCQBatch usually, but let's be safe here)
    if (!Array.isArray(questions)) {
       log('8. NORMALIZING AI RESPONSE (not an array)', questions);
       if (questions && typeof questions === 'object') {
         if (Array.isArray(questions.questions)) questions = questions.questions;
         else questions = [questions];
       } else {
         log('8. PARSE FAILED - questions is null or not object');
         await supabase.from("interviews").delete().eq("id", interview.id);
         return res.status(500).json({ error: "AI returned unparseable response" });
       }
    }

    // 9. Save questions with fallbacks
    log('9. Saving questions to DB...');
    const questionsToInsert = questions.map(q => ({
      ...sanitizeQuestion(q, 1, difficulty),
      interview_id: interview.id
    }));

    const { data: savedQuestions, error: qErr } = await supabase
      .from("interview_questions")
      .insert(questionsToInsert)
      .select("id, round_number, question_type, question_text, subject, topic, difficulty, options, explanation");

    if (qErr) {
      log('9. QUESTIONS INSERT FAILED', {
        error: qErr.message,
        code: qErr.code,
        details: qErr.details,
        hint: qErr.hint,
        firstAttempt: questionsToInsert[0]
      });
      await supabase.from("interviews").delete().eq("id", interview.id);
      return res.status(400).json({ error: "Database failed to save questions", detail: qErr });
    }
    log('9. Questions saved', { count: savedQuestions.length });

    // 10. Success response
    log('10. SUCCESS! Returning response');
    res.status(201).json({
      interviewId: interview.id,
      session: interview,
      round: {
        roundNumber: 1,
        roundType: "mcq",
        title: "Aptitude & Core CS",
        description: "10 multiple choice questions",
        timeLimit: 600,
        questions: savedQuestions
      }
    });

  } catch (err) {
    log('11. UNHANDLED ERROR', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────────
//  V2 — Round Complete
//  POST /api/interview/round/complete
// ──────────────────────────────────────────────────
exports.completeRound = async (req, res) => {
  try {
    const interviewId = req.body.interviewId?.toString().replace('sess_', '');
    const { responses } = req.body;
    const roundNumber = parseInt(req.body.roundNumber);
    
    console.log(`[CompleteRound] Round ${roundNumber} finished. Progressing to ${roundNumber + 1}`);
    const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

    // 1. Verify access
    const { data: interview } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .eq("user_id", userId)
      .single();

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const rNum = parseInt(roundNumber);
    const { data: qData, error: qFetchError } = await supabase
      .from("interview_questions")
      .select("id, correct_answer, options")
      .eq("interview_id", interviewId)
      .eq("round_number", rNum);

    if (qFetchError) throw qFetchError;

    const questionMap = (qData || []).reduce((acc, q) => {
      acc[q.id] = { correct: q.correct_answer, options: q.options };
      return acc;
    }, {});

    // 3. Save responses and calculate correct count
    let correctCount = 0;
    const responsesToInsert = (responses || []).map(r => {
      const qInfo = questionMap[r.questionId];
      if (!qInfo) return null; // Should not happen

      const dbCorrectValue = String(qInfo.correct || '').trim();
      const userSelected = String(r.selectedOption || r.answer || '').trim();
      
      // Verification logic:
      // Case 1: Direct match (e.g. "A" === "A" or "Paris" === "Paris")
      let isCorrect = (dbCorrectValue.toUpperCase() === userSelected.toUpperCase());

      // Case 2: User sent key (A), but DB has value ("Paris")
      if (!isCorrect && qInfo.options) {
          const valFromOption = String(qInfo.options[userSelected] || '').trim();
          if (valFromOption && valFromOption.toUpperCase() === dbCorrectValue.toUpperCase()) {
              isCorrect = true;
          }
      }

      // Case 3: User sent value ("Paris"), but DB has key (A)
      if (!isCorrect && qInfo.options) {
          // Find key for the value
          const keyForValue = Object.keys(qInfo.options).find(k => 
              String(qInfo.options[k] || '').trim().toUpperCase() === userSelected.toUpperCase()
          );
          if (keyForValue && keyForValue.toUpperCase() === dbCorrectValue.toUpperCase()) {
              isCorrect = true;
          }
      }
      
      if (isCorrect) correctCount++;
      
      console.log(`- Q: ${r.questionId} Found: ${dbCorrectValue} User: ${userSelected} Result: ${isCorrect}`);

      return {
        interview_id: interviewId,
        question_id: r.questionId,
        round_number: roundNumber,
        selected_option: userSelected,
        user_answer: r.answer || r.selectedOption,
        time_taken_seconds: r.timeTaken || 0,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0
      };
    }).filter(Boolean);

    if (responsesToInsert.length > 0) {
      await supabase.from("interview_responses").insert(responsesToInsert);
    }

    // 4. Calculate final score
    const totalCount = responsesToInsert.length || 1;
    const score = (correctCount / totalCount) * 10;

    // 5. Create Round Summary
    const { data: summary } = await supabase
      .from("interview_round_summaries")
      .insert({
        interview_id: interviewId,
        round_number: roundNumber,
        round_type: roundNumber === 1 ? 'mcq' : (roundNumber <= 4 ? 'dsa' : 'hr'),
        score: score,
        correct_count: correctCount,
        total_count: totalCount,
        ai_summary: `Scored ${correctCount}/${totalCount} in Round ${roundNumber}.`
      })
      .select()
      .single();

    // 5. Check if complete
    if (roundNumber >= interview.total_rounds) {
      await supabase.from("interviews").update({ status: "completed", completed_at: new Date() }).eq("id", interviewId);
      return res.json({ roundSummary: summary, isComplete: true });
    }

    // 6. Generate Next Round
    const nextRoundNumber = roundNumber + 1;
    let nextRoundQuestions = [];
    let savedNextQs = [];
    let nextRoundType = '';

    if (nextRoundNumber === 2 || nextRoundNumber === 3 || nextRoundNumber === 4) {
      nextRoundType = 'dsa';
      nextRoundQuestions = await generateDSAProblemBatch({
        targetRole: interview.target_role,
        difficulty: nextRoundNumber === 2 ? 'easy' : (nextRoundNumber === 3 ? 'medium' : 'hard'),
        roundNumber: nextRoundNumber
      });
      console.log('[DSA DEBUG] title:', nextRoundQuestions?.title);
      console.log('[DSA DEBUG] type:', Array.isArray(nextRoundQuestions) ? 'ARRAY (bad)' : 'OBJECT (good)');
    } else if (nextRoundNumber === 5) {
      nextRoundType = 'hr';
      nextRoundQuestions = await generateHRBatch({
        targetRole: interview.target_role,
        experienceYears: interview.resume_context?.experience || 0
      });
    }

    // 7. Process questions into the new schema
    const questionsArr = Array.isArray(nextRoundQuestions) ? nextRoundQuestions : [nextRoundQuestions];
    for (const q of questionsArr) {
      if (nextRoundType === 'dsa') {
        // A. Upsert to base question bank
        const slug = q.slug || q.question_slug || (q.title ? q.title.toLowerCase().replace(/\s+/g, '-') : 'problem');
        const { data: baseQ, error: baseErr } = await supabase
          .from("dsa_questions")
          .upsert({
            title: q.title || q.topic || "Coding Challenge",
            slug: slug,
            topic: q.topic || "Algorithms",
            difficulty: nextRoundNumber === 2 ? 'easy' : (nextRoundNumber === 3 ? 'medium' : 'hard'),
            base_description: q.problemStatement || q.questionText || q.question_text || "",
            constraints: Array.isArray(q.constraints) ? q.constraints : [q.constraints],
            created_at: new Date()
          }, { onConflict: 'slug' })
          .select()
          .single();

        if (baseQ) {
          // B. Insert into session questions with AI variation
          await supabase.from("session_questions").insert({
            session_id: interviewId,
            question_id: baseQ.id,
            ai_variation: q, // full AI JSON
            test_cases: q.test_cases || q.testCases || null,
            difficulty: baseQ.difficulty,
            order_index: 1
          });
        }
      }

      // Also keep interview_questions for backward compatibility/unified MCQ flow
      let nextQsInsert = {
        interview_id: interviewId,
        round_number: nextRoundNumber,
        question_type: nextRoundType === 'dsa' ? 'coding' : nextRoundType,
        difficulty: q.difficulty || interview.difficulty,
        topic: q.topic || q.title || q.subject || null,
      };

      if (nextRoundType === 'dsa') {
        Object.assign(nextQsInsert, {
          question_text: q.title || "Coding Challenge",
          slug: q.slug || q.question_slug || null,
          subject: 'DSA',
          problem_statement: q.problemStatement || q.question_text || "",
          function_signatures: q.functionSignatures || q.function_signature || null,
          examples: q.examples || null,
          test_cases: q.test_cases || q.testCases || null,
          hints: q.hints || null,
          constraints: q.constraints || null,
          time_complexity_expected: q.timeComplexityExpected || null,
          space_complexity_expected: q.spaceComplexityExpected || null,
        });
      } else {
        Object.assign(nextQsInsert, {
          question_text: q.questionText || q.question_text || "",
          options: q.options || null,
          correct_answer: q.correct_answer || q.correctAnswer || null,
          explanation: q.explanation || null,
        });
      }

      const { data: insData, error: insErr } = await supabase.from("interview_questions").insert([nextQsInsert]).select();
      if (insErr) {
        console.error("❌ [V2] Failed to insert interview_question:", insErr);
        // If we can't save the questions, we should NOT move the interview round forward
        // However, we're already halfway through. We'll return the error later.
      } else {
        console.log(`✅ [V2] Inserted Round ${nextRoundNumber} questions for session ${interviewId}`);
        // Add to our return list if select() didn't return them for some reason
        if (savedNextQs.length === 0 && insData) savedNextQs.push(...insData);
      }
    }

    // Double check we have them
    if (savedNextQs.length === 0) {
       console.log("⚠️ [V2] No questions found for next round. Re-fetching...");
       const { data: refetch } = await supabase
        .from("interview_questions")
        .select("*")
        .eq("interview_id", interviewId)
        .eq("round_number", nextRoundNumber);
       if (refetch) savedNextQs.push(...refetch);
    }

    // Since we kept interview_questions, we can still fetch from it for now, 
    // but the session_questions is now being populated too.
    const { data: fetchedNextQs } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("interview_id", interviewId)
      .eq("round_number", nextRoundNumber);
    if (fetchedNextQs) savedNextQs = fetchedNextQs; // Assign to the already declared variable

    // 8. Update interview current round
    await supabase.from("interviews").update({ current_round: nextRoundNumber }).eq("id", interviewId);

    res.json({
      roundSummary: summary,
      nextRound: {
        roundNumber: nextRoundNumber,
        roundType: nextRoundType,
        questions: savedNextQs
      },
      isComplete: false
    });

  } catch (err) {
    console.error("[V2 Complete Round]", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Internal Helper: Execute on Piston ───────────────────────
const executeOnPiston = async (code, language, stdin = "") => {
  try {
    const PISTON_URL = "https://emkc.org/api/v2/piston/execute";
    // Map project names to Piston language keys
    const langMap = {
      'python': { language: 'python', version: '3.10.0' },
      'javascript': { language: 'javascript', version: '18.15.0' },
      'js': { language: 'javascript', version: '18.15.0' },
      'java': { language: 'java', version: '15.0.2' },
      'cpp': { language: 'cpp', version: '10.2.0' },
      'c++': { language: 'cpp', version: '10.2.0' },
    };

    const selectedLang = langMap[language.toLowerCase()] || langMap['python'];
    console.log("[PISTON REQUEST]", { 
      language: selectedLang.language, 
      version: selectedLang.version, 
      hasCode: !!code 
    });

    const payload = {
      language: selectedLang.language,
      version: selectedLang.version,
      files: [{ content: code }],
      stdin: stdin
    };

    console.log("FINAL PAYLOAD:", payload);

    const response = await axios.post(PISTON_URL, payload, {
      headers: {} // clears any defaults to avoid 401
    });
    console.log(`[PISTON] Response status: ${response.status}`);
    return response.data.run; // { stdout, stderr, code, signal, output }
  } catch (err) {
    console.error("[PISTON_ERROR]", err.message);
    return { stdout: "", stderr: "Execution engine failed", code: 1 };
  }
};

// ── Internal Helper: Wrap user code with test harness ───────
const wrapCodeWithHarness = (code, language, input) => {
  // AI sometimes puts labels like 's = "..."'. Strip them.
  let cleanInput = String(input || "").replace(/^[a-zA-Z0-9_]+\s*=\s*/, "").trim();
  
  // If it's a string not wrapped in quotes, wrap it for JSON
  if (cleanInput.startsWith('"') && !cleanInput.endsWith('"')) cleanInput += '"';
  if (!cleanInput.startsWith('"') && !cleanInput.startsWith('[') && !cleanInput.startsWith('{') && isNaN(cleanInput)) {
      cleanInput = `"${cleanInput}"`;
  }

  if (language === 'python' || language === 'python3') {
    return `${code}\n\n# --- SMART DRIVER ---\nimport json\nimport types\ntry:\n    # Discovery: Find the first function defined in the user's code scope\n    func = globals().get('solve') or globals().get('solution')\n    if not func:\n        candidate_funcs = [v for k, v in globals().items() if isinstance(v, types.FunctionType) and k not in ['json', 'sys', 'types']]\n        if candidate_funcs: func = candidate_funcs[-1]\n\n    if func:\n        result = func(*json.loads('[${cleanInput}]'))\n        print(json.dumps(result))\n    else:\n        pass\nexcept Exception as e:\n    import sys\n    sys.stderr.write(str(e))\n    sys.exit(1)`;
  }
  if (language === 'javascript' || language === 'js') {
    return `${code}\n\n// --- SMART DRIVER ---\ntry {\n    let fn = (typeof solve === 'function') ? solve : (typeof solution === 'function' ? solution : null);\n    if (!fn) {\n        const keys = Object.keys(global).filter(k => typeof global[k] === 'function' && !['setTimeout', 'setInterval', 'console'].includes(k));\n        if (keys.length > 0) fn = global[keys[keys.length-1]];\n    }\n    if (fn) {\n        const result = fn(...JSON.parse('[${cleanInput}]'));\n        console.log(result !== undefined ? JSON.stringify(result) : "INTERNAL_NULL_RETURN");\n    }\n} catch (e) {\n    console.error(e.message);\n    process.exit(1);\n}`;
  }
  if (language === 'java') {
      // Find method name from code
      const match = code.match(/(?:public|private|int|String|List|void)\s+([a-zA-Z0-9_]+)\s*\(/);
      const methodName = match ? match[1] : "solve";
      return `import java.util.*;\nimport java.util.stream.*;\n${code}\n\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            Solution sol = new Solution();\n            // This is a naive but common driver for DSA\n            System.out.println(sol.${methodName}(args[0]));\n        } catch(Exception e) {\n            System.out.println("INTERNAL_NULL_RETURN");\n        }\n    }\n}`;
  }
  return code;
};

// ── Shared Helper: Strict Comparison ───────
const compareResults = (rawOutput, rawExpected) => {
    const out = String(rawOutput || "").trim();
    const exp = String(rawExpected || "").trim();

    if (!out || out === "INTERNAL_NULL_RETURN") {
        return exp === "" || exp === "null";
    }

    try {
        if ((out.startsWith('[') || out.startsWith('{')) && (exp.startsWith('[') || exp.startsWith('{'))) {
            return JSON.stringify(JSON.parse(out)) === JSON.stringify(JSON.parse(exp));
        }
    } catch (e) {}

    return out === exp;
};

// ──────────────────────────────────────────────────
//  V2 — DSA Submit
//  POST /api/interview/dsa/submit
// ──────────────────────────────────────────────────
exports.submitDSA = async (req, res) => {
  try {
    const interviewId = req.body.interviewId?.toString().replace('sess_', '');
    const { questionId, roundNumber, code, language } = req.body;
    
    // 1. Fetch test cases
    const { data: question } = await supabase
        .from("interview_questions")
        .select("question_text, test_cases")
        .eq("id", questionId)
        .single();

    if (!question) return res.status(404).json({ error: "Question not found" });

    // 2. Execute against ALL test cases in parallel
    const testCases = question.test_cases || [];
    const executionPromises = testCases.map(async (tc) => {
        const harnessedCode = wrapCodeWithHarness(code, language, tc.input);
        const result = await executeOnPiston(harnessedCode, language);
        
        // Normalize results
        const rawOutput = result.stdout.trim();
        const rawExpected = String(tc.expectedOutput || tc.expected || "").trim();
        const passed = compareResults(rawOutput, rawExpected);

        return {
            id: tc.id,
            input: tc.input,
            expected: rawExpected,
            got: rawOutput || (result.stderr ? "ERROR" : "NULL"),
            passed: passed && result.code === 0,
            runtime: "40ms", 
            stderr: result.stderr
        };
    });

    const testResults = await Promise.all(executionPromises);

    // 3. AI Evaluation
    let aiEval = await evaluateCode({
      problem: question.question_text,
      code,
      language
    });
    
    if (Array.isArray(aiEval)) aiEval = aiEval[0];

    // 4. Save response to both NEW and OLD tables
    await supabase.from("interview_responses").insert({
      interview_id: interviewId,
      question_id: questionId,
      round_number: roundNumber,
      code_solution: code,
      language: language,
      test_results: testResults,
      is_correct: testResults.every(r => r.passed),
      score: (testResults.filter(r => r.passed).length / testResults.length) * 10,
      ai_feedback: aiEval.feedback,
      improvements: aiEval.improvements
    });

    // question_attempts (New Schema)
    const { data: sessionQ } = await supabase.from("session_questions").select("question_id").eq("session_id", interviewId).limit(1).maybeSingle();
    const baseQuestionId = sessionQ?.question_id;

    await supabase.from("question_attempts").insert({
      session_id: interviewId,
      question_id: baseQuestionId || questionId,
      user_code: code,
      language: language,
      test_results: testResults,
      passed_cases: testResults.filter(r => r.passed).length,
      total_cases: testResults.length,
      time_complexity: aiEval.runtime_estimate || aiEval.timeComplexity || "O(N)",
      space_complexity: aiEval.space_complexity || aiEval.spaceComplexity || "O(1)",
      ai_feedback: aiEval.feedback,
      score: Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100),
      submitted_at: new Date()
    });

    res.json({
      testResults,
      passed: testResults.filter(r => r.passed).length,
      total: testResults.length,
      allPassed: testResults.every(r => r.passed),
      aiEvaluation: {
        score: testResults.every(r => r.passed) ? (aiEval.score / 10) : ((testResults.filter(r => r.passed).length / testResults.length) * 10),
        timeComplexity: aiEval.runtime_estimate || aiEval.timeComplexity,
        spaceComplexity: aiEval.space_complexity || aiEval.spaceComplexity,
        feedback: aiEval.feedback,
        improvements: aiEval.improvements
      }
    });

  } catch (err) {
    console.error("[V2 DSA Submit]", err);
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────────
//  V2 — DSA Run (Dry Run)
//  POST /api/interview/dsa/run
// ──────────────────────────────────────────────────
exports.runDSA = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    
    // 1. Fetch visible test cases
    const { data: question } = await supabase
      .from("interview_questions")
      .select("question_text, test_cases")
      .eq("id", questionId)
      .single();

    const visibleTCs = (question.test_cases || []).filter(tc => tc.isVisible !== false).slice(0, 3);
    
    // 2. Execute on Piston
    const executionPromises = visibleTCs.map(async (tc) => {
        const harnessedCode = wrapCodeWithHarness(code, language, tc.input);
        const result = await executeOnPiston(harnessedCode, language);
        
        const rawOutput = result.stdout.trim();
        const rawExpected = String(tc.expectedOutput || tc.expected || "").trim();
        const passed = compareResults(rawOutput, rawExpected);
        
        return {
            id: tc.id,
            input: tc.input,
            expected: rawExpected,
            got: rawOutput || (result.stderr ? result.stderr : "NULL"),
            passed: passed && result.code === 0,
            runtime: "30ms",
            logs: result.stderr
        };
    });

    const testResults = await Promise.all(executionPromises);

    res.json({
      testResults,
      passed: testResults.filter(r => r.passed).length,
      total: testResults.length
    });

  } catch (err) {
    console.error("[V2 DSA Run]", err);
    res.status(500).json({ message: err.message });
  }
};


// ──────────────────────────────────────────────────
//  V2 — Get Session
//  GET /api/interview/session/[id]
// ──────────────────────────────────────────────────
exports.getSession = async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authData?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cleanId = req.params.id.replace('sess_', '');
    
    const { data: session } = await supabase
      .from("interviews")
      .select("*, interview_questions(*), interview_responses(*), interview_round_summaries(*)")
      .eq("id", cleanId)
      .eq("user_id", userId)
      .single();

    if (!session) return res.status(404).json({ message: "Session not found" });

    // --- SELF HEALING LOGIC ---
    // If we're at a round that should have questions, but they're missing, generate them on the fly.
    const currentRoundNum = session.current_round;
    const currentRoundQs = (session.interview_questions || []).filter(q => q.round_number === currentRoundNum);
    
    if (session.status === 'active' && currentRoundQs.length === 0 && currentRoundNum > 1 && currentRoundNum < 6) {
       console.log(`🛠️ [Self-Heal] Missing questions for Round ${currentRoundNum}. Generating...`);
       
       let nextRoundQuestions = [];
       if (currentRoundNum >= 2 && currentRoundNum <= 4) {
          nextRoundQuestions = await generateDSAProblemBatch({
             targetRole: session.target_role,
             difficulty: currentRoundNum === 2 ? 'easy' : (currentRoundNum === 3 ? 'medium' : 'hard'),
             roundNumber: currentRoundNum
          });
          console.log('[DSA DEBUG] title:', nextRoundQuestions?.title);
          console.log('[DSA DEBUG] type:', Array.isArray(nextRoundQuestions) ? 'ARRAY (bad)' : 'OBJECT (good)');
       } else if (currentRoundNum === 5) {
          nextRoundQuestions = await generateHRBatch({ 
             role: session.target_role, 
             difficulty: session.difficulty || 'intermediate' 
          });
       }

       if (nextRoundQuestions) {
          const questionsArr = Array.isArray(nextRoundQuestions) ? nextRoundQuestions : [nextRoundQuestions];
          for (const q of questionsArr) {
             const nextQsInsert = {
                interview_id: session.id,
                round_number: currentRoundNum,
                question_type: currentRoundNum === 5 ? 'hr' : 'coding',
                difficulty: q.difficulty || session.difficulty,
                topic: q.topic || q.title || (currentRoundNum === 5 ? 'Behavioral' : 'DSA'),
             };

             if (currentRoundNum >= 2 && currentRoundNum <= 4) {
                Object.assign(nextQsInsert, {
                   question_text: q.title || "Coding Challenge",
                   slug: q.slug || q.question_slug || null,
                   subject: 'DSA',
                   problem_statement: q.problemStatement || q.questionText || "",
                   function_signatures: q.functionSignatures || q.function_signature || null,
                   examples: q.examples || null,
                   test_cases: q.test_cases || q.testCases || null,
                   hints: q.hints || null,
                   constraints: q.constraints || null,
                   time_complexity_expected: q.timeComplexityExpected || null,
                   space_complexity_expected: q.spaceComplexityExpected || null,
                });
             } else {
                Object.assign(nextQsInsert, {
                   question_text: q.questionText || q.question_text || "",
                   explanation: q.explanation || null,
                });
             }
             const { data: inserted } = await supabase.from("interview_questions").insert(nextQsInsert).select();
             if (inserted) session.interview_questions.push(...inserted);
          }
       }
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────────
//  V2 — List Interviews
//  GET /api/interview
// ──────────────────────────────────────────────────
exports.listInterviews = async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authData?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { data: interviews, error } = await supabase
      .from("interviews")
      .select("id, target_role, difficulty, type, status, current_round, total_rounds, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[DATABASE ERROR] List Interviews Failed:", error);
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, data: { sessions: interviews || [] } });
  } catch (err) {
    console.error("[V2 List Interviews] Exception:", err);
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────────
//  V2 — Get Results
//  GET /api/interview/:id/results
// ──────────────────────────────────────────────────
exports.getResults = async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authData?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cleanId = req.params.id.replace('sess_', '');

    const { data: results, error } = await supabase
      .from("interviews")
      .select("*, interview_questions(*), interview_responses(*), interview_round_summaries(*)")
      .eq("id", cleanId)
      .eq("user_id", userId)
      .single();

    if (error || !results) {
      console.error("[DATABASE ERROR] Get Results Failed:", error);
      return res.status(404).json({ message: "Results not found" });
    }

    res.json(results);
  } catch (err) {
    console.error("[V2 Get Results] Exception:", err);
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────────────
//  V2 — Delete Interview
//  DELETE /api/interview/:id
// ──────────────────────────────────────────────────
exports.deleteInterview = async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const userId = authData?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cleanId = req.params.id.replace('sess_', '');
    
    console.log(`[DeleteInterview] Starting cleanup for session ${cleanId} (User: ${userId})`);

    // 1. Clean up all related tables to avoid FK violations and stale data
    // Some use 'interview_id', others use 'session_id'
    const cleanupOperations = [
      supabase.from("session_questions").delete().eq("session_id", cleanId),
      supabase.from("question_attempts").delete().eq("session_id", cleanId),
      supabase.from("interview_round_summaries").delete().eq("interview_id", cleanId),
      supabase.from("interview_responses").delete().eq("interview_id", cleanId),
      supabase.from("interview_questions").delete().eq("interview_id", cleanId),
      supabase.from("adaptive_tracking").delete().eq("interview_id", cleanId),
      supabase.from("coding_problems").delete().eq("interview_id", cleanId),
      supabase.from("questions").delete().eq("interview_id", cleanId),
      supabase.from("user_answers").delete().eq("interview_id", cleanId),
      supabase.from("interview_sessions").delete().eq("id", cleanId).eq("user_id", userId),
    ];

    const results = await Promise.allSettled(cleanupOperations);
    results.forEach((res, i) => {
       if (res.status === 'rejected') {
          console.warn(`[DeleteInterview] Step ${i} failed:`, res.reason);
       }
    });

    // 2. Finally delete the main interview record
    const { error: deleteError } = await supabase
      .from("interviews")
      .delete()
      .eq("id", cleanId)
      .eq("user_id", userId);

    if (deleteError) {
       console.error("[DeleteInterview] Main delete failed:", deleteError);
       throw deleteError;
    }

    console.log(`[DeleteInterview] Successfully deleted session ${cleanId}`);
    res.json({ message: "Interview deleted successfully" });

  } catch (err) {
    console.error("[V2 Delete Interview] Exception:", err);
    res.status(500).json({ message: err.message });
  }
};
