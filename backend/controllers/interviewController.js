const axios = require("axios");
const {
  generateMCQBatch,
  generateDSAProblemBatch,
  generateHRBatch,
  evaluateHRAnswer,
  evaluateCode
} = require("../services/ai");
const { generateAptitudeQuestions } = require("../services/aptitudeGenerator");
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
function sanitizeQuestion(aiQuestion, roundNumber, defaultDifficulty = 'intermediate', forceType = null) {
  const questionType = forceType || aiQuestion.round_type || aiQuestion.question_type || 'mcq';
  const isCoding = questionType === 'coding' || questionType === 'dsa';

  const base = {
    interview_id: aiQuestion.interview_id,
    round_number: roundNumber,
    // forceType wins (ensures coding track never saves as 'mcq')
    question_type: questionType,
    question_text: aiQuestion.title
      || aiQuestion.questionText 
      || aiQuestion.question_text 
      || aiQuestion.question 
      || aiQuestion.topic
      || 'Coding Challenge',
    subject: aiQuestion.subject || (isCoding ? 'DSA' : aiQuestion.topic || 'CS'),
    topic: aiQuestion.topic || aiQuestion.subject || 'General',
    difficulty: (aiQuestion.difficulty || defaultDifficulty).toLowerCase().trim(),
    options: aiQuestion.options || {},
    correct_answer: aiQuestion.correctAnswer || aiQuestion.correct_answer || aiQuestion.correct || (isCoding ? null : 'A'),
    explanation: aiQuestion.explanation || aiQuestion.explanation_text || ''
  };

  // Save DSA-specific fields when relevant
  if (isCoding) {
    base.problem_statement = aiQuestion.problemStatement || aiQuestion.problem_statement || aiQuestion.description || '';
    base.function_signatures = aiQuestion.functionSignatures || aiQuestion.function_signatures || aiQuestion.starter_code || null;
    base.examples = aiQuestion.examples || null;
    base.test_cases = aiQuestion.test_cases || aiQuestion.testCases || null;
    base.hints = aiQuestion.hints || null;
    base.constraints = aiQuestion.constraints || null;
    base.slug = aiQuestion.slug || aiQuestion.question_slug || null;
    base.time_complexity_expected = aiQuestion.timeComplexityExpected || aiQuestion.time_complexity_expected || null;
    base.space_complexity_expected = aiQuestion.spaceComplexityExpected || aiQuestion.space_complexity_expected || null;
  }

  return base;
}

/**
 * evalFollowUp: Instant AI evaluation of a behavioral answer to decide on follow-ups.
 * POST /api/interview/follow-up
 */
exports.evalFollowUp = async (req, res) => {
  try {
    const { question, answer, role, difficulty } = req.body;
    const { generateFollowUp } = require("../services/ai");

    const result = await generateFollowUp({ question, answer, role, difficulty });
    
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("[evalFollowUp Controller Error]", err);
    res.json({ success: false, needsFollowUp: false, error: err.message });
  }
};
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
    const difficulty = (body.difficulty || 'intermediate').toLowerCase().trim();
    const resumeId = sanitizeUUID(body.resumeId);

    const { getSequence, ROUND_SEQUENCES } = require('../config/roundConfig');
    const sequence = getSequence(roundType, targetRole);
    const totalRounds = sequence.length;
    const firstRound = sequence[0];

    log('3. Sanitized values', { resumeId, difficulty, roundType, targetRole, totalRounds, firstRoundType: firstRound.type });

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
    log('7. Generating questions via AI...', { firstRoundType: firstRound.type });
    let questions;
    try {
      if (firstRound.type === 'aptitude') {
        questions = await generateAptitudeQuestions(firstRound.difficulty || difficulty);
      } else if (firstRound.type === 'mcq' || firstRound.type === 'technical') {
        questions = await generateMCQBatch({
          targetRole,
          skills: resumeData?.skills || [],
          experienceYears: resumeData?.experience_years || 0,
          difficulty: firstRound.difficulty || difficulty,
          roundNumber: 1,
          roundType: firstRound.type
        });
      } else if (firstRound.type === 'dsa' || firstRound.type === 'coding') {
        questions = await generateDSAProblemBatch({
          targetRole,
          difficulty: firstRound.difficulty || difficulty,
          roundNumber: 1
        });
      } else if (firstRound.type === 'hr' || firstRound.type === 'behavioral' || firstRound.type === 'behavioural') {
        questions = await generateHRBatch({
          targetRole,
          experienceYears: resumeData?.experience_years || 0
        });
      }

      log('7. AI questions generated', { count: Array.isArray(questions) ? questions.length : '1 (object)' });
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
    // Map the firstRound.type to the saved question_type
    const questionTypeMap = { dsa: 'coding', coding: 'coding', mcq: 'mcq', technical: 'mcq', hr: 'hr', behavioral: 'hr', behavioural: 'hr' };
    const forcedType = questionTypeMap[firstRound.type] || null;
    const questionsToInsert = questions.map(q => ({
      ...sanitizeQuestion(q, 1, firstRound.difficulty || difficulty, forcedType),
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

    // 11. Run Background Pre-Generator Non-Blocking
    try {
      const { preGenerateRemainingRounds } = require('../services/preGenerator');
      preGenerateRemainingRounds({
        sequence,
        startFromIndex: 1, // Start generating Round 2 and beyond
        interviewId: interview.id,
        role: targetRole,
        difficulty: difficulty,
        resumeContext: resumeContext
      }).catch(err => console.error("[Background Pre-Gen Async Error]", err));
    } catch (e) {
      console.error("[Background Pre-Gen Trigger Error]", e);
    }

  } catch (err) {
  }
};

/**
 * Early termination of interview
 * POST /api/interview/end
 */
exports.endInterview = async (req, res) => {
  try {
    const interviewId = req.body.interviewId?.toString().replace('sess_', '');
    const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

    const { data: interview, error } = await supabase
      .from("interviews")
      .update({ 
        status: "completed", 
        completed_at: new Date().toISOString() 
      })
      .eq("id", interviewId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, session: interview });
  } catch (err) {
    console.error("[EndInterview Controller Error]", err);
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
      // Normalize correct answer from ALL possible field names (AI variations)
      const correctVal = (q.correct_answer || q.correctAnswer || q.correct || "").toString().trim().toUpperCase();
      acc[q.id] = { 
        correct: correctVal, 
        options: q.options || {} 
      };
      return acc;
    }, {});

    // 3. Save responses and calculate correct count
    let correctCount = 0;
    const responsesToInsert = (responses || []).map(r => {
      const qInfo = questionMap[r.questionId];
      if (!qInfo) return null; // Should not happen

      const dbCorrectValue = qInfo.correct;
      const userSelected = String(r.selectedOption || r.answer || '').trim();
      
      // Verification logic:
      // Case 1: Direct match (e.g. "A" === "A" or "Paris" === "Paris") 
      // Normalize both sides to avoid case mismatch (a vs A)
      const corStr = dbCorrectValue;
      const selStr = userSelected.toUpperCase();
      let isCorrect = (corStr === selStr);

      // Case 2: User sent key (a), but DB has value ("Paris") or keys are case-mismatched
      if (!isCorrect && qInfo.options) {
          // Check if userSelected key exists in options (case insensitive)
          const optionKey = Object.keys(qInfo.options).find(k => k.toUpperCase() === selStr);
          if (optionKey) {
            const valFromOption = String(qInfo.options[optionKey] || "").trim().toUpperCase();
            if (valFromOption === corStr) {
              isCorrect = true;
            }
          }
      }

      // Case 3: User sent value ("Paris"), but DB has key (A)
      if (!isCorrect && qInfo.options) {
          // Find if any option value matches the user's selection
          const keyForValue = Object.keys(qInfo.options).find(k => 
              String(qInfo.options[k] || '').trim().toUpperCase() === selStr
          );
          if (keyForValue && keyForValue.toUpperCase() === corStr) {
              isCorrect = true;
          }
      }
      
      if (isCorrect) correctCount++;
      
      console.log(`- Q: ${r.questionId} Found: ${dbCorrectValue} User: ${userSelected} Result: ${isCorrect} | corStr: ${corStr} selStr: ${selStr}`);

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

    const { getSequence } = require('../config/roundConfig');
    const trackSequence = getSequence(interview.round_type, interview.target_role);
    const currentRoundStep = trackSequence.find(r => r.round === roundNumber);
    const nextRoundStep = trackSequence.find(r => r.round === roundNumber + 1);

    // 5. Create Round Summary
    const { data: summary } = await supabase
      .from("interview_round_summaries")
      .insert({
        interview_id: interviewId,
        round_number: roundNumber,
        round_type: currentRoundStep?.type || 'mcq',
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
    let nextRoundType = nextRoundStep?.type || '';

    if (nextRoundType === 'dsa' || nextRoundType === 'coding') nextRoundType = 'dsa';
    else if (nextRoundType === 'hr' || nextRoundType === 'behavioral') nextRoundType = 'hr';
    else if (nextRoundType === 'mcq' || nextRoundType === 'technical') nextRoundType = 'mcq';
    else if (nextRoundType === 'aptitude') nextRoundType = 'aptitude';

    const { waitForRound } = require('../services/preGenerator');
    let fallbackGenerationNeeded = false;

    // Check pre-generation status
    const { data: nextRoundData } = await supabase
      .from("interview_rounds")
      .select("status")
      .eq("interview_id", interviewId)
      .eq("round_number", nextRoundNumber)
      .maybeSingle();

    if (nextRoundData?.status === "ready") {
       const { data: q } = await supabase
        .from("interview_questions")
        .select("*")
        .eq("interview_id", interviewId)
        .eq("round_number", nextRoundNumber);
       savedNextQs = q || [];
    } else if (nextRoundData?.status === "generating") {
       try {
         savedNextQs = await waitForRound(interviewId, nextRoundNumber);
       } catch (err) {
         fallbackGenerationNeeded = true;
       }
    } else {
       fallbackGenerationNeeded = true; // "failed" or no data
    }

    if ((fallbackGenerationNeeded || savedNextQs.length === 0) && nextRoundStep) {
      console.warn(`[V2] Fallback generating Round ${nextRoundNumber} synchronously`);
      
      if (nextRoundType === 'dsa') {
        nextRoundQuestions = await generateDSAProblemBatch({
          targetRole: interview.target_role,
          difficulty: nextRoundStep?.difficulty || 'medium',
          roundNumber: nextRoundNumber
        });
      } else if (nextRoundType === 'hr') {
        nextRoundQuestions = await generateHRBatch({
          targetRole: interview.target_role,
          experienceYears: interview.resume_context?.experience || 0
        });
      } else if (nextRoundType === 'mcq' || nextRoundType === 'aptitude') {
        nextRoundQuestions = await generateMCQBatch({
          targetRole: interview.target_role,
          difficulty: nextRoundStep?.difficulty || 'medium',
          roundNumber: nextRoundNumber,
          roundType: nextRoundStep?.type
        });
      }

      const questionsArr = Array.isArray(nextRoundQuestions) ? nextRoundQuestions : [nextRoundQuestions];
      let nextQsInsertArray = [];

      for (const q of questionsArr) {
        if (nextRoundType === 'dsa') {
          const slug = q.slug || q.question_slug || (q.title ? q.title.toLowerCase().replace(/\s+/g, '-') : 'problem');
          const { data: baseQ } = await supabase
            .from("dsa_questions")
            .upsert({
              title: q.title || q.topic || "Coding Challenge",
              slug: slug,
              topic: q.topic || "Algorithms",
              difficulty: nextRoundStep?.difficulty || 'medium',
              base_description: q.problemStatement || q.questionText || q.question_text || "",
              constraints: Array.isArray(q.constraints) ? q.constraints : [q.constraints],
              created_at: new Date()
            }, { onConflict: 'slug' })
            .select()
            .single();

          if (baseQ) {
            await supabase.from("session_questions").insert({
              session_id: interviewId,
              question_id: baseQ.id,
              ai_variation: q,
              test_cases: q.test_cases || q.testCases || null,
              difficulty: baseQ.difficulty,
              order_index: 1
            });
          }
        }

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

        nextQsInsertArray.push(nextQsInsert);
      }
      
      if (nextQsInsertArray.length > 0) {
        const { data: insData, error: insErr } = await supabase.from("interview_questions").insert(nextQsInsertArray).select();
        if (insErr) {
          console.error("❌ [V2] Failed to batch insert fallback interview_questions:", insErr);
        } else {
          console.log(`✅ [V2] Batch inserted fallback ${insData.length} questions for Round ${nextRoundNumber}`);
          if (savedNextQs.length === 0 && insData) savedNextQs.push(...insData);
        }
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
    // Detect class at HARNESS BUILD TIME (Node.js side) to avoid runtime template issues
    const classMatch = code.match(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\s*[{(]/);
    const hasClass = !!classMatch;
    const className = classMatch ? classMatch[1] : '';

    return `${code}

// --- SMART DRIVER ---
try {
    const _input = JSON.parse('[${cleanInput}]');
    const _hasClass = ${hasClass};
    const _className = ${JSON.stringify(className)};
    const _classMatch = _hasClass ? [null, _className] : null;
    
    if (_classMatch) {
        // CLASS-BASED PROBLEM (e.g. APICache, LRUCache, etc.)
        const _ClassName = eval(_classMatch[1]);
        const _instance = new _ClassName();

        // If input is an array-of-arrays (list of method calls / requests)
        // e.g. [['GET', 'users', 1], ['POST', 'users', {name:'John'}]]
        if (Array.isArray(_input[0]) && Array.isArray(_input[0][0])) {
            const _calls = _input[0];
            const _results = _calls.map(call => {
                // Try calling a generic handler: process(method, endpoint, params)
                if (typeof _instance.process === 'function') {
                    return _instance.process(...call);
                }
                // Fallback: try calling the class method that matches first arg
                const _methodName = String(call[0]).toLowerCase();
                if (typeof _instance[_methodName] === 'function') {
                    return _instance[_methodName](...call.slice(1));
                }
                return null;
            });
            console.log(JSON.stringify(_results));
        } else {
            // Single call: just call process or the first method we find
            const _args = _input;
            let _result;
            if (typeof _instance.process === 'function') {
                _result = _instance.process(..._args);
            } else {
                const _methods = Object.getOwnPropertyNames(Object.getPrototypeOf(_instance))
                    .filter(m => m !== 'constructor' && typeof _instance[m] === 'function');
                if (_methods.length > 0) _result = _instance[_methods[0]](..._args);
            }
            console.log(_result !== undefined ? JSON.stringify(_result) : "INTERNAL_NULL_RETURN");
        }
    } else {
        // FUNCTION-BASED PROBLEM
        let fn = (typeof solve === 'function') ? solve : (typeof solution === 'function' ? solution : null);
        if (!fn) {
            const keys = Object.keys(global).filter(k =>
                typeof global[k] === 'function' &&
                !['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'console', 'Buffer', 'URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder', 'Promise', 'JSON', 'Math', 'parseInt', 'parseFloat', 'encodeURIComponent', 'decodeURIComponent'].includes(k)
            );
            if (keys.length > 0) fn = global[keys[keys.length - 1]];
        }
        if (fn) {
            const result = fn(..._input);
            console.log(result !== undefined ? JSON.stringify(result) : "INTERNAL_NULL_RETURN");
        }
    }
} catch (e) {
    console.error(e.message);
    process.exit(1);
}`;
  }
  if (language === 'java') {
      // Find method name from code
      const match = code.match(/(?:public|private|int|String|List|void)\s+([a-zA-Z0-9_]+)\s*\(/);
      const methodName = match ? match[1] : "solve";
      return `import java.util.*;\nimport java.util.stream.*;\n${code}\n\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            Solution sol = new Solution();\n            // This is a naive but common driver for DSA\n            System.out.println(sol.${methodName}(args[0]));\n        } catch(Exception e) {\n            System.out.println("INTERNAL_NULL_RETURN");\n        }\n    }\n}`;
  }

  if (language === 'cpp' || language === 'c++') {
    // 1. Better Method Discovery (detects method name and return type)
    const methodMatch = code.match(/public:[\s\S]*?(\w+<[\w<>, ]+>|\w+)\b[^(\n]* (\w+)\s*\(/);
    const methodName = methodMatch ? methodMatch[2] : 'solve';

    return `#include <bits/stdc++.h>
using namespace std;

// Generic JSON Serializers
string toJson(bool b) { return b ? "true" : "false"; }
string toJson(int i) { return to_string(i); }
string toJson(long long l) { return to_string(l); }
string toJson(double d) { return to_string(d); }
string toJson(const string& s) { return "\\\"" + s + "\\\""; }

template<typename T> string toJson(const vector<T>& v);
template<typename K, typename V> string toJson(const pair<K, V>& p);

template<typename K, typename V>
string toJson(const pair<K, V>& p) {
    // Detect if this is likely a fruit-inventory style pair or a generic one
    // In our system, vector<pair<string, int>> is standardized as a list of fruit objects
    return "{\\\"fruit\\\":\\\"" + (string)p.first + "\\\",\\\"quantity\\\":" + to_string(p.second) + "}";
}

template<typename T>
string toJson(const vector<T>& v) {
    string out = "[";
    for (size_t i = 0; i < v.size(); i++) {
        out += toJson(v[i]);
        if (i + 1 < v.size()) out += ",";
    }
    return out + "]";
}

// Fallback for types we don't handle explicitly yet
template<typename T>
string toJson(T val) { return "\\\"COMPLEX_RETURN_TYPE\\\""; }

${code}

unordered_map<string,int> parseJsonMap(const string& s) {
    unordered_map<string,int> m;
    size_t i = s.find('{');
    if (i == string::npos) return m;
    i++;
    while (i < s.size()) {
        size_t ks = s.find('"', i);
        if (ks == string::npos) break;
        size_t ke = s.find('"', ks + 1);
        string key = s.substr(ks + 1, ke - ks - 1);
        size_t colon = s.find(':', ke);
        size_t vs = colon + 1;
        while (vs < s.size() && (s[vs]==' '||s[vs]=='\\t')) vs++;
        size_t ve = vs;
        while (ve < s.size() && (isdigit(s[ve])||s[ve]=='-')) ve++;
        int val = stoi(s.substr(vs, ve - vs));
        m[key] = val;
        i = ve;
    }
    return m;
}

int main() {
    try {
        string allInput, line;
        while (getline(cin, line)) allInput += line + "\\n";
        
        // Note: In real scenarios, we'd use a robust JSON parser for C++.
        // For these DSA problems, we assume basic maps as the standard input for inventory.
        
        // Simple object splitter
        auto findObject = [](const string& s, size_t from) -> pair<size_t,size_t> {
            size_t start = s.find('{', from);
            if (start == string::npos) return {string::npos, string::npos};
            size_t depth = 0, pos = start;
            for (; pos < s.size(); pos++) {
                if (s[pos] == '{') depth++;
                else if (s[pos] == '}') { depth--; if (depth == 0) break; }
            }
            return {start, pos};
        };

        auto [s1, e1] = findObject(allInput, 0);
        auto [s2, e2] = findObject(allInput, e1 == string::npos ? 0 : e1 + 1);

        Solution sol;
        
        // For the specific inventory problem
        if (s1 != string::npos && s2 != string::npos) {
            auto inv = parseJsonMap(allInput.substr(s1, e1 - s1 + 1));
            auto rst = parseJsonMap(allInput.substr(s2, e2 - s2 + 1));
            auto result = sol.${methodName}(inv, rst);
            sort(result.begin(), result.end()); // Keep sorted standard
            cout << toJson(result) << endl;
        } else {
            // General purpose fallback for other problems (takes raw string arg)
            // cout << toJson(sol.${methodName}(allInput)) << endl;
        }
    } catch (const exception& e) {
        cerr << "HARNESS_ERROR: " << e.what() << endl;
        return 1;
    }
    return 0;
}`;
  }

  return code;
};

// ── Shared Helper: Strict Comparison ───────
const canonicalize = (val) => {
    if (Array.isArray(val)) {
        // Sort arrays of objects by their canonical JSON string for order-insensitive compare
        return val.map(canonicalize).sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1);
    }
    if (val && typeof val === 'object') {
        // Sort object keys
        const sorted = {};
        Object.keys(val).sort().forEach(k => { sorted[k] = canonicalize(val[k]); });
        return sorted;
    }
    return val;
};

const compareResults = (rawOutput, rawExpected) => {
    const out = String(rawOutput || "").trim();
    const exp = String(rawExpected || "").trim();

    if (!out || out === "INTERNAL_NULL_RETURN") {
        return exp === "" || exp === "null";
    }

    try {
        if ((out.startsWith('[') || out.startsWith('{')) && (exp.startsWith('[') || exp.startsWith('{'))) {
            // Canonicalize both sides (sort arrays + object keys) for order-insensitive comparison
            return JSON.stringify(canonicalize(JSON.parse(out))) === JSON.stringify(canonicalize(JSON.parse(exp)));
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
        const result = await executeOnPiston(harnessedCode, language, tc.input);
        
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
       const resumeData = session.resume_context || {};
       
       if (currentRoundNum >= 2 && currentRoundNum <= 4) {
          nextRoundQuestions = await generateDSAProblemBatch({
             targetRole: session.target_role,
             difficulty: currentRoundNum === 2 ? 'easy' : (currentRoundNum === 3 ? 'medium' : 'hard'),
             roundNumber: currentRoundNum,
             skills: resumeData.skills || [],
             experienceYears: resumeData.experience_years || 0
          });
          console.log('[DSA DEBUG] title:', nextRoundQuestions?.title);
       } else if (currentRoundNum === 5) {
          nextRoundQuestions = await generateHRBatch({ 
             targetRole: session.target_role, 
             difficulty: session.difficulty || 'intermediate',
             skills: resumeData.skills || [],
             experienceYears: resumeData.experience_years || 0
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

    const rawId = req.params.id || '';
    const cleanId = rawId.toString().replace('sess_', '');
    
    console.log(`[DeleteInterview] Root request for ${cleanId} (User: ${userId})`);

    // 1. Diagnostics: Check where this ID exists before deletion
    const [{ data: intExists }, { data: sessExists }] = await Promise.all([
      supabase.from("interviews").select("id").eq("id", cleanId).eq("user_id", userId).maybeSingle(),
      supabase.from("interview_sessions").select("id").eq("id", cleanId).eq("user_id", userId).maybeSingle()
    ]);

    if (!intExists && !sessExists) {
        console.warn(`[DeleteInterview] ID ${cleanId} NOT FOUND in either interviews or interview_sessions for this user.`);
        return res.status(404).json({ error: "Session not found or already deleted" });
    }

    console.log(`[DeleteInterview] Target found. Deletion proceeding... (interviews: ${!!intExists}, sessions: ${!!sessExists})`);

    // 2. Cascade Cleanup (Manual)
    const { data: answers } = await supabase.from("user_answers").select("id").eq("interview_id", cleanId);
    if (answers?.length > 0) {
      const answerIds = answers.map(a => a.id);
      await supabase.from("execution_logs").delete().in("answer_id", answerIds);
    }

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
    ];

    await Promise.allSettled(cleanupOperations);

    // 3. Purge main records
    await supabase.from("interview_sessions").delete().eq("id", cleanId).eq("user_id", userId);
    
    const { error: mainDeleteError } = await supabase
      .from("interviews")
      .delete()
      .eq("id", cleanId)
      .eq("user_id", userId);

    if (mainDeleteError) {
       console.error("[DeleteInterview] CRITICAL: Root delete failed:", mainDeleteError);
       return res.status(400).json({ 
         error: "Database restricted delete", 
         message: "Could not delete root session entry. Other records might still be referencing it.",
         details: mainDeleteError.message 
       });
    }

    console.log(`[DeleteInterview] Successfully purged session ${cleanId}.`);
    res.json({ success: true, message: "Interview and all related data deleted successfully" });

  } catch (err) {
    console.error("[V2 Delete Interview] Exception during purge:", err);
    res.status(500).json({ message: err.message });
  }
};


