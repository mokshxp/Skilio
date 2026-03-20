require('dotenv').config();
const axios = require('axios');
axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
    model: 'meta/llama-3.1-405b-instruct',
    messages: [{ role: 'user', content: 'Hi' }],
    chat_template_kwargs: { enable_thinking: true }
}, {
    headers: { Authorization: 'Bearer ' + process.env.NVIDIA_API_KEY }
}).then(r => console.log('OK-Llama', r.data.id)).catch(e => console.log('ERR-Llama', e.response?.data || e.message));
