const WebSocket = require('ws');

const url = 'ws://localhost:8000/interview/f611e1e8-20e7-4fc3-b09f-0ad24fcc91c6';
console.log('Testing URL:', url);
const ws = new WebSocket(url);

ws.on('open', function open() {
    console.log('Connected!');
    ws.close();
    process.exit(0);
});

ws.on('error', function error(err) {
    console.error('Error:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('Timeout after 5s');
    process.exit(1);
}, 5000);
