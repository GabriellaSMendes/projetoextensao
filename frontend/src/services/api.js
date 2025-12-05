import axios from 'axios';

const api = axios.create({
    //baseURL: window.APP_CONFIG.API_URL,
    baseURL: '/api',
});

export default api;