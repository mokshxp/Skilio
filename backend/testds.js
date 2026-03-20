require('dotenv').config();
const axios = require('axios');
axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
    model: 'deepseek-ai/deepseek-r1',
    messages: [{ role: 'user', content: 'Hi' }],
    max_tokens: 100
}, {
    headers: { Authorization: 'Bearer ' + process.env.NVIDIA_API_KEY }
}).then(r => console.log('OK-DS', r.data.id)).catch(e => console.log('ERR-DS', e.response?.data || e.message));
