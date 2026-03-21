const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/interview/start', {
      targetRole: "Software Engineer",
      difficulty: "Beginner", // WRONG CASE - should be "beginner"
      roundType: "mixed",
      totalRounds: 5
    }, {
      headers: {
        'x-user-id': 'user_test_123' // Fallback if authMiddleware allows it
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Status:', err.response?.status);
    console.log('Data:', JSON.stringify(err.response?.data, null, 2));
  }
}

test();
