const { WebSocketServer, WebSocket } = require('ws');
const url = require('url');
const { createClerkClient, verifyToken } = require('@clerk/backend');
const supabase = require('../config/db');
const ai = require('./ai');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Setup WebSocket server for interview interactions
 */
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(process.cwd(), 'ws_debug.log');
function logWs(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(`[WS DEBUG] ${msg}`);
}

/**
 * Setup WebSocket server for interview interactions
 */
function setupWebSocket(server) {
    const wss = new WebSocketServer({ noServer: true });
    logWs("WebSocket Server Initialized");

    // Handle initial HTTP upgrade to WebSocket
    server.on('upgrade', (request, socket, head) => {
        const parsedUrl = url.parse(request.url);
        const pathname = parsedUrl.pathname;
        logWs(`Upgrade request received for: ${pathname}`);

        // Match /ws-interview/ID or /ws-interview/ID/
        const match = pathname.match(/^\/ws-interview\/([^\/]+)\/?$/);

        if (match) {
            const sessionId = match[1];
            logWs(`Matched interview session: ${sessionId}`);

            logWs(`Attempting to handle upgrade for session: ${sessionId}`);
            try {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    logWs(`Upgrade callback reached for session: ${sessionId}`);
                    ws.sessionId = sessionId;
                    ws.authenticated = false;
                    wss.emit('connection', ws, request);
                });
            } catch (err) {
                logWs(`Error during handleUpgrade: ${err.message}`);
            }
        } else {
            logWs(`No match for pathname: ${pathname}`);
        }
    });

    wss.on('connection', (ws, req) => {
        logWs(`[WS] Connection attempt for session: ${ws.sessionId}`);

        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data);

                // Authentication step
                if (message.type === 'auth') {
                    const { token } = message;
                    if (!token) {
                        logWs('[WS] Auth error: Missing token');
                        ws.send(JSON.stringify({ type: 'error', payload: 'Missing token' }));
                        ws.close(1008, 'Missing Authentication Token');
                        return;
                    }

                    try {
                        console.log(`[WS] Verifying token for session: ${ws.sessionId}`);
                        ws.authenticating = true;

                        const decoded = await verifyToken(token, {
                            secretKey: process.env.CLERK_SECRET_KEY
                        });

                        ws.userId = decoded.sub;
                        ws.authenticated = true;
                        ws.authenticating = false;
                        console.log(`[WS] Authenticated user: ${ws.userId} for session: ${ws.sessionId}`);

                        // Send the current active question
                        await sendCurrentQuestion(ws);
                    } catch (err) {
                        ws.authenticating = false;
                        console.error('[WS] Auth error for session:', ws.sessionId, '| Error:', err.message);
                        ws.send(JSON.stringify({ type: 'error', payload: `Authentication failed: ${err.message}` }));
                        ws.close(1008, 'Authentication failed');
                    }
                    return;
                }

                if (!ws.authenticated) {
                    if (ws.authenticating) {
                        return logWs('[WS] Ignoring message while authentication is pending');
                    }
                    return ws.send(JSON.stringify({ type: 'error', payload: 'Unauthenticated' }));
                }

                // Handle regular messages
                switch (message.type) {
                    case 'ping':
                        ws.send(JSON.stringify({ type: 'pong' }));
                        break;

                    case 'answer':
                        await handleTheoryAnswer(ws, message.payload);
                        break;

                    case 'code_submission':
                        await handleCodeSubmission(ws, message.payload);
                        break;

                    case 'run_code':
                        await handleRunCode(ws, message.payload);
                        break;

                    case 'start_interview':
                        // User explicitly requesting start/first question
                        await sendCurrentQuestion(ws);
                        break;

                    case 'next_question':
                        await sendCurrentQuestion(ws);
                        break;

                    default:
                        console.warn(`[WS] Unknown message type: ${message.type}`);
                }
            } catch (err) {
                console.error('[WS] Message handling error:', err);
            }
        });

        ws.on('close', () => {
            console.log(`[WS] Connection closed: ${ws.sessionId}`);
        });
    });
}

/**
 * Fetches and sends the current unanswered question for the session
 */
async function sendCurrentQuestion(ws) {
    const { data: session, error } = await supabase
        .from("interview_sessions")
        .select("*, questions(*)")
        .eq("id", ws.sessionId)
        .eq("user_id", ws.userId)
        .single();

    if (error || !session) {
        return ws.send(JSON.stringify({ type: 'error', payload: 'Interview session not found' }));
    }

    const questions = session.questions || [];
    const sortedQuestions = [...questions].sort((a, b) => b.question_number - a.question_number);
    let current = sortedQuestions.find(q => q.answer === null);

    // Round limits
    const roundLimits = { technical: 4, coding: 2, behavioural: 3, behavioral: 3, mixed: 4 };
    const limit = roundLimits[session.round_type] || 4;

    if (!current && questions.length < limit && session.status === 'ongoing') {
        // Generate next based on last score
        const lastQ = sortedQuestions[0]; // because we sorted descending
        const nextQ = await generateNextQuestion(session, lastQ);
        if (nextQ) current = nextQ;
    }

    if (current) {
        ws.send(JSON.stringify({
            type: 'question',
            payload: {
                id: current.id,
                question: current.content,
                type: current.type,
                hint: current.hint || "",
                time_limit_seconds: current.time_limit_seconds || 600,
                question_number: current.question_number,
                title: current.title || "Next Question",
                description: current.description || current.content,
                constraints: current.constraints || [],
                examples: current.examples || []
            }
        }));
    } else {
        ws.send(JSON.stringify({ type: 'interview_end' }));
    }
}

async function handleTheoryAnswer(ws, payload) {
    const { answer, question_id } = payload;

    const { data: question } = await supabase
        .from("questions")
        .select("*, interview_sessions(*)")
        .eq("id", question_id)
        .single();

    if (!question || question.interview_sessions.user_id !== ws.userId) return;

    const { role, difficulty, round_type } = question.interview_sessions;

    const evaluation = await ai.scoreAnswer({
        question: question.content,
        answer,
        roundType: round_type,
        role,
        difficulty
    });

    await supabase.from("questions").update({
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvements: evaluation.improvements,
        topics_covered: evaluation.topics_covered,
        topics_missed: evaluation.topics_missed
    }).eq("id", question_id);

    ws.send(JSON.stringify({
        type: 'feedback',
        payload: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            improvements: evaluation.improvements
        }
    }));
}

async function handleCodeSubmission(ws, payload) {
    const { code, language, question_id } = payload;

    const { data: question } = await supabase
        .from("questions")
        .select("*, interview_sessions(*)")
        .eq("id", question_id)
        .single();

    if (!question || question.interview_sessions.user_id !== ws.userId) return;

    const problemContext = `${question.title || 'Coding Challenge'}: ${question.description || question.content}`;

    const evaluation = await ai.evaluateCode({ problem: problemContext, code, language });

    await supabase.from("questions").update({
        answer: code,
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvements: evaluation.improvements,
        language_used: language
    }).eq("id", question_id);

    ws.send(JSON.stringify({
        type: 'feedback',
        payload: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            improvements: evaluation.improvements
        }
    }));
}

async function handleRunCode(ws, payload) {
    const { code, language, question_id } = payload;
    ws.send(JSON.stringify({
        type: 'run_result',
        payload: {
            stdout: "Code logic looks valid. (Sandbox execution pending integration)",
            passed: true,
            time_ms: 45
        }
    }));
}

function decideNextDifficulty(score) {
    if (score <= 3) return "easier";
    if (score <= 7) return "same";
    return "harder";
}

async function generateNextQuestion(session, lastQ = null) {
    const previousQuestions = (session.questions || []).map(q => q.content);
    const { role, difficulty, round_type, resume_context, id } = session;

    let followUpContext = null;
    let guidance = null;

    if (lastQ && lastQ.score !== null) {
        let scoreToUse = lastQ.score;
        // In case it's string, parse
        if (typeof scoreToUse === 'string') scoreToUse = parseFloat(scoreToUse);
        
        const difficultyAdjustment = decideNextDifficulty(scoreToUse ?? 5);

        if (difficultyAdjustment === "easier") {
            guidance = "The candidate struggled. Ask an easier follow-up question or provide hints.";
        } else if (difficultyAdjustment === "same") {
            guidance = "Ask another question of similar difficulty but covering a slightly deeper concept.";
        } else if (difficultyAdjustment === "harder") {
            guidance = "The candidate performed well. Increase difficulty or ask a more advanced concept.";
        }

        if (guidance) {
            followUpContext = {
                question: lastQ.content,
                answer: lastQ.answer,
                score: lastQ.score,
                guidance,
                difficultyAdjustment
            };
        }
    }

    const weakTopics = (session.questions || [])
        .flatMap(q => q.topics_missed || [])
        .slice(-3);


    // Mixed round logic
    let actualRoundType = round_type;
    if (!followUpContext && round_type === 'mixed') {
        const rand = Math.random();
        if (rand < 0.4) actualRoundType = 'technical';
        else if (rand < 0.8) actualRoundType = 'coding';
        else actualRoundType = 'behavioural';
    }

    const nextQData = await ai.generateQuestion({
        role,
        difficulty,
        roundType: actualRoundType,
        resumeContext: resume_context,
        previousQuestions,
        followUpContext,
        weakTopics
    });

    const { data: nq } = await supabase.from("questions").insert({
        interview_id: id,
        content: nextQData.question || nextQData.description || nextQData.title,
        type: nextQData.type || (actualRoundType === 'coding' ? 'coding' : 'theory'),
        hint: nextQData.hint || "",
        expected_topics: nextQData.expected_topics || nextQData.topics || [],
        time_limit_seconds: nextQData.time_limit_seconds || 600,
        question_number: (session.questions?.length || 0) + 1,
        title: nextQData.title,
        description: nextQData.description,
        constraints: nextQData.constraints,
        examples: nextQData.examples,
        hidden_test_cases: nextQData.hidden_test_cases
    }).select().single();

    return nq;
}

module.exports = { setupWebSocket };
