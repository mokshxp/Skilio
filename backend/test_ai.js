require('dotenv').config();
const { analyzeResume } = require('./services/ai');

const testText = "This is a test resume for a Software Engineer with 5 years of experience in React and Node.js. Education: BS in CS. Skills: Javascript, Python, AWS.";

analyzeResume(testText)
    .then(res => {
        console.log("SUCCESS:");
        console.log(JSON.stringify(res, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error("FAILURE:");
        console.error(err);
        process.exit(1);
    });
