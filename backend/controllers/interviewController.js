const {
  generateMCQBatch,
  generateDSAProlbemBatch,
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
    round_type: aiQuestion.round_type || 'mcq',
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
      round_type: roundType,
      status: "active",
      current_round: 1,
      total_rounds: totalRounds,
      resume_context: resumeContext
    };

    const { data: interview, error: intErr } = await supabase
      .from("interviews")
      .insert(interviewData)
      .select("id, target_role, difficulty, round_type, total_rounds, current_round")
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
      .select("id, round_number, round_type, question_text, subject, topic, difficulty, options, explanation");

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
    const { interviewId, roundNumber, responses } = req.body;
    const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

    // 1. Verify access
    const { data: interview } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .eq("user_id", userId)
      .single();

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    // 2. Save responses
    const responsesToInsert = (responses || []).map(r => ({
      interview_id: interviewId,
      question_id: r.questionId,
      round_number: roundNumber,
      selected_option: r.selectedOption || r.answer, // handle different field names
      user_answer: r.answer || r.selectedOption,
      time_taken_seconds: r.timeTaken,
      is_correct: r.isCorrect,
      score: r.isCorrect ? 1 : 0
    }));

    await supabase.from("interview_responses").insert(responsesToInsert);

    // 3. Calculate score
    const correctCount = responses.filter(r => r.isCorrect).length;
    const totalCount = responses.length;
    const score = totalCount > 0 ? (correctCount / totalCount) * 10 : 0;

    // 4. Create Round Summary
    const { data: summary } = await supabase
      .from("interview_round_summaries")
      .insert({
        interview_id: interviewId,
        round_number: roundNumber,
        round_type: roundNumber <= 2 ? 'mcq' : (roundNumber <= 4 ? 'dsa' : 'hr'),
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
    let nextRoundType = '';

    if (nextRoundNumber === 2) {
      nextRoundType = 'mcq';
      nextRoundQuestions = await generateMCQBatch({
        targetRole: interview.target_role,
        difficulty: interview.difficulty,
        roundNumber: 2
      });
    } else if (nextRoundNumber === 3 || nextRoundNumber === 4) {
      nextRoundType = 'dsa';
      const dsaProblem = await generateDSAProlbemBatch({
        targetRole: interview.target_role,
        difficulty: nextRoundNumber === 3 ? 'easy' : 'medium',
        roundNumber: nextRoundNumber
      });
      nextRoundQuestions = [dsaProblem];
    } else if (nextRoundNumber === 5) {
      nextRoundType = 'hr';
      nextRoundQuestions = await generateHRBatch({
        targetRole: interview.target_role,
        experienceYears: interview.resume_context?.experience || 0
      });
    }

    // 7. Save next round questions
    const nextQsInsert = nextRoundQuestions.map(q => ({
      interview_id: interviewId,
      round_number: nextRoundNumber,
      round_type: nextRoundType,
      question_text: q.questionText || q.problemStatement || "",
      question_slug: q.slug || null,
      subject: q.subject || null,
      topic: q.topic || null,
      difficulty: q.difficulty || interview.difficulty,
      options: q.options || null,
      correct_answer: q.correctAnswer || null,
      explanation: q.explanation || null,
      function_signature: q.functionSignatures || null,
      examples: q.examples || null,
      constraints: q.constraints || null,
      test_cases: q.testCases || null,
      hints: q.hints || null,
      solution_approach: q.solution_approach || null
    }));

    const { data: savedNextQs } = await supabase
      .from("interview_questions")
      .insert(nextQsInsert)
      .select();

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

// ──────────────────────────────────────────────────
//  V2 — DSA Submit
//  POST /api/interview/dsa/submit
// ──────────────────────────────────────────────────
exports.submitDSA = async (req, res) => {
  try {
    const { interviewId, questionId, roundNumber, code, language } = req.body;
    
    // 1. Fetch test cases
    const { data: question } = await supabase
      .from("interview_questions")
      .select("question_text, test_cases")
      .eq("id", questionId)
      .single();

    // 2. Mocking Judge0 for now (should implement actual call)
    const testResults = (question.test_cases || []).map(tc => ({
      id: tc.id,
      input: tc.input,
      expected: tc.expectedOutput,
      got: tc.expectedOutput, // MOCK: assume correct
      passed: true,
      runtime: "40ms"
    }));

    // 3. AI Evaluation
    const aiEval = await evaluateCode({
      problem: question.question_text,
      code,
      language
    });

    // 4. Save response
    await supabase.from("interview_responses").insert({
      interview_id: interviewId,
      question_id: questionId,
      round_number: roundNumber,
      code_solution: code,
      language: language,
      test_results: testResults,
      is_correct: aiEval.status === 'Accepted',
      score: aiEval.score / 10,
      ai_feedback: aiEval.feedback,
      improvements: aiEval.improvements
    });

    res.json({
      testResults,
      passed: testResults.length,
      total: testResults.length,
      allPassed: true,
      aiEvaluation: {
        score: aiEval.score / 10,
        timeComplexity: aiEval.runtime_estimate,
        spaceComplexity: aiEval.space_complexity,
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
//  V2 — DSA Run
//  POST /api/interview/dsa/run
// ──────────────────────────────────────────────────
exports.runDSA = async (req, res) => {
  try {
    const { interviewId, questionId, code, language } = req.body;
    
    // 1. Fetch visible test cases
    const { data: question } = await supabase
      .from("interview_questions")
      .select("question_text, test_cases")
      .eq("id", questionId)
      .single();

    // 2. Mocking Judge0 (only visible test cases)
    const visibleTCs = (question.test_cases || []).filter(tc => tc.isVisible);
    const testResults = visibleTCs.map(tc => ({
      id: tc.id,
      input: tc.input,
      expected: tc.expectedOutput,
      got: tc.expectedOutput,
      passed: true,
      runtime: "30ms"
    }));

    res.json({
      testResults,
      passed: testResults.length,
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

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
