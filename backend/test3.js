require('dotenv').config();
const axios = require('axios');
const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
const key = process.env.NVIDIA_API_KEY;

[
    'qwen/qwen2.5-72b-instruct',
    'meta/llama-3.1-70b-instruct',
    'meta/llama-3.1-8b-instruct',
    'qwen/qwen-2.5-72b-instruct',
    'meta/llama3-70b-instruct'
].forEach(m => {
    axios.post(url, {
        model: m,
        messages: [{ role: 'user', content: 'Hi' }]
    }, {
        headers: { Authorization: 'Bearer ' + key }
    }).then(r => console.log('OK', m, r.data.id)).catch(e => console.log('ERR', m, e.response?.data || e.message));
});
