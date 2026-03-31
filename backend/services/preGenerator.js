const { 
  generateMCQBatch, 
  generateDSAProblemBatch, 
  generateHRBatch 
} = require("./ai");
const { generateAptitudeQuestions } = require("./aptitudeGenerator");
const supabase = require("../config/db");

async function preGenerateRemainingRounds({
  sequence,
  startFromIndex,
  interviewId,
  role,
  difficulty,
  resumeContext,
}) {
  // ✅ Wait 10 seconds before pre-generating — let NVIDIA recover from aptitude load
  await new Promise(r => setTimeout(r, 10000));

  for (let i = startFromIndex; i < sequence.length; i++) {
    const roundStep = sequence[i];
    const roundNumber = roundStep.round;

    try {
      // Upsert tracking state
      await supabase
        .from("interview_rounds")
        .upsert({ interview_id: interviewId, round_number: roundNumber, status: "generating" }, { onConflict: 'interview_id,round_number' });

      let nextRoundQuestions = [];
      let roundTypeToSave = roundStep.type;
      
      if (roundStep.type === 'dsa' || roundStep.type === 'coding') {
        roundTypeToSave = 'coding';
        nextRoundQuestions = await generateDSAProblemBatch({
          targetRole: role,
          difficulty: roundStep.difficulty || difficulty,
          roundNumber: roundNumber
        });
      } else if (roundStep.type === 'hr' || roundStep.type === 'behavioral' || roundStep.type === 'behavioural') {
        roundTypeToSave = 'hr';
        nextRoundQuestions = await generateHRBatch({
          targetRole: role,
          experienceYears: resumeContext?.experience || 0
        });
      } else if (roundStep.type === 'aptitude') {
        roundTypeToSave = 'aptitude';
        nextRoundQuestions = await generateAptitudeQuestions(roundStep.difficulty || difficulty);
      } else {
        roundTypeToSave = 'mcq';
        nextRoundQuestions = await generateMCQBatch({
          targetRole: role,
          difficulty: roundStep.difficulty || difficulty,
          roundNumber: roundNumber,
          roundType: roundStep.type
        });
      }

      const questionsArr = Array.isArray(nextRoundQuestions) ? nextRoundQuestions : [nextRoundQuestions];
      let nextQsInsertArray = [];

      for (const q of questionsArr) {
        if (roundStep.type === 'dsa' || roundStep.type === 'coding') {
          const slug = q.slug || q.question_slug || (q.title ? q.title.toLowerCase().replace(/\s+/g, '-') : 'problem');
          const { data: baseQ } = await supabase
            .from("dsa_questions")
            .upsert({
              title: q.title || q.topic || "Coding Challenge",
              slug: slug,
              topic: q.topic || "Algorithms",
              difficulty: roundStep.difficulty || difficulty,
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
          round_number: roundNumber,
          question_type: roundTypeToSave,
          difficulty: q.difficulty || difficulty,
          topic: q.topic || q.title || q.subject || null,
        };

        if (roundStep.type === 'dsa' || roundStep.type === 'coding') {
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
        await supabase.from("interview_questions").insert(nextQsInsertArray);
      }

      await supabase
        .from("interview_rounds")
        .update({ status: "ready" })
        .eq("interview_id", interviewId)
        .eq("round_number", roundNumber);

      console.log(`✅ Pre-generated Round ${roundNumber} (${roundStep.label}) for interview ${interviewId}`);

    } catch (err) {
      await supabase
        .from("interview_rounds")
        .update({ status: "failed" })
        .eq("interview_id", interviewId)
        .eq("round_number", roundNumber);

      console.error(`❌ Pre-generation failed for Round ${roundNumber}:`, err.message);
    }

    // ✅ Gap between each round pre-generation to avoid rate limiting
    if (i < sequence.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function waitForRound(interviewId, roundNumber, timeoutMs = 60000) { // Bumped slightly for deep rounds
  const start = Date.now();
  const pollInterval = 1500; 

  while (Date.now() - start < timeoutMs) {
    const { data } = await supabase
      .from("interview_rounds")
      .select("status")
      .eq("interview_id", interviewId)
      .eq("round_number", roundNumber)
      .single();

    if (data?.status === "ready") {
      const { data: questions } = await supabase
        .from("interview_questions")
        .select("*")
        .eq("interview_id", interviewId)
        .eq("round_number", roundNumber);
      return questions;
    }

    if (data?.status === "failed") throw new Error("Round pre-generation failed");

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error("Timeout waiting for round pre-generation");
}

module.exports = { preGenerateRemainingRounds, waitForRound };
