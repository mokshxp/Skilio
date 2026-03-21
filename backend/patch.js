const fs = require('fs');
let f = fs.readFileSync('controllers/interviewController.js', 'utf8');

f = f.replace(/\.select\(\)/g, '.select("id")');
f = f.replace(/\.from\("interviews"\)\s*\n\s*\.select\("\*"\)/g, '.from("interviews").select("id, user_id, resume_id, type, target_role, difficulty, status, total_rounds, current_round, total_score, resume_context")');
f = f.replace(/\.from\("interview_questions"\)\s*\n\s*\.select\("\*"\)/g, '.from("interview_questions").select("id, interview_id, round_number, question_text, question_type, subject, topic, difficulty, options, correct_answer, explanation")');
f = f.replace(/\.from\("interview_responses"\)\s*\n\s*\.select\("\*"\)/g, '.from("interview_responses").select("id, interview_id, question_id, round_number, user_answer, code_output, is_correct, score, ai_feedback, improvements, next_difficulty, time_taken_seconds")');

// Wait, the selects above were split across lines. Let's just do a simpler replace.
f = f.replace(/\.from\("interview_questions"\)\s*\.select\("\*"\)/g, '.from("interview_questions").select("id, interview_id, round_number, question_text, question_type, subject, topic, difficulty, options, correct_answer, explanation")');
f = f.replace(/\.from\("interviews"\)\s*\.select\("\*"\)/g, '.from("interviews").select("id, user_id, resume_id, type, target_role, difficulty, status, total_rounds, current_round, total_score, resume_context")');
f = f.replace(/\.from\("interview_responses"\)\s*\.select\("\*"\)/g, '.from("interview_responses").select("id, interview_id, question_id, round_number, user_answer, code_output, is_correct, score, ai_feedback, improvements, next_difficulty, time_taken_seconds")');

fs.writeFileSync('controllers/interviewController.js', f);
console.log("Replaced selections successfully");
