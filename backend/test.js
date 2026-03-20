require('dotenv').config();
const axios = require('axios');
const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
const key = process.env.NVIDIA_API_KEY;

console.log('Testing with qwen...');
axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
  model: 'qwen/qwen2.5-coder-32b-instruct',
  messages: [{ role: 'user', content: 'Hi' }]
}, {
  headers: { Authorization: 'Bearer ' + key }
}).then(r => console.log('OK2.5', r.data.id)).catch(e => console.log('ERR2.5', e.response?.data || e.message));

axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
  model: 'qwen/qwen-2.5-72b-instruct',
  messages: [{ role: 'user', content: 'Hi' }]
}, {
  headers: { Authorization: 'Bearer ' + key }
}).then(r => console.log('OK2.5-72b', r.data.id)).catch(e => console.log('ERR2.5-72b', e.response?.data || e.message));

axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
  model: 'meta/llama-3.1-405b-instruct',
  messages: [{ role: 'user', content: 'Hi' }]
}, {
  headers: { Authorization: 'Bearer ' + key }
}).then(r => console.log('OK-Llama', r.data.id)).catch(e => console.log('ERR-Llama', e.response?.data || e.message));
