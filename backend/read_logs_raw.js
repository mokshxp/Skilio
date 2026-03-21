const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'logs', 'combined-2026-03-21.log');
const content = fs.readFileSync(logFile, 'utf8');
const lines = content.split('\n');
console.log('--- RECENT LOGS ---');
lines.slice(-20).forEach(line => {
    try {
        const obj = JSON.parse(line);
        console.log(`[${obj.level}] ${obj.message}`);
        if (obj.error) console.log('ERROR:', obj.error);
        if (obj.details) console.log('DETAILS:', obj.details);
    } catch (e) {
        console.log(line);
    }
});
